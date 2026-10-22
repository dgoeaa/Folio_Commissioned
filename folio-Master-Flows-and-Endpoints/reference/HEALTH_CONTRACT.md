# The non-destructive health contract

The client half of this is `core/health-contract.js` and it is finished. **The server half is
each flow's own, and until a flow implements it, that flow cannot be health-checked at all.**

## The problem this solves

Every endpoint in this estate is a Power Automate flow the browser calls directly, and most of
them write: they assign, dispatch, email and archive. So the obvious health check — call it and
see whether it answers — is not available, because for two thirds of the estate *checking* it
means *doing* it.

That is why this platform shipped without an endpoint health check for as long as it did, and
why the Admin Suite reports a flow that does not implement this contract as **unimplemented**
rather than quietly skipping it. A skipped endpoint reads as a healthy one.

## The request

```json
{ "operation": "healthCheck", "validationOnly": true, "requestId": "<unique per call>", "endpointKey": "<the key the caller used>" }
```

## What the flow must do

Branch on `validationOnly` **before any write action**. When it is `true`:

1. Validate the flow's own configuration and connection references.
2. Write nothing. Create nothing. Send nothing. Assign nothing. Upload nothing.
3. Answer HTTP 200 with the response below.

Normal execution must be a separate branch. A flow that evaluates `validationOnly` *after* it has
already created a record has not implemented this contract; it has added a field.

## The response

```json
{
  "success": true,
  "validationOnly": true,
  "endpoint": { "key": "THE_EXACT_CONTRACT_KEY_THIS_FLOW_SERVES" },
  "data": null,
  "error": null
}
```

`endpoint.key` must be the key **this flow serves**, as the flow itself knows it — not the key
echoed back from the request. Echoing the caller's own value back makes the field worthless: the
whole point of it is to detect the case where they disagree.

## What the caller concludes, and why each verdict differs

| The flow answers | Verdict | What it means |
|---|---|---|
| 200, `validationOnly:true`, key matches | `healthy` | It validated itself and wrote nothing. |
| 200, `validationOnly:true`, **key differs** | `wrong-endpoint-key` | The address is valid, correctly signed, and reaches the wrong flow. It succeeds — against the wrong flow. This is the worst outcome in the table and the only check in this platform that detects it. |
| 200, no `validationOnly` echo | `not-implemented` | The flow ignored the flag, so it may have taken its write path. **Do not repeat the call.** |
| 4xx/5xx with a JSON body | `refused` | It was reached and it refused. That is a working endpoint answering. |
| Any status with a **non-JSON** body | `blocked` | Power Automate always answers JSON. Something between the browser and the tenant answered instead — an egress filter or a proxy. Nothing can be concluded about the endpoint. |
| No answer | `unreachable` | From a browser this is indistinguishable between a blocked host, a DNS failure and a CORS refusal. The flow may be healthy and merely unreachable from this network. |

The load-bearing column is not the status code. Power Automate refuses a call with JSON; an
egress filter refuses it with an HTML error page and a status line that looks identical. Reading
the second as "this signature is revoked" has already happened in this estate — it produced a
report declaring 39 flows dead on a machine whose network simply blocked the host. That is why
every result carries `reached`, and why a run in which nothing was reached is reported as
**inconclusive** rather than as an estate-wide failure.

## The identity handshake

A second, separate probe, and the only one that proves *which* flow answered.

**Request**

```json
{ "_platform": { "operation": "verify", "correlationId": "<uuid, new for every call>" } }
```

**Response**

```json
{
  "verified": true,
  "flowIdentity": "<this flow's own identity>",
  "environment": "<the environment it runs in>",
  "contractVersion": "<the contract version it implements>",
  "correlationId": "<the id it was given, unchanged>"
}
```

The correlation id must come back unchanged. Without it, a cached or replayed response is
indistinguishable from a live one, and the caller reports `identity-mismatch` when it does not
match — not `healthy`.

This is the same handshake the flow-capsule registry (`flowcapsule.py`) performs before it
activates or rolls back a stored URL, so a flow that implements it works with both.

## Where this is exercised

- **Admin Suite → Live checks** runs either probe across the estate, one endpoint at a time.
  Sequential, not parallel: twenty-five simultaneous calls to one tenant gets throttled and
  produces failures that read as endpoint faults.
- `core/health-contract.js` is the implementation; `tests/admin-suite.test.mjs` asserts each
  verdict above against a fabricated flow, including that a wrong-key answer outranks a refusal.

## What it does not prove

A `healthy` result says the flow validated its own configuration and named itself correctly. It
says nothing about whether the flow's business logic is right, whether the caller was authorised,
or whether the flow should have been called at all. Under the inert authentication posture a flow
called directly answers whoever calls it, so "the health check passed" is not a statement about
access control.
