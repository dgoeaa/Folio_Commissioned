# Flow estate — build specification

> **This document carries no commands.** It is the specification the flow build follows:
> what each flow owes its callers, and the dependency order the waves impose. Every step in
> this repository lives in [`../../deployment/RUNBOOK.md`](../../deployment/RUNBOOK.md), which is
> the only document that carries one — Part 6 is the click-by-click build this specification
> describes, and Part 7 is that build cut to the pilot's six flows.
>
> It stood at `docs/deployment/FLOW-BUILD-PLAN.md` until 2026-09-24. The name said plan and
> the content is a specification — per contract key, request and response and obligations —
> so it moved here, where the specifications are, and left the word *plan* to
> [`../../deployment/PLAN.md`](../../deployment/PLAN.md), which is now the only one.


What to build in Power Automate, in what order, and what each flow owes its callers.

Sequenced by dependency: each wave is usable on its own and unblocks the next. Nothing
here can be built in this repository — with no proxy and no identity provider, a flow is
the only place a caller can be checked, so the flows are the platform's entire enforcement
surface.

---

## The shape of the problem

Three numbers reframe it.

**19 contract keys, but 15 physical flows.** Several keys are routes on a shared workflow,
not separate flows:

| Contract keys | One flow |
|---|---|
| `DYNAMIC_ACTIONS`, `EMAIL`, `DISPATCH_OUTBOUND`, `ARCHIVE_REFERENCE` | `DYNAMIC_GLOBAL_ACTIONS` |
| `SUBSIDIARY_ACTIONS`, `FETCH_ACTIVITIES` | `SUBSIDIARY_ACTIONS` (18 route keys) |

**44 of 61 governed actions land on one physical flow.** `DYNAMIC_GLOBAL_ACTIONS` — reached
through four contract keys — is not one flow among nineteen. It is *the* flow. Everything
else is comparatively small.

| Backend | Governed actions |
|---|---|
| `DYNAMIC_ACTIONS` (incl. `.optional`) | **40** |
| `ARCHIVE_REFERENCE` + `DISPATCH_OUTBOUND` + `EMAIL` — *same physical flow* | **4** |
| no backend — client-only | 8 |
| `SINGLE_ASSIGNMENT` | 2 |
| `SUBSIDIARY_ACTIONS` | 2 |
| `BULK_ASSIGNMENT`, `EMAIL_RELATED_TASK`, `OTP_GENERATE`, `OTP_VERIFY`, `SCAN_INTAKE` | 1 each |

**Only 1 flow was genuinely new, and it is now written.** 17 of 19 runtime keys resolved to a
documented flow that already existed. (That resolution was `npm run recover`, which is now
**retired and exits 2** — its corpus describes a superseded estate. The current mapping of all
25 keys to their 20 workflows is `docs/folio-Master-Flows-and-Endpoints/registers/endpoint-register.json`, read by
`npm run reconcile`.) The one missing entirely was a
`SCAN_INTAKE` that accepts raw bytes — nothing in the estate reads the `X-DGO-Filename` /
`X-DGO-Sha256` / `X-DGO-Size` headers `depositScan` sends. It is built as
`docs/folio-Master-Flows-and-Endpoints/surfaces/internal/designer-paste/DGO_SCAN_INTAKE.designer-paste.json`, with its
variables package beside it. Paste the variables first, then the scope, and set the trigger to
**PUT, tenant-authenticated**. Until it is pasted the key remains unimplemented in the tenant and
`npm run keyimpl` says so.

