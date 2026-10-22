# NITDA Folio — Endpoint and Flow Register and Report

| Field | Value |
|---|---|
| Reference | NITDA-FOLIO-EFR-001 |
| Version | 1.0 |
| Date | 2026-09-28 |
| Status | Issued for action |
| Baseline | branch `claude/system-remediation-gaps-ahpmsy`, commit `72f2deb` |
| Scope | The six Folio platforms and every endpoint, flow, list and service they require. Nothing outside the baseline branch was read. |
| Companion | Register workbook `docs/folio-Master-Flows-and-Endpoints/reference/ENDPOINT_FLOW_REGISTER.xlsx`: the same registers with live summary formulas and action tracking columns. A formatted version of this report is published as an artifact. |

## Contents

Summary · Scope and method · R1 Platforms · R2 Endpoints · R3 Operations · R4 Supporting · R5 Mail obligations · R6 Findings · R7 Action plan · R8 Not required · R9 Sources

## Summary

The six NITDA Folio platforms require 30 endpoints across the Workspace (16), the Document Portal (7) and the Correspondence Mailer (7), plus 10 supporting flows, lists and services. 12 are provided, 12 are provided with a caveat, 5 are gaps and 1 is not examined. The gaps are the subsidiary actions, the dynamic actions, bulk assignment and both AI keys. One finding is critical: an OpenRouter API key is embedded in a zipped flow export dated after the key rotation, and the repository secret scan does not open zip files.

| Measure | Count |
|---|---|
| Required endpoints | 30 |
| Provided | 12 |
| Provided with caveat | 12 |
| Gap | 5 |
| Not examined | 1 |
| Findings | 12 |
| Actions | 22 |

### Priority 1 actions

| ID | Action | Owner | Acceptance test |
|---|---|---|---|
| A-01 | Revoke the OpenRouter key embedded in the AI_Document_Processing export, take the key out of the flow definition (use a connection or secret), and record the revocation with the provider. | Platform technical owner with the agency | The provider shows the old key revoked. A fresh export of the flow contains no sk-or- string. A scan of the repository including zip files finds none. |
| A-02 | Confirm the two Google keys in the 4 Aug run record are among the four rotated Google keys. If not, revoke them. | Agency | Provider console shows both keys revoked or deleted. |
| A-04 | Implement the SUBSIDIARY_ACTIONS routes ACKNOWLEDGE, CREATESUPPORTREQUEST and read. Either add a switch to IP_Subsidiary_Actions_Endpoint and repoint the key to it, or add the cases to the dynamic-actions flow and its known list. | Flow builder (platform owner decides the route) | A POST with each operation returns 200 with the write applied. A live reading shows the key as intended. ITEM-65 closes. |
| A-05 | Add cases for the operations the Workspace sends to DYNAMIC_ACTIONS: dispatch, dispatchOutbound (ITEM-25), the 12 activity-lifecycle operations, user-admin:*, route, upsert_record, transition_status and read. Add each to the known list. | Flow builder | npm run test:dynamicops passes with the extended set. Each operation returns something other than 501 or 400 against the live flow. |
| A-07 | Repoint BULK_ASSIGNMENT to IP_Bulk_Assignment_Endpoint, or let that flow take over the workflow id. Retire the retrieval binding. | Platform owner (decision) and operator (repoint) | A live reading shows the key as intended. A bulk assignment test updates every selected task and writes an audit row. |
| A-08 | Bring the live AI_Document_Processing definition (flow id fefa43c6) into the branch. Add a router on action for aiChat and aiAnalyseEventDocs, a directory gate, and inputs for messages, context and referenceId. Keep credentials in a connection. | Flow builder | Both AI calls from the Workspace return an answer. The definition in the branch matches the live flow id. |

## Scope and method

- **Required** means a call site exists in a platform's code. Anything declared but never called is in R8.
- **Provided** is judged on four records: the register (wired workflow), the owner map of 24 Sep (intended flow), the branch's live reading of 27 Sep (flow answering each key), and the flow definitions in the branch.
- Definitions are exports matched to keys by flow name, so they can differ from what runs. The crosswalk records `verified: 0`. No live calls were made.
- **Status values:** Provided, an exported flow does what the caller sends. Provided with caveat, it works with a limit the platform depends on. Gap, the platform sends something the flow does not handle or the key is answered by the wrong flow. Not examined, the live flow or service is not held in the branch.
- **Owners** are the roles the branch names. Actions are proposals; none has been accepted.

## R1 Platforms

| ID | Code | Name | Port | Network use |
|---|---|---|---|---|
| P-01 | runtime | Folio Workspace | 8080 | 16 flow URLs: 15 JSON POST and 1 raw PUT (SCAN_INTAKE) |
| P-02 | portal | NITDA Document Portal | 8081 | 7 flow URLs |
| P-03 | console | Folio Estate Console | 8082 | Probes the Workspace keys. No endpoints of its own. |
| P-04 | mailer | DGO Correspondence Mailer | 8083 | 7 flow URLs of its own. Standalone: shares no key with the Workspace. |
| P-05 | workbench | Folio Flow Workbench | 8765 | 2 relay routes, plus direct calls to a flow URL |
| P-06 | capsule | Folio Vault | 8787 | 8 admin routes and a health probe. Optional. |

## R2 Endpoint register

