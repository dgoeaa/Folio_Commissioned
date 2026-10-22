# DGO_OPS Repository

> **`runtime/` was removed on 2026-09-22, and this note is why.**
>
> This archive held a copy of the retired repository's runtime alongside the live application it
> is the ancestor of — 134 files, 50 byte-identical to their live counterpart and 72 already
> diverged. Among the diverged were `config/endpoints.config.js`, `config/rbac.config.js`,
> `config/routes.config.js` and `config/fetch-policy.config.js`: two routing tables, two RBAC
> configurations and two endpoint configurations in one tree, with nothing saying which one runs.
> An archive is meant to record what something was. A second copy of the configuration that is
> currently running is not a record — it is a trap for anyone who greps.
>
> **The rule this leaves behind: the live tree is authoritative for anything that runs. Nothing
> under `docs/archive/` is.** The removed files are in git history, where they can be read
> without sitting next to the code they shadow.
>
> Nothing else remains here. `design-system/` and `ECM_ActivityHub_Portal/` were removed on
> 2026-10-02 (commit `4521e5a`) with the other unreferenced archive files, and handed to the
> owner in the custody archive recorded under `docs/audits/folio-cleanup-2026-09-30/`. The live
> design system, `document-portal/ds/`, is the only one in this repository and is
> authoritative (ITEM-57).


## Structure

This repository was restructured on 2026-07-30 by extracting and flattening two ZIP archives.

### Archives processed

| Archive | Files | Notes |
|---|---|---|
| `upload to git.zip` | 442 files | Top-level `upload to git/` wrapper stripped; contents placed at repo root |
| `Leanest operational package ZIP.zip` | 55 files | `ECM_ActivityHub_Portal/htdocs/` identical to `upload to git.zip`; only unique `MANIFEST` and `VERIFICATION` retained |

### Flattening decisions

- **`ECM_ActivityHub_Portal/ECM_ActivityHub_Portal/`** — redundant nested wrapper removed; `aud_activityhubp_20260728_151904/` and `precision_auditor_v3.py` moved up into `ECM_ActivityHub_Portal/`. The inner `htdocs/` (older/smaller version) was discarded in favour of the outer `htdocs/` which matches the curated leanest package.
- **`Document_submission portals/Document_submission portals/`** — empty nested directory; both levels removed.

### File collisions resolved

| File | Decision |
|---|---|
| `Complete full-content JSON state file.json` | Overwritten with the version from `upload to git.zip` (newer content) |
| `VERIFICATION.json` | Kept from `upload to git.zip`; leanest-package version saved as `VERIFICATION.leanest.json` |
| `MANIFEST.sha256.json` | Kept from `upload to git.zip`; leanest-package version saved as `MANIFEST.leanest.sha256.json` |

### Root directories

```
ECM_ActivityHub_Portal/   ECM Activity Hub portal app
design-system/            DGO Design System source, docs, tokens, styles, assets
digitaldocs.page.gd/      DigitalDocs public site (htdocs)
docs-root/                Governance and reference documents
intelhub.page.gd/         IntelHub public site (htdocs)
manifests/                Package manifest records
runtime/                  REMOVED 2026-09-22 — it shadowed the live application (see the note above)
templates/                Operational Power Automate / email templates
```