> **The portal's ticket-based `UPLOAD` was on this list and does not belong on it.**
> `CG_Upload_Endpoint` (workflow `df82e331`, re-exported 2026-09-03) performs the whole
> redemption — rate limit, ticket lookup filtered on `Redeemed`, size match, file create,
> attachment record, ticket redeem — and `npm run wiring` reports it 7/7. Do not build a second
> one. Its trigger was `triggerAuthenticationType: Tenant`, which refused the portal's anonymous
> caller outright; the 2026-09-03 export shows it is now `All`. **One mismatch remains: the
> trigger declares `POST` and the contract's caller sends `PUT`.** That is a trigger setting, not
> a flow to write. `npm run keyimpl` states the current posture of every key.
>
> An earlier version of this note gave the workflow as `df7ddff1` and said it had been "renamed
> and rebuilt in place" from `ECM_DOCS_INTAKE`. That was wrong, and the reason is worth carrying:
> one export file bore CG_Upload_Endpoint's definition stamped with ECM_DOCS_INTAKE's workflow
> id. See brief item 6.11.

> **Correctness note, now stale.** This warned that `config/action-ownership.config.js` declared
> `scan-deposit` with `backend: 'SCAN_UPLOAD.required'` against a key that does not exist. It
> reads `SCAN_INTAKE.required` and has done since before the flow was built against it; the
> mismatch was corrected and this note outlived it.

---

## Cross-cutting obligations

Every flow, in every wave. Stated once here rather than repeated fifteen times.

1. **Validate your own input.** There is nothing in front of you.
2. **Rate-limit by source.** Same reason.
3. **Return the platform envelope.** `core/contracts.js` `assertEnvelope()` reads
   `{ ok, status: { http }, data, errors[], request: { action, requestId }, timing, meta }`,
   and treats `ok:false` or `status.http >= 400` as failure. Answering `200` with a body
   that says failure is worse than answering `4xx` — the client will store it as truth.
4. **Be idempotent where the client retries.** `PendingQueue` re-sends failed governed
   writes. A retried `assign-one` must not produce two assignments.
5. **From Wave 3 on: verify the bearer proof before anything else**, and derive the role
   from `DGO_UserDirectory` — never from `userEmail` in the body, which stops being sent
   under enforcement.

---

# Wave 0 — Make identity real

**Unblocks:** everything. **Needs:** nothing. **No authentication involved.**

Do this first regardless of what else you decide. Until it is done every browser that
loads the platform is a System Administrator with `accessScope: ['all']`, because
`core/state.js` seeds a bootstrap admin so a fresh install can boot.

### 0.1 Provision and seed

```bash
npm run seed:roles
../../architecture/scripts/setup-sharepoint.ps1 -SiteUrl "…" -WhatIf
../../architecture/scripts/setup-sharepoint.ps1 -SiteUrl "…"
```

10 lists · 97 fields · 10 seed rows, including the six `DGO_RoleCatalogue` roles generated
from `config/rbac.config.js`.

### 0.2 Populate `DGO_UserDirectory`

One row per officer. `Role` from the six catalogue values, `Status` `active`.

### 0.3 Extend `FETCH_ALL` to return `users`

The single highest-value change in this document.

```json
{ "users": [ { "UserId":"u-1042", "FullName":"A. Officer", "Email":"…",
               "Directorate":"Registry", "Role":"director", "Persona":"registry",
               "Status":"active", "AccessScope":"[\"Registry\"]" } ] }
```

- Return SharePoint internal names as-is — `normalizeUser` reads them.
- **Return the collection even when empty.** `users: []` means "the directory answered and
  you are not in it" → caller resolves to `viewer` / `unregistered`. Omitting the key means
  "unchanged". Absent and empty are different facts and the platform acts on the difference.
- Scope the rows to what the caller may see; it lands in their browser.

**Done when:** an officer sees their real role in `#/diagnostics`, and a user not in the
directory is refused every route.

---

# Wave 1 — The read spine

**Unblocks:** every workspace showing real data. **Needs:** Wave 0.

All three exist and are wired. Verify before rebuilding:
`npm run verify:endpoints -- --only FETCH_ALL,REFERENCE_DATA,GET_DOCS`

| Key | Action | Returns |
|---|---|---|
| `FETCH_ALL` | `fetchAll` | `{ docs[], tasks[], emails[], users[], categories[], departments[], comments[], approvals[] }` |
| `REFERENCE_DATA` | `lookups` | `{ users[], categories[], departments[] }` |
| `GET_DOCS` | `getDocs` | `{ docs[] }` |
| `FETCH_EMAIL_ATTACHMENTS` | `fetchEmailAttachments` | `{ attachments[] }` |

