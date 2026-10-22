# Folio E-mail Design System (consolidated, 2026-10-20)

Supersedes `03-Design-System/email.md` and `README.md` of the 2026-10-19 bundle for e-mail work. Source authority, in order: NITDA Brand Guidelines (2020) → owner brand set of 2026-10-18 (`email-catalogue/ACCEPTANCE.md`) → `styles/dgo-design-system` tokens (`tokens.json`, copied unchanged).

## 1. Brand architecture

| Audience | Identity | Masthead |
|---|---|---|
| External (citizens, MDAs, correspondents) | NITDA master brand only | NITDA white lockup, 168 px, left |
| Internal (staff, registry, operators) | NITDA + DGO Digital Ops sub-brand | NITDA lockup 168 px left, DGO Digital Ops lockup 150 px right |

Applied in this package: all 16 CL-* and ML-* correspondence templates, `Frame-IP-Send-Email--external` and the citizen notice `PT-Ack-Overdue` are NITDA-only (18 templates). The other 41 carry the DGO Digital Ops lockup. No approved exception is used.

The organisation name in every footer is "National Information Technology Development Agency". "Folio · NITDA Digital Correspondence" (finding B2) is not used anywhere.

## 2. Logos and image hosting

| Use | Hosted file (e-mail) | Master in this package |
|---|---|---|
| E-mail masthead, NITDA | `https://folio-portal.page.gd/email-assets/nitda-lockup-white.png` | `assets/logos/nitda-lockup-digital-white.png` (byte-identical) |
| E-mail masthead, DGO Digital Ops | `https://folio-portal.page.gd/email-assets/dgo-logo-whiteout.png` | `assets/logos/email-dgo-logo-whiteout.png` (same file) |
| Screens on light grounds | — | `nitda-lockup-digital-colour.png`, `dgo-mark.svg` |
| Print | — | `nitda-logo-horizontal-colour.jpeg`, `nitda-logo-horizontal-whiteout.png`, `nitda-logo-stacked-whiteout.png` |
| Avatar | — | `nitda-symbol-infoweb.png` |
| Watermark on Deep Green (screens only) | — | `nitda-infoweb-watermark-white.png`: the design-system infoweb symbol with its green ground removed; used at 9–12% opacity in the visual index header |

`folio-portal.page.gd/email-assets/` is the catalogue image host since release 39 (2026-10-19). `nitda.gov.ng/assets/`, `correspondence-gateway.rf.gd` (suspended), cloudfront, flaticon, myfiles.space and yourcdn.com are not used. E-mail clients cannot read local files, so the templates must reference the host. The offline index swaps in the local masters for preview only.

Logo rules: top-left placement, no drop shadow, no recolouring, minimum clear space equal to the height of "Na", only on Deep Green in e-mail.

## 3. Colour

Literal hex values only (e-mail clients ignore CSS variables). Every value used in a template is a token in `tokens.json`; the validator checks this.

- Masthead: `dgo-green-700` #05583B with a 3 px `dgo-smart-400` #17B255 rule.
- Card #FFFFFF, page ground and footer `dgo-ink-50` #F5F4F4, hairlines `dgo-ink-100` #E8E6E7.
- Running text `dgo-ink-700` #373435; labels `dgo-ink-500` #5F5C5D; values `dgo-ink-900` #1B1A1A.
- Primary button `dgo-green-700` #05583B, white text, 8 px radius; one per message.
- Coat-of-arms red and yellow appear only through the status scales (`danger`, `warn`) that `tokens.json` already approves for status. They are never used decoratively.
- No gradients, textures, photography overlays or blur.

### Colour by purpose

Each of the 59 templates has its own hero scheme: ground, 4 px rule, chip ground, chip border, chip text, headline and sub-line. No two templates share a scheme, and no two share the same ground and rule pair. The full list is in `hero-schemes.json` and `../03-Registers/colour-variant-register.csv`.

Families keep the meaning of the original `email.md` rows:

| Family | Grounds used | Meaning |
|---|---|---|
| Correspondence (CL, ML, Frame) | white, ink-25, green-50, smart-50, info, warn tints, Deep Green | Official letters from the Agency; tint follows the letter type |
| Decision / progress (SN) | smart-600, green-500/600/800, info-800 | Workflow steps for staff |
| Attention (SN, GV) | warn-50/100, danger-50, status-escalated-bg | Something needs the reader |
| Failure (GV, OP) | danger-600/800, ink-800/900, warn-800 | Operator failure, escalation, timeout |
| Record (GV, OP) | ink-50, ink-100 | Neutral run records |
| Report (RP) | smart-700, green-950 | Generated reports |
| Helpdesk (WS) | smart-800 ground, cat-8 #00838A rule and chip border | Support |

Contrast: headline and chip text meet 4.5:1 against their grounds; results per template are in `../04-Validation/validation-report.md`.

## 4. Type

| Role | Face | Size / line |
|---|---|---|
| Headline (`email-hero`) | Outfit, 'Segoe UI', Arial (Alwyn New substitute) | 700 24/31 px; 21/28 px below 620 px |
| Greeting | Outfit | 600 17/24 px |
| Section label | Outfit | 700 12/16 px, 1.2 px tracking, uppercase |
| Body | Verdana, Geneva | 400 14/23 px |
| Field label / footer / chip | Verdana | 400–700 12 px (floor; nothing smaller is used) |
| Reference numbers, IDs | Menlo, Consolas, 'Roboto Mono', 'Liberation Mono', monospace (no Courier New: it renders wide and serif-like on Android) | 700 20/28 px references; 400 13/21 px IDs |
| Fact value | Verdana | 400–700 14/21 px, `overflow-wrap:anywhere` |
| Fact label | Verdana | 400 12/17 px, `#5F5C5D`, stacked above the value |

No web font is loaded: the Google Fonts link in the 2026-10-19 templates is removed (external dependency; most clients block it). Clients without Outfit fall back to Segoe UI or Arial, which the brand allows until licensed Alwyn New files are installed.

## 5. Structure (every complete template)

1. `<html lang="en" dir="ltr">`, UTF-8, viewport, `color-scheme: light`, Apple reformat off, Outlook 96 dpi block.
2. `meta folio-template`, `folio-purpose`, `folio-envelope` (to / cc / carrier, verbatim from the source).
3. `<title>` = subject; hidden preheader = preview text, padded so clients do not pull body text.
4. Outer table on #F5F4F4; card `max-width: 600px`, fluid to 100% (Outlook pinned to 600 px with conditional table).
5. Masthead → Hero → optional commissioning-hold banner → Body (28 px top, 32 px sides; 20 px on mobile) → Footer.
6. Layout tables only, all `role="presentation"`; no flexbox, no CSS grid, no `box-shadow`.
7. Buttons are bulletproof (cell background plus padded link).
8. Print: page ground drops to white, card border removed.

## 5b. Proportion rules (2026-10-21 revision)

The templates are built to hold their proportions in clients that ignore `<style>` (Outlook mobile, some Android clients), not only where the 620 px rule applies.

- Masthead: NITDA lockup 140 px, DGO Digital Ops lockup 150 px, in a 52 / 48 split with `max-width:100%`, 18 px vertical padding.
- Hero: 26 px top padding, chip 12 px with 0.3 px tracking, headline 24/31 px.
- Facts: label above value inside a `#FAFAF9` panel with a 1 px `#E8E6E7` border and 12 px radius. No two-column label tables, so nothing is squeezed into a narrow column.
- Section labels: an 18 × 3 px Smart Green bar and a 12 px uppercase label, never wrapped.
- Buttons: 14 × 22 px padding, 10 px radius, arrow bound to the last word.
- Report tiles: figures at 22/28 px; data tables at 13/19 px.

## 5c. Letter structure (2026-10-21, second revision)