| ID | Platform | Key or route | Transport | Action or operation | Required by | Live flow (27 Sep) | Intended flow | Evidence examined | Status | Findings | Actions | Note |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| EP-W01 | Folio Workspace | FETCH_ALL | POST JSON | fetchAll | core/data-loader.js:54 (boot and every reload) | IP_FETCH_ALL_BOOTSTRAP | IP_FETCH_ALL__EXTENDED_ENDPOINT (migration) | IP_FETCH_ALL_BOOTSTRAP 17 and 24 Sep; IP_FETCH_ALL__EXTENDED 11 Sep | Provided with caveat | F-08 | A-11 | Each list read is capped at 500 rows (200 for departments). emails and approvals are always empty. |
| EP-W02 | Folio Workspace | FETCH_ACTIVITIES | POST JSON | LIST-ACTIVITIES | core/data-loader.js:54 (fallback); modules/lookup.js:57; modules/fasttrack.js:33 | IP_Get_Docs_Endpoint | No row in the owner map | IP_Get_Docs_Endpoint 12 and 17 Sep | Provided |  |  | Directory-gated; returns filtered documents. Shares its flow with GET_DOCS. |
| EP-W03 | Folio Workspace | GET_DOCS | POST JSON | getDocs | modules/lookup.js:57; modules/fasttrack.js:33 | IP_Get_Docs_Endpoint | IP_Get_Docs_Endpoint | IP_Get_Docs_Endpoint 12 and 17 Sep | Provided |  |  |  |
| EP-W04 | Folio Workspace | REFERENCE_DATA | POST JSON | lookups | modules/fasttrack.js:33 | IP_Reference_Data_Endpoint | IP_Reference_Data_Endpoint | IP_Reference_Data_Endpoint 18 Sep | Provided |  |  | Users, categories, departments. |
| EP-W05 | Folio Workspace | SUBSIDIARY_ACTIONS | POST JSON | INIT; route carried in payload | core/acknowledgement-service.js:171 (ACKNOWLEDGE); core/offline-action-queue.js:14; core/support-service.js:8 (CREATESUPPORTREQUEST); modules/lookup.js:57; modules/fasttrack.js:33 | IP_Dynamic_Global_Actions_Endpoint | IP_Subsidiary_Actions_Endpoint | IP_Subsidiary_Actions_Endpoint 5 Sep: telemetry and CORS only | Gap | F-01 | A-04 | The live flow handles none of the routes the Workspace sends. Readiness register ITEM-65 is blocked on this. |
| EP-W06 | Folio Workspace | DYNAMIC_ACTIONS | POST JSON | dynamicGlobalAction | See operation register OP-D01 to OP-D09 | IP_Dynamic_Global_Actions_Endpoint | IP_Dynamic_Global_Actions_Endpoint | IP_Dynamic_Global_Actions_Endpoint 17 Sep: 4 cases | Gap | F-02 | A-05, A-06 | Implements 4 of the 19 operations in its known list. The Workspace also sends operations outside the list. |
| EP-W07 | Folio Workspace | EMAIL | POST JSON | dispatchEmail | core/correspondence-email-service.js:70; modules/statistics.js:48; modules/reports.js:50 | IP_SEND_EMAIL | IP_SEND_EMAIL | IP_SEND_EMAIL 5 Sep: recipients composed from the payload | Provided with caveat | F-06 | A-09 | Notification-matrix rows RN-021 and RN-024 still describe the older fixed-address sender. |
| EP-W08 | Folio Workspace | FETCH_EMAIL_ATTACHMENTS | POST JSON | fetchEmailAttachments | modules/activities.js:132 | IP_Retrieve_Email_Attachment_Endpoint | IP_Retrieve_Email_Attachment_Endpoint | IP_Retrieve_Email_Attachment_Endpoint 6 Sep | Provided with caveat | F-11 | A-22 | No caller check; reads Outlook directly. |
| EP-W09 | Folio Workspace | SINGLE_ASSIGNMENT | POST JSON (flat) | singleassignment | modules/single-assignment.js:140 | Single_Task_Assignment | IP_Single_Assignment_Endpoint (migration) | No export of the live flow. Intended package IP_Single_Assignment_Endpoint.READY assigns and audits, sends no mail. | Not examined | F-07 | A-10 | Live flow is an older one with no export in the branch. |
| EP-W10 | Folio Workspace | BULK_ASSIGNMENT | POST JSON | bulkassignment | modules/bulk-assignment.js:19 | BULK OPS DATA RETRIEVAL HTTP | IP_Bulk_Assignment_Endpoint | BULKOPSDATARETRIEVALHTTP 11 Sep reads documents; IP_Bulk_Assignment_Endpoint 1 Sep assigns | Gap | F-03 | A-07 | Confirmed live: a document-retrieval flow answers this key. |
| EP-W11 | Folio Workspace | EMAIL_RELATED_TASK | POST JSON | emailtotaskassignment | modules/lookup.js:152 | IP_Create_Email_Assignment | IP_Create_Email_Assignment_Endpoint (migration) | IP_Create_Email_Assignment 11 Sep; IP_Create_Email_Assignment_Endpoint 6 Sep | Provided with caveat | F-07, F-11 | A-10, A-22 | Six mail actions go to one named address. No caller check. |
| EP-W12 | Folio Workspace | AI_DOC_ANALYSIS | POST JSON | aiAnalyseEventDocs (operation classify) | modules/correspondence.js:128; modules/executive.js:30 | AI_Document_Processing | AI_Document_Processing | AI_Document_Processing 11 Sep, flow id 901eb9d7. Live flow id fefa43c6 is not held. | Gap | F-04, F-05 | A-08, A-01 | The export ignores action, messages, operation and referenceId. |
| EP-W13 | Folio Workspace | AI_CHAT | POST JSON | aiChat | modules/assistant.js:48 | AI_Document_Processing | AI_Document_Processing | As EP-W12 | Gap | F-04, F-05 | A-08, A-01 | Shares its flow with EP-W12. |
| EP-W14 | Folio Workspace | OTP_GENERATE | POST JSON (flat) | generate (operation requestOtp) | core/otp-service.js:6; core/otp-identity.js:95 only if auth is enabled | IP_OTP_VERIFY | IP_OTP_Endpoint (repoint pending) | IP_OTP_VERIFY 5 Sep switches on action and handles generate | Provided with caveat | F-09 | A-12 | Auth is disabled, so the sign-in use is dormant. |
| EP-W15 | Folio Workspace | OTP_VERIFY | POST JSON (flat) | verify (operation verifyOtp) | core/otp-service.js:7; core/otp-identity.js:124 only if auth is enabled | IP_OTP_VERIFY | IP_OTP_VERIFY | IP_OTP_VERIFY 5 Sep | Provided |  |  |  |
| EP-W16 | Folio Workspace | SCAN_INTAKE | PUT raw bytes | none | core/scan-intake-service.js | IP_SCAN_INTAKE | IP_SCAN_INTAKE_Endpoint_v2.1 (migration) | IP_SCAN_INTAKE 4 Sep; v2.1 13 Sep | Provided |  |  | Headers X-DGO-Filename, X-DGO-Sha256, X-DGO-Size. Live trigger is not tenant-authenticated (ITEM-59). No contract entry; must not go through DataClient.request(). |
| EP-P01 | NITDA Document Portal | SUBMISSION | POST JSON | record; +verification | document-portal/js/core.js:333 | CG_Submission_Endpoint | CG_Submission_Endpoint | npm run keyimpl: implemented | Provided |  |  | Pilot-critical. Returns {referenceId, uploads[]}; 403 verification_required. |
| EP-P02 | NITDA Document Portal | UPLOAD | PUT raw file | X-Upload-Ticket header | core.js:371 | CG_Upload_Endpoint | CG_Upload_Endpoint | npm run keyimpl: implemented | Provided |  |  | Pilot-critical. Returns {stored, attachmentLink}. |
| EP-P03 | NITDA Document Portal | SUPPORT | POST JSON | create case | core.js:388 | CG_Portal_Support_Endpoint | CG_Portal_Support_Endpoint | npm run keyimpl: implemented | Provided |  |  | Returns {caseRef}. Failures queued for retry. |
| EP-P04 | NITDA Document Portal | VERIFY | POST JSON | {email} | core.js:418 | CG_Portal_Verification_Endpoint | CG_Verification_Endpoint | npm run keyimpl: implemented | Provided |  |  | Returns {sent, expiresAt}; 429. Live and owner-map names differ. |
| EP-P05 | NITDA Document Portal | VERIFY_CONFIRM | POST JSON | {email, code} | core.js:435 | CG_Portal_Verification_Confirmation_Endpoint | CG_Portal_Verification_Confirmation_Endpoint | npm run keyimpl: implemented | Provided |  |  | Returns {verification, expiresAt}. |
| EP-P06 | NITDA Document Portal | STATUS | POST JSON | {referenceId, email} or {referenceId, verification} | core.js:504 | CG_Portal_Status_Check_Endpoint | CG_Portal_Status_Check_Endpoint | npm run keyimpl: implemented | Provided |  |  | Returns {record}; 404 or 400 denied; 403 verification_required; 429. |
| EP-P07 | NITDA Document Portal | WRITEBACK | POST JSON | {referenceId, verification, action, body}; action is respond, note or withdraw | core.js:455 | CG_Portal_Writeback_Endpoint | CG_Portal_Writeback_Endpoint | npm run keyimpl: implemented | Provided |  |  | Needs VERIFY and VERIFY_CONFIRM for the proof. Not queued on failure. |
| EP-M01 | DGO Correspondence Mailer | MAIL_SEND | POST JSON | send | mailer/js/sender.js:187, 290 | Not observed live | DGO_MAIL_SEND | mailer/flows/definitions (dgo-mail/2.0) | Provided with caveat |  | A-20 | Allowlist gov.ng and edu.ng, at most 10 recipients, about 21 MB of attachments. |
| EP-M02 | DGO Correspondence Mailer | MAIL_LOG | POST JSON | list, get | sender.js:263; views/sent.js:173; views/outbox.js:87 | Not observed live | DGO_MAIL_LOG | As EP-M01 | Provided with caveat |  | A-20 |  |
| EP-M03 | DGO Correspondence Mailer | MAIL_DIRECTORY | POST JSON | list, upsert, delete | views/directory.js; sync.js:173 | Not observed live | DGO_MAIL_DIRECTORY | As EP-M01 | Provided with caveat |  | A-20 |  |
| EP-M04 | DGO Correspondence Mailer | MAIL_TEMPLATES | POST JSON | list, upsert, delete | views/templates.js; sync.js:199 | Not observed live | DGO_MAIL_TEMPLATES | As EP-M01 | Provided with caveat |  | A-20 |  |
| EP-M05 | DGO Correspondence Mailer | MAIL_PROVISION | POST JSON | provision | Setup and Settings | Not observed live | DGO_MAIL_PROVISION | As EP-M01 | Provided with caveat |  | A-20 | Creates the mailer lists and file library. |
| EP-M06 | DGO Correspondence Mailer | MAIL_AUTH | POST JSON | requestCode, verifyCode, whoAmI, signOut, listOperators, upsertOperator | mailer/js/session.js:42-61; views/settings.js:173 | Not observed live | DGO_MAIL_AUTH | As EP-M01 | Provided with caveat |  | A-19, A-20 | Missing from the committed config template. With it unset the app skips sign-in. |
| EP-M07 | DGO Correspondence Mailer | MAIL_DATA | POST JSON | mailings, reports and files operations | mailer/js/sync.js | Not observed live | DGO_MAIL_DATA | As EP-M01 | Provided with caveat |  | A-19, A-20 | Missing from the committed config template. |
| EP-T01 | Folio Flow Workbench | GET /api/health | GET | none | tools/flow-workbench/app.js:121 | n/a | n/a | tools/flow-workbench/local_agent.py | Provided |  |  | Local relay on 127.0.0.1:8765. |
| EP-T02 | Folio Flow Workbench | POST /api/request | POST JSON | {url, method, headers, body, timeoutSeconds} | app.js:519 | n/a | n/a | local_agent.py | Provided |  |  | Relays to HTTPS targets only; browser origin locked to the relay. |
| EP-T03 | Folio Flow Workbench | Direct flow URL | Browser fetch | any method | app.js:531 | n/a | n/a | app.js | Provided |  |  | Reply is unreadable because flows send no CORS headers. |
| EP-T04 | Folio Vault | GET /health | GET | none | Readiness probe | n/a | n/a | tools/flow-capsule/app/flowcapsule.py | Provided |  |  | No token needed. |
| EP-T05 | Folio Vault | /admin/flows routes (8) | GET, POST | list, register, versions, verify, rollback, enable, disable | core/capsule-client.js from Admin Suite | n/a | n/a | flowcapsule.py | Provided |  |  | Bearer token required. Optional platform. |
| EP-T06 | Folio Estate Console and Admin Suite | Configured flow URLs | Browser fetch | healthCheck, verify, manual invoke | modules/admin-suite.js:1558; tools/admin-console.html:2528 | n/a | n/a | As called | Provided |  |  | Uses the Workspace keys; adds none. |

