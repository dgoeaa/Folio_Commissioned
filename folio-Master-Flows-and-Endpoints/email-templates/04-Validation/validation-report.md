# Validation report — 2026-10-21

Automated checks over every file in `01-Templates/`. Full per-check results: `validation-results.json`.

## Summary

| Check | Result |
|---|---|
| Complete documents present and parsed | 59 of 59 (32 designs) |
| IP_SEND_EMAIL fragments present and parsed | 29 of 29 |
| Plain-text versions present, with every body placeholder | 59 of 59 |
| Templates passing every check | 59 of 59 |
| Duplicate hero schemes | 0 |
| Duplicate ground + rule pairs | 0 |
| Lowest hero contrast (headline, chip, sub-line) | 4.86:1 (floor 4.5:1) |
| Lowest contrast of any text in any template | 4.97:1 across 1475 text runs (floor 4.5:1) |
| Smallest type size in any template | 12 px (floor 12 px; iOS and Android text inflation disabled) |
| Hero headline | 24/31 px on every template (21/28 px below 620 px); largest display figure 32 px (sign-in code) |
| Monospace stack | Menlo, Consolas, Roboto Mono, Liberation Mono; no Courier New fallback |
| Hero signature mark and footer brand rule present | 59 of 59 |
| Sign-off rule and signatory at Outfit 16/22 | 16 of 16 letters (CL, ML) and 10 of 10 CL fragments |
| Largest document | 21.2 KB (Gmail clips at 102 KB) |
| Placeholders checked | 582 (575 from the 2026-10-19 sources, 7 in the new PT-Ack-Overdue) |
| Placeholders lost | 0 |
| GAP register rows with a delivered template | 46 of 46 |
| Additional rows covered | TR-108 and TR-143 (PT-Ack-Overdue), TR-133 (WS-Support-Request) |

## Checks applied to each complete document

