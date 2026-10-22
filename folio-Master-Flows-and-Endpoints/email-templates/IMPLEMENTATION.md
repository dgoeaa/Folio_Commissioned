# E-mail template package: what is in service

The package in this folder (delivered 2026-10-20, [`README.md`](README.md)) lists its changes in
[`06-Integration/repository-change-set.md`](06-Integration/repository-change-set.md). This page records, per finding, what this
repository does and what the owner still applies in the tenant and on the hosts. The readiness register tracks the open half as
ITEM-92. The package files are kept as delivered, with one exception: the logos, the Cascadia Mono font and four stylesheets that
are byte-identical to the repository's masters are not duplicated here (`npm run test:hygiene`); the package's pages and stylesheets
load the masters instead (`styles/dgo-design-system/`, `document-portal/`, `assets/fonts/`). `MANIFEST.md` still lists them as
delivered.

`npm run emailfragments` compiles the package into the modules the platforms send from. `npm run test:emailfragments`,
`npm run test:govmail` and `npm run test:mailer` hold every sender to the package.

## Built in this repository (2026-10-21)

| Finding | What it does | Where |
|---|---|---|
| F1 double frame | The Workspace sends body fragments as `payload.email.html`, with `email.hero` and `email.footerNote`. Each fragment opens with its greeting, so the frame adds no "Dear Sir/Madam,". | `core/email-fragment-service.js`, `config/email-fragments.generated.js` |
| F1 hero by purpose | IP_SEND_EMAIL picks the hero scheme `payload.email.hero.purpose` names (else its own colours), and prints the chip, title, lead and footer note. | release 43, EMAIL package; `email-catalogue/shared/email-with-attachments.html` |
| F1, RN-012 to RN-036 | The eight staff notices send `SN-*`; the commissioning hold sends `--hold`, a request not approved `--not-approved`. | `core/staff-notice-service.js` |
| F2 RN-020, RN-022 | The comment notice is `SN-Comment`; the Desk's closure letter is `CL-Closure`. | as above |
| F3 GOV bodies | `npm run govmail:update` writes the `GV-*` designs into GOV-01 to GOV-08, chosen by outcome, escalation and severity; recipients and subjects stay. GOV-06's button opens the exception in the Folio Admin Suite. | `scripts/govmail-update.mjs`, `scripts/lib/govmail-fix.mjs` |
| F4 Desk letters | The six Desk templates send `CL-*`, with the variant when a line is empty; the Desk previews the complete document. | `core/correspondence-email-service.js` |
| F4 Mailer | The Agency letterhead sends the `CL-*` documents; the starters are `ML-Cover-Letter`, `ML-Invitation` and `ML-Follow-Up`; DGO_MAIL_AUTH sends `ML-Sign-In-Code`, with the code out of the subject line. | `mailer/js/` |
| F4 report e-mails | Reports sends `RP-Management`, Statistics `RP-Statistics`. | `core/report-email-service.js` |
| F5 support request | `WS-Support-Request` to dgs@nitda.gov.ng through EMAIL (owner decision 2026-10-21): no flow implemented SUBSIDIARY_ACTIONS `CREATESUPPORTREQUEST`, so nothing reached the support team. | `core/support-service.js` |
| F5 citizen overdue notice | CG_Portal_Daily_Sweep tells the citizen once (`PT-Ack-Overdue`, `Send_Citizen_Ack_Overdue_Email`) when the sweep's own rule finds the submission overdue; a sent receipt stops a repeat, a failed one is retried. | release 43, sweep package |
| F7 legacy library | Marked superseded and read-only. | `deployment/notification-instrument/email-templates/DEPLOYMENT.md` |
| TR-100 operator letters | A Mailer template is on the CL-Official base: the operator writes the headline and body; the masthead, colours and footer are added at send. An older template moves onto the base when next saved. | `mailer/js/letterhead.js`, `mailer/js/views/templates.js` |
| B1 brand README | E-mail section added. | `styles/dgo-design-system/README.md` |
| B2 DGO masthead | Blocks A and B on the eight internal catalogue messages. | release 43; `email-catalogue/` |
| B3 New E-Scan | Classified as e-mail. | `tests/brand-authority.test.mjs` |
| B4 Portal logos | The two lockups replaced by the masters. `nitda-symbol.png` is kept: the master symbol is 82 × 82 px, the portal's 263 × 277 px. | `document-portal/ds/logo/` |
| B5 third-party images | Ten unread steps removed (Single_Task_Assignment 3, BULK_OPS 2, the scan flow 5). The scan flow's `Compose_3` keeps a cloudfront image: its output is written to SharePoint through `varResponse`. | release 43 |
| B6 brand checks | The package, its fragments and every sender are checked. | `tests/email-fragments.test.mjs`, `tests/brand-authority.test.mjs` |
| Track page | `PF.page` returns unless the Track page's elements exist. | `document-portal/js/track.js` |