## R3 Operation register

| ID | Endpoint key | Operation | Sent by | In known list | Implemented | Result | Finding | Action |
|---|---|---|---|---|---|---|---|---|
| OP-D01 | DYNAMIC_ACTIONS | update (document flag) | core/document-flags.js:146; modules/activities.js; modules/lookup.js:105 | Yes | Yes | Works |  |  |
| OP-D02 | DYNAMIC_ACTIONS | update-task | modules/lookup.js:132 | Yes | Yes | Works |  |  |
| OP-D03 | DYNAMIC_ACTIONS | dispatch | modules/dispatch.js:39, 56 | Yes | No | 501 not implemented | F-02 | A-05 |
| OP-D04 | DYNAMIC_ACTIONS | dispatchOutbound | core/dispatch-service.js:17 | Yes | No | 501 not implemented | F-02 | A-05 |
| OP-D05 | DYNAMIC_ACTIONS | activity-archive, activity-nysc, activity-siwes, each with :create-queue-record, :set-reference-id, :update-activity (12 operations) | modules/activities.js:171; config/dynamic-actions.config.js | Yes | No | 501 not implemented | F-02 | A-05 |
| OP-D06 | DYNAMIC_ACTIONS | user-admin:* | modules/user-admin.js:34 | No | No | 400 unknown operation | F-02 | A-05, A-06 |
| OP-D07 | DYNAMIC_ACTIONS | route | modules/response-tracking.js:39 | No | No | 400 unknown operation | F-02 | A-05, A-06 |
| OP-D08 | DYNAMIC_ACTIONS | upsert_record, transition_status (sent as action, not operation) | modules/meetings.js:157, 202, 232 | No | No | 400 unknown operation | F-02 | A-05, A-06 |
| OP-D09 | DYNAMIC_ACTIONS | read | modules/lookup.js:57; modules/fasttrack.js:33 | No | No | 400 unknown operation | F-02 | A-05, A-06 |
| OP-S01 | SUBSIDIARY_ACTIONS | ACKNOWLEDGE | core/acknowledgement-service.js:171; core/offline-action-queue.js:14 | No | No | 400 unknown operation | F-01 | A-04 |
| OP-S02 | SUBSIDIARY_ACTIONS | CREATESUPPORTREQUEST | core/support-service.js:8 | No | No | 400 unknown operation | F-01 | A-04 |
| OP-S03 | SUBSIDIARY_ACTIONS | read | modules/lookup.js:57; modules/fasttrack.js:33 | No | No | 400 unknown operation | F-01 | A-04 |
| OP-M01 | MAIL_SEND | send | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M02 | MAIL_LOG | list | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M03 | MAIL_LOG | get | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M04 | MAIL_DIRECTORY | list | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M05 | MAIL_DIRECTORY | upsert | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M06 | MAIL_DIRECTORY | delete | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M07 | MAIL_TEMPLATES | list | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M08 | MAIL_TEMPLATES | upsert | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M09 | MAIL_TEMPLATES | delete | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M10 | MAIL_PROVISION | provision | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M11 | MAIL_AUTH | requestCode | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M12 | MAIL_AUTH | verifyCode | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M13 | MAIL_AUTH | whoAmI | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M14 | MAIL_AUTH | signOut | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M15 | MAIL_AUTH | listOperators | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M16 | MAIL_AUTH | upsertOperator | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M17 | MAIL_DATA | listMailings | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M18 | MAIL_DATA | saveMailing | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M19 | MAIL_DATA | deleteMailing | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M20 | MAIL_DATA | listReports | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M21 | MAIL_DATA | saveReport | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M22 | MAIL_DATA | deleteReport | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M23 | MAIL_DATA | uploadFile | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M24 | MAIL_DATA | downloadFile | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M25 | MAIL_DATA | listFiles | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M26 | MAIL_DATA | deleteFile | mailer client (see EP-M01 to EP-M07) | Yes | Yes | Defined in the flow; not observed live |  | A-20 |
| OP-M27 | All seven mailer keys | healthCheck, verify | mailer/js/api.js; Settings | Yes | Yes | Defined in every mailer flow |  |  |
| OP-P01 | WRITEBACK | respond | document-portal/js/core.js:455 | Yes | Yes | Works |  |  |
| OP-P02 | WRITEBACK | note | core.js:455 | Yes | Yes | Works |  |  |
| OP-P03 | WRITEBACK | withdraw (the only one that changes status) | core.js:455 | Yes | Yes | Works |  |  |