**Obligations**

- Any collection you omit is left untouched in client state — so omit deliberately, never
  as an error path.
- Column names are normalised by `core/domain.js`, which accepts `RefIDD`/`Reference_ID`,
  `AssignedTo`/`Assigned`, `RoutedToDSU`, `CC_x0027_dTo`, `_x0033_rdAssigned`. Send what
  SharePoint holds; do not invent friendly names.
- `FETCH_ALL` is the boot call. Slow here is slow everywhere — 90 s client timeout.

**Done when:** Correspondence, Activities and Lookup render live records.

---

# Wave 2 — The governed write spine

**Unblocks:** 46 of 61 governed actions — triage, assignment, approval, dispatch, closure,
minutes, files, users. **Needs:** Wave 1.

This is the bulk of the work. Build it as **one flow with an operation switch**, which is
what the client already assumes.

### 2.1 `DYNAMIC_ACTIONS` — `dynamicGlobalAction`

```json
{ "action": "dynamicGlobalAction", "operation": "<discriminator>",
  "ref": "NITDA-2026-000318", "userEmail": "…", "…": "operation-specific" }
```

Operation groups, from `config/action-ownership.config.js`:

| Group | Operations |
|---|---|
| Lifecycle | `triage`, `start-work`, `complete-action`, `approve`, `reject`, `executive-approve`, `executive-return`, `executive-escalate`, `resolve-escalation` |
| Records | `create-correspondence`, `append-minute`, `add-comment`, `update-task`, `update-operation`, `flag-document`, `convert-email` |
| Registry files | `register-file`, `route-file`, `receive-file`, `close-file` |
| Briefs / meetings / projects | `create-brief`, `submit-brief`, `decide-brief`, `request-meeting`, `decide-meeting`, `meeting-actions-to-tasks`, `create-project`, `update-project` |
| User administration | `user-admin:create-user`, `user-admin:update-user`, `user-admin:assign-role`, `user-admin:disable-user` |
| Reminders / dispatch | `set-reminder`, `remind-assignee`, `retry-dispatch`, `close-dispatch` |
| Activity parity (3-step sequences) | `activity-archive`, `activity-siwes`, `activity-nysc`, each with `:create-queue-record`, `:set-reference-id`, `:update-activity` |

**Obligations**

- **Reject an unrecognised operation explicitly.** `config/dynamic-actions.config.js` says a
  discriminator the backend does not recognise "must fail explicitly" — never a silent
  `200`, or the client records a write that never happened.
- **`user-admin:*` requires `role:assign` on the caller, resolved server-side.** This is a
  plain HTTP endpoint; a viewer can post this payload. Write to `DGO_UserDirectory` and
  append before/after to `DGO_UserRoleHistory`. Refuse a role not in `DGO_RoleCatalogue`.
- Activity-parity operations are **ordered sequences**. Step 2 and 3 must refuse to run
  without the record id from step 1.
- Mint references as `NITDA-YYYY-<sequence>` — unpadded, monotonic, never restarting
  within a year.

### 2.2 `SINGLE_ASSIGNMENT` — `singleassignment`
Actions: `assign-one`, `route-task`. Idempotent per `(ref, assignee, operation)`.

### 2.2a `USER_ADMIN` — `userAdmin`
Operations `user-admin:create-user`, `update-user`, `assign-role`, `disable-user`, from Folio's User Administration
screen. Served by its own flow, `IP_User_Admin_Endpoint` (ITEM-25, owner approval 2026-10-08), because
`DYNAMIC_ACTIONS` has no room under the service's 500-action limit; it shares that flow's gate. The person is found by
e-mail in `DGO_UserDirectory`; a create is refused when the address is there (409), a change when it is not (404); Role,
Persona and Status must be the directory's own choices (400); only a `systemAdmin` grants `systemAdmin` or changes a
`systemAdmin` (403). Each change is a Guarded Update (Rev + 1) and is audited as `user:<action>`.