| Zone | Content |
|---|---|
| Classification marking (CL only) | `{{classification}}` in a #033F2A band, centred, 12 px, 2 px tracking. Repeated at the foot of the message, as on a printed government letter. |
| Masthead | Logos, then a hairline and the issuing office: "Office of the Director-General/CEO" (CL), `{{SenderOffice}} · {{Organisation}}` (ML), or the DGO unit (internal). The office is no longer repeated in the hero or the footer. |
| Hero | Status chip (letter type and priority), headline, one sub-line. |
| Docket | Reference (left, monospace) and Date (right) in a #FAFAF9 band directly under the hero. Staff notices pair Reference with a "Record · Open in Folio →" link. |
| Body | Greeting; lead paragraph at 15/24 px; record card; fact panel; callouts; action; sign-off. |
| Notes | "Why you received this" and confidentiality text, #F5F4F4. |
| Footer | Deep Green band: brand rule, Agency name (white, 15 px), address and links (#C2EED2). |

Body components:

- **Record card.** The record or document title is a link (Outfit 16/22 bold, underlined) to the same URL as the primary button, beside a document glyph drawn from table cells.
- **Fact panel.** Label above value; a 3 px top edge in the template accent; short facts sit two to a row, long ones (summaries, IDs, timestamps) take the full width.
- **Status values** (Status, Decision, Outcome) are pills in the template's chip colours.
- **Callouts** have a 3 px top edge and a square marker in the callout colour, replacing the left accent bar.
- **Sign-off.** "Yours faithfully," then a 32 × 2 px accent rule, then the signatory at Outfit 16/22 bold.
- **Report rows.** `{{row.title}}` links to `{{row.url}}`, the same URL as the row's View link. PT-Ack-Overdue links `{{trackingNumber}}` to `{{trackingUrl}}`.

## 5a. Marks and markings

Every hero carries a small signature mark, right-aligned beside the status chip and drawn in the template's rule colour. It is built from table cells (no images, no SVG), so it renders in Outlook and survives image blocking. It is decorative (`aria-hidden`) and hidden below 620 px.

| Family | Mark | Reads as |
|---|---|---|
| CL, ML, PT, Frame | line · ring · dot · ring · line | Seal of an official letter |
| SN | dot – dot – dot – ring | Workflow steps, the open ring is the reader's step |
| GV, OP | five bars of uneven height | Run signal |
| RP | four rising bars and a rule | Report |
| WS | dot – ring – dot | Support link |

The nodes and orbits echo the infoweb symbol, which the guidelines name as the source of the brand's geometric vocabulary. The footer carries a short Smart Green and Deep Green brand rule above the organisation name.

## 6. Fragments for IP_SEND_EMAIL (finding F1)

Staff notices (SN), report e-mails (RP) and Correspondence Desk letters (CL) are sent through the IP_SEND_EMAIL frame. They must be sent as fragments from `01-Templates/fragments/`:

- `payload.email.html` = the fragment. It starts with the greeting line, so the frame does not add "Dear Sir/Madam,".
- `payload.email.hero` = `{ purpose, chip, title, lead }`, given in the comment at the top of each fragment. `purpose` is the template ID; the frame looks it up in `hero-schemes.json`.
- `payload.email.footerNote` = the "why you received this" line, also in that comment.

The complete documents for the same IDs are used by DGO_MAIL_SEND, which passes complete documents through unchanged (TR-094 to TR-099), and for review.

## 7. Link bindings

The 2026-10-19 designs used `href="#"` on 41 buttons and links. Each now has a named binding. These are the only placeholders this package adds:

| Binding | Used by | Supply |
|---|---|---|
| `{{recordUrl}}` | SN-*, WS-Support-Request | Folio record deep link built by the Workspace service |
| `{{registryRecordUrl}}` | GV failing, stale, recovered, exception | Registry list item URL: `@{item()?['{Link}']}` or the list URL + `DispForm.aspx?ID=` |
| `{{runUrl}}` | GV run and execution reports | `@{concat('https://make.powerautomate.com/environments/', workflow()?['tags']?['environmentName'], '/flows/', workflow()?['name'], '/runs/', workflow()?['run']?['name'])}` |
| `{{reportsUrl}}` | RP-Management | Folio Reports page URL |
| `{{row.url}}` | RP row "View" links | Per-row record URL |
| `{{html}}` | Frame body slot | `payload.email.html` |

## 8. Writing

- Subject: what happened and the reference, under 70 characters.
- Headline: one plain sentence in the reader's terms. Sub-line: what happens next.
- Field labels are nouns; leave a row out rather than print "N/A".
- One primary button, with a verb and "→".
- External copy is third person ("The Agency"). No emoji; status chips use the existing typographic marks (✓ ✉ ⚠ ↻ ✕).