## R4 Supporting register

| ID | Item | Kind | What depends on it | What the branch shows | Status | Finding | Action |
|---|---|---|---|---|---|---|---|
| SUP-01 | AUTO_SCHEDULED_SWEEP | Scheduled flow (recurrence trigger, no URL) | The eight timed notifications: citizen reminders, escalations, owner alerts and an operations alert (matrix rows RN-002, 003, 004, 008, 013, 014, 026, 027). | Deployed (readiness ITEM-49). List-threshold failure closed (ITEM-45). Seven of eight mail actions go to a composed recipient; one alerts a fixed address about undelivered notifications. | Provided |  |  |
| SUP-02 | DGO_USERDIRECTORY_SYNC | Sync flow, Microsoft 365 to DGO_UserDirectory | Every gated internal flow looks up the caller and role in DGO_UserDirectory. The Workspace users collection comes from the same list. | Package built and run through six simulated scenarios. Never overwrites Role, Persona, AccessScope or PilotCohort. No export or tenant reading shows it deployed. | Not examined |  | A-15 |
| SUP-03 | Flow Configuration list (allowed origins) | SharePoint list on NITDADGO-EAAACTIVITYTRACKING | Every portal, internal and mailer flow reads it to answer CORS. It must list https://internal-platform.rf.gd (Workspace and mailer) and https://activityweb.page.gd (portal). | Portal flows reading a list on the internal site is an accepted exception (D16). The OTP allow-list row was applied by the operator and not verified (ITEM-56). | Provided with caveat |  | A-16 |
| SUP-04 | SharePoint lists and libraries | Provisioning prerequisite | Rate limits, OTP records, upload tickets, sequence counters, verification proofs, telemetry, audit. Ten governance lists, twelve portal lists, and the mailer eight lists and file library. | Governance lists verified present on 9 Sep (97 present, 10 seeds). Portal lists from 07-portal-provisioning.flow.json. Mailer lists from DGO_MAIL_PROVISION. Portal Flow Telemetry.RunRecordJson applied but unverified (ITEM-30). | Provided with caveat |  | A-20 |
| SUP-05 | ECM_DOCS_INTAKE | Bridge flow (HTTP, tenant-authenticated) | The design one portal-to-internal crossing: reads the portal registry for the internal platform and writes status back (D1). The Workspace public-portal channel is meant to arrive through FETCH_ALL. | The flow exists. No Workspace code and no exported flow calls it, and the FETCH_ALL package reads no portal list. | Gap |  | A-14 |
| SUP-06 | Internal proof ledger | SharePoint list | The internal OTP-verify and FETCH_ALL kits mint and read internal-session proofs from it. | Decided as a separate list and not yet provisioned (ITEM-64). The live packages do not carry the check. | Not examined |  | A-17 |
| SUP-07 | Outlook mailboxes | Microsoft 365 connection | Every flow with a send action. Service mailbox dgsregistry@nitda.gov.ng; the mailer sends as its connection or a shared mailbox. | Sending identity is marked TENANT_VERIFICATION_REQUIRED in config/notification-delivery.config.js. | Not examined |  | A-18 |
| SUP-08 | Power Automate Management connector | Connector | GetFlow in the flows that write run records: EMAIL_RELATED_TASK, FETCH_ALL (11 Sep), FETCH_EMAIL_ATTACHMENTS, VERIFY_CONFIRM, WRITEBACK. | The connection must be bound in the tenant. | Not examined |  | A-18 |
| SUP-09 | Adobe PDF Tools connector and OpenRouter | External services | The AI flow extracts PDF text with Adobe PDF Tools and prompts OpenRouter. | Only the export held calls them. It embeds an API key (F-05). | Gap | F-05 | A-01, A-08 |
| SUP-10 | Web hosts for the static platforms | Hosting | Workspace and Mailer at https://folio-platform.page.gd (Mailer as /mailer.html); Portal at https://folio-portal.page.gd (owner, 2026-10-19). | Hosts must match the allowed-origins rows in SUP-03 and the mailer allowedOrigin. | Provided with caveat |  | A-16 |

In the packages examined no required flow calls another flow.

## R5 Mail obligations register

The 39 required notifications from `config/notification-matrix.config.js`, with the matrix's own status. Remediation text per row is in the workbook.

