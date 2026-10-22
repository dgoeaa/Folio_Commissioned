# 6 · Service contracts

How the Workspace talks to its services. The map from each contract key to its flow is in
[Components §3.8](03-COMPONENTS.md#38-power-automate-flows). Everything about an individual flow
(definition, released package, live captures, evidence) is in
[`docs/folio-Master-Flows-and-Endpoints/`](../folio-Master-Flows-and-Endpoints/README.md).

## 6.1 A request

Every call is an HTTPS `POST` to the service's signed trigger URL, made by `core/data-client.js`:

```http
POST https://defaultca6a4b3f…environment.api.powerplatform.com/powerautomate/automations/direct/…/workflows/<id>/triggers/manual/paths/invoke?api-version=1&sp=…&sv=1.0&sig=<signature>
Content-Type: application/json
X-Correlation-Id: <GUID>
X-DGO-Proof: <sign-in proof>          (every service except OTP_GENERATE and OTP_VERIFY)

{
  "action": "<the contract's action, e.g. fetchAll>",
  "payload": { … },
  "requestId": "<GUID>",
  "timestamp": "<ISO time>"
}
```

- OTP_GENERATE and OTP_VERIFY are called with `flatPayload`: the fields sit at the top level
  (`action`, `identifier`, `otp_code`), because those flows read them there.
- The browser sends a CORS preflight first. The Power Platform gateway answers it itself, with
  `Access-Control-Allow-Origin: *` and the requested headers allowed (accepted as ITEM-56: the
  proof, not the origin, is the protection).
- The reply is the standard envelope ([Architecture §2.6](02-ARCHITECTURE.md#26-the-standard-reply-envelope)).

## 6.2 The client's contracts

From `config/endpoints.config.js` and `config/fetch-policy.config.js`. *Timeout* is the client's wait
before it gives up; *retry* is how many times it tries again; *cache* is how long a read is reused.

| Contract key | Action | Kind | Timeout | Retry | Cache |
| --- | --- | --- | --- | --- | --- |
| `FETCH_ALL` | `fetchAll` | read | 90 s | 1 | 10 min |
| `FETCH_ACTIVITIES` | `LIST-ACTIVITIES` | read | 15 s | 1 | 5 min |
| `REFERENCE_DATA` | `lookups` | read | 15 s | 1 | 5 min |
| `GET_DOCS` | `getDocs` | read | 15 s | 1 | 5 min |
| `FETCH_EMAIL_ATTACHMENTS` | `fetchEmailAttachments` | read | 15 s | 1 | 5 min |
| `SINGLE_ASSIGNMENT` | `singleassignment` | write | 15 s | 1 | |
| `BULK_ASSIGNMENT` | `bulkassignment` | write | 15 s | 1 | |
| `DYNAMIC_ACTIONS` | `dynamicGlobalAction` | write | 15 s | 0 | |
| `SUBSIDIARY_ACTIONS` | `INIT` | write | 15 s | 1 | |
| `USER_ADMIN` | `userAdmin` | write | 15 s | 1 | |
| `EMAIL` | `dispatchEmail` | write | 15 s | 1 | |
| `EMAIL_RELATED_TASK` | `emailtotaskassignment` | write | 15 s | 1 | |
| `SCAN_INTAKE` | | write | 15 s | 1 | |
| `OTP_GENERATE` | `generate` | identity | 20 s | 0 | |
| `OTP_VERIFY` | `verify` | identity | 20 s | 0 | |
| `AI_CHAT`, `AI_DOC_ANALYSIS`, `AI_EMAIL_ANALYSIS` | | empty in the go-live build | | | |
| `DISPATCH_OUTBOUND`, `ARCHIVE_REFERENCE` | | served as DYNAMIC_ACTIONS operations | | | |

**Writes and retries.** A write with retry 1 is sent again if the first attempt times out or fails. Of
the write services, only DYNAMIC_ACTIONS de-duplicates a repeated request (by request hash); the others
can apply a retried write twice. This was accepted as a deferred follow-up under G-04 (obligation 6).

Every write asks the person to confirm first (`core/flow-confirmation.js`), unless the screen has
already asked (it marks the request `__confirmedByUI`) or the button itself is the confirmation
(sign-in passes `skipConfirmation`).

## 6.3 Status codes a service returns

| HTTP | Envelope code | Means | The Workspace does |
| --- | --- | --- | --- |
| 200 | `OK` | Done | Applies the result |
| 401 | `ERR401` | No valid proof, or the person is not active in the directory | Reports the failure (a refresh shows "The registry could not be reached"). It does not clear the proof by itself. An *expired* proof never gets this far: the client knows the expiry and opens the sign-in dialog before calling. |
| 403 | `ERR403` | Signed in, but the role may not do this | Shows the refusal |
| 404 | `ERR404` | Not found (for OTP_VERIFY: the code was not accepted) | Shows the message |
| 409 | `ERR409` | Conflict: duplicate person, or the record changed since you read it (`Rev`) | Asks you to reload and retry |
| 429 | `ERR429` | Too many attempts (sign-in codes, Portal rate limits) | Asks you to wait |
| 500 | `ERR500` | The flow failed (`Scope_Catch_…`) | Shows the failure; the run record is in Portal Flow Telemetry |
| 501 | `ERR501` | The operation is recognised but not built (ITEM-25) | Shows the refusal |

## 6.4 Portal and Mailer services

| Surface | Contract keys | Notes |
| --- | --- | --- |
| Document Portal | `SUBMISSION`, `UPLOAD`, `STATUS`, `SUPPORT`, `VERIFY`, `VERIFY_CONFIRM`, `WRITEBACK` | Public; per-IP limits per hour: SUBMISSION 20, UPLOAD 60, STATUS 30, SUPPORT 10, VERIFY 5, VERIFY_CONFIRM 5, WRITEBACK 20 |
| Correspondence Mailer | `MAIL_SEND`, `MAIL_LOG`, `MAIL_DIRECTORY`, `MAIL_TEMPLATES`, `MAIL_PROVISION`, `MAIL_AUTH`, `MAIL_DATA` | Its own signed addresses, delivered as `mailer-endpoints.config.local.js` |

## 6.5 Where to look next

| Need | Record |
| --- | --- |
| The released package for a flow | `docs/folio-Master-Flows-and-Endpoints/packages/` |
| A flow, action by action | `docs/folio-Master-Flows-and-Endpoints/provisioning/flows/` |
| Which flow each key resolves to, and its workflow ID | `registers/config-build-ledger.json`, `registers/endpoint-workflow-ids.json` |
| Which lists each flow touches | `registers/flow-list-map.json` |
| What each flow runs in the tenant, by fingerprint | `registers/identification-paste-ledger.json` |
| The authentication obligations | [`docs/architecture/AUTHENTICATION_CONTRACT.md`](../architecture/AUTHENTICATION_CONTRACT.md) |