### 2.2b `ACTIVITY_LIFECYCLE` — `activityLifecycle`
Operations `activity-archive`, `activity-siwes` and `activity-nysc`, each sent as `:create-queue-record`,
`:set-reference-id` and `:update-activity`, from Folio's Activities screen (the Canvas shortcuts). Served by its own
flow, `IP_Activity_Lifecycle_Endpoint` (ITEM-25, owner decision 2026-10-10), because `DYNAMIC_ACTIONS` has no room under
the service's 500-action limit; it shares that flow's gate and needs the `activities` route. The activity is read from
DGO DIGITAL OPS by item ID (404 if absent); the queue row is built from it, not from the request (NVERSE `DGOFASTTRACK`,
the category, AssignedTo `dgs@NITDA.gov.ng`); `Reference_ID` is computed by the flow and refused (409) on a queue row
that is not this activity's; the activity becomes Treated / Processed. Each step is audited and replays its first result.

### 2.3 `BULK_ASSIGNMENT` — `bulkassignment`
Action: `bulk-assign`. Client caps at 50 (`AppConfig.maxBulkAssign`), 90 s timeout.
**Report per-item outcomes**, not one aggregate status — a partial failure the client
cannot see becomes a silent data-loss bug. `BULK_ASSIGNMENT_DIRECT` is the same contract
against a different workflow; build one, point both keys at it unless you need the split.

### 2.4 `DISPATCH_OUTBOUND` / `ARCHIVE_REFERENCE` / `TRANSITION_STATUS` / `LOG_AUDIT_EVENT`

Four operations on the **same** flow as 2.1, reached the same way — `core/api.js`
`invokeObsidianAction()` posts `{ "action": "dynamicGlobalAction", "payload": { "operation":
"<one of these>" } }`, so they are discriminated by `operation` exactly like the table in
2.1 and are **not** separate `action` values.

| Operation | Obligation |
|---|---|
| `dispatchOutbound` | Record the act before the send. A dispatch marked sent that was not is worse than one that failed loudly |
| `archiveReference` | **Terminal.** Refuse to archive a reference with open tasks rather than cascading |
| `transitionStatus` | Refuse an illegal transition. `core/lifecycle.js` holds the permitted set; a flow that accepts any transition lets the client define the lifecycle |
| `logAuditEvent` | Append-only. An audit record the caller can overwrite is not an audit record |

> `transitionStatus` and `logAuditEvent` were absent from this plan while
> `core/api.js` has always been able to send them, so a flow built exactly to this document
> would have rejected two operations the client emits. Found by cross-checking the plan
> against `scripts/lib/endpoint-surface.mjs` during the readiness audit; the check is now
> mechanical, in `tests/packaging.test.mjs`.

**Done when:** an officer registers, triages, assigns, approves, dispatches and closes one
correspondence, and a second officer on another machine sees every step.

---

# Wave 3 — Enforcement

**Unblocks:** every security property the platform claims. **Needs:** Waves 0–2.

Until this wave, RBAC is a UI affordance. It decides which menu items render; it does not
decide what anyone may do.

### 3.1 `OTP_GENERATE` — `otpGenerate`

```json
→ { "operation": "requestOtp", "email": "officer@nitda.gov.ng" }
← { "sent": true, "expiresAt": "2026-08-05T09:12:00Z" }
```

**An address absent from the directory, or not `active`, must get the identical response
and the identical timing.** Otherwise this flow enumerates who works at the agency. Store
the code hashed with an expiry and an attempt counter. Report `sent:false` honestly.

### 3.2 `OTP_VERIFY` — `otpVerify`

```json
→ { "operation": "verifyOtp", "email": "…", "code": "418209" }
← { "ok": true, "token": "<signed proof>", "expiresAt": 1786000000000,
    "claims": { "preferred_username": "…", "name": "…", "roles": ["director"] } }
```