| ID | Event | Platform | Audience | Channel | Carrier | Status (matrix) | Severity | Owner |
|---|---|---|---|---|---|---|---|---|
| RN-001 | A submission is accepted and a reference is minted | portal | citizen | email | docs/folio-Master-Flows-and-Endpoints/surfaces/portal/designer-paste/Portal_SUBMISSION_ECM_DOCS.designer-paste.json | ABSENT | Critical | Platform technical owner |
| RN-002 | A record moves to action-required | portal | citizen | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/import-package/DGO_SCHEDULED_SWEEP (legacy import package, Recurrence trigger) | PROVISIONED | Critical | Process owner, correspondence lifecycle |
| RN-003 | A decision is issued — the record moves to approved | portal | citizen | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/import-package/DGO_SCHEDULED_SWEEP (legacy import package, Recurrence trigger) | PROVISIONED | Critical | Process owner, correspondence lifecycle |
| RN-004 | A decision is issued — the record moves to declined | portal | citizen | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/import-package/DGO_SCHEDULED_SWEEP (legacy import package, Recurrence trigger) | PROVISIONED | Critical | Process owner, correspondence lifecycle |
| RN-005 | A submitter withdraws their own submission | portal | citizen | email | docs/folio-Master-Flows-and-Endpoints/surfaces/portal/designer-paste/Portal_WRITEBACK_ECM_DOCS.designer-paste.json | ABSENT | High | Process owner, correspondence lifecycle |
| RN-006 | A citizen requests a verification code | portal | citizen | email | Portal_VERIFY_ECM_DOCS and Portal_VERIFY_CONFIRM_ECM_DOCS, action Send_Otp_Email | MISADDRESSED | Critical | Platform technical owner |
| RN-007 | A support case is opened from the portal | portal | citizen | email | Portal_SUPPORT_ECM_DOCS, action Send_Support_Acknowledgement | PROVISIONED | Medium | Platform technical owner |
| RN-008 | A support case is answered or closed | portal | citizen | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/import-package/DGO_SCHEDULED_SWEEP (legacy import package, Recurrence trigger) | PROVISIONED | High | Registry helpdesk owner |
| RN-009 | A record is assigned to one officer | internal | assignee | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/designer-paste/DGO_SINGLE_ASSIGNMENT.designer-paste.json | REGRESSION | Critical | Platform technical owner |
| RN-010 | Records are assigned in bulk | internal | assignee | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/designer-paste/DGO_BULK_ASSIGNMENT.designer-paste.json | MISADDRESSED | Critical | Platform technical owner |
| RN-011 | A record is assigned with supporting and copy-to parties | internal | supporting | email | DGO_SINGLE_ASSIGNMENT and DGO_BULK_ASSIGNMENT | ABSENT | Medium | Process owner, correspondence lifecycle |
| RN-012 | An officer is reminded to acknowledge an assignment | internal | assignee | email | core/acknowledgement-service.js via SUBSIDIARY_ACTIONS | LOCAL_ONLY | High | Platform technical owner |
| RN-013 | An acknowledgement clock expires unacknowledged | internal | owner | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/import-package/DGO_SCHEDULED_SWEEP (legacy import package, Recurrence trigger) | PROVISIONED | High | Operational owner |
| RN-014 | A due date is breached | internal | owner | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/import-package/DGO_SCHEDULED_SWEEP (legacy import package, Recurrence trigger) | PROVISIONED | High | Operational owner |
| RN-015 | An operator notifies the owner of a fast-tracked record | internal | owner | email | No artifact. The action has no declared backend at all. | LOCAL_ONLY | High | Platform technical owner |
| RN-016 | An officer requests a sign-in code | internal | assignee | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/designer-paste/DGO_OTP_GENERATE.designer-paste.json, action Send_Otp_Mail | MISADDRESSED | Critical | Platform technical owner |
| RN-017 | A record enters pending_review and awaits an approval | internal | approver | email | No artifact. | ABSENT | High | Process owner, correspondence lifecycle |
| RN-018 | An approval is decided, returned or rejected | internal | originator | email | No artifact. | ABSENT | High | Process owner, correspondence lifecycle |
| RN-019 | A record is reassigned from one officer to another | internal | assignee | email | DGO_SINGLE_ASSIGNMENT | ABSENT | Medium | Process owner, correspondence lifecycle |
| RN-020 | A comment is added to a reference someone else is working | internal | assignee | in-app | core/notification-center.js, and a cross-device carrier it does not yet have | ABSENT | Low | Platform technical owner |
| RN-021 | An officer sends an outward official correspondence | internal | correspondent | email | The flow behind the EMAIL endpoint — deployed as Web - Send Email | MISADDRESSED | Critical | Platform technical owner |
| RN-022 | An approved response is dispatched to its recipients | internal | correspondent | email | DGO_DYNAMIC_GLOBAL_ACTIONS, operation dispatchoutbound | UNIMPLEMENTED | Critical | Platform technical owner |
| RN-023 | A dispatch fails | internal | originator | in-app | core/action-authority.js failure toast and core/notification-center.js | PROVISIONED | Medium | Platform technical owner |
| RN-024 | An officer sends a report or statistics email | internal | originator | email | The flow behind the EMAIL endpoint — deployed as Web - Send Email | MISADDRESSED | High | Platform technical owner |
| RN-025 | A flow run completes and its run record is captured | flow-estate | registry-fixed | email | Send_Telemetry_Email, in the deployed flows | REGRESSION | Medium | Platform technical owner |
| RN-026 | An outbound message to a citizen fails to send | flow-estate | administrator | email | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/import-package/DGO_SCHEDULED_SWEEP (legacy import package, Recurrence trigger) | PROVISIONED | High | Operational owner |
| RN-027 | A failed outbound message is retried | flow-estate | citizen | ledger | docs/folio-Master-Flows-and-Endpoints/surfaces/internal/import-package/DGO_SCHEDULED_SWEEP (legacy import package, Recurrence trigger) | PROVISIONED | High | Operational owner |
| RN-028 | A provisioning or gap-closure run completes | flow-estate | administrator | email | Global_Gap_Remediation_Provisioning, Send an email notification V2 | PROVISIONED | Low | Platform technical owner |
| RN-029 | A scanned document is deposited by the intake pipeline | flow-estate | registry-fixed | email | DGSO INCOMING AI PROCESSING, Send an email (V2) | PROVISIONED | Low | Registry owner |
| RN-030 | A governed action fails | internal | operator | in-app | core/action-authority.js and core/notification-center.js | PROVISIONED | Low | Platform technical owner |
| RN-031 | An operator action succeeds and must remain findable afterwards | internal | operator | in-app | core/notification-center.js | PROVISIONED | Low | Platform technical owner |
| RN-032 | A write cannot reach the registry and is held on the device | internal | operator | in-app | core/pending-queue.js and the module toast at each call site | PROVISIONED | Low | Platform technical owner |
| RN-033 | A verification code is requested for delivery by SMS | internal | assignee | sms | No artifact. No SMS connector exists anywhere in the estate. | UNIMPLEMENTED | Medium | Platform technical owner |
| RN-034 | An escalation is raised on a record | internal | owner | email | No artifact. Neither action has a declared backend. | LOCAL_ONLY | High | Platform technical owner |
| RN-035 | A reminder set on a task falls due | internal | assignee | email | No artifact. A scheduled carrier must be created — see PRE-2. | LOCAL_ONLY | Medium | Platform technical owner |
| RN-036 | The executive authority delegates a record to someone else | internal | assignee | email | No artifact. | ABSENT | High | Process owner, correspondence lifecycle |
| RN-037 | A new portal submission arrives and the registry must pick it up | flow-estate | administrator | email | Portal_SUBMISSION_ECM_DOCS, or the monitored registry mailbox | MISADDRESSED | High | Registry owner |
| RN-038 | A record is assigned and the cascade resolves a copy-to and inform list | internal | copyTo | email | DGO_SINGLE_ASSIGNMENT and DGO_BULK_ASSIGNMENT | ABSENT | Low | Process owner, correspondence lifecycle |
| RN-039 | An HTTP flow registry exception is open and assigned to someone | flow-estate | assignee | email | Send_Exception_Email, inside Notify_Each_Exception, in 06 - GOV - Registry Exception | PROVISIONED | Medium | Platform technical owner |

