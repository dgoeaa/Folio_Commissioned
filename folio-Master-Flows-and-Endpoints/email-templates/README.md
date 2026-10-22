# Folio E-mail Templates — Production Package, 2026-10-20

Built from the Folio Branding and Templates Bundle of 2026-10-19 (baseline `claude/system-remediation-gaps-ahpmsy` at `d1a8bd0`). It replaces that bundle's `04-GAP-Templates` and `03-Design-System/email.md`. Nothing in the repository or the tenant was changed.

Start with `00-Package-Home.html`, then `00-Visual-Index.html`. It opens offline in any browser and shows all 59 templates with their colour schemes and links to the files.

## Contents

| Folder | What it holds |
|---|---|
| `00-Package-Home.html` | Offline home page: package figures and a route into every folder, styled with the packaged NITDA design-system stylesheets |
| `00-Visual-Index.html` | Offline visual index of every template, filterable by family |
| `01-Templates/email/` | 59 send-ready complete documents (32 designs: each default and every variant) |
| `01-Templates/text/` | 59 plain-text versions, one per complete document, for the text/plain part |
| `01-Templates/fragments/` | 29 body fragments for the IP_SEND_EMAIL frame (CL, SN, RP) |
| `02-Design-System/` | `email-design-system.md` (consolidated rules), `hero-schemes.json` (frame lookup), `tokens.json`, 10 logo masters, Cascadia Mono, and `web/` (the NITDA design-system stylesheets, Google Fonts imports removed for offline use) |
| `03-Registers/` | Template catalogue, colour-variant register, Power Automate map, resource status register (all 268 rows), file manifest, and the same registers as one Excel workbook |
| `06-Integration/` | Design-system bundle fix (`design-system-bundle-fix/`: guarded Track page script and a components-only bundle), repository change set for every finding, IP_SEND_EMAIL hero lookup (steps and importable actions), DGO masthead and footer for the 8 internal catalogue messages, replacement e-mail section for the brand README |
| `04-Validation/` | Validation report and machine-readable results |
| `05-Source-Review/` | The 2026-10-19 review (PDF, Word) and draft register (Excel), unchanged, for traceability |
| `MANIFEST.md` | Every file with purpose, status, size and SHA-256 |

The HTML templates are the editable source and the ready-to-use output at once: plain, hand-editable HTML with inline styles and no build step.

## How to implement

1. **Staff notices, report e-mails, Correspondence Desk letters (via IP_SEND_EMAIL).** Send `01-Templates/fragments/<ID>.fragment.html` as `payload.email.html`. Set `payload.email.hero` and `payload.email.footerNote` from the comment at the top of the fragment. In the frame flow, look up `hero.purpose` in `02-Design-System/hero-schemes.json` to colour the hero. This removes the double frame (F1).
2. **Mailer letters (DGO_MAIL_SEND), letterhead variants TR-094 to TR-099.** Use the complete documents in `01-Templates/email/` (CL-* and ML-*).
3. **Governance flows GOV-01 to GOV-08, telemetry, sign-in code.** Paste the complete document into the flow's Send e-mail action body. Map each `{{placeholder}}` to the expression in `03-Registers/power-automate-map.csv`; action names, recipient expressions and flow IDs are listed there unchanged.
4. **Link bindings.** Supply `{{recordUrl}}`, `{{registryRecordUrl}}`, `{{runUrl}}`, `{{reportsUrl}}` and `{{row.url}}` as described in `email-design-system.md` §7.
5. **Images.** Keep `nitda-lockup-white.png` and `dgo-logo-whiteout.png` on `folio-portal.page.gd/email-assets/`.
6. **Brand checks.** Add the new files to `test:brand` and `tests/staff-notice.test.mjs`; the checks in `04-Validation` can be ported directly.

## Record of changes

**Templates (all 59)**
- Rebuilt from flexbox `<div>` previews into table-based e-mail HTML: `role="presentation"` tables, `bgcolor` fallbacks, bulletproof buttons, an Outlook 600 px conditional wrapper and a fluid card (`max-width: 600px`).
- Added a hidden preheader, `<title>` = subject, `lang="en" dir="ltr"`, `color-scheme: light`, an Outlook 96 dpi block, a mobile rule at 620 px and a print rule.
- Added a hero signature mark per family (seal, workflow, run signal, report, support), drawn from table cells in the template's rule colour, and a Smart Green brand rule in the footer.
- Letter structure revision (2026-10-21): the issuing office moved into the masthead; classification marked at the head and foot of CL letters; Reference and Date in a docket band under the hero; record and document titles linked to the same URL as the View / Open button; record card, paired facts, status pills, square-marker callouts and a signature rule in the body; a Deep Green brand footer. See `email-design-system.md` §5c.
- Proportion revision after live tests in Outlook web and Outlook mobile (2026-10-21): smaller masthead lockups in a fixed split, 24 px headlines, label-above-value fact panels, a non-Courier monospace stack, wrap-safe buttons and section labels. See `email-design-system.md` §5b.
- Raised the type floor to 12 px, disabled mobile text inflation and set the mobile headline at 24/31 px.
- Expanded `font:` shorthand, which Outlook ignores, into longhand properties.
- Moved the envelope line (to, cc, carrier) into `meta folio-envelope`, verbatim.
- Removed the Google Fonts `<link>` (external dependency). Fonts fall back to Segoe UI / Arial / Verdana.
- Replaced relative logo paths (`../03-Design-System/...`), which break once sent, with the approved host.
- Replaced 41 dead `href="#"` links with named bindings.
- Gave every template its own hero scheme (59 unique; the 2026-10-19 set used only 22 distinct ground-and-rule pairs across 58 files, with pairs such as CL-Invitation / ML-Invitation and SN-Owner-Notice / CL-Request-Info identical).
- WS-Support-Request: the hero moved from a #00838A ground (white text 4.1:1) to `dgo-smart-800` with a `dgo-cat-8` rule, lifting contrast above 4.5:1.
- Frame: the design annotations (payload note, dashed fragment box) were removed from the send-ready file and recorded in the design system. The body slot is `{{html}}`.