Single-use; cap attempts. **The comparison is not constant-time and cannot be made so** —
WDL has no bitwise operators, so `equals()` is what compares them, and the protection is the
lifecycle rather than the compare (SC-003, open item 19). This line read "Constant-time
compare" until 2026-08-31; item 19 corrected seven documents and missed this one, which is
why `npm run test:claims` now guards the wording instead of a person remembering.
**Resolve the role from
`DGO_UserDirectory`** — `claims.roles` is the server's statement about the caller. An HMAC
over `email | role | expiry` with a secret held in the flow is sufficient and needs no
library. On rejection: `{ ok:false, reason }` with no hint which half was wrong.

`core/otp-identity.js` already implements the client half and `core/boot.js` installs it
under enforcement.

### 3.3 Retrofit proof verification into Waves 1–2

Every flow, before anything else: verify signature and expiry → re-read `Role`/`Status`
from the directory → check the action against the role → `401` missing/expired/invalid,
`403` role not permitted. The client distinguishes them.

Then set `DGO_AUTH_ENABLED=true`, `DGO_AUTH_ROLE_SOURCE=claims`, and a `roleClaimMap`.

**Done when:** an anonymous `curl` to `FETCH_ALL` returns `401`, and a `viewer`'s token
posting `user-admin:assign-role` returns `403`.

---

# Wave 4 — The public channel

**Unblocks:** citizen submission and tracking. **Needs:** Wave 2 (references and the
register). Independent of Wave 3 — the public is anonymous by design.

⚠ Every URL here is delivered to every visitor's browser. Assume a hostile caller holds
each one from the moment you deploy.

### 4.1 `SUBMISSION` — **rebuild**

The documented flow answers `{ trackingId, referenceId, … }` and takes the file inline as
`FileContentBase64`. The portal expects:

```json
→ { subject, category, description, senderEmail, sender:{name}, attachments:[{name,size,sha256}], verification? }
← { "referenceId": "NITDA-2026-000318", "uploads": [ { "ticket":"…", "name":"…" } ] }
```

Mint the reference; issue one single-use, short-lived upload ticket per declared
attachment; restrict `category` to the public subset; apply the Universal Filename Policy
keeping the submitter's original as `originalName`; rate-limit by source. Answer
`403 {"error":"verification_required"}` to demand email verification.

*Either* rebuild the flow to this contract *or* change the portal to the base64 contract —
but decide, because today they disagree and `npm run verify:endpoints` will report it.

### 4.2 `UPLOAD` — **new, and the only genuinely absent flow**

`PUT` raw bytes, ticket in `X-Upload-Ticket`. Redeem once and only once; verify the bytes
against the declared size and SHA-256; refuse oversize or unmatched.
→ `{ stored, attachmentLink, reason }`

Bytes never travel base64-in-JSON — that is the 4 MB ceiling this design replaced.

### 4.3 `STATUS`, `SUPPORT`
Both route to `SUBSIDIARY_ACTIONS` (`TRACK`, `CREATESUPPORTREQUEST`). `STATUS` takes
`{ referenceId, email }` and matches **both** — that pairing is what stops someone who
guesses a reference reading another person's correspondence. One denial message that does
not reveal which half was wrong.

### 4.4 `VERIFY`, `VERIFY_CONFIRM`
Reuse the Wave 3 OTP flows.

### 4.5 `WRITEBACK` — **new**, in scope by [D11](../deployment/sharepoint/DECISIONS.md#d11--citizen-write-back-is-in-scope)

The seventh portal endpoint, and the only one with no flow candidate at all — nothing existing
comes close to being repointed. `document-portal/`'s client and this key's full contract already
exist; see `PORTAL_DATA_CONTRACT.md`'s WRITEBACK section for the exact request/response shape.

```json
→ { "referenceId": "NITDA-2026-000318", "verification": "<proof>",
    "action": "respond" | "note" | "withdraw", "body": "…" }
← { "ok": true, "queued": false }
```

