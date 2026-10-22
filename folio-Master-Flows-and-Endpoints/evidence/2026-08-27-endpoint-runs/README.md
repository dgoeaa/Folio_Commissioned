# Endpoint run records — 2026-08-27

Twelve flow run records captured from the Correspondence Gateway endpoints.

## Redaction

**These files are scrubbed. The originals must never be committed.**

Eight of the twelve carried a live `sig=` trigger token in the
`x-ms-igw-external-uri` and `x-ms-igw-raw-target` request headers. That token is
a bearer credential: whoever holds it can invoke the flow. Both header values
have been replaced with `***REDACTED-BY-REPO***` and every `sig=` value with
`sig=***REDACTED-BY-REPO***`.

The leak is in the flows themselves, not in the capture. `Compose_Redacted_Headers`
blanks `Authorization`, `Cookie`, `x-api-key` and `Ocp-Apim-Subscription-Key`, but
in four of the seven flows it does not blank the two `x-ms-igw-*` headers, which
carry the full inbound request URL including the token. Those records are emailed
as attachments to dgsRegistry@nitda.gov.ng on every run.

| Flow | `x-ms-igw-*` redacted |
| --- | --- |
| CG_Submission_Endpoint | yes |
| CG_Support_Endpoint | yes |
| CG_Status_Check_Endpoint | **no** |
| CG_Verification_Endpoint | **no** |
| CG_Verification_Confirmation_Endpoint | **no** |
| CG_Writeback_Endpoint | **no** |

The four tokens seen in these records should be treated as disclosed and the
flow URLs regenerated. Redaction is not rotation.

## What the records show

Every endpoint runs clean end to end — `flow_outcome: Succeeded`, zero failed
actions. Two carry direct proof that the HTTP reply reached the caller:

- `CG_Support_Endpoint__…668CU10` — Response Succeeded, 400, 90 bytes, 25 ms,
  from a browser CORS call.
- `CG_Verification_Endpoint__…304CU25` — Response Succeeded, 200, 57 bytes.

The 400/404/401 results are correct rejections of probe payloads: validation
failure, no matching record, missing authorisation. No successful business
transaction is recorded here — see OPEN_ITEMS.

The earlier Verification records are kept deliberately. They show the two
mutually exclusive failure modes that `varData`'s declared type produced
(String → `varHTTPResponse` type error → 502; Object → every `varData`
assignment fails → 200 with an empty body), and the run that cleared both.
