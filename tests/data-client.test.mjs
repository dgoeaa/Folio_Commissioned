import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { test } from 'node:test';
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm';

const source = await readFile(new URL('../runtime/core/data-client.js', import.meta.url), 'utf8');

// Isolate the packaged browser module without importing auth, storage or tenant configuration.
async function client(responses, { write = true } = {}) {
  const calls = [], queued = [], errors = [], successes = [];
  const context = createContext({
    crypto: webcrypto, AbortController, setTimeout, clearTimeout,
    fetch: async (url, options) => {
      calls.push({ url, options });
      const response = responses[Math.min(calls.length - 1, responses.length - 1)];
      if (response instanceof Error) throw response;
      return new Response(response.body, { status: response.status });
    },
  });
  const dependencies = {
    './state.js': { State: { get: () => ({ settings: {}, profile: { email: 'test@example.invalid' } }) } },
    '../config/endpoints.config.js': {
      EndpointContracts: { DYNAMIC_ACTIONS: { action: 'dynamicGlobalAction', method: 'POST', write } },
    },
    './endpoint-registry.js': { EndpointRegistry: { url: () => 'https://flow.example.invalid/' } },
    '../config/fetch-policy.config.js': { fetchPolicyFor: () => ({ retry: 2, timeoutMs: 1000 }) },
    './errors.js': { normalizeError: error => ({ ok: false, message: error.message }) },
    './loading-state.js': {
      LoadingState: {
        start() {},
        error: (...args) => errors.push(args),
        success: (...args) => successes.push(args),
      },
    },
    './performance-monitor.js': { PerformanceMonitor: { measure: (_kind, _key, run) => run() } },
    './pending-queue.js': { PendingQueue: { enqueue: item => queued.push(item) } },
    './flow-confirmation.js': { confirmFlowExecution: async () => true },
    './auth.js': {
      authHeaders: async () => ({}), clientMayAssertIdentity: () => false,
      ensureAuthenticated: async () => {},
    },
    '../config/auth.config.js': { AuthConfig: { identityEndpoints: [] } },
  };
  const module = new SourceTextModule(source, { context });
  await module.link(specifier => {
    const exports = dependencies[specifier];
    assert.ok(exports, `Unexpected dependency: ${specifier}`);
    return new SyntheticModule(Object.keys(exports), function () {
      for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  return { request: module.namespace.request, calls, queued, errors, successes };
}

for (const status of [400, 401, 403, 404, 409, 422]) {
  for (const body of ['<html>Refused</html>', 'not JSON', '', '{"message":"Refused","code":"DENIED"}']) {
    test(`HTTP ${status}, body ${JSON.stringify(body)}: refuse once, never queue or signal success`, async () => {
      const c = await client([{ status, body }]);
      await assert.rejects(c.request('DYNAMIC_ACTIONS', { referenceId: 'test-ref' }), error => {
        assert.equal(error.status, status);
        assert.equal(error.refused, true);
        assert.equal(error.message, body.startsWith('{"') ? 'Refused' : `HTTP ${status}`);
        assert.equal(error.code, body.startsWith('{"') ? 'DENIED' : '');
        assert.equal(error.normalized.ok, false);
        return true;
      });
      assert.equal(c.calls.length, 1);
      assert.equal(c.queued.length, 0);
      assert.equal(c.successes.length, 0);
      assert.equal(c.errors.length, 1);
      assert.equal(c.errors[0][3].retryable, false);
    });
  }
}

for (const status of [408, 429, 500, 503]) {
  for (const body of ['{"message":"Try later"}', '<html>Try later</html>']) {
    test(`HTTP ${status}, body ${JSON.stringify(body)}: retain transient retries and queue`, async () => {
      const c = await client([{ status, body }]);
      await assert.rejects(c.request('DYNAMIC_ACTIONS'), error => {
        assert.equal(error.status, status);
        assert.notEqual(error.refused, true);
        return true;
      });
      assert.equal(c.calls.length, 3);
      assert.equal(c.queued.length, 1);
      assert.equal(c.queued[0].retryable, true);
      assert.equal(c.errors[0][3].retryable, true);
      assert.equal(c.successes.length, 0);
    });
  }
}

test('network failure retains retries and queues the failed write', async () => {
  const c = await client([new TypeError('Failed to fetch')]);
  await assert.rejects(c.request('DYNAMIC_ACTIONS'), /Failed to fetch/);
  assert.equal(c.calls.length, 3);
  assert.equal(c.queued.length, 1);
  assert.equal(c.successes.length, 0);
});

test('read refusal does not queue and is not retryable', async () => {
  const c = await client([{ status: 403, body: '<html>Forbidden</html>' }], { write: false });
  await assert.rejects(c.request('DYNAMIC_ACTIONS'));
  assert.equal(c.calls.length, 1);
  assert.equal(c.queued.length, 0);
  assert.equal(c.errors[0][3].retryable, false);
});

test('JSON error envelopes preserve the flow message and code', async () => {
  const c = await client([{ status: 400, body: '{"status":{"message":"Invalid entity"},"data":{"code":"INVALID"}}' }]);
  await assert.rejects(c.request('DYNAMIC_ACTIONS'), error => {
    assert.equal(error.message, 'Invalid entity');
    assert.equal(error.code, 'INVALID');
    return true;
  });
});

test('a successful retry returns the existing result and request envelope without queuing', async () => {
  const c = await client([{ status: 503, body: 'Unavailable' }, { status: 200, body: '{"saved":true}' }]);
  const payload = { operation: 'update-task', referenceId: 'test-ref' };
  const result = await c.request('DYNAMIC_ACTIONS', payload);
  assert.equal(result.ok, true);
  assert.equal(result.data.saved, true);
  assert.equal(result.attempts, 2);
  assert.equal(c.queued.length, 0);
  assert.equal(c.errors.length, 0);
  assert.equal(c.successes.length, 1);
  const first = JSON.parse(c.calls[0].options.body);
  const second = JSON.parse(c.calls[1].options.body);
  assert.deepEqual(first.payload, payload);
  assert.equal(first.action, 'dynamicGlobalAction');
  assert.equal(first.requestId, second.requestId);
  assert.equal(result.requestId, first.requestId);
});

test('malformed successful responses still fail rather than signal success', async () => {
  const c = await client([{ status: 200, body: '<html>Not a flow response</html>' }]);
  await assert.rejects(c.request('DYNAMIC_ACTIONS'), /Invalid JSON response/);
  assert.equal(c.successes.length, 0);
});