1. Starts `<!doctype html>`; `<html lang="en" dir="ltr">`; `color-scheme: light`; non-empty `<title>` (the subject).
2. Hidden preheader present.
3. Every `<table>` carries `role="presentation"`; no flexbox, CSS grid or `box-shadow`.
4. Every hex colour is a value in `02-Design-System/tokens.json`.
5. Every image has alt text and loads from `https://folio-portal.page.gd/email-assets/`.
6. Identity: external templates carry no DGO mark; internal templates carry it.
7. Links are `https://nitda.gov.ng` or a named `{{binding}}`; no `href="#"`.
8. No `<link>`, `<script>`, web-font call or relative path.
9. Card `max-width: 600px`; mobile rule at 620 px; print rule.
10. Every source placeholder is still present; the only additions are the link bindings in `02-Design-System/email-design-system.md` §7.
11. Hero colours in the file match `hero-schemes.json` and the colour register.
12. Contrast of every text run against its nearest background, computed from the inline styles.
13. Plain-text version: starts with `Subject:` and contains every body placeholder. Recipient-address fields (`recipientEmail`, `Email`, `to`, `cc`, `citizenEmail` and similar) belong to the flow's To and Cc fields, not the body, so they are not required in the text.
14. Type floor: no text below 12 px; `-webkit-text-size-adjust:100%` set.
15. Label and value pairs are stacked (label above value) inside a tinted fact panel, so long run IDs, timestamps and field keys wrap cleanly at any width without relying on media queries.
16. Hero signature mark (`data-folio-mark`) and footer brand rule present; the mark is hidden below 620 px.
17. Structure: issuing office in the masthead; brand footer present; `{{classification}}` marked at head and foot where used; every linked record or document title points to the same URL as the primary button.
18. Fragments: no `<html>`, `<head>` or `<body>`; greeting first; every body placeholder present (envelope fields and `year` are the frame's); presentational tables only.

## Mobile behaviour

Below 620 px the card goes full width, side padding drops to 20 px, the headline sets at 24/31 px and the hero signature mark is hidden so the status chip has the full width. The stat tiles in RP-Management (4) and RP-Statistics (3) stack into one column. The record tables in the two reports stay tabular, because their columns only make sense side by side. No other template has a multi-column content row: label and value pairs are two narrow cells, which fit at 320 px.

## Per template

| Template | Result | Hero contrast H / chip / sub | Lowest text contrast | Smallest type | Source placeholders | Added | Size |
|---|---|---|---|---|---|---|---|
| `CL-Official` | Pass | 15.91 / 7.53 / 9.07 | 6.02 | 12 px | 13 | — | 14.7 KB |
| `CL-Official--no-optional-lines` | Pass | 15.91 / 7.74 / 9.07 | 6.02 | 12 px | 11 | — | 13.2 KB |
| `CL-Request-Info` | Pass | 15.44 / 9.79 / 8.07 | 6.02 | 12 px | 12 | — | 14.9 KB |
| `CL-Request-Info--no-due-date` | Pass | 13.56 / 9.79 / 9.62 | 6.02 | 12 px | 11 | — | 13.6 KB |
| `CL-Transmittal` | Pass | 15.35 / 8.52 / 8.02 | 6.02 | 12 px | 12 | — | 14.1 KB |
| `CL-Transmittal--no-attachments` | Pass | 15.35 / 12.01 / 8.02 | 6.02 | 12 px | 11 | — | 13.1 KB |
| `CL-Invitation` | Pass | 5.61 / 9.67 / 4.86 | 5.61 | 12 px | 12 | — | 14.5 KB |
| `CL-Invitation--no-due-date` | Pass | 5.61 / 9.67 / 4.86 | 5.61 | 12 px | 11 | — | 13.1 KB |
| `CL-Circular` | Pass | 8.52 / 12.01 / 7.53 | 6.02 | 12 px | 11 | — | 13.8 KB |
| `CL-Closure` | Pass | 15.62 / 8.61 / 8.16 | 6.02 | 12 px | 11 | — | 13.6 KB |
| `Frame-IP-Send-Email` | Pass | 15.23 / 7.53 / 8.69 | 6.02 | 12 px | 11 | `html` | 11.8 KB |
| `Frame-IP-Send-Email--no-attachments` | Pass | 15.23 / 7.53 / 8.69 | 6.02 | 12 px | 10 | `html` | 10.6 KB |
| `Frame-IP-Send-Email--external` | Pass | 15.91 / 10.62 / 9.07 | 6.02 | 12 px | 11 | `html` | 11.5 KB |
| `Frame-IP-Send-Email--caller-greeting` | Pass | 15.23 / 10.62 / 8.69 | 6.02 | 12 px | 10 | `html` | 11.6 KB |
| `GV-Run-Report` | Pass | 15.82 / 7.74 / 8.27 | 6.02 | 12 px | 6 | `runUrl` | 14.4 KB |
| `GV-Run-Report--gov01-provisioning` | Pass | 13.98 / 7.74 / 9.91 | 6.02 | 12 px | 11 | `runUrl` | 18.3 KB |
| `GV-Run-Report--failed` | Pass | 11.33 / 5.88 / 9.56 | 5.88 | 12 px | 6 | `runUrl` | 14.4 KB |
| `GV-Run-Report--timed-out` | Pass | 9.79 / 6.51 / 8.7 | 6.02 | 12 px | 6 | `runUrl` | 14.5 KB |
| `GV-Execution-Report` | Pass | 15.82 / 7.74 / 8.27 | 6.02 | 12 px | 8 | `runUrl` | 15.3 KB |
| `GV-Execution-Report--failed` | Pass | 14.66 / 11.33 / 7.66 | 6.02 | 12 px | 8 | `runUrl` | 15.3 KB |
| `GV-Failing-Alert` | Pass | 5.88 / 11.33 / 4.97 | 4.97 | 12 px | 7 | `registryRecordUrl` | 14.4 KB |
| `GV-Failing-Escalation` | Pass | 11.33 / 5.88 / 9.56 | 5.88 | 12 px | 6 | `registryRecordUrl` | 13.0 KB |
| `GV-Failing-Escalation--escalated` | Pass | 17.37 / 11.33 / 15.82 | 6.02 | 12 px | 6 | `registryRecordUrl` | 13.0 KB |
| `GV-Recovered` | Pass | 15.62 / 8.61 / 8.16 | 6.02 | 12 px | 6 | `registryRecordUrl` | 12.6 KB |
| `GV-Registry-Exception` | Pass | 13.92 / 11.33 / 12.68 | 6.02 | 12 px | 11 | `registryRecordUrl` | 15.9 KB |
| `GV-Registry-Exception--medium-low` | Pass | 15.44 / 9.79 / 8.07 | 6.02 | 12 px | 11 | `registryRecordUrl` | 15.9 KB |
| `GV-Stale-Alert` | Pass | 15.44 / 9.79 / 8.07 | 6.02 | 12 px | 7 | `registryRecordUrl` | 14.4 KB |
| `GV-Stale-Escalation` | Pass | 9.79 / 6.51 / 8.7 | 6.02 | 12 px | 6 | `registryRecordUrl` | 13.0 KB |
| `GV-Stale-Escalation--escalated` | Pass | 17.37 / 9.79 / 15.82 | 6.02 | 12 px | 6 | `registryRecordUrl` | 13.0 KB |
| `ML-Cover-Letter` | Pass | 15.91 / 7.53 / 9.07 | 6.02 | 12 px | 15 | — | 14.5 KB |
| `ML-Cover-Letter--no-message` | Pass | 15.91 / 7.53 / 9.07 | 6.02 | 12 px | 14 | — | 14.3 KB |
| `ML-Follow-Up` | Pass | 15.44 / 9.79 / 8.07 | 6.02 | 12 px | 17 | — | 15.2 KB |
| `ML-Follow-Up--no-message` | Pass | 13.56 / 9.79 / 9.62 | 6.02 | 12 px | 16 | — | 15.0 KB |
| `ML-Invitation` | Pass | 15.04 / 9.67 / 7.86 | 6.02 | 12 px | 18 | — | 16.9 KB |
| `ML-Invitation--no-message` | Pass | 11.89 / 9.67 / 8.43 | 6.02 | 12 px | 17 | — | 16.7 KB |
| `ML-Sign-In-Code` | Pass | 15.91 / 8.52 / 14.06 | 6.02 | 12 px | 4 | — | 13.2 KB |
| `OP-Run-Telemetry` | Pass | 15.82 / 7.74 / 8.27 | 6.02 | 12 px | 6 | — | 14.4 KB |
| `OP-Run-Telemetry--not-ok` | Pass | 15.82 / 9.56 / 8.27 | 6.02 | 12 px | 6 | — | 14.5 KB |
| `RP-Management` | Pass | 8.61 / 11.93 / 7.74 | 5.44 | 12 px | 17 | `row.url` `reportsUrl` | 20.0 KB |
| `RP-Statistics` | Pass | 18.69 / 12.01 / 16.52 | 5.44 | 12 px | 19 | `row.url` | 21.2 KB |
| `SN-Ack-Reminder` | Pass | 5.89 / 7.61 / 5.21 | 5.21 | 12 px | 8 | `recordUrl` | 16.9 KB |
| `SN-Ack-Reminder--hold` | Pass | 5.89 / 7.61 / 5.21 | 5.21 | 12 px | 10 | `recordUrl` | 17.4 KB |
| `SN-Approval-Decision` | Pass | 6.05 / 8.52 / 5.44 | 5.44 | 12 px | 7 | `recordUrl` | 17.1 KB |
| `SN-Approval-Decision--hold` | Pass | 6.05 / 8.52 / 5.44 | 5.44 | 12 px | 9 | `recordUrl` | 17.6 KB |
| `SN-Approval-Decision--not-approved` | Pass | 14.66 / 11.33 / 7.66 | 6.02 | 12 px | 7 | `recordUrl` | 17.1 KB |
| `SN-Approval-Request` | Pass | 9.67 / 5.61 / 8.37 | 5.61 | 12 px | 6 | `recordUrl` | 16.2 KB |
| `SN-Approval-Request--hold` | Pass | 9.67 / 5.61 / 8.37 | 5.61 | 12 px | 8 | `recordUrl` | 16.7 KB |
| `SN-Comment` | Pass | 16.63 / 8.52 / 8.69 | 6.02 | 12 px | 6 | `recordUrl` | 16.6 KB |
| `SN-Comment--hold` | Pass | 16.63 / 8.52 / 8.69 | 6.02 | 12 px | 8 | `recordUrl` | 17.1 KB |
| `SN-Delegation` | Pass | 12.01 / 8.52 / 10.62 | 5.85 | 12 px | 6 | `recordUrl` | 17.1 KB |
| `SN-Delegation--hold` | Pass | 12.01 / 8.52 / 10.62 | 5.85 | 12 px | 8 | `recordUrl` | 17.6 KB |
| `SN-Escalation` | Pass | 14.66 / 11.33 / 7.66 | 6.02 | 12 px | 8 | `recordUrl` | 18.1 KB |
| `SN-Escalation--hold` | Pass | 12.64 / 11.33 / 8.96 | 6.02 | 12 px | 10 | `recordUrl` | 18.6 KB |
| `SN-Owner-Notice` | Pass | 13.56 / 9.79 / 9.62 | 6.02 | 12 px | 8 | `recordUrl` | 17.1 KB |
| `SN-Owner-Notice--hold` | Pass | 13.56 / 9.79 / 9.62 | 6.02 | 12 px | 10 | `recordUrl` | 17.6 KB |
| `SN-Reassignment` | Pass | 7.61 / 12.01 / 6.73 | 6.02 | 12 px | 9 | `recordUrl` | 17.6 KB |
| `SN-Reassignment--hold` | Pass | 7.61 / 12.01 / 6.73 | 6.02 | 12 px | 11 | `recordUrl` | 18.1 KB |
| `WS-Support-Request` | Pass | 11.93 / 12.01 / 10.73 | 6.02 | 12 px | 19 | `recordUrl` | 20.2 KB |
| `PT-Ack-Overdue` | Pass | 15.91 / 8.7 / 9.07 | 6.02 | 12 px | 7 | — | 15.0 KB |

## Client compatibility

These are static checks against documented client behaviour. Nothing was sent through a rendering service or a live tenant, because this package makes no tenant changes.

| Client | Expected rendering |
|---|---|
| Outlook for Windows 2016–2021, 365 classic (Word engine) | Full layout from tables and `bgcolor`; card pinned to 600 px by the conditional table. Rounded corners render square. Outfit is unavailable, so headings use Segoe UI. |
| New Outlook, Outlook.com, Outlook for Mac | Full layout, rounded corners. |
| Gmail web, Android and iOS | Full layout; the 620 px rule applies. Gmail may apply its own dark-mode colour change, which no markup fully prevents. |
| Apple Mail (macOS, iOS) | Full layout; `color-scheme: light` keeps the brand colours. |
| Yahoo, AOL | Full layout. |
| Plain-text clients and accessibility tools | The text version in `01-Templates/text/` is sent as the alternative part. |
| Images blocked | Alt text on the Deep Green masthead reads in white; hero and body are text and table colour, so the message stays readable. |
| Print | Page ground prints white; card border removed. |
