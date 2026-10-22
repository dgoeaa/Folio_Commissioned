## E-mail

Every e-mail is built from the e-mail catalogue (`email-catalogue/`, 51 messages at release 39) and the Folio production template set of 2026-10-20 (59 templates, from 32 designs). The older 20-template notification library and the 6 correspondence starters are superseded; they are not wired to any send.

- **External** (citizens, MDAs, correspondents): NITDA identity only.
- **Internal** (staff, registry, operators): NITDA plus the DGO Digital Ops lockup.
- **Images:** `https://folio-portal.page.gd/email-assets/` only.
- **Layout:** one 600 px card in presentational tables, with the masthead, a hero coloured by purpose (`hero-schemes.json`), the body and the footer.
- **Text:** every template has a plain-text version.
- **IP_SEND_EMAIL:** staff notices, report e-mails and Desk letters are sent as fragments through IP_SEND_EMAIL. The frame draws the masthead, hero and footer, and adds no second greeting.

Brand checks (`test:brand`) cover the catalogue, the GOV mails, the Mailer starters, the report e-mails and the Desk letters. Run the check for the current counts of classified and pending outputs; this README does not repeat them.
