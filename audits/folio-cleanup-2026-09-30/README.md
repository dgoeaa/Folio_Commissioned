# ECM-Platform-Folio clean-up (2026-09-30)

On 2026-09-30 this repository was exported and copied into `dgoeaa/ECM-Platform-Folio`, a
re-organised "clean" folio, with no history imported. The copy was never kept in sync. Its rules
and records now live here, and the folio repository is to be archived.

## What was carried over

| Folio file | Now |
|---|---|
| `05-governance/CLEANUP_REPORT.md`, `cleanup-report.json`, `provenance.yaml` | this folder, unchanged |
| `05-governance/evidence-register.yaml` | [`docs/governance/evidence-register.yaml`](../../governance/evidence-register.yaml), unchanged |
| `05-governance/approved-large-files.yaml` | [`docs/governance/approved-large-files.json`](../../governance/approved-large-files.json), paths mapped back to this repository |
| `OWNERS.yaml` | [`OWNERS.yaml`](../../../OWNERS.yaml), sections mapped to paths |
| `07-tools/validation/validate_folio.py` and its workflow | `tests/repo-hygiene.test.mjs`, in `npm run test:node` |
| `FOLIO_INDEX.md`, the numbered layout | not carried over; `docs/README.md` covers navigation |
| `assets/brand/nitda-lockup*__*.png` | not carried over; renamed copies of `document-portal/ds/logo/` |

## Divergence check (2026-10-02)

`cleanup-report.json` records the source path and SHA-256 of every file the folio retained (1,697).
Comparing the folio files, those hashes and this repository:

- Folio files edited after the copy: **0**. Nothing needed porting back.
- Unchanged here since the copy: 1,625.
- Changed here since the copy: 72. The folio copies of these are stale.

## Removal (2026-10-02)

All 394 files the clean-up excluded (about 50 MiB) were handed to the repository owner as a custody
archive, `ECM_DOCS_DEV-excluded-archive-2026-10-02.zip`
(SHA-256 `065c938049c5734c59b8becb99676590fc7031b4ecc9c3f207e32aa253605594`), with a manifest
of each file's SHA-256 and status.

**99 were removed**: archived copies of other projects under `docs/archive/dgo-ops/`
(design system, templates, page builds, old verification reports)
Nothing in code, tests or docs referenced them. Four endpoint-run records under `docs/flows/evidence/` were removed with them and restored the same day, because the readiness register cites them (ITEM-30, ITEM-40).

**295 were kept** because something still uses them: the folio's "delete" list included live
scripts (for example `scripts/build-governance-backup.mjs`), its "generate" list is generator
output that `--check` tests compare against, and many "archive" files are cited by the
architecture and audit documents, or linked from other archived pages (the ActivityHub portal
and the page builds were restored for that reason; `npm run test:refs` pins archive breakage at 0).
Removing any of these needs the code or documents that use them changed first.

The removed files remain in git history.
