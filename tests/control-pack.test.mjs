import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const backlog = JSON.parse(await read('program/decommission-backlog.json'));

test('CSV and JSON contain identical ordered items and every field', async () => {
  const [header, ...lines] = (await read('program/decommission-backlog.csv')).trimEnd().split(/\r?\n/);
  const keys = header.split(',');
  assert.equal(lines.length, backlog.items.length);
  for (const [i, line] of lines.entries()) {
    // The control pack uses single-line, unquoted CSV fields.
    const cells = line.split(',');
    assert.equal(cells.length, keys.length);
    const expected = Object.fromEntries(Object.entries(backlog.items[i])
      .map(([k, v]) => [k, Array.isArray(v) ? v.join('|') : String(v)]));
    assert.deepEqual(Object.fromEntries(keys.map((k, j) => [k, cells[j]])), expected);
  }
});

test('original IDs are retained, stages covered and dependencies valid without cycles', () => {
  const items = new Map(backlog.items.map(item => [item.item_id, item]));
  assert.equal(items.size, backlog.items.length);
  for (let n = 0; n <= 12; n++) assert.ok(items.has(`FOL-${String(n).padStart(2, '0')}`));
  assert.deepEqual([...new Set(backlog.items.map(i => i.stage))].sort(), [0, 1, 2, 3, 4, 5, 6, 7]);
  function visit(id, parents = []) {
    assert.ok(!parents.includes(id), `Dependency cycle: ${[...parents, id]}`);
    for (const dep of items.get(id).dependency) {
      if (/^D-[1-7]$/.test(dep)) continue;
      assert.ok(items.has(dep), `Unknown dependency: ${dep}`);
      visit(dep, [...parents, id]);
    }
  }
  for (const item of backlog.items) {
    assert.ok(backlog.allowed_statuses.includes(item.status));
    assert.ok(item.blocker.every(id => /^(B-0[1-5]|D-[1-7])$/.test(id)));
    visit(item.item_id);
  }
});

test('partial source evidence does not close a program gate or owner decision', async () => {
  assert.equal(backlog.items.find(i => i.item_id === 'FOL-00').status, 'blocked');
  assert.equal(backlog.items.find(i => i.item_id === 'FOL-03').status, 'planned');
  assert.ok(!backlog.items.some(i => ['verified', 'released', 'accepted'].includes(i.status)));
  const decisions = await read('program/decision-register.md');
  for (let n = 1; n <= 7; n++) {
    assert.match(decisions, new RegExp(`\\| D-${n} \\|[^\\n]+\\| Open`));
  }
});

test('program Markdown local links and heading fragments resolve', async () => {
  let checked = 0;
  for (const file of await readdir(new URL('program/', root))) {
    if (!file.endsWith('.md')) continue;
    const source = await read(`program/${file}`);
    for (const [, href] of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      if (/^https?:\/\//.test(href)) continue;
      const target = new URL(href, new URL(`program/${file}`, root));
      const fragment = decodeURIComponent(target.hash.slice(1));
      target.hash = '';
      await access(target);
      if (fragment) {
        const headings = [...(await readFile(target, 'utf8')).matchAll(/^#{1,6} (.+)$/gm)]
          .map(([, h]) => h.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s/g, '-'));
        assert.ok(headings.includes(fragment), `Missing heading: ${href}`);
      }
      checked++;
    }
  }
  assert.ok(checked > 0);
});
