# Portal integration factsheet

> **This document carries no commands.** Every commissioning step in this repository lives in
> [`RUNBOOK.md`](../../deployment/RUNBOOK.md), which is the only document that carries one, and which is also
> the command-line path, on a desktop or a phone alike. This document is a supporting record.
> If you are here to execute, go there. Until 2026-09-24 the estate carried five runbooks and a separate command-line path; they are Parts 1 to 5 of that one document now.

Intake response. One row per requested field: the value, and the file it was read from.

| | |
|---|---|
| Source | branch `claude/sharepoint-lists-gap-bqo7j7`, head `5b821e1` (open as PR #25 into `main`) |
| Compiled | 2026-08-31 |
| Paths | quoted as `` `path` ``, not linked, so the document survives being copied to a branch without its sources |

Where a field has no value, the cell says which of these applies and why in one line:
**none exists** (the architecture has no such component) · **not recorded** (applies, but only the
tenant or hosting owner holds it).

---

## 1 · Portal source code

| Field | Value | Source |
|---|---|---|
| Repository | `https://github.com/dgoeaa/ECM_DOCS_DEV`, private; `LICENSE` proprietary, NITDA | `LICENSE` |
| Relevant branch | `claude/sharepoint-lists-gap-bqo7j7` @ `5b821e1`, 94 commits ahead of `main` (`63d79ee`), open as PR #25 | git |
| Release | **not recorded** — no git tags, no release cut. `package.json` `version: 0.1.0`, `private: true`. Unit of delivery is a package from `npm run package` | `package.json` |
| Applications | `document-portal/index.html` (public portal, PWA) · `index.html` (internal runtime, 29 routes) | `README.md` |

Everything below concerns the **document portal** unless stated.

---

## 2 · Portal technology

| Field | Value | Source |
|---|---|---|
| Backend language and framework | **none exists.** Both applications are zero-build static sites — hand-authored ES modules, no bundler, no transpiler, no SSR, no server tier. The backend role is filled by Power Automate (Logic Apps WDL) over SharePoint Online | `README.md`, `config/endpoints.config.js` |
| Frontend language | Browser-native ES modules (`type="module"`); plain CSS in an `@layer` cascade, self-hosted tokens and fonts | `styles/`, `document-portal/ds/` |
| Runtime versions | None to state — the delivered sites need no runtime; any static HTTP server serves them | `README.md` |
| Tooling versions | `engines.node: ">=22"`; `@playwright/test ^1.48.0`, `http-server ^14.1.1`, `linkinator ^8.0.3`, `puppeteer-core ^25.4.0` (tests, packaging, link-checking only) | `package.json` |
| Dependency manager | **npm**, `package-lock.json` at `lockfileVersion: 3` | `package-lock.json` |

---

## 3 · Deployment environment

| Field | Value | Source |
|---|---|---|
| Operating system and version | **not recorded.** No target host named. CI runs `ubuntu-latest`; devcontainer is `mcr.microsoft.com/devcontainers/javascript-node:22` — both development only. the runbook places hosting under "your infrastructure, outside this repository" | `.github/workflows/ci.yml`, `.devcontainer/devcontainer.json`, `docs/deployment/RUNBOOK.md` |
| Docker / IIS / systemd / Kubernetes | **none exists.** No service to run or supervise — static files only. Local dev: `http-server` on :8080, or `scripts/dev-server.mjs` | `package.json` |
| Build command | No build step for the site. `npm run package` (distributable + `PACKAGE_MANIFEST.json` hashing every byte) · `npm run package:bundle` · `npm run setup` / `npm run setup -- --values <file>` (write endpoint config; `npm run recover` is retired and exits 2) | `package.json`, `docs/deployment/PACKAGING.md` |
| Deploy command | **Site:** copy the packaged directory to a static host. **Flow:** `scripts/export-power-automate-flows.ps1` → `scripts/patch-flow-package.mjs` → `node scripts/verify-portal-wiring.mjs <dir>` → `scripts/update-flow-definition.ps1` | `docs/folio-Master-Flows-and-Endpoints/packages/README.md` |
| Restart command | **none exists** — static files. `npm start` / `npm run serve:portal` start the local server | `package.json` |
| Rollback command | **Flow:** `scripts/update-flow-definition.ps1` writes the current definition to a `.before.json` before sending, and replays it to roll back; `-WhatIf` is the default posture, `-Apply` required to transmit. **Site and data:** none defined. Estate position on record: *"Power Automate does not undo completed actions, and no compensating action is declared anywhere in the estate."* | `scripts/update-flow-definition.ps1`, `scripts/process-docs.mjs` |

### `npm run setup -- --values <file>` — accepted input format

**A plain `KEY=value` text file, not JSON.** `scripts/setup.mjs` `parseValuesFile()` reads it line
by line; `export ` prefixes, single or double quotes, and `#` comment lines are tolerated. There is
**no `--help` flag** — passing one is ignored and the command runs normally.

Portal keys are resolved by trying, in order: `PF_ENDPOINT_<KEY>`, `DGO_ENDPOINT_INTAKE_<KEY>`,
`PF_<KEY>`, then the bare `<KEY>`. Runtime keys try `DGO_ENDPOINT_<KEY>`, `DGO_<KEY>`, then bare.
Precedence: values file → environment → empty. (`--recover`, which once backfilled unsupplied
keys from the reference corpus, is retired and exits 2: that corpus describes a superseded
estate, so backfilling from it produced a config that looked complete and answered 401. Use
`npm run values:template`, which emits all 25 keys, so nothing is left unsupplied.)

```
# portal-endpoint-values.txt  — one line per endpoint
PF_ENDPOINT_SUBMISSION=https://…/triggers/manual/paths/invoke?api-version=1&sp=…&sv=…&sig=…
PF_ENDPOINT_UPLOAD=…
PF_ENDPOINT_SUPPORT=…
PF_ENDPOINT_VERIFY=…
PF_ENDPOINT_VERIFY_CONFIRM=…
PF_ENDPOINT_STATUS=…
PF_ENDPOINT_WRITEBACK=…
```

The seven portal keys are `SUBMISSION`, `UPLOAD`, `SUPPORT`, `VERIFY`, `VERIFY_CONFIRM`, `STATUS`,
`WRITEBACK` (`scripts/lib/endpoint-surface.mjs`, `PORTAL_ENDPOINTS`). The eighteen runtime keys are
in `RUNTIME_ENDPOINTS` in the same file. Verified by running the command against a file of the
above shape: it reports `7/7 endpoints wired` and writes both `config.local.js` files. Optional
auth keys: `DGO_AUTH_ENABLED`, `DGO_AUTH_ROLE_SOURCE`.

Package import is not the deploy route: it cannot *update* a flow, only "save as a new flow",
which mints a new trigger URL. `update-flow-definition.ps1` PATCHes over the maker API, so the
flow keeps its id, trigger URL, owners, run history and connections. It requires
`Microsoft.PowerApps.PowerShell` plus flow ownership or co-ownership — not an Entra app
registration, client secret, admin consent, or tenant admin.

---

## 4 · Database

| Field | Value | Source |
|---|---|---|
| Engine and version | **SharePoint Online lists**, Microsoft 365. No version — SaaS, continuously versioned. No RDBMS, no connection string | `docs/folio-Master-Flows-and-Endpoints/deployment/sharepoint/LISTS.md` |
| Estate size | 14 lists / 99 provisioned columns across 4 site collections | `docs/folio-Master-Flows-and-Endpoints/deployment/sharepoint/portal-field-spec.json` v2.0.0 |
| Migration framework | **none exists** in the schema-versioning sense. Provisioning is `scripts/provision-sharepoint-fields.ps1` (browser twin: `.browser.js`) reading `portal-field-spec.json`; both re-read the live list and create only what is absent, so they are idempotent. 97/97 run recorded 2026-08-19 | `scripts/provision-sharepoint-fields.ps1`, `docs/folio-Master-Flows-and-Endpoints/evidence/2026-08-19-provisioning-run.json` |
| Connection-delivery method | Power Automate **connection references** to the `shared_sharepointonline` connector, embedded per flow (`connectionReferences`, `allConnectionData`). Lists addressed **by GUID**, never by title | `docs/folio-Master-Flows-and-Endpoints/packages/*.flow.json` |
| Application database permissions | **not recorded.** Flows act as the identity owning each connector connection; that account is not named in the repository | — |

### Lists

**`NEDMS`** — `https://nitdanigeria.sharepoint.com/sites/NEDMS`

| List | GUID | Cols |
|---|---|---|
| Portal Registry | `4c49f66a-23cd-4e1f-8ce7-ec1bb40eb667` | 23 |
| Portal Attachments | `ecf2ba9b-968f-4fbc-ac9c-7b5e36d5099e` | 8 |
| Portal Status Timeline | `5b486a5e-0ce7-46d7-a159-d84c77f3d1fd` | 6 |
| Portal Upload Tickets | `d777f3cd-0696-426e-8096-ffc860e7c0d4` | 9 |

**`Global_Digital_Documents_Centre`** — `https://nitdanigeria.sharepoint.com/sites/Global_Digital_Documents_Centre`

| List | GUID | Cols |
|---|---|---|
| Portal Rate Limits | `d6b97198-489c-4bd7-8647-1133c55efdf9` | 3 |
| Portal OTP Codes | `3f85213c-1fdc-4be0-8c0c-e28aa77fbe56` | 7 |
| Portal Verification Proofs | `f5c9698e-4b6c-4ec7-97ee-dc540efab8a9` | 5 |
| Portal Support Cases | `b984645b-8e3a-457f-a305-b95650fd3f23` | 8 |
| Portal Sequence Counters | `d95409a4-2b48-4d34-9f60-da5d27db862d` | 7 |
| Portal Audit Events | `f59026cc-9fd7-4322-b681-73c599b852c6` | 6 |
| Portal Flow Telemetry | `726c210d-09d5-45d9-952d-7a506b644b13` | 8 |
| Portal Outbox Receipts | `88a81ca1-319a-45f5-8409-f91a24538ffa` | 7 |

**Other** — `DGO_AccessScopes` `f2ffd2fa-901e-4f28-8f28-957da0fe05e4` (site `DGO_ECM_GOVERNANCE`,
internal governance) · `Flow Configuration` `9bc168c3-06e5-4d58-982b-0df06205fd35` (site
`NITDADGO-EAAACTIVITYTRACKING`, platform configuration).

Portal flows may touch the portal lists only. One flow crosses to the internal estate,
`ECM_DOCS_INTAKE`, and it is tenant-authenticated. No portal flow reads or writes a `DGO_*` list.

The seven design templates in `docs/folio-Master-Flows-and-Endpoints/packages/` name `NITDA_Portal_*` lists
on a single site; the live estate uses the `Portal *` lists above across two site collections.
`portal-field-spec.json` v2.0.0 supersedes the v1.0 `sharepoint-lists.json`.

---

## 5 · Portal authentication and authorization

| Field | Value | Source |
|---|---|---|
| Current authentication mechanism — portal | **None.** Anonymous by design. Every request carries `Content-Type: application/json` and no other header — no bearer token, no correlation id, no idempotency key. The SAS `sig` in the flow URL is served to every visitor, so it is not a caller credential | `document-portal/js/core.js`, `docs/folio-Master-Flows-and-Endpoints/contracts/DOCUMENT_PORTAL_FLOWS.md` |
| Identity, where present | Email one-time code. `VERIFY` mails a six-digit code; `VERIFY_CONFIRM` exchanges it for an opaque single-use proof (two concatenated GUIDs, hyphens stripped; 15-minute expiry) accepted and consumed by `SUBMISSION`, `STATUS`, `WRITEBACK`. For `WRITEBACK` the proof is the only authentication | `portal-data-contract.json` |
| Current authentication mechanism — internal runtime | `AuthConfig.enabled: false` (inert). Identity travels as a client-asserted `userEmail` from `localStorage`; RBAC advisory only. No identity provider, no tenant registration, no directory dependency; `provider` fixed to `'otp'` | `config/auth.config.js` |
| Administrator role | `systemAdmin`, permissions `['*']`. Second admin role `userAdmin`. Full set: `systemAdmin`, `userAdmin`, `executive`, `director`, `operator`, `viewer`. Bootstrap identity `dgsregistry@nitda.gov.ng` | `config/rbac.config.js`, `core/current-user.js` |
| Role or permission allowed to invoke each flow | **Portal: none exists** — callers are anonymous. **Runtime: declared client-side, not enforced.** `EndpointContracts` in `config/endpoints.config.js` carries `method`, `action`, `readOnly`/`write` per key; nothing server-side reads it. Token validation, role derivation and per-action authorisation are flow-side obligations (gap G-04) | `config/endpoints.config.js`, `docs/deployment/RUNBOOK.md` |
| Stable user identifier for audit records | **Portal:** `senderEmail`, stored lowercased and trimmed, plus `SourceIp` (from `X-Forwarded-For`) and the minted `referenceId`. `Portal Audit Events` holds `Flow`, `AtUtc`, `Reference`, `SourceIp`, `Detail` — one row per `WRITEBACK` call; `Detail` carries the action and the body's length, never the body. **Runtime:** normalized lowercase email from `normalizeEmail()` | `portal-data-contract.json`, `core/current-user.js` |

Activating `auth.enabled: true` changes four behaviours together: requests carry the proof in the
`Authorization` header; the client stops sending `userEmail`; role decisions read the verified
proof; unauthenticated callers cannot reach a governed action. `missingActivationConfig()` reports
the only outstanding configuration — the `OTP_GENERATE` and `OTP_VERIFY` URLs.

---

## 6 · Network and TLS

| Field | Value | Source |
|---|---|---|
| Portal hostname | **not recorded.** No hostname chosen. Design templates return the literal `Access-Control-Allow-Origin: https://your-host`; deployed `CG_*` flows return `*`. `scripts/patch-gateway-origin.mjs` replaces the literal with a resolver reading `ALLOWED_ORIGIN*` rows from the `Flow Configuration` list | `scripts/patch-gateway-origin.mjs`, `portal-data-contract.json` |
| TLS termination point | **Flows:** Microsoft's Power Platform gateway — host `defaultca6a4b3f912349bcbcb927085ebbf1.a1.environment.api.powerplatform.com`, gateway `ppapigw.eu-il103.gateway.prod.island.powerapps.com`, cluster `prdil103weu`. **Static site:** not recorded, pending a hosting decision | 2026-08-27 run records |
| Reverse proxy | **None.** *"Every URL below is invoked directly by the browser. There is no proxy, broker or other intermediary in the request path, and none is required to run or deploy the platform."* An authenticating proxy existed in an earlier design and was removed | `config/endpoints.config.js` |
| Backend outbound HTTPS | **No backend process to test.** The browser makes every outbound HTTPS call, to Power Automate. Flows reach SharePoint and Office 365 Outlook through Power Platform connectors — evidenced by succeeded run records | 2026-08-27 run records |

---

## 7 · Power Automate — every flow

Environment, common to all (from `workflow_identity.tags`,
`docs/folio-Master-Flows-and-Endpoints/evidence/2026-08-27-endpoint-runs/`):

| | |
|---|---|
| Environment | `Default-ca6a4b3f-9123-49bc-bcb9-27085ebbf1a1` (tenant default) |
| Region | `westeurope` |
| Resource group / type | `selfhostingresourcegroup` / `Microsoft.Logic/workflows` |
| Licensing | `capabilities: Premium` |
| Trigger type | `Instant` |
| Authored via | `creationSource: Portal`, `modifiedSources: Portal` |

| Portal alias | Flow name | Flow id | Method | Trigger auth | Enabled |
|---|---|---|---|---|---|
| `SUBMISSION` | `CG_Submission_Endpoint` | `de9ef13b-ae4c-42b0-9afa-20e71a180759` | POST | `All` (anonymous) | Enabled — created 2025-12-23, modified 2026-08-27 |
| `UPLOAD` | `CG_Upload_Endpoint` | `df7ddff1-9275-4f23-acf6-e169525f4e2f` | **PUT** | `All` (anonymous) | not evidenced — no run record captured; shares the `ECM_DOCS_INTAKE` workflow id |
| `SUPPORT` | `CG_Support_Endpoint` | `1b2c2e53-6c07-46a3-80b2-c43be1ef69db` | POST | `All` (anonymous) | Enabled — created 2026-08-15 |
| `VERIFY` | `CG_Verification_Endpoint` | `86897b2f-9770-4efa-8486-2642f24bb947` | POST | `All` (anonymous) | Enabled — created 2026-08-15 |
| `VERIFY_CONFIRM` | `CG_Verification_Confirmation_Endpoint` | `5e13db77-c1e1-4ed4-b109-cb5d9d247b49` | POST | `All` (anonymous) | Enabled — created 2026-08-22 |
| `STATUS` | `CG_Status_Check_Endpoint` | `badb65d8-f472-407e-8975-c29d77b855d7` | POST | `All` (anonymous) | Enabled — created 2026-08-15 |
| `WRITEBACK` | `CG_Writeback_Endpoint` | `21d4bfd3-f595-46fa-81bb-c29dabc12e7a` | POST | `All` (anonymous) | Enabled — created 2026-08-22 |
| — (internal crossing) | `ECM_DOCS_INTAKE` | `df7ddff1-9275-4f23-acf6-e169525f4e2f` | POST | **`Tenant`** | — |

Workflow ids where telemetry recorded them (`docs/folio-Master-Flows-and-Endpoints/registers/portal-endpoint-workflow-ids.json`):
`STATUS` `cf1e66eb8ac2460794b7f683d9aa8ac0` · `VERIFY` `ee627334d2e34ba7ac1b899bdb3ff2d0` ·
`VERIFY_CONFIRM` `2569134db3514e838594319ea8e2a4a9` · `WRITEBACK` `91292a0347d443619316b3d0118462f2`.

**Current complete HTTP-trigger URLs — not reproduced in this file.** They are in the tree under
`docs/reference/foundational/` (55 signatures, 28 files, 39 distinct flows). `tests/check-secrets.mjs`
fails the build on a `sig=` signature in any tracked file outside that baseline, so copying them
here would turn `npm test` red. Read each live URL from its flow's trigger card and configure it
into the git-ignored `document-portal/config.local.js` via `npm run setup -- --values <file>`.
Shape: `https://<environment host>/powerautomate/automations/direct/cu/<cluster>/workflows/<workflowId>/triggers/manual/paths/invoke?api-version=1&sp=…&sv=…&sig=…`

---

## 8 · Request contract, per flow

Authority: `docs/folio-Master-Flows-and-Endpoints/deployment/sharepoint/portal-data-contract.json` (`status: AUTHORITATIVE`). The
literal schemas are the `triggers.manual.inputs.schema` of each
`docs/folio-Master-Flows-and-Endpoints/packages/0N-*.flow.json`.

**Common to all seven schemas:** `required: []`, every property nullable
(`type: ["string","null"]`), `additionalProperties: true`. Validation happens inside the flow, not
at the trigger. **No envelope** — every body is a flat JSON object; no `action`, `operation`,
`payload` or `requestId`, unlike the internal platform's `{action, payload, requestId, timestamp}`.

| Flow | Schema title | Properties |
|---|---|---|
| `SUBMISSION` | Portal Submission Request | `localId`, `channel`, `correspondenceType`, `subject`, `category`, `sender{name, organisation, organisationType}`, `senderEmail` (format `email`), `senderPhone`, `eventDate`, `description`, `attachments[]{name, size:int, sha256}`, `submittedAt`, `verification` |
| `UPLOAD` | — (no schema; `method: PUT` only) | Headers `Content-Type: application/octet-stream`, `X-Upload-Ticket`; body = raw bytes, never base64 |
| `SUPPORT` | Portal Support Case Request | `name`, `email` (format `email`), `topic`, `aboutReference`, `message` |
| `VERIFY` | Portal Verify Request | `email` (format `email`) |
| `VERIFY_CONFIRM` | Portal Verify Confirm Request | `email` (format `email`), `code` |
| `STATUS` | Portal Status Request | `referenceId`, `email` (format `email`), `verification` |
| `WRITEBACK` | — | `referenceId`, `verification`, `action` ∈ `{respond, note, withdraw}`, `body` |

### Business-validation rules

**`SUBMISSION`** — one compound condition, `Condition_Validate_Request`; any failure returns
`400 {"error":"invalid-request"}`:

| Rule | Check |
|---|---|
| Subject | length > 5 |
| Description | length > 19 |
| Sender name | length > 1 |
| Sender email | exactly one `@`, not at position 0, ≥3 chars before the end, a `.` after it, no space |
| Category | one of `General Correspondence`, `Application`, `Proposal`, `Report`, `Compliance Filing`, `Policy Submission`, `Event Invitation` |
| Attachment count | 1–5 |
| Each attachment | non-empty `name`; 1–10 485 760 bytes (10 MB); `sha256` empty or exactly 64 lowercase hex. Count passing the filter must equal count declared |

Verification posture: `Condition_Require_Verification_Posture` is gated on the literal
`@false == true`, so the proof-checking branch is unreachable as shipped. To require verification,
change that literal to `true` in Code view — there is no configuration flag.

Reference minting — **the target is decided; the two other behaviours are current state, not open
options.**

| | Behaviour |
|---|---|
| Template (`01-portal-submission.flow.json`) | `Create_Submission_Record` with `Title: "PENDING"`, then patch `Title` and `ReferenceID` to `concat('NITDA-', <year>, '-', <SharePoint item ID>)` |
| Deployed (`portal-wiring.json`) | `concat('NITDA-', yyyy, '-', last 3 digits of ticks(utcNow()))` — 1000 values per year |
| **Decided target — D6, marked Decided** | Mint from `Portal Sequence Counters` (`Prefix`, `Year`, `CurrentSequence`, `LastReferenceId`, `LockToken`, `ModifiedByFlowRun`), zero-padded to width 5: `NITDA-2026-00001`. D6 states the `ticks()` expression **must not** be carried over, and that the padding width must be one the legacy form never used so the two generations cannot be confused while both circulate. Verified by `npm run wiring` — `SUBMISSION` must show all three `Portal Sequence Counters` operations |

**`UPLOAD`** — verify received size and SHA-256 against the ticket before storing (INT-002);
enforce expiry; refuse a second presentation. The Universal Filename Policy is applied by the flow;
`document-portal/` performs no filename normalisation.

**`VERIFY_CONFIRM`** — the flow must compare the code to the stored code, not only filter on it
(D9). Attempt cap 5 per challenge; challenge consumed on match and on the fifth failure.

**`STATUS`** — `referenceId` trimmed and uppercased before matching. `email` is structurally absent
from the body when a proof is held, not blank.

**`WRITEBACK`** — a valid proof is required on every call; there is no other authentication.

### Sensitive fields

| Field | Location | Handling |
|---|---|---|
| `OTP_Code` | `Portal OTP Codes` | Plaintext (SC-003 — WDL has no bitwise operators, so no digest can be computed in-flow). Protected by lifecycle: 5-minute expiry, 5-attempt cap, consumed on match |
| `verification` proof | `Portal Verification Proofs` | Opaque, single-use, 15-minute expiry; refuse if consumed or expired |
| `X-Upload-Ticket` | `Portal Upload Tickets` | Opaque, single-use, short-lived |
| `senderEmail`, `email`, `senderPhone` | `Portal Registry`, `Portal Support Cases`, `Portal OTP Codes` | Personal data; email lowercased and trimmed |
| `SourceIp` | several lists | Personal data; from `X-Forwarded-For` |
| Message bodies | `Portal Status Timeline` | `Portal Audit Events.Detail` records action and body length, never the body. `Portal Outbox Receipts` records that a message was sent, never the body and never a code |
| `Authorization`, `Cookie`, `x-api-key`, `Ocp-Apim-Subscription-Key`, `x-ms-igw-external-uri`, `x-ms-igw-raw-target` | telemetry capture | Blanked by `Compose_Redacted_Headers` before the run record is composed. `CG_Status_Check_Endpoint`, `CG_Verification_Endpoint`, `CG_Verification_Confirmation_Endpoint` and `CG_Writeback_Endpoint` do not currently blank the last two; four live tokens were recovered from twelve captured records (`remediation/29-redact-igw-headers.md`) |
| `sig=` trigger token | every flow URL | Bearer credential |

### Portal-to-flow field mappings

Full table in `portal-data-contract.json` as `field` → `persistence` (`List/Column`), machine-checked
by `node scripts/verify-portal-data-contract.mjs --strict`, which reports any contract field with no
provisioned column.

| Portal field | Persisted as |
|---|---|
| `localId` | `Portal Registry/LocalId` |
| `subject` / `category` / `description` | `Portal Registry/Subject` / `/Category` / `/Description` |
| `sender.name` / `.organisation` / `.organisationType` | `Portal Registry/SenderName` / `/SenderOrganisation` / `/SenderOrganisationType` |
| `senderEmail` / `senderPhone` | `Portal Registry/SenderEmail` / `/SenderPhone` |
| `submittedAt` | `Portal Registry/SubmittedAtUtc` — ISO 8601 with `Z`; flows must not reformat |
| `attachments[]` | count → `Portal Registry/AttachmentCount`; each element → one `Portal Upload Tickets` row (`DeclaredName`, `DeclaredSizeBytes`, `DeclaredSha256`) |
| `verification` | redeemed by setting `Portal Verification Proofs/Consumed`; outcome → `Portal Registry/VerifiedSubmission` |
| derived `referenceId` | `Portal Registry/ReferenceId` — minted by the flow, never by the portal |
| `X-Forwarded-For` | `Portal Registry/SourceIp` |
| support `name`/`email`/`topic`/`aboutReference`/`message` | `Portal Support Cases/Name`/`Email`/`Topic`/`AboutReference`/`Message`; `Status` = `open` at creation |

---

## 9 · Response contract, per flow

Every response carries `Content-Type: application/json`, `Access-Control-Allow-Origin`,
`Access-Control-Allow-Methods: <POST|PUT>, OPTIONS`, `Access-Control-Allow-Headers: Content-Type,
X-Correlation-ID[, X-Upload-Ticket]`. Deployed flows add `Cache-Control: no-store, no-cache,
must-revalidate`, `Pragma: no-cache`, `X-Content-Type-Options: nosniff`.

Each flow is a `Scope_<Name>_Main` plus a `Scope_<Name>_Catch` that fires only on an unhandled
exception and answers `500` with a `reason` ending `-processing-failed`.

Envelope rule: the HTTP status is the envelope's own status code; a branch that sets a failure code
must have that code survive to the response. D8 records that
`Scope_Finalize_Response_State` overwrites `varStatusCode` with `if(errors, 400, 200)` after a
rate-limit case sets 429, and specifies the fix.

| Flow | Success | Failure codes | Response body | Fields read by the browser | Processing |
|---|---|---|---|---|---|
| `SUBMISSION` | `200` | `400` invalid-request · `403` verification_required · `429` too-many-requests · `500` submission-processing-failed | `{referenceId, uploads:[{ticket, name}]}` | `referenceId`, `uploads[].ticket`, `uploads[].name`, `error` | Synchronous |
| `UPLOAD` | `200` | `403` missing-upload-ticket · `404` ticket-not-found · `409` ticket-already-redeemed · `410` ticket-expired · `413` size-mismatch · `422` checksum-mismatch · `429` · `500` upload-processing-failed | `{stored, attachmentLink, reason}` | `stored`, `attachmentLink`, `reason` (client also accepts `error` as a fallback key) | Synchronous |
| `SUPPORT` | `200` | `400` · `429` · `500` support-processing-failed | `{caseRef}` — `NITDA-S-<6 hex>` | `caseRef` | Synchronous |
| `VERIFY` | `200` | `400` invalid-email · `429` · `500` verify-processing-failed | `{sent, expiresAt}` | `sent`, `expiresAt` | Synchronous. Mail-send failure still answers `200 {sent:false, expiresAt:null}` |
| `VERIFY_CONFIRM` | `200` | `401` invalid-code / no-pending-code / code-expired · `429` too-many-attempts / too-many-requests · `400` · `500` | `{verification, expiresAt}` on success; `{verified:false, reason}` otherwise | `verification`, `expiresAt`, `verified`, `reason` | Synchronous |
| `STATUS` | `200` | `403` verification_required · `404` byte-identical denial · `429` · `500` status-processing-failed | `{record:{…}}` | `record.referenceId`, `.status`, `.statusLabel`, `.category`, `.subject`, `.receivedAt`, `.acknowledgedAt`, `.updatedAt`, `.closedAt` — public projection only | Synchronous |
| `WRITEBACK` | `200` | `401`/`403` proof missing, invalid, expired or consumed · `404` byte-identical denial · `429` · other 4xx/5xx | `{ok, queued?, reason?}` | `ok`, `queued`, `reason` | Synchronous; `queued` is the flow's signal that it accepted but has not finished applying |

Contract constraints stated in `portal-data-contract.json`:

- `STATUS` — a null or absent record must be answered `404`, not `200`; a `200` with no record
  renders as a successful match. The `404` is byte-identical whether the reference is unknown, not
  the caller's, or the proof is expired or unknown (INT-006). Its `429` body is
  `{"resolution":"unavailable","reason":"rate-limited"}`.
- `SUBMISSION` — an empty `uploads` array when attachments were declared means the attachments are
  never sent.
- `UPLOAD` — `stored` must be truthful; `200 {stored:false}` means the bytes were not filed.
- `VERIFY` — `sent` must be present and truthful; the client tests `=== true`, so an absent field
  reads as failure.
- `SUPPORT` — the reference shown to the citizen must be the flow's `caseRef`. Current client
  behaviour: `support.js` `send()` calls `PF.intake.support()` without reading the promise, and
  displays a locally generated `sref()` reference instead.

---

## 10 · Invocation behaviour

| Field | Portal | Internal runtime |
|---|---|---|
| **Timeout** | None set by the client — bare `fetch()`, no `AbortController`, no timer. Observed live latency 2026-08-27: 4.1 s – 77.5 s | `config/fetch-policy.config.js`: default 15 000 ms; `FETCH_ALL` 20 000; `FETCH_ACTIVITIES` 15 000; `AI_CHAT` 30 000; `DYNAMIC_ACTIONS` 15 000; `OTP_GENERATE`/`OTP_VERIFY` 20 000. `EndpointContracts` raises several to 90 000 |
| **Retry** | Outbox, not a retry policy. `SUBMISSION` and `SUPPORT` queue in `localStorage` (`nitda.portal.outbox.v2`, last 50 items) when offline, unreachable, or refused with a non-`403` error (`SUPPORT`: only when offline, unreachable, `5xx` or `429`; a `4xx` is final). One entry per payload: a payload already queued is not queued again. Flushed on load and on `online`, one flush at a time, items resent one after another; a resend never queues a copy, a failed one keeps its entry with the try counted. Dropped on delivery or after 5 tries. No backoff, no jitter. (Until 5 October 2026 each failed resend queued another copy, so one case grew to 24 `SUPPORT` runs in a minute; `tests/portal-outbox.test.mjs`.) `UPLOAD`, `VERIFY`, `VERIFY_CONFIRM`, `STATUS`, `WRITEBACK` are never queued. `SUBMISSION`'s `403 verification_required` is handed back to the wizard rather than queued; `WRITEBACK` is never queued because the proof is single-use | `retry: 1` default; `0` for `AI_CHAT`, `DYNAMIC_ACTIONS`, `OTP_GENERATE`, `OTP_VERIFY` |
| **Idempotency** | No idempotency key is sent. `localId` is the only correlation handle; its stated purpose is to let a retry be recognised as the same submission, SUBMISSION deduplicates by query (same sender, subject, attachments within 24 hours: Phase 3), and SUPPORT returns the case already opened for the same address, topic and message within an hour (`replayed: true`). Server-side single-use is enforced on the ticket and the proof only | `core/idempotency.js` — SHA-256 of sorted payload + operation + reference + lowercased actor email + 300 s time bucket, held in memory 300 000 ms. In-tab only; not transmitted |
| **Concurrency / rate** | Fixed-window counters in `Portal Rate Limits`, one row per bucket, keyed `<ENDPOINT>_IP:<X-Forwarded-For>`. A caller with no `X-Forwarded-For` buckets as `unknown`. An expired window is updated in place, never duplicated; create only when no row exists | `dedupe: true`, `staleWhileRevalidate: true`, `cacheTtlMs` 300 000 (600 000 for `FETCH_ALL`), per-endpoint `payloadBudgetBytes` |

Rate limits — **D8 is marked Decided and governs.** The design templates are designs for flows that
were never deployed (`docs/folio-Master-Flows-and-Endpoints/packages/README.md`: *"They are not what is
deployed"*), so where the two differ, D8 is the value. D8 fixes a **60-minute fixed window for every
endpoint**, and sets thresholds for two of them; thresholds for `SUBMISSION`, `UPLOAD`, `SUPPORT`
and `STATUS` are **not recorded** and remain an operator decision.

| Flow | Design templates (`DOCUMENT_PORTAL_FLOWS.md` §0.1) | Decision D8 |
|---|---|---|
| `SUBMISSION` | 20 / hour / IP | 60-minute window |
| `UPLOAD` | 100 / hour / IP | 60-minute window |
| `SUPPORT` | 5 / 10 min / IP | 60-minute window |
| `VERIFY` | 10 / 10 min / IP **and** 3 / 10 min / email, both must pass | 5 / hour / source |
| `VERIFY_CONFIRM` | 15 / 10 min / IP | 10 / hour / source |
| `STATUS` | 30 / 10 min / IP **and** 10 / 10 min / reference, both must pass | 60-minute window |

D8 also specifies the refusal path: `Compose_Switch_Key` returns `'rate-limited'` when the bucket is
over its limit and the caller's action otherwise; the `Switch` is repointed at it; a new
`Case_Rate_Limited` sets 429 — so the refusal returns through the same response envelope and
telemetry scope as every other outcome.

---

## 11 · Safe validation contract

One probe table, `scripts/lib/endpoint-probes.mjs`, used by `npm run verify:endpoints` and by the
`ENDPOINT-CHECK.html` page in every delivered package. Probes carry `__DGO_PROBE__` markers and a
per-run `runId` so anything created can be found afterwards. Field names are checked against
`portal-data-contract.json` by `npm run test:probecontract`.

| Endpoint | Non-destructive request | Expected status | Expected response | Side effects |
|---|---|---|---|---|
| `STATUS` | `{referenceId:"__DGO_PROBE__", email:<probe address>}` | `404` | uniform denial | **None** — read-only, reference unknown by construction |
| `VERIFY_CONFIRM` | `{email:<probe>, code:"000000"}` | `401` / `404` / `410` | refusal | Increments an attempt counter only if a challenge exists for the probe address |
| `WRITEBACK` | `{referenceId, verification:"__DGO_PROBE__", action:"note", body:<runId>}` | `401` / `403` / `404` | refusal | **None** — refused before any write |
| `UPLOAD` | raw bytes, no `X-Upload-Ticket` | `401` / `403` | refusal | **None** — refused before storage |
| `SUBMISSION` | minimal valid body, `attachments: []` | `200` | `referenceId` | **Writes** — marked `write: true`; creates a `Portal Registry` row, a timeline event and a reference |
| `SUPPORT` | minimal valid body | `200` | `caseRef` | **Writes** — marked `write: true`; creates a `Portal Support Cases` row, may send an acknowledgement email |
| `VERIFY` | `{email:<probe address>}` | `200` | `sent`, `expiresAt` | **Writes and sends mail** — creates a `Portal OTP Codes` row and mails a code to the probe address |

**Confirmation that validation produces no business side effects: not confirmed for the full set.**
Four of the seven probes are refusal probes and are side-effect free. Three — `SUBMISSION`,
`SUPPORT`, `VERIFY` — are marked `write: true` in the probe table and create real records. A
side-effect-free contract for those three does not exist in the repository; it would need either a
documented sweep of `__DGO_PROBE__`/`runId`-marked rows after each run, or an `OPTIONS`/health
branch per flow.

Recorded runs:

| Run | Substrate | Result |
|---|---|---|
| `probe-msi1o6f7`, 2026-08-06 (`docs/folio-Master-Flows-and-Endpoints/deployment/verification/endpoint-verification.json`) | `scripts/dev-server.mjs` — the local conforming implementation, **not a Power Automate tenant** | 26 probed, 26 acceptable |
| `probe-mskul63e`, 2026-08-08 (`docs/folio-Master-Flows-and-Endpoints/contracts/transcripts/DOCUMENTS_PORTAL_transcript_endpoint-check-portal-probe-mskul63e.json`) | browser, live tenant | All five portal endpoints reached and answered `200`; each missing the field the client reads — `STATUS` no `record`, `SUBMISSION` no `uploads`, `SUPPORT` no `caseRef`, `VERIFY` no `sent`, `VERIFY_CONFIRM` no `verification`. Latency 3.1 s – 12.4 s. **Superseded** — see below |

**The 2026-08-08 result was diagnosed and closed.** `OPEN_ITEMS.md` item 27, closed 2026-08-22: all
seven portal flows were returning the standard envelope, putting every contract field
(`referenceId`, `sent`, `verification`, `record`, `caseRef`, `stored`) one level below where
`document-portal/js/core.js` reads it, while the HTTP status stayed `200` — so the portal read
success with the field missing. The portal set now answers flat per the `AUTHORITATIVE` contract;
the internal set keeps the envelope per `core/contracts.js`. Enforced by
`npm run test:responsecontract`. Related: item 28, same date, unified two divergent
`invokeObsidianAction` implementations behind one `liftEnvelope()` helper
(`tests/envelope-lift.test.mjs`). **No probe run has been recorded against the tenant since the
fix**, so the correction is evidenced by the repository's gates, not by a live capture.

---

## 12 · Secret storage

| Field | Value | Source |
|---|---|---|
| Approved runtime location for a generated encryption master key | **none exists.** Nothing in this platform generates, holds or uses an encryption master key; there is no server process to hold one. The OTP code is stored in plaintext because WDL cannot compute a digest (SC-003) | `portal-data-contract.json` |
| Approved location for the secrets that do exist | A **Power Automate environment variable**, or an **Azure Key Vault reference**. Rotation order: check the provider console for misuse → mint the replacement → move the value into the environment variable or Key Vault reference → revoke the old key last | `docs/deployment/EXECUTION_GUIDE.md`, `remediation/EXECUTION.md`, `INTERNAL_OPS_COVERAGE.md`, `OPEN_ITEMS.md` item 7 |
| Application service identity | **none exists / not recorded.** No application service runs. Flows execute as the identity owning each connector connection; that account is not named in the repository | — |
| Required file ownership and permissions | **none exists.** No secret is stored on a filesystem. `config/config.local.js` and `document-portal/config.local.js` hold endpoint URLs, are git-ignored, written by `npm run setup`, and are served to every visitor's browser by design | `config/endpoints.config.js` |

Secrets in the tree: 43 SAS trigger signatures across 28 files, resolving to 39 flows, 14 of which
carried two signatures each (`npm run rotation` produces the worklist); four `x-ms-igw-*` tokens
disclosed through telemetry email; and seven third-party API keys — Google ×4, OpenRouter, OpenAI,
Hugging Face.

> **Both credential sets have since been rotated.** `ITEM-22` rotated the trigger signatures and
> reconciled them against `endpoint-register.json` — 0 of the 43 appear in it. `ITEM-7` closed on
> 2026-09-08 when the agency confirmed all seven API-key rotations complete. This paragraph read
> "55 signatures, 14 of which carry two live signatures each" and "redacted in the tree but not
> rotated"; neither is true now. The count was also wrong at 55 — the counters matched greedily
> and indexed one credential under several strings. What remains true is that every one is still
> readable in git history, which is why publication is still refused.

---

## 13 · Backup destination

| Field | Value | Source |
|---|---|---|
| Database backup location | **not recorded.** No backup destination, procedure or schedule is documented. The store is SharePoint Online, so Microsoft 365 native retention, versioning and recycle bins apply by default; no explicit backup of the twelve portal lists has been configured or recorded | — |
| Encryption-key backup location | **none exists** — no key exists (§12) | — |
| Backup schedule and retention period | No backup schedule. A **records**-retention schedule exists: default 7 years; Legal and Executive directive 10; Official correspondence and Financial 7; Routine administrative 5; General 3 | `core/retention.js` |
| Recovery position | *"Power Automate does not undo completed actions, and no compensating action is declared anywhere in the estate. Whatever a failed run wrote before failing stays written."* `SUBMISSION` writes to five lists | `scripts/process-docs.mjs`, `scripts/process/discover-flows.mjs` |

---

## 14 · Information derivable from the supplied portal

**Derivable from this branch:** the endpoint inventory and aliases; flow ids, environment, region
and enabled state; request JSON Schemas and the exact validation predicates; the complete response
code and body enumeration for all seven endpoints; every portal-field → SharePoint-column mapping,
machine-checked; the sensitive-field inventory; client timeout, retry and queueing behaviour; the
rate-limit design; the probe table and each probe's side effects; list GUIDs and column counts; the
approved secret-storage location.

**Not derivable — required from the tenant or hosting owner:**

| # | Field | Owner |
|---|---|---|
| 1 | Portal hostname — it is the CORS allow-list value every flow must return | hosting |
| 2 | Hosting decision: where the static site is served, its OS, TLS termination, and who may load it | hosting |
| 3 | Live trigger URLs, read from each flow's trigger card | operator |
| 4 | The identity owning each connector connection, and its SharePoint permissions | operator |
| 5 | Whether the environment holds seven flows or twelve — `OPEN_ITEMS.md` item 35 records five packages naming a paste target the run records contradict | operator |
| 6 | Backup and restore position for the twelve portal lists | operator |
| 7 | Whether `scripts/update-flow-definition.ps1` has run against the tenant — `OPEN_ITEMS.md` item 2 | operator |