## R6 Findings register

### F-05 · Critical · An API key is committed where the secret scan does not look

| Field | Value |
|---|---|
| Detail | An OpenRouter bearer token (sk-or-v1-...) is in the Authorization header of the HTTP action inside the AI_Document_Processing export. The export is dated 11 Sep, after the agency confirmed on 8 Sep that all provider keys were rotated (readiness ITEM-7). It is either the new key or one that was missed. Two Google API keys (AIzaSy...) sit in the 4 Aug run record, which predates the rotation. ITEM-7 lists four Google keys as rotated; the branch does not say these two are among them. No key was tested. |
| Evidence | docs/folio-Master-Flows-and-Endpoints/exports/AI_Document_Processing_20260911185206.zip (definition.json); docs/reference/foundational/flows/run-records/dgso_incoming_ai_processing_provisioning_report_2026-08-04_1/ (definition_raw.json, standard.html); tests/check-secrets.mjs reads text files only; scan of every tracked zip and xlsx found no other match. |
| Affects | EP-W12, EP-W13, SUP-09 |
| Actions | A-01, A-02, A-03 |

### F-01 · High · SUBSIDIARY_ACTIONS routes are not implemented by the flow that answers the key

| Field | Value |
|---|---|
| Detail | The 27 Sep live reading shows the dynamic-actions flow answering this key. It handles four operations and none of the routes the Workspace sends (ACKNOWLEDGE, CREATESUPPORTREQUEST, read). The flow the owner map names, IP_Subsidiary_Actions_Endpoint, does telemetry, CORS and a response only. |
| Evidence | docs/folio-Master-Flows-and-Endpoints/deployment/internal/evidence/2026-09-27-live-endpoint-wiring.json; readiness ITEM-65 (blocked); docs/folio-Master-Flows-and-Endpoints/exports/IP_Subsidiary_Actions_Endpoint_20260905193834.zip |
| Affects | EP-W05, OP-S01 to OP-S03 |
| Actions | A-04 |

### F-02 · High · DYNAMIC_ACTIONS implements 4 of 19 operations, and the Workspace sends others outside the list

| Field | Value |
|---|---|
| Detail | dispatch, dispatchOutbound and 12 activity-lifecycle operations answer 501. user-admin:*, route, upsert_record, transition_status and read answer 400 unknown operation. The live flow is the intended IP_Dynamic_Global_Actions_Endpoint (repointed 27 Sep). transitionstatus, logauditevent and archivereference are in the list but the Workspace never calls them. |
| Evidence | IP_Dynamic_Global_Actions_Endpoint packages of 12 and 17 Sep (Switch_Dynamic_Operation, Compose_Dynamic_Known_Operations); notification-matrix RN-022 |
| Affects | EP-W06, OP-D03 to OP-D09 |
| Actions | A-05, A-06 |

### F-03 · High · BULK_ASSIGNMENT is answered by a retrieval flow

| Field | Value |
|---|---|
| Detail | The 27 Sep live reading confirms BULK OPS DATA RETRIEVAL HTTP answers this key. Its export reads a document by taskId or runs an OData query and has no assignment write. The owner map names IP_Bulk_Assignment_Endpoint, which does assign. |
| Evidence | 2026-09-27-live-endpoint-wiring.json; BULKOPSDATARETRIEVALHTTP_20260911185143.zip; matched bundle IP_Bulk_Assignment_Endpoint_20260901023331.zip |
| Affects | EP-W10 |
| Actions | A-07 |

### F-04 · High · The AI keys share one flow, and the only export held cannot serve both callers

| Field | Value |
|---|---|
| Detail | AI_Document_Processing reads triggerBody()[text_1], fetches a SharePoint item attachments, extracts PDF text through Adobe PDF Tools and posts a prompt to OpenRouter. It has no switch, no directory gate and does not read action, messages, operation or referenceId. The Workspace sends {messages, scoped, context} for AI_CHAT and {operation: classify, referenceId, subject, ...} for AI_DOC_ANALYSIS. The export has a different flow id from the live flow (fefa43c6), whose definition is not in the branch. |
| Evidence | AI_Document_Processing_20260911185206.zip; modules/assistant.js:48; modules/correspondence.js:128 |
| Affects | EP-W12, EP-W13 |
| Actions | A-08 |

### F-11 · High · Three required flows have no caller check

| Field | Value |
|---|---|
| Detail | The intended packages for FETCH_EMAIL_ATTACHMENTS, EMAIL_RELATED_TASK and SUBSIDIARY_ACTIONS do not look the caller up in the user directory. Triggers accept anonymous callers and Workspace authentication is disabled, so the flow is the only place a check can happen. FETCH_EMAIL_ATTACHMENTS reads Outlook messages and attachments. EMAIL_RELATED_TASK creates tasks and sends mail. |
| Evidence | IP_Retrieve_Email_Attachment_Endpoint_20260906045907, IP_Create_Email_Assignment_Endpoint_20260906043757 and IP_Subsidiary_Actions_Endpoint_20260905193834 packages (no directory list read); docs/folio-Master-Flows-and-Endpoints/deployment/internal/INTERNAL_FLOWS_README.md (caller gate pattern) |
| Affects | EP-W05, EP-W08, EP-W11 |
| Actions | A-22 |

### F-07 · Medium · Assignment mail: the intended single-assignment flow sends none, and email-to-task sends to one fixed person

| Field | Value |
|---|---|
| Detail | The live SINGLE_ASSIGNMENT flow is the older Single_Task_Assignment, which has no export in the branch. The intended package has no send action (matrix RN-009 regression). EMAIL_RELATED_TASK has six send actions all addressed to one named address. |
| Evidence | IP_Single_Assignment_Endpoint.READY package; IP_Create_Email_Assignment packages of 6 and 11 Sep; notification-matrix RN-009, RN-010 |
| Affects | EP-W09, EP-W11 |
| Actions | A-10 |

### F-08 · Medium · FETCH_ALL feeds no emails or approvals and caps every list

| Field | Value |
|---|---|
| Detail | Every FETCH_ALL package hard-codes emails and approvals as empty arrays. Each list read is capped at 500 rows (200 for departments). The Workspace email collection has no source in the exported flow. |
| Evidence | IP_FETCH_ALL_BOOTSTRAP 17 and 24 Sep; IP_FETCH_ALL__EXTENDED 11 Sep (Set_variable_varData_FetchAll_Success) |
| Affects | EP-W01 |
| Actions | A-11 |

### F-06 · Low · EMAIL: the live flow is the payload-addressed sender and the notification matrix is out of date