Read the proof, match and consume it — there is no other authentication, and it is checked on
every call, not once per session. `respond` and `note` append a row to the same
`Portal Status Timeline` the staff side (`ECM_DOCS_INTAKE`, C7) writes, actor `Submitter`; only
`withdraw` changes `Portal Registry/Status`. Append one row to `Portal Audit Events` on every
call — [D13](../deployment/sharepoint/DECISIONS.md#d13--writeback-is-fully-provisioned--the-portal-audit-events-row-is-no-longer-proposed)
settled that as required, not proposed, and explains why this endpoint is the exception to D2's
reservation of that list: an anonymous caller with no proof cannot reach this write at all, so
it is not the public-endpoint append risk D2 was written about. Answer the same byte-identical
404 STATUS does when the reference is unknown or the proof does not own it.

**Done when:** a verified citizen responds to an action-required request, adds a note, and
withdraws a request, and all three appear on the timeline with actor `Submitter`.

**Wave 4 as a whole is done when:** two submissions produce different consecutive references,
both land in SharePoint, and tracking returns one and denies the other.

---

# Wave 5 — Ancillary

**Needs:** Wave 2. Each is independent; build on demand.

| Key | Action | Notes |
|---|---|---|
| `EMAIL` | `dispatchEmail` | `send-correspondence-email`. Same flow as `DYNAMIC_ACTIONS`. |
| `EMAIL_RELATED_TASK` | `emailtotaskassignment` | `create-task-from-email` |
| `SUBSIDIARY_ACTIONS` | 18 route keys | `INIT`, `GET_BOOTSTRAP`, `REFRESH_EMAILS`, `LOAD_EMAIL_DETAILS`, `CREATE_TASK`, `UPDATE_TASK`, `LOAD_EVENT_INFO`, `TRACK`, `ACKNOWLEDGE`, `GET_ALL`, `LISTDOCS`, `GETDOC`, `BULKASSIGN`, `CREATESUPPORTREQUEST`, `GETREFERENCES`, `LIST-ACTIVITIES`, `AI_ANALYSE_EMAIL`, `AI_CHAT` |
| `SCAN_INTAKE` | raw `PUT` | **New.** `X-DGO-Filename`, `X-DGO-Size`, `X-DGO-Sha256` → `{ referenceId, attachmentLink, stored, depositedBy, sha256, bytes }`. `depositedBy` comes from the server, never the page. |

`SCAN_INTAKE` carries no `EndpointContracts` entry deliberately — it is not a JSON contract
and `DataClient.request()` must not be used for it.

---

# Wave 6 — AI

**Needs:** Wave 2. Entirely optional; nothing else depends on it.

`AI_EMAIL_ANALYSIS` (`aiAnalyseEmail`), `AI_DOC_ANALYSIS` (`aiAnalyseEventDocs`),
`AI_CHAT` (`aiChat` → `{ reply }`). 90 s timeouts. These see correspondence content —
whatever model you route them to inherits the data-protection position for R-01.

---

## Sequence at a glance

```
Wave 0  directory + roles          ← start here, no auth needed, closes the fail-open
   │
Wave 1  read spine                 ← platform shows real data
   │
Wave 2  DYNAMIC_ACTIONS + assign   ← 40 of 61 actions; the bulk of the work
   ├────────────────┐
Wave 3  OTP + proof  Wave 4  public channel      ← independent of each other
   │                        │
Wave 5  ancillary ──────────┘
   │
Wave 6  AI                          ← optional
```

**A defensible pilot is Waves 0–2 plus 4.** Waves 3, 5 and 6 are additive.

## Before any of it

```bash
npm run verify:endpoints
```

From a machine whose egress allows `*.environment.api.powerplatform.com`. It reports which
of the 22 wired endpoints answer and which responses do not carry what the client reads.
**This has never been run against the tenant** — every estimate above assumes the
documented estate behaves as documented, and that is the one thing nobody has checked.

## Not in scope for the flows

- Rotate the 59 published signatures before production (G-03). Deleting revokes nothing.
- Approve the Part H routing table — which desk each kind of correspondence lands on.
- Decide the data-protection position for R-01 under the posture you choose.
