# Repository and tenant change set

These are the changes that put this package into service. They are listed for the release owner to apply. The package itself changes nothing. Every change keeps the existing action names, flow IDs, variables, expressions and dynamic-content references.

## F1 · Double frame — IP_SEND_EMAIL (df59a69f)

Apply `IP_SEND_EMAIL-frame-hero.md`, sections 1 to 5. The callers send the fragments in `01-Templates/fragments/`.

## F2 · No template — RN-020, RN-022

- **RN-020** (comment): use `SN-Comment` and `SN-Comment--hold`.
- **RN-022** (Desk closure): use `CL-Closure`.
- Both go through the F1 change.

## F3 · GOV flows off-brand

Paste the matching complete document from `01-Templates/email/` into the body of each action:

| Flow | Action | Template |
|---|---|---|
| GOV-01 to GOV-08 | `Send_Final_Report_Email` | `GV-Run-Report` (Succeeded), `--failed`, `--timed-out`; GOV-01 uses `--gov01-provisioning` |
| GOV-05, GOV-08 | `Send_Execution_Report_Email` | `GV-Execution-Report`, `--failed` |
| GOV-04 | `Send_Failure_Owner_And_Governance_Alert` | `GV-Failing-Alert` |
| GOV-04 | `Send_Failure_Reminder_Or_Escalation` | `GV-Failing-Escalation`, `--escalated` |
| GOV-04 | `Send_Recovery_Notification` | `GV-Recovered` |
| GOV-04 | `Send_Stale_Owner_And_Governance_Alert` | `GV-Stale-Alert` |
| GOV-04 | `Send_Stale_Reminder_Or_Escalation` | `GV-Stale-Escalation`, `--escalated` |
| GOV-06 | `Send_Exception_Email` | `GV-Registry-Exception`, `--medium-low` |

- Choose the variant with a `Condition` on the outcome or severity that the flow already computes.
- Map each `{{placeholder}}` to the expression listed in `03-Registers/power-automate-map.csv`.
- Paste each template's plain-text file (`01-Templates/text/`) into the action's text body, if the connector has one.

## F4 · Desk letters, Mailer letters, report e-mails, sign-in code

| Where | Change |
|---|---|
| Correspondence Desk | Send the CL-* fragments via IP_SEND_EMAIL |
| DGO_MAIL_SEND letterhead (TR-094 to TR-099) | Use the CL-* complete documents |
| `mailer/js/seed-templates.js` | Replace the three Cambria starters with `ML-Cover-Letter`, `ML-Follow-Up` and `ML-Invitation`, plus their `--no-message` variants |
| DGO_MAIL_AUTH `Send_Code` | Use `ML-Sign-In-Code` |
| `modules/reports.js` (`reportHtml`) | Send the `RP-Management` fragment |
| `modules/statistics.js` (`htmlDoc`) | Send the `RP-Statistics` fragment |

`reports.js` renders the empty-state row from the `folio-empty-state` comment in the template when the date range returns no rows.

**TR-100 (operator-authored letters in the SharePoint list DGOMailTemplates).** Make `CL-Official` the required base for new entries:

- Operators replace only the hero headline and the body cell.
- Masthead, colours and footer stay fixed.
- Existing entries are re-saved on that base when they are next edited.

## F5 · Workspace support request and citizen overdue notice

- **WS-Support-Request (TR-107; also TR-133, the legacy "Internal Support Request").** Add a `Send_an_email_(V2)` step after `CREATESUPPORTREQUEST` in SUBSIDIARY_ACTIONS, with `WS-Support-Request` as the body. The recipient is `dgs@nitda.gov.ng` (supportEmail).
- **PT-Ack-Overdue (TR-108; also TR-143, the legacy "Acknowledgement Clock Overdue").**
  - In CG_Portal_Daily_Sweep (f12aec6d), add a `Send_an_email_(V2)` step after the registry alert for each overdue record. Name it `Send_Citizen_Ack_Overdue_Email`.
  - The recipient is the submission's citizen e-mail.
  - The bindings `citizenName`, `citizenEmail`, `trackingNumber`, `submittedDate`, `dueDate` and `trackingUrl` come from the record the sweep already reads.
  - This template is NITDA-only (external).