| Field | Value |
|---|---|
| Detail | The 27 Sep live reading has IP_SEND_EMAIL answering EMAIL, as the owner intended. Its package composes recipients from the payload, checks the caller and writes a receipt per send. Matrix rows RN-021 and RN-024 still read MISADDRESSED and describe the older Web - Send Email flow; their evidence is dated 2 Sep. The 5 Sep package was read, not the live definition. |
| Evidence | 2026-09-27-live-endpoint-wiring.json; IP_SEND_EMAIL_20260905184716.zip; config/notification-matrix.config.js |
| Affects | EP-W07 |
| Actions | A-09 |

### F-09 · Low · OTP wiring differs between the live reading and the owner map

| Field | Value |
|---|---|
| Detail | The live reading has IP_OTP_VERIFY answering both OTP keys. The owner map wants IP_OTP_Endpoint for generate and that repoint is pending. Both exports handle what the Workspace sends. |
| Evidence | 2026-09-27-live-endpoint-wiring.json (planOfSameDay); IP_OTP_VERIFY and IP_OTP_Endpoint packages of 5 Sep |
| Affects | EP-W14 |
| Actions | A-12 |

### F-10 · Low · Flow identity is only partly established

| Field | Value |
|---|---|
| Detail | The branch holds a live reading of 27 Sep (693 flows visible). It names the flow behind each of 25 keys: 15 as the owner intended, 9 different, 1 with no row in the owner map. It records no signatures. Exports are matched to keys by flow name, not by id, and the crosswalk records verified: 0. |
| Evidence | 2026-09-27-live-endpoint-wiring.json; docs/folio-Master-Flows-and-Endpoints/registers/flow-identity-crosswalk.json |
| Affects | All endpoints |
| Actions | A-13 |

### F-12 · Low · The mailer package documents its configuration inconsistently

| Field | Value |
|---|---|
| Detail | mailer/config.js and mailer/config.local.example.js list 5 of the 7 keys the app requires (MAIL_AUTH and MAIL_DATA are missing). scripts/platforms.config.mjs says five flows. docs/reference/PLATFORM_NAMING.md says five platforms and omits the mailer. The mailer flows and lists are recorded as specified, not observed. |
| Evidence | mailer/js/settings.js (ENDPOINT_KEYS, isDeployed); mailer/js/app.js:76; docs/folio-Master-Flows-and-Endpoints/reference/ESTATE-REGISTER.md |
| Affects | EP-M06, EP-M07 |
| Actions | A-19, A-20 |

## R7 Action plan

### Priority 1: do first

| ID | Action | Type | Owner (role) | Acceptance test | Depends on | Register refs | Findings |
|---|---|---|---|---|---|---|---|
| A-01 | Revoke the OpenRouter key embedded in the AI_Document_Processing export, take the key out of the flow definition (use a connection or secret), and record the revocation with the provider. | Security | Platform technical owner with the agency | The provider shows the old key revoked. A fresh export of the flow contains no sk-or- string. A scan of the repository including zip files finds none. |  | ITEM-7 | F-05 |
| A-02 | Confirm the two Google keys in the 4 Aug run record are among the four rotated Google keys. If not, revoke them. | Security | Agency | Provider console shows both keys revoked or deleted. |  | ITEM-7 | F-05 |
| A-04 | Implement the SUBSIDIARY_ACTIONS routes ACKNOWLEDGE, CREATESUPPORTREQUEST and read. Either add a switch to IP_Subsidiary_Actions_Endpoint and repoint the key to it, or add the cases to the dynamic-actions flow and its known list. | Build | Flow builder (platform owner decides the route) | A POST with each operation returns 200 with the write applied. A live reading shows the key as intended. ITEM-65 closes. |  | ITEM-65 | F-01 |
| A-05 | Add cases for the operations the Workspace sends to DYNAMIC_ACTIONS: dispatch, dispatchOutbound (ITEM-25), the 12 activity-lifecycle operations, user-admin:*, route, upsert_record, transition_status and read. Add each to the known list. | Build | Flow builder | npm run test:dynamicops passes with the extended set. Each operation returns something other than 501 or 400 against the live flow. | A-06 | ITEM-25 | F-02 |
| A-07 | Repoint BULK_ASSIGNMENT to IP_Bulk_Assignment_Endpoint, or let that flow take over the workflow id. Retire the retrieval binding. | Wiring | Platform owner (decision) and operator (repoint) | A live reading shows the key as intended. A bulk assignment test updates every selected task and writes an audit row. |  | ITEM-65 | F-03 |
| A-08 | Bring the live AI_Document_Processing definition (flow id fefa43c6) into the branch. Add a router on action for aiChat and aiAnalyseEventDocs, a directory gate, and inputs for messages, context and referenceId. Keep credentials in a connection. | Build | Flow builder | Both AI calls from the Workspace return an answer. The definition in the branch matches the live flow id. | A-01 |  | F-04 |

### Priority 2: schedule next

| ID | Action | Type | Owner (role) | Acceptance test | Depends on | Register refs | Findings |
|---|---|---|---|---|---|---|---|
| A-03 | Extend tests/check-secrets.mjs to open zip and xlsx files and scan for provider-key patterns (sk-or-v1-, AIza, hf_). | Control | Platform technical owner | The test fails on the current AI export until A-01 is done, then passes. | A-01 |  | F-05 |
| A-06 | Align the client with the flow contract: make meetings send operation instead of action, and settle the names used by user-admin and response-tracking so every sent operation is in the known list. | Build | Platform technical owner | Every operation in the operation register OP-D01 to OP-D09 is in the flow known list. npm run test:dynamicops passes. |  |  | F-02 |
| A-10 | Add assignee notification to the intended single-assignment package (port the recipient expression from Deployed - Create Task, matrix RN-009), repoint SINGLE_ASSIGNMENT, and re-address the six fixed sends in EMAIL_RELATED_TASK to the resolved assignee. | Build | Flow builder | An assignment sends one mail to the assignee and none to a fixed address. Matrix RN-009 and RN-010 change status. |  | RN-009, RN-010 | F-07 |
| A-11 | Feed emails and approvals from FETCH_ALL, or remove those collections from the Workspace. Add paging beyond 500 rows (200 for departments). | Build | Flow builder with the platform owner | A test mailbox with mail returns a non-empty emails collection. A list of more than 500 rows returns all rows. |  |  | F-08 |
| A-14 | Decide and document how portal submissions reach the Workspace: read the portal registry through the tenant-authenticated ECM_DOCS_INTAKE bridge from FETCH_ALL, or accept a portal-only path. | Decision | Agency (decisions D1 and D6, ITEM-37) | A written decision. If the bridge is used, a submission made in the portal appears in the Workspace with the public-portal channel. |  | ITEM-37 | SUP-05 |
| A-15 | Deploy DGO_USERDIRECTORY_SYNC into a recurrence flow and record a tenant reading of it. | Deploy | Platform technical owner with the tenant administrator | DGO_UserDirectory rows update from Microsoft 365, an audit row is written per run, and the flow appears in a live reading. |  |  | SUP-02 |
| A-16 | Verify the allowed-origins rows for https://folio-platform.page.gd and https://folio-portal.page.gd against the CORS answer of every flow, including the mailer allowedOrigin. | Verify | Operator | A browser call from each host to each flow succeeds and reads the reply. |  | ITEM-56 | SUP-03, SUP-10 |
| A-18 | Verify the Outlook sending identity and shared mailbox, and bind the Power Automate Management connection, in the tenant. | Verify | Tenant administrator | A test send from each mail-sending flow arrives from the intended address. GetFlow succeeds in the run-record flows. |  | PRE-1 | SUP-07, SUP-08 |
| A-20 | Run the mailer setup in the tenant and record a reading of its seven flows and lists. | Verify | Operator | ESTATE-REGISTER shows the mailer flows and lists as observed. Each of the 26 mailer operations answers a healthCheck. | A-19 |  | F-12 |
| A-21 | Work the mail obligations still open in the notification matrix: 9 absent, 6 misaddressed, 2 regression, 2 unimplemented, 4 local-only. Use each row remediation. | Build | Owners named per row in the matrix | Matrix statuses move to PROVISIONED as verified by scripts/verify-notification-matrix.mjs. | A-09, A-10 | RN rows | MAIL register |
| A-22 | Add the directory caller gate (Status active plus role permission) to FETCH_EMAIL_ATTACHMENTS, EMAIL_RELATED_TASK and the SUBSIDIARY_ACTIONS flow. | Build | Flow builder | A call with an unknown email returns 401 and with a role lacking permission returns 403, and no mail or task is touched. | A-04 |  | F-11 |