Identification release 43 changes nine packages: CG_Portal_Daily_Sweep, BULK_OPS_DATA_RETRIEVAL_HTTP, IP_Create_Task_for_received_Email_Endpoint,
IP_SEND_EMAIL, AUTO_SCHEDULED_SWEEP, Folio_Failure_Watch, Folio_Incoming_Correspondence_Scan_Processing_Flow, IP_OTP_GENERATE and
Single_Task_Assignment.

## Owner steps

All five were done by 2026-10-22 ([evidence](../evidence/2026-10-22-item92-tenant-verification.json)); ITEM-92 is resolved.

| # | Step | Done when |
|---|---|---|
| T1 | `npm run flows:update`, then `npm run flows:update -- apply`; file the report with `npm run flows:update -- record <report>` | the paste ledger records release 43's nine packages |
| T2 | `npm run govmail:update`, then `npm run govmail:update -- apply` | the report shows the eight GOV flows APPLIED |
| T3 | Re-import DGO_MAIL_AUTH from the Mailer release (`releases/`) | a sign-in code arrives in the new design |
| T4 | `npm run config:rebuild`; upload the Workspace, Portal and Mailer builds | the config build ledger records the build |
| T5 | Send one staff notice, one Desk letter, one report, one support request; run one GOV flow | each arrives in its design, with one greeting |

## Revision of 2026-10-21 (ITEM-93)

The package was re-issued after live tests in Outlook web and Outlook mobile: smaller masthead lockups, 24 px headlines,
facts stacked label above value, and a letter structure with Reference and Date in a docket band under the hero
(`02-Design-System/email-design-system.md` §5b and §5c). The 96 changed files replaced their copies here; the 87 unchanged
ones and this page were left alone, and the 12 new files the package lists are the masters again (the DGO whiteout logo is
`document-portal/email-assets/dgo-logo-whiteout.png`), so the package's pages load them from there.

| Area | What the repository does | Where |
|---|---|---|
| Letters | A CL fragment still opens with its Reference and Date row, for the frame; the build marks it `<!--folio-docket-->`. The complete document keeps the package's docket band, and its `{{html}}` takes the fragment without that row (`documentBody`). The build fails unless the document's body is exactly the fragment's less that row. | `scripts/build-email-fragments.mjs`, `core/email-fragment-service.js`, `mailer/js/letterhead.js` |
| Mailer base | The CL-Official base body has no Reference and Date row (the docket band shows `{{Reference}}` and `{{Date}}`). A template saved before the revision loses its old row when the letter is built. | `mailer/js/letterhead.js` |
| Support request | Derived with its docket band (sender, reference, record link) above the body. | `scripts/build-email-fragments.mjs` |
| GOV bodies | A run of sample rows that differ only by the last row's missing rule is one row list. | `scripts/lib/govmail-fix.mjs` |
| Docket band | Repository patch to the package documents (owner decision 2026-10-22, defect seen in the Outlook mobile app): the 34 documents with a docket band put Reference on its own full-width row and the Date or Record below it, the reference wrapping only when it must and the date never. Delivered, both values broke mid-word in two fixed half-width columns. The Visual Index still shows the band as delivered. | `01-Templates/email/*.html`; `tests/email-fragments.test.mjs` |
| Catalogue | `Send_Citizen_Ack_Overdue_Email` is PT-Ack-Overdue again; the NITDA lockup is 140 px on the seven internal messages with the DGO masthead. | `email-catalogue/` |

Identification release 44 changes seven packages, e-mail HTML only: CG_Portal_Daily_Sweep, BULK_OPS_DATA_RETRIEVAL_HTTP,
IP_Create_Task_for_received_Email_Endpoint, AUTO_SCHEDULED_SWEEP, Folio_Incoming_Correspondence_Scan_Processing_Flow,
IP_OTP_GENERATE and Single_Task_Assignment. The owner steps are T1 to T5 of ITEM-93 in the readiness register.

## Not in scope

- F6: flows not yet built use the listed designs when they are built.
- `06-Integration/design-system-bundle-fix/_ds_bundle.js` belongs to the NITDA Design System project, which is not in this repository.