## F6 · Flows not yet deployed

When these flows are deployed, they use the existing designs:

| Rows | Flow | Template |
|---|---|---|
| TR-109 | DGO_USERDIRECTORY_SYNC `Send_Run_Report` | `GV-Run-Report` |
| TR-110, TR-114 | Telemetry mails (DGO_USERDIRECTORY_SYNC, ECM_DOCS_INTAKE) | `OP-Run-Telemetry` |
| TR-111 | DGO_ENDPOINT_INVENTORY `Send_Governance_Report_Email` | `GV-Execution-Report` |
| TR-116 to TR-123 | One-off set-up reports | `GV-Run-Report` |
| TR-112, TR-113 | Flow Estate and Flows In Use | `GV-Execution-Report` |

TR-115 is superseded by retry rule A and needs no template.

## F7 · Legacy 20-template library

- The library is not wired to any send.
- Two of its intents now have catalogue templates: TR-133 → `WS-Support-Request`, TR-143 → `PT-Ack-Overdue`.
- Mark the library folder read-only and as superseded by `email-catalogue/`. ITEM-68 stays closed.

## B1 · Brand README describes an older state

Replace the e-mail section of `styles/dgo-design-system/README.md` with `README-email-section.md` in this folder.

## B2 · Sub-brand applied unevenly

Apply `DGO-internal-masthead-footer.html` (Block A replaces the header row, Block B the footer) to:

| Row | Flow (ID) | Action |
|---|---|---|
| TR-036 | BULK_OPS_DATA_RETRIEVAL_HTTP (5aab9e61) | `Send_an_email_(V2)_Main_5` |
| TR-037 | BULK_OPS_DATA_RETRIEVAL_HTTP (5aab9e61) | `Send_Bulk_Failure_Email` |
| TR-039 | IP_Create_Task_for_received_Email_Endpoint (ab1a3555) | `Send_an_email_(V2)_Main_1_1_1` |
| TR-044 | AUTO_SCHEDULED_SWEEP (8c19b45c) | `Send_Digest_Email` |
| TR-045 | AUTO_SCHEDULED_SWEEP (8c19b45c) | `Send_Task_Reminder_Email` |
| TR-048 | Folio_Incoming_Correspondence_Scan_Processing_Flow (197527c8) | `Send_an_email_(V2)`; recipient stays dgsregistry@nitda.gov.ng |
| TR-049 | IP_OTP_GENERATE (e5632336) | `Send_an_email_(V2)` |
| TR-050 | Single_Task_Assignment (3caf9458) | `Send_an_email_(V2)_Main_5` |

All 41 internal templates in this package already carry the DGO mark, so the staff notices are covered by the F1 change.

## B3 · Stale pending entry

In `tests/brand-authority.test.mjs`, move the New E-Scan template out of the pending list and classify it as e-mail. Its colours are on the palette and its images on the brand host. The test count rises by one classified output, and the pending count falls to 1.

## B4 · Portal logo exports

Replace the files in `document-portal/ds/logo/` with the masters in `02-Design-System/assets/logos/`. These are byte-identical to `styles/dgo-design-system/brand/`; their checksums are in `MANIFEST.md`.

## B5 · Third-party images in leftover steps

Delete the unreferenced HTML steps in the next release of each flow:

- Single_Task_Assignment: 3 steps that use cloudfront.
- BULK_OPS_DATA_RETRIEVAL_HTTP: 2 steps that use cloudfront.
- The scan flow: 5 steps that use flaticon, myfiles.space and yourcdn.com.

None of these steps feeds a send.

## B6 · No brand check for GOV, Mailer starters, reports, Desk type

Add `04-Validation/validation-results.json`'s checks to `test:brand`, covering `email-catalogue/gov/`, `mailer/js/seed-templates.js`, `modules/reports.js`, `modules/statistics.js` and the Desk letters. The check list is in `04-Validation/validation-report.md`.