### Priority 3: housekeeping and records

| ID | Action | Type | Owner (role) | Acceptance test | Depends on | Register refs | Findings |
|---|---|---|---|---|---|---|---|
| A-09 | Read the live IP_SEND_EMAIL definition and update matrix rows RN-021 and RN-024, then re-run scripts/verify-notification-matrix.mjs. | Records | Platform technical owner | The matrix status matches the live definition and the verifier passes. |  |  | F-06 |
| A-12 | Finish the OTP_GENERATE repoint to IP_OTP_Endpoint once its package is fixed, or amend the owner map to accept IP_OTP_VERIFY for both keys. | Wiring | Platform owner | Live reading and owner map agree for OTP_GENERATE. |  |  | F-09 |
| A-13 | Extend the live reading to record each flow definition and id, so exports match keys by id, and record verified in the crosswalk. | Records | Platform technical owner | flow-identity-crosswalk.json shows verified greater than 0 and no key matched by name only. |  | ITEM-65 | F-10 |
| A-17 | Provision the internal proof ledger list before pasting the DGO_FETCH_ALL and DGO_OTP_VERIFY kits. | Provision | Operator | The list exists with Purpose and Consumed columns. npm run test:proofidentity passes. |  | ITEM-64 | SUP-06 |
| A-19 | Fix the mailer documentation: add MAIL_AUTH and MAIL_DATA to config.js and config.local.example.js, change the platforms.config summary to seven flows, and update PLATFORM_NAMING.md to six platforms. | Records | Platform technical owner | Filling the committed template makes isDeployed true. The documents agree on seven flows and six platforms. |  |  | F-12 |

## R8 Declared but not required

| ID | Item | Reason |
|---|---|---|
| EX-01 | AI_EMAIL_ANALYSIS | Contract, settings label and workflow binding exist. No caller. |
| EX-02 | BULK_ASSIGNMENT_DIRECT | Contract, settings label and adapter entry exist. No caller. |
| EX-03 | SUBSIDIARY_ACTIONS route keys | REFRESH_EMAILS, LOAD_EMAIL_DETAILS, AI_ANALYSE_EMAIL, CREATE_TASK, UPDATE_TASK, LOAD_EVENT_INFO, AI_CHAT, TRACK, GET_ALL, GET_BOOTSTRAP, LISTDOCS, GETDOC, BULKASSIGN, GETREFERENCES. Declared, never sent. |
| EX-04 | Unused aliases | VERIFY_OTP_AND_EXECUTE, TRANSITION_STATUS, LOG_AUDIT_EVENT, ARCHIVE_REFERENCE. The client calls none of them. |
| EX-05 | Vault invoke route | POST /invoke/{alias}. The client omits it on purpose. |
| EX-06 | Governance flows and unbound exports | The GOV - flows and every exported flow that is neither bound to a key nor listed in the supporting register. No platform code calls them and no required flow depends on them. |
| EX-07 | Register workflow records | The 51 workflow records other than the 20 bound to keys. |
| EX-08 | Estate tooling | Scripts using the Power Automate Management API and Microsoft sign-in, and the mailer setup tool. They provision and commission once; no platform calls them at run time. |

## R9 Sources and evidence

| ID | Source | Used for |
|---|---|---|
| S-01 | docs/folio-Master-Flows-and-Endpoints/registers/endpoint-register.json and config/endpoint-atlas.data.js | Register: workflow bound to each of 25 keys |
| S-02 | docs/folio-Master-Flows-and-Endpoints/reference/contract-key-flow-map.json and contract-key-flow-reconciliation.json | Owner map (24 Sep): intended flow per key; reconciliation of 24 keys |
| S-03 | docs/folio-Master-Flows-and-Endpoints/deployment/internal/evidence/2026-09-27-live-endpoint-wiring.json | Live reading (27 Sep): flow answering each key; 693 flows visible |
| S-04 | docs/deployment/PRODUCTION_READINESS_REGISTER.json | Register items ITEM-7, 25, 30, 37, 45, 49, 56, 59, 64, 65 |
| S-05 | config/notification-matrix.config.js | 39 required notifications and their status |
| S-06 | docs/folio-Master-Flows-and-Endpoints/exports/*.zip (12 packages) | Flow definitions parsed for triggers, cases, connectors, lists, mail, HTTP hosts |
| S-07 | docs/folio-Master-Flows-and-Endpoints/artifacts/matched-flow-packages/2026-09-24/Matched_Flow_ZIP_Packages_Available.zip (retired 2026-10-21; registers/flow-retirement.json) | 20 packages matched to contract keys |
| S-08 | mailer/flows/flows.catalogue.json, mailer/flows/packages, mailer/js | Mailer contract dgo-mail/2.0, seven flows and client call sites |
| S-09 | docs/folio-Master-Flows-and-Endpoints/deployment/sharepoint/portal-wiring.json | Portal trust boundary, bridge and accepted crossings |
| S-10 | docs/folio-Master-Flows-and-Endpoints/registers/flow-identity-crosswalk.json | Key to tenant-flow candidates; verified count |
| S-11 | core/, modules/, shared/, document-portal/js, mailer/js, tools/ | Call sites in platform code |
| S-12 | scripts/platforms.config.mjs and docs/reference/PLATFORM_NAMING.md | Platform list and names |
| S-13 | npm run keyimpl; npm run platforms; tests/check-secrets.mjs | Commands run at this baseline |