**Visual index:** previews render on demand as they scroll into view and scale to any screen width; the header carries the infoweb watermark (`nitda-infoweb-watermark-white.png`, derived from the design-system symbol).

**New in this package:** `PT-Ack-Overdue`, the citizen overdue notice for rows TR-108 and TR-143 (NITDA identity, sent by CG_Portal_Daily_Sweep); 59 plain-text versions; 29 IP_SEND_EMAIL fragments; `hero-schemes.json`, consolidated design system, four registers, visual index, validation suite results.

## Findings resolved by this package

| Finding | Resolution |
|---|---|
| F2 required notifications without a template | None remain. RN-020 uses SN-Comment; RN-022 uses CL-Closure; both inherit the F1 fix |
| B1 brand README describes an older state | Replacement e-mail section in `06-Integration/README-email-section.md` |
| B3 New E-Scan template still listed as pending | Test reclassification set out in `06-Integration/repository-change-set.md` |
| F1 double frame | Fragments for every IP_SEND_EMAIL-carried template, greeting first |
| F3 governance bodies outside the catalogue, off-palette, logo from nitda.gov.ng | 15 GV templates on token colours and the catalogue image host |
| F4 Desk letter shortfalls (no lang, no preheader, 760 px, no logo, Arial, box-shadow); Cambria starter letters; report e-mails with no inline styling; bare sign-in code mail | All fixed in CL-*, ML-*, RP-*, ML-Sign-In-Code |
| F5 Workspace support request | Template delivered (WS-Support-Request); the flow route is still to be built |
| B2 uneven sub-brand | DGO mark on all 41 internal templates; "Folio · NITDA Digital Correspondence" not used |
| B6 no brand check for GOV, Mailer starter, reports, Desk type | Covered by the checks in `04-Validation` |

## Retained constraints

- All Power Automate action names, flow IDs, recipient expressions, payload field names and placeholders are unchanged (582 checked: 575 from the 2026-10-19 sources and 7 in PT-Ack-Overdue; 0 lost).
- Variant files are kept one-to-one with the 2026-10-19 set, so catalogue and register references stay valid.
- Register statuses are not changed. Delivered templates are marked PROPOSED (not deployed) until they are released.
- Correspondence (CL, ML) stays NITDA-only, as test:brand requires.

## Limitations not removable from a standalone package

- **Deployment.** Nothing is released. The F1 fix needs the Workspace to send fragments, and colour by purpose needs the frame to read `hero-schemes.json`.
- **New bindings.** The five URL bindings must be populated by the carriers. Until they are, the buttons need a fallback URL.
- **Fonts.** Licensed Alwyn New files are not available. Outfit, the approved substitute, is not loaded in e-mail, so clients show Segoe UI or Arial.
- **Rendering service.** Compatibility is checked statically against known client behaviour, not on a rendering farm.
- **Outside scope and unchanged:** the 12 DECISION rows (including 8 internal catalogue messages without the DGO mark), F6 inline templates of flows not yet in the estate, F7 unwired legacy library, B4 Portal logo exports, B5 third-party images in unreferenced legacy steps.

## Self-containment

Every file the package's pages, templates and documents use is inside the package. Checked by resolving every `src`, `href`, `url()` and Markdown link in every file.

Only three addresses point outside the package, and they have to:

| Reference | Used by | Why it is external | Local copy in the package |
|---|---|---|---|
| `https://folio-portal.page.gd/email-assets/nitda-lockup-white.png` | All 59 e-mail templates, DGO masthead | E-mail clients cannot read files attached to a package; images must be hosted | `02-Design-System/assets/logos/nitda-lockup-digital-white.png` (byte-identical; re-seed the host from it) |
| `https://folio-portal.page.gd/email-assets/dgo-logo-whiteout.png` | 41 internal templates, DGO masthead | As above | `02-Design-System/assets/logos/email-dgo-logo-whiteout.png` (same file) |
| `https://nitda.gov.ng` | Footers, home page | A link to the Agency website, not a dependency | — |

Previews in the home page and visual index swap in the local logo files, so both work fully offline.

Two files in `06-Integration/design-system-bundle-fix/` are drop-in replacements for files in the NITDA Design System project. They are meant to run there, alongside that project's React runtime and portal pages, and are not meant to run on their own: `_ds_bundle.js` (needs React) and `document-portal/js/track.js` (references the portal's `support.html` and logo).

Fonts: no licensed Alwyn New files or Outfit files exist in the source material, so none are packaged. Headings fall back to Segoe UI or Arial, as the brand allows. Cascadia Mono is packaged.
