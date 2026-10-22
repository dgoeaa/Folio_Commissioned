# The last refs outside the baseline — 2026-10-01

**Baseline:** `claude/system-remediation-gaps-ahpmsy` @ `df138aa`
**Follows:** [`pending-pr-merge-2026-09-30.md`](../governance/RETIRED_RECORDS.md), which brought in every open pull request.
**Scope:** every ref on GitHub whose commits were not yet in the baseline after that work. A full
refresh found 19:
- 14 branches;
- 5 closed, unmerged pull requests (#6, #9, #10, #12 and #15), whose branches are deleted but whose commits
  survive in GitHub's `refs/pull/N/head`.

Every other branch (21), every other pull request head (#1–#34) and every tag (none exist) was already in
the baseline.

**Method:** the same as the 2026-09-30 record.
- For each ref, every file its outside commits add or change is compared, by exact content (git blob),
  against the baseline's whole history. Pre-reorganisation paths are first mapped to `docs/flows/`.
- A file is **held** when its content is already there; held files are not listed.
- Each remaining file is sorted into one of three buckets:
  - **superseded — rewritten:** the baseline holds a later version at the same path;
  - **superseded — retired:** the baseline deleted it on purpose;
  - **absent:** the content is in no baseline commit at all. Each absent file was then read and decided.
- The appendix lists all 507 files.

Every ref is now an ancestor of the baseline: two through real merges, seventeen through history-only
merges (`git merge -s ours`, tree unchanged). Deleting any of their branches loses nothing.

## Outcome

| Ref | Outside commits | Result |
|---|---:|---|
| `claude/system-remediation-gaps-audit-aw6a69` | 3 | **Merged, content ported** |
| `claude/ecm-docs-assessment-wj0yn9` | 2 | **Merged, content ported** |
| `claude/platform-flows-endpoints-docs-plxjlw` | 14 | History only — its value arrived through `aw6a69` |
| `claude/ecm-docs-commissioning-audit-5ffkz3` | 3 | History only — nothing unique |
| `claude/docs-portal-live-ops-comments-maavhp` | 15 | History only — superseded flow estate |
| `claude/power-automate-internal-flows-snrmx2` | 2 | History only — superseded flow estate |
| `claude/power-automate-execution-flow-xihaj6` | 2 | History only — superseded |
| `claude/document-portal-automate-flows-30o4xd` | 1 | History only — superseded |
| `claude/power-automate-actions-review-kjpsna` | 1 | History only — superseded by a stronger gate |
| `claude/ecm-docs-dev-cleanup-v2h35g` | 2 | History only — cleanup of another lineage |
| `claude/ecm-docs-cleanup-3vhb6g` | 2 | History only — every file rewritten since |
| `claude/sharepoint-lists-gap-docs-hyoup8` | 4 | History only — already held |
| `claude/platform-visual-architecture-4zffpk` | 1 | History only — generated data, regenerated since |
| `archive/quarantined-estate-2026-09-09` | 2 | History only — quarantined on purpose |
| PR #6 (`copilot/claudeplatform-architecture-security-4iwgff`) | 19 | History only — report already in the baseline |
| PR #9 (`claude/platform-visual-docs-99h1jd`) | 2 | History only — every file rewritten since |
| PR #10 (`upload-refs-20260804-195801`) | 10 | History only — uploads and superseded tooling |
| PR #12 (`claude/platform-parity-check-xp2028`) | 7 | History only — every file retired or rewritten |
| PR #15 (`claude/platform-commissioning-live-5vnn9n`) | 1 | History only — every file retired or rewritten |

## Ported

**`aw6a69`.**
- **What it is:** the 2026-09-11 audit's selective port of `plxjlw` onto the baseline. It shares history
  with the baseline but was never merged.
- **What it brings:**
  - `scripts/lib/provisioning-reader.mjs` now reads provenance from the directory, so three patched
    definitions stop presenting as "deployed export — the live tenant";
  - the endpoint dataset (`docs/reference/endpoints.json`). It was regenerated against today's corpus
    (26 keys, 72 HTTP-triggered flows), and its test is now in `test:node`;
  - the workbook, harvest-collector and flow-package builders and verifiers, with their npm scripts;
  - three reference documents;
  - [`BRANCH_MERGE_AUDIT_2026-09-11.md`](../governance/RETIRED_RECORDS.md).
- **Left out deliberately:** that audit's one held-back file, a corrupted `CG_Upload_Endpoint` export
  stamped with another flow's id, stays out, as the audit decided (§4.4). It remains reachable in
  `plxjlw`'s history.

**`wj0yn9`.**
- **What it brings:**
  [`INDEPENDENT_PILOT_READINESS_ASSESSMENT_2026-09-23.md`](../governance/RETIRED_RECORDS.md)
  and its readable page, an independent assessment of this baseline at `6750a3c`. Both are kept
  unedited.
- **Still standing:** at least one of its findings still holds on 2026-10-01. `npm start` runs
  `http-server . -p 8080 --cors`, which listens on every interface with permissive CORS (its
  Deliverable 1, item 5). That is a finding for the readiness register, not something a merge should
  change silently.

## Not ported, and why

- **`plxjlw`.** The 2026-09-11 audit found the branch has no common ancestor and 320 conflicting shared
  files. Merging it would revert:
  - the OTP protocol;
  - credential redaction;
  - signature counting;
  - the install-don't-paste warning.

  Everything worth taking was ported by `aw6a69`, which is above. Its 15 absent files are the same
  files `aw6a69` carries. The other 92 changed files are older than the baseline's versions.
- **`5ffkz3`.** Its two remaining files (`AGENT_COMMISSIONING_DIRECTIVE.md`,
  `COMMISSIONING_AGENT_BRIEF.md`) are agent-engagement documents the baseline retired on purpose.
  `tests/commissioning-authority.test.mjs` asserts that "the three agent-engagement documents stay gone" and names both of them.
- **The August flow estates** (`maavhp`, `snrmx2`, `xihaj6`, `30o4xd`).
  - **What they are:** generations of portal and internal flow packages (`paste/`, `codeview/`,
    `variables/`, `portal-corrected/`), built before the tenant's live definitions were harvested.
  - **Why they are superseded:** the baseline builds its packages from those live exports
    (`docs/flows/contracts/deployed/`, `docs/flows/surfaces/*/designer-paste/`, `console-apply/`).
    Their own `01–07` portal flows are among the files the baseline has rewritten.
  - **Specific items:**
    - `maavhp`'s Azure Function was reverted on that branch itself (`fb1f452`).
    - `xihaj6`'s 85-column gap flow is superseded by the deployed `Global_Gap_Remediation_Provisioning`
      flow, whose live export the baseline holds.
    - `snrmx2` and `maavhp` each carry a `setup-sharepoint-portal.ps1`, which the baseline retired.
- **`kjpsna`.** An AI prompt for clipboard JSON, plus a validator for the modern designer schema. The
  baseline's `tests/designer-paste-schema.test.mjs` already checks every committed package for
  per-type required fields, connector parameters, run-after, expressions, placeholders, name uniqueness
  and nesting depth, which is a stronger and enforced form of the same control.
- **`v2h35g` and `3vhb6g`.** Cleanups of a lineage the baseline did not continue. `v2h35g`'s
  `REPOSITORY_HYGIENE.md` describes deleting 115 files from that lineage, and adding it here would
  describe deletions that never happened in this tree. Every other file in both is a version the
  baseline has rewritten since.
- **`hyoup8` and `4zffpk`.** Nothing is absent. `hyoup8`'s only differing file is held, and `4zffpk`'s
  is generated visual data, regenerated since.
- **`archive/quarantined-estate-2026-09-09`.** Quarantined on purpose, and excluded by the 2026-09-11
  audit as well. Its one absent file, `ENDPOINT_REQUIREMENTS_ASSESSMENT_BRIEF.md`, arrives through
  `aw6a69` in its later, bannered form. The rest are older versions of files the baseline has.
- **PR #6.** A Copilot repository-hygiene and forensic capture from 2026-08-03. The baseline already
  holds its report as [`repository-hygiene/`](../governance/RETIRED_RECORDS.md), and that report
  cites the two forensic snapshots this PR carries (`177d992`, `18e9f4d`). The raw capture (37 files,
  including a per-archive secrets listing whose entries are all recorded as redacted) and the two
  snapshots stay in history. `document-portal/admin.html` and `js/admin.js` were retired by the
  baseline.
- **PR #10.**
  - **What it is:** an upload of local reference material and early run-it-yourself tooling.
  - **Uploads:** a platform zip, a PDF the PR itself then removed, and `desktop.ini` files. None of it
    belongs in the tree.
  - **Tooling:** `check-endpoints.mjs`, `setup-endpoints.mjs`, `dev-setup.mjs` and
    `DIRECT-ENDPOINTS.md` are superseded by `scripts/setup.mjs`, the dev server and
    `docs/deployment/RUNBOOK.md`.
- **PRs #9, #12 and #15.** Every file is either rewritten or retired by the baseline.

## Verification

- `git merge-base --is-ancestor <ref> HEAD` succeeds for all 35 non-baseline branches and for every
  `refs/pull/N/head` from #1 to #34.
- The appendix accounts for all 507 files the 19 refs carry that the baseline did not hold.

## Appendix — every file, by ref

Each row is a file the ref adds or changes whose final content is in no commit of the baseline. "Held" files
(same content already in the baseline) are not listed. Buckets: **ported**, **superseded — rewritten**
(the baseline holds a later version at the mapped path), **superseded — retired** (the baseline deleted it
on purpose), **not taken** (absent from the baseline; the reason is in the section for that ref).

<details><summary><code>PR #6</code> — 91 file(s)</summary>

| File | Bucket |
|---|---|
| `.gitignore` | superseded — rewritten |
| `core/acknowledgement-service.js` | superseded — rewritten |
| `core/action-authority.js` | superseded — rewritten |
| `core/data-client.js` | superseded — rewritten |
| `core/ui.js` | superseded — rewritten |
| `docs/forensic/177d992/00-provenance.md` | not taken |
| `docs/forensic/177d992/01-architecture.md` | not taken |
| `docs/forensic/177d992/README.md` | not taken |
| `docs/forensic/177d992/diagrams/01-architecture.mmd` | not taken |
| `docs/forensic/18e9f4d/00-provenance.md` | not taken |
| `docs/forensic/18e9f4d/01-architecture.md` | not taken |
| `docs/forensic/18e9f4d/02-security.md` | not taken |
| `docs/forensic/18e9f4d/03-build-deploy.md` | not taken |
| `docs/forensic/18e9f4d/04-report.md` | not taken |
| `docs/forensic/18e9f4d/diagrams/01-architecture.mmd` | not taken |
| `docs/forensic/18e9f4d/diagrams/02-trust-boundaries.mmd` | not taken |
| `docs/forensic/18e9f4d/diagrams/03-build-deploy.mmd` | not taken |
| `docs/forensic/18e9f4d/diagrams/04-fork-comparison.mmd` | not taken |
| `docs/forensic/18e9f4d/findings.json` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/00-provenance-raw.txt` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-archive-ECM_DOCS_DEV.zip-duplicates.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-archive-ECM_DOCS_DEV.zip-secrets.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-archive-ECM_DOCS_DEV.zip-source-members.txt` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-archive-ECM_DOCS_DEV.zip-unzip-l.txt` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-archive-find.txt` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-archive-reference-search.txt` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-archive-summary.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-git-ls-files-sha256.txt` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-git-ls-files-wc.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-requested-items.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/01-tree-summary.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/02-entry-points.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/02-reference-analysis.log` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/02-reference-edges.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/03-archive-divergent-members.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/03-archive-redundancy.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/03-archive-references.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/03-duplicate-analysis.log` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/03-exact-duplicates.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/03-near-duplicates.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/03-obsolescence-markers.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/03-stale-references.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/03-verdicts.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/04-archive-removal-blockers.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/04-design-system-census.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/04-file-dispositions.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/04-findings.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/04-fork-reconciliation.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/04-recommendation-analysis.log` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/04-recommendations.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/04-secret-exposure.tsv` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/04-secret-gate-raw.txt` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/duplicate-obsolescence.json` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/findings-recommendations.json` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/inventory.json` | not taken |
| `docs/repository-hygiene/c2d78ba2ea23/reference-graph.json` | not taken |
| `document-portal/404.html` | superseded — rewritten |
| `document-portal/README.md` | superseded — rewritten |
| `document-portal/admin.html` | superseded — retired |
| `document-portal/config.example.js` | superseded — rewritten |
| `document-portal/index.html` | superseded — rewritten |
| `document-portal/js/admin.js` | superseded — retired |
| `document-portal/js/data.js` | superseded — rewritten |
| `document-portal/submit.html` | superseded — rewritten |
| `document-portal/support.html` | superseded — rewritten |
| `document-portal/sw.js` | superseded — rewritten |
| `document-portal/track.html` | superseded — rewritten |
| `index.html` | superseded — rewritten |
| `modules/acknowledgment.js` | superseded — rewritten |
| `modules/activities.js` | superseded — rewritten |
| `modules/archive.js` | superseded — rewritten |
| `modules/assistant.js` | superseded — rewritten |
| `modules/correspondence-email.js` | superseded — rewritten |
| `modules/correspondence.js` | superseded — rewritten |
| `modules/executive.js` | superseded — rewritten |
| `modules/fasttrack.js` | superseded — rewritten |
| `modules/lookup.js` | superseded — rewritten |
| `modules/orchestrator.js` | superseded — rewritten |
| `modules/registry.js` | superseded — rewritten |
| `modules/reports.js` | superseded — rewritten |
| `modules/response-tracking.js` | superseded — rewritten |
| `modules/settings.js` | superseded — rewritten |
| `modules/statistics.js` | superseded — rewritten |
| `modules/user-admin.js` | superseded — rewritten |
| `shared/figma-uiux-runtime.js` | superseded — rewritten |
| `styles/app.css` | superseded — rewritten |
| `styles/dgo-design-system/components.css` | superseded — rewritten |
| `tests/check-secrets.mjs` | superseded — rewritten |
| `tests/governance.test.mjs` | superseded — rewritten |
| `tests/secrets-baseline.txt` | superseded — rewritten |
| `tests/smoke.spec.js` | superseded — rewritten |

</details>

<details><summary><code>PR #9</code> — 9 file(s)</summary>

| File | Bucket |
|---|---|
| `.github/workflows/ci.yml` | superseded — rewritten |
| `README.md` | superseded — rewritten |
| `docs/architecture/architecture.html` | superseded — rewritten |
| `docs/architecture/components.html` | superseded — rewritten |
| `docs/visual/app.js` | superseded — rewritten |
| `docs/visual/platform-data.js` | superseded — rewritten |
| `package.json` | superseded — rewritten |
| `scripts/visual-docs-data.mjs` | superseded — rewritten |
| `tests/visual-docs.test.mjs` | superseded — rewritten |

</details>

<details><summary><code>PR #10</code> — 37 file(s)</summary>

| File | Bucket |
|---|---|
| `.devcontainer/devcontainer.json` | superseded — rewritten |
| `.github/workflows/ci.yml` | superseded — rewritten |
| `.gitignore` | superseded — rewritten |
| `README.md` | superseded — rewritten |
| `dgo-stagem-r11.5-cumulative-reconciled-platform.zip` | not taken |
| `docs/architecture/architecture.html` | superseded — rewritten |
| `docs/architecture/components.html` | superseded — rewritten |
| `docs/deployment/DIRECT-ENDPOINTS.md` | not taken |
| `docs/deployment/LOCAL-DEV.md` | superseded — rewritten |
| `docs/deployment/README.md` | superseded — rewritten |
| `docs/visual/app.js` | superseded — rewritten |
| `docs/visual/platform-data.js` | superseded — rewritten |
| `package.json` | superseded — rewritten |
| `playwright.config.js` | superseded — rewritten |
| `refs/Flows/Flows Details/desktop.ini` | not taken |
| `refs/Flows/Flows Details/flow/desktop.ini` | not taken |
| `refs/Flows/Flows Details/flow/removeTypeDuplicates.js.map` | not taken |
| `refs/Flows/New folder/desktop.ini` | not taken |
| `refs/Flows/desktop.ini` | not taken |
| `refs/Platforms/desktop.ini` | not taken |
| `refs/desktop.ini` | not taken |
| `refs/source_SPAs/Docs Tasks Email Matrix.html.txt` | not taken |
| `refs/source_SPAs/desktop.ini` | not taken |
| `scripts/check-endpoints.mjs` | not taken |
| `scripts/dev-server.mjs` | superseded — rewritten |
| `scripts/dev-setup.mjs` | not taken |
| `scripts/dev/intake.mjs` | superseded — rewritten |
| `scripts/dev/runtime-config.mjs` | superseded — rewritten |
| `scripts/dev/seed.mjs` | superseded — rewritten |
| `scripts/endpoints.example.env` | not taken |
| `scripts/setup-endpoints.mjs` | not taken |
| `scripts/visual-docs-data.mjs` | superseded — rewritten |
| `tests/README.md` | superseded — rewritten |
| `tests/architecture.test.mjs` | superseded — rewritten |
| `tests/dev-server.test.mjs` | superseded — rewritten |
| `tests/endpoint-tooling.test.mjs` | not taken |
| `tests/visual-docs.test.mjs` | superseded — rewritten |

</details>

<details><summary><code>PR #12</code> — 8 file(s)</summary>

| File | Bucket |
|---|---|
| `COMMISSIONING.md` | superseded — retired |
| `FRONTEND_REVIEW_ASSESSMENT.md` | superseded — retired |
| `PLATFORM_DOCUMENTATION.md` | superseded — retired |
| `README.md` | superseded — rewritten |
| `STATUS_REPORT.md` | superseded — retired |
| `docs/architecture/TARGET_ARCHITECTURE.md` | superseded — rewritten |
| `docs/architecture/architecture.html` | superseded — rewritten |
| `scripts/commission-check.mjs` | superseded — rewritten |

</details>

<details><summary><code>PR #15</code> — 7 file(s)</summary>

| File | Bucket |
|---|---|
| `COMMISSIONING.md` | superseded — retired |
| `PLATFORM_DOCUMENTATION.md` | superseded — retired |
| `README.md` | superseded — rewritten |
| `STATUS_REPORT.md` | superseded — retired |
| `docs/architecture/TARGET_ARCHITECTURE.md` | superseded — rewritten |
| `docs/architecture/architecture.html` | superseded — rewritten |
| `scripts/commission-check.mjs` | superseded — rewritten |

</details>

<details><summary><code>archive/quarantined-estate-2026-09-09</code> — 8 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/README.md` | superseded — rewritten |
| `docs/deployment/ENDPOINT_REQUIREMENTS_ASSESSMENT_BRIEF.md` | not taken |
| `docs/reference/provisioning/README.md → docs/flows/provisioning/README.md` | superseded — rewritten |
| `docs/reference/provisioning/packages/copy-of-fetch-all-data-references-matrix-post.md → docs/flows/provisioning/packages/copy-of-fetch-all-data-references-matrix-post.md` | superseded — rewritten |
| `docs/reference/provisioning/packages/dynamic-multi-actions.md → docs/flows/provisioning/packages/dynamic-multi-actions.md` | superseded — rewritten |
| `docs/reference/provisioning/packages/otp-verify-patched-definition.md → docs/flows/provisioning/packages/otp-verify-patched-definition.md` | superseded — rewritten |
| `docs/reference/provisioning/packages/portal-verify-confirm-definition.md → docs/flows/provisioning/packages/portal-verify-confirm-definition.md` | superseded — rewritten |
| `scripts/lib/provisioning-reader.mjs` | superseded — rewritten |

</details>

<details><summary><code>claude/docs-portal-live-ops-comments-maavhp</code> — 60 file(s)</summary>

| File | Bucket |
|---|---|
| `config/endpoints.config.js` | superseded — rewritten |
| `config/entry-points.config.js` | superseded — rewritten |
| `core/source-normalizer.js` | superseded — rewritten |
| `docs/architecture/INTAKE_CONVERGENCE.md` | not taken |
| `docs/architecture/architecture-data.json` | superseded — rewritten |
| `docs/architecture/components.html` | superseded — rewritten |
| `docs/deployment/FLOW-BUILD-PLAN.md` | superseded — retired |
| `docs/deployment/FLOW_IMPLEMENTATION_MAP.md` | not taken |
| `docs/deployment/README.md` | superseded — rewritten |
| `docs/deployment/power-automate-flows/01-portal-submission.flow.json → docs/flows/packages/01-portal-submission.flow.json` | superseded — rewritten |
| `docs/deployment/power-automate-flows/02-portal-upload.flow.json → docs/flows/packages/02-portal-upload.flow.json` | superseded — rewritten |
| `docs/deployment/power-automate-flows/03-portal-support.flow.json → docs/flows/packages/03-portal-support.flow.json` | superseded — rewritten |
| `docs/deployment/power-automate-flows/04-portal-verify-request.flow.json → docs/flows/packages/04-portal-verify-request.flow.json` | superseded — rewritten |
| `docs/deployment/power-automate-flows/05-portal-verify-confirm.flow.json → docs/flows/packages/05-portal-verify-confirm.flow.json` | superseded — rewritten |
| `docs/deployment/power-automate-flows/06-portal-status.flow.json → docs/flows/packages/06-portal-status.flow.json` | superseded — rewritten |
| `docs/deployment/power-automate-flows/07-portal-provisioning.flow.json → docs/flows/packages/07-portal-provisioning.flow.json` | superseded — rewritten |
| `docs/deployment/power-automate-flows/08-governance-repair.flow.json → docs/flows/packages/08-governance-repair.flow.json` | not taken |
| `docs/deployment/power-automate-flows/09-portal-intake-feed.flow.json → docs/flows/packages/09-portal-intake-feed.flow.json` | not taken |
| `docs/deployment/power-automate-flows/README.md → docs/flows/packages/README.md` | superseded — rewritten |
| `docs/deployment/power-automate-flows/SHAREPOINT_LISTS.md → docs/flows/packages/SHAREPOINT_LISTS.md` | not taken |
| `docs/deployment/power-automate-flows/codeview/01-portal-submission.definition.json → docs/flows/packages/codeview/01-portal-submission.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/02-portal-upload.definition.json → docs/flows/packages/codeview/02-portal-upload.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/03-portal-support.definition.json → docs/flows/packages/codeview/03-portal-support.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/04-portal-verify-request.definition.json → docs/flows/packages/codeview/04-portal-verify-request.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/05-portal-verify-confirm.definition.json → docs/flows/packages/codeview/05-portal-verify-confirm.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/06-portal-status.definition.json → docs/flows/packages/codeview/06-portal-status.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/07-portal-provisioning.definition.json → docs/flows/packages/codeview/07-portal-provisioning.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/08-governance-repair.definition.json → docs/flows/packages/codeview/08-governance-repair.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/09-portal-intake-feed.definition.json → docs/flows/packages/codeview/09-portal-intake-feed.definition.json` | not taken |
| `docs/deployment/power-automate-flows/paste/01-portal-submission.paste.json → docs/flows/packages/paste/01-portal-submission.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/01-portal-submission.variables.json → docs/flows/packages/paste/01-portal-submission.variables.json` | not taken |
| `docs/deployment/power-automate-flows/paste/02-portal-upload.paste.json → docs/flows/packages/paste/02-portal-upload.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/03-portal-support.paste.json → docs/flows/packages/paste/03-portal-support.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/04-portal-verify-request.paste.json → docs/flows/packages/paste/04-portal-verify-request.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/05-portal-verify-confirm.paste.json → docs/flows/packages/paste/05-portal-verify-confirm.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/06-portal-status.paste.json → docs/flows/packages/paste/06-portal-status.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/07-portal-provisioning.paste.json → docs/flows/packages/paste/07-portal-provisioning.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/08-governance-repair.paste.json → docs/flows/packages/paste/08-governance-repair.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/09-portal-intake-feed.paste.json → docs/flows/packages/paste/09-portal-intake-feed.paste.json` | not taken |
| `docs/deployment/power-automate-flows/sharepoint-lists.json → docs/flows/packages/sharepoint-lists.json` | superseded — rewritten |
| `docs/reference/dgo-governance-live-inventory.json` | not taken |
| `docs/reference/flow-contracts/DOCUMENT_PORTAL_FLOWS.md → docs/flows/contracts/DOCUMENT_PORTAL_FLOWS.md` | superseded — rewritten |
| `docs/reference/portal-provisioning-readiness.json` | not taken |
| `docs/reference/sharepoint-provisioning-spec.json` | superseded — rewritten |
| `docs/visual/platform-data.js` | superseded — rewritten |
| `package.json` | superseded — rewritten |
| `scripts/dev/endpoints.mjs` | superseded — rewritten |
| `scripts/flow-embedded-spec.mjs` | not taken |
| `scripts/flow-implementation-map.mjs` | not taken |
| `scripts/flow-list-guids.mjs` | not taken |
| `scripts/flow-paste-package.mjs` | not taken |
| `scripts/lib/endpoint-probes.mjs` | superseded — rewritten |
| `scripts/lib/endpoint-surface.mjs` | superseded — rewritten |
| `scripts/repair-sharepoint-governance.ps1` | not taken |
| `scripts/setup-sharepoint-portal.ps1` | superseded — retired |
| `scripts/sharepoint-list-catalogue.mjs` | not taken |
| `tests/dev-server.test.mjs` | superseded — rewritten |
| `tests/flow-paste.test.mjs` | not taken |
| `tests/governance.test.mjs` | superseded — rewritten |
| `tests/intake-convergence.test.mjs` | not taken |

</details>

<details><summary><code>claude/document-portal-automate-flows-30o4xd</code> — 7 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/deployment/power-automate-flows/README.md → docs/flows/packages/README.md` | superseded — rewritten |
| `docs/deployment/power-automate-flows/paste/01-portal-submission.paste.json → docs/flows/packages/paste/01-portal-submission.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/02-portal-upload.paste.json → docs/flows/packages/paste/02-portal-upload.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/03-portal-support.paste.json → docs/flows/packages/paste/03-portal-support.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/04-portal-verify-request.paste.json → docs/flows/packages/paste/04-portal-verify-request.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/05-portal-verify-confirm.paste.json → docs/flows/packages/paste/05-portal-verify-confirm.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/06-portal-status.paste.json → docs/flows/packages/paste/06-portal-status.paste.json` | not taken |

</details>

<details><summary><code>claude/ecm-docs-assessment-wj0yn9</code> — 2 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/audits/INDEPENDENT_PILOT_READINESS_ASSESSMENT_2026-09-23.md` | ported |
| `docs/audits/PILOT_READINESS_REVIEW_2026-09-23.html` | ported |

</details>

<details><summary><code>claude/ecm-docs-cleanup-3vhb6g</code> — 12 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/README.md` | superseded — rewritten |
| `docs/audits/DESIGN_AUDIT_BRIEF_ASSESSMENT.md` | superseded — rewritten |
| `docs/audits/INDEX.md` | superseded — rewritten |
| `docs/deployment/power-automate-flows/README.md → docs/flows/packages/README.md` | superseded — rewritten |
| `docs/deployment/sharepoint/HANDOVER.md` | superseded — rewritten |
| `docs/deployment/sharepoint/README.md` | superseded — rewritten |
| `docs/reference/README.md` | superseded — rewritten |
| `docs/reference/flow-contracts/ALIGNMENT_REPORT.json → docs/flows/contracts/ALIGNMENT_REPORT.json` | superseded — rewritten |
| `docs/reference/flow-contracts/DOCUMENT_PORTAL_FLOWS.json → docs/flows/contracts/DOCUMENT_PORTAL_FLOWS.json` | superseded — rewritten |
| `docs/reference/flow-contracts/flow-alignment-console.html → docs/flows/contracts/flow-alignment-console.html` | superseded — rewritten |
| `docs/reference/flow-list-map.json → docs/flows/registers/flow-list-map.json` | superseded — rewritten |
| `docs/reference/foundational/README.md` | superseded — rewritten |

</details>

<details><summary><code>claude/ecm-docs-commissioning-audit-5ffkz3</code> — 2 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/deployment/AGENT_COMMISSIONING_DIRECTIVE.md` | superseded — retired |
| `docs/deployment/COMMISSIONING_AGENT_BRIEF.md` | superseded — retired |

</details>

<details><summary><code>claude/ecm-docs-dev-cleanup-v2h35g</code> — 15 file(s)</summary>

| File | Bucket |
|---|---|
| `README.md` | superseded — rewritten |
| `docs/README.md` | superseded — rewritten |
| `docs/STATUS_REPORT.md` | superseded — rewritten |
| `docs/audits/DESIGN_AUDIT_BRIEF_ASSESSMENT.md` | superseded — rewritten |
| `docs/audits/INDEX.md` | superseded — rewritten |
| `docs/audits/REPOSITORY_HYGIENE.md` | not taken |
| `docs/deployment/DOCUMENT_PORTAL_LIVE_OPERATIONS.md` | superseded — rewritten |
| `docs/reference/README.md` | superseded — rewritten |
| `docs/reference/flow-contracts/ALIGNMENT_REPORT.json → docs/flows/contracts/ALIGNMENT_REPORT.json` | superseded — rewritten |
| `docs/reference/flow-contracts/DOCUMENT_PORTAL_FLOWS.json → docs/flows/contracts/DOCUMENT_PORTAL_FLOWS.json` | superseded — rewritten |
| `docs/reference/flow-contracts/INTERNAL_PLATFORM_FLOWS.md → docs/flows/contracts/INTERNAL_PLATFORM_FLOWS.md` | superseded — rewritten |
| `docs/reference/flow-contracts/flow-alignment-console.html → docs/flows/contracts/flow-alignment-console.html` | superseded — rewritten |
| `docs/reference/foundational/README.md` | superseded — rewritten |
| `docs/reference/foundational/flows/run-records/README.md` | superseded — rewritten |
| `docs/reference/foundational/verification/FINDINGS.md` | superseded — rewritten |

</details>

<details><summary><code>claude/platform-flows-endpoints-docs-plxjlw</code> — 111 file(s)</summary>

| File | Bucket |
|---|---|
| `.gitattributes` | superseded — rewritten |
| `.gitignore` | superseded — rewritten |
| `CONTRIBUTING.md` | superseded — rewritten |
| `PLATFORM_DOCUMENTATION.md` | superseded — retired |
| `README.md` | superseded — rewritten |
| `config/status-vocabulary.config.js` | superseded — rewritten |
| `core/source-normalizer.js` | superseded — rewritten |
| `docs/README.md` | superseded — rewritten |
| `docs/STATUS_REPORT.md` | superseded — rewritten |
| `docs/architecture/AUTHENTICATION_CONTRACT.md` | superseded — rewritten |
| `docs/architecture/AUTH_RBAC_GUIDE.md` | superseded — rewritten |
| `docs/architecture/CONSOLIDATION_ANALYSIS.md` | superseded — rewritten |
| `docs/architecture/TARGET_ARCHITECTURE.md` | superseded — rewritten |
| `docs/architecture/architecture.html` | superseded — rewritten |
| `docs/cutover/ARCHIVE_DISPOSITION.md` | superseded — rewritten |
| `docs/deployment/COMMISSIONING.md` | superseded — retired |
| `docs/deployment/DOCUMENT_PORTAL_LIVE_OPERATIONS.md` | superseded — rewritten |
| `docs/deployment/ENDPOINT_REQUIREMENTS_ASSESSMENT_BRIEF.md` | not taken |
| `docs/deployment/EXECUTION_RUNBOOK.md` | superseded — retired |
| `docs/deployment/FLOW-BUILD-PLAN.md` | superseded — retired |
| `docs/deployment/PACKAGING.md` | superseded — rewritten |
| `docs/deployment/PORTAL_INTEGRATION_FACTSHEET.md` | superseded — rewritten |
| `docs/deployment/PRODUCTION_READINESS_REGISTER.json` | superseded — rewritten |
| `docs/deployment/sharepoint/CLOSING_STATE.md` | superseded — rewritten |
| `docs/deployment/sharepoint/DECISIONS.md` | superseded — rewritten |
| `docs/deployment/sharepoint/FLOW_STANDARD.md` | superseded — rewritten |
| `docs/deployment/sharepoint/LISTS.md` | superseded — rewritten |
| `docs/deployment/sharepoint/OPEN_ITEMS.md` | superseded — rewritten |
| `docs/deployment/sharepoint/flow-standard.json` | superseded — rewritten |
| `docs/process/00-README.md` | superseded — rewritten |
| `docs/process/01-EXECUTIVE-SUMMARY.md` | superseded — rewritten |
| `docs/process/02-SCOPE-AND-BOUNDARIES.md` | superseded — rewritten |
| `docs/process/03-SOURCE-INVENTORY.md` | superseded — rewritten |
| `docs/process/05-EVIDENCE-FRAMEWORK.md` | superseded — rewritten |
| `docs/process/06-PROCESS-ARCHITECTURE.md` | superseded — rewritten |
| `docs/process/07-MASTER-PROCESS-INVENTORY.md` | superseded — rewritten |
| `docs/process/08-PROCESS-HIERARCHY.md` | superseded — rewritten |
| `docs/process/09-PROCESS-DETAIL.md` | superseded — rewritten |
| `docs/process/10-SUBPROCESS-AND-VARIANT-CATALOGUE.md` | superseded — rewritten |
| `docs/process/11-PROCESS-STEP-CATALOGUE.md` | superseded — rewritten |
| `docs/process/12-RULE-AND-CONTROL-CATALOGUE.md` | superseded — rewritten |
| `docs/process/13-ROLES-AND-RESPONSIBILITY-MATRIX.md` | superseded — rewritten |
| `docs/process/14-STATUS-AND-TRANSITION-CATALOGUE.md` | superseded — rewritten |
| `docs/process/15-INTEGRATION-CATALOGUE.md` | superseded — rewritten |
| `docs/process/16-DEPENDENCY-MAP.md` | superseded — rewritten |
| `docs/process/17-EXCEPTION-AND-RECOVERY-CATALOGUE.md` | superseded — rewritten |
| `docs/process/18-NOTIFICATION-AND-ESCALATION-CATALOGUE.md` | superseded — rewritten |
| `docs/process/19-MONITORING-AUDIT-AND-PERFORMANCE.md` | superseded — rewritten |
| `docs/process/20-PROCESS-DIAGRAMS.md` | superseded — rewritten |
| `docs/process/21-TRACEABILITY-MATRIX.md` | superseded — rewritten |
| `docs/process/22-GAP-CONFLICT-AND-VALIDATION-REGISTER.md` | superseded — rewritten |
| `docs/process/23-COVERAGE-AND-RECONCILIATION.md` | superseded — rewritten |
| `docs/process/24-COMPLETENESS-AND-CONSISTENCY-REVIEW.md` | superseded — rewritten |
| `docs/process/25-RECOMMENDATIONS.md` | superseded — rewritten |
| `docs/process/26-STATUS-AND-CONFIDENCE.md` | superseded — rewritten |
| `docs/process/27-SOURCE-REGISTER.md` | superseded — rewritten |
| `docs/process/28-TERMINOLOGY-AND-INDEX.md` | superseded — rewritten |
| `docs/reference/ENDPOINTS_JSON_IN_POWER_AUTOMATE.md` | not taken |
| `docs/reference/FLOW_HARVEST_COLLECTOR.md` | not taken |
| `docs/reference/README.md` | superseded — rewritten |
| `docs/reference/endpoints.json` | not taken |
| `docs/reference/flow-contracts/DOCUMENT_PORTAL_FLOWS.html → docs/flows/contracts/DOCUMENT_PORTAL_FLOWS.html` | superseded — rewritten |
| `docs/reference/flow-contracts/DOCUMENT_PORTAL_FLOWS.json → docs/flows/contracts/DOCUMENT_PORTAL_FLOWS.json` | superseded — rewritten |
| `docs/reference/flow-contracts/DOCUMENT_PORTAL_FLOWS.md → docs/flows/contracts/DOCUMENT_PORTAL_FLOWS.md` | superseded — rewritten |
| `docs/reference/flow-contracts/INTERNAL_PLATFORM_FLOWS.md → docs/flows/contracts/INTERNAL_PLATFORM_FLOWS.md` | superseded — rewritten |
| `docs/reference/flow-contracts/recovered/Copy of - Fetch_All_Data_and_References_Matrix-POST__08584201914788160149253197884CU95__full_definition.json → docs/flows/contracts/recovered/Copy of - Fetch_All_Data_and_References_Matrix-POST__08584201914788160149253197884CU95__full_definition.json` | superseded — rewritten |
| `docs/reference/flow-contracts/recovered/Dynamic_Multi-Actions__08584162519225125704688467311CU186__full_definition.json → docs/flows/contracts/recovered/Dynamic_Multi-Actions__08584162519225125704688467311CU186__full_definition.json` | superseded — rewritten |
| `docs/reference/flow-list-map.json → docs/flows/registers/flow-list-map.json` | superseded — rewritten |
| `docs/reference/internal-flow-register.json → docs/flows/registers/internal-flow-register.json` | superseded — rewritten |
| `docs/reference/process-inventory.json` | superseded — rewritten |
| `docs/reference/provisioning/README.md → docs/flows/provisioning/README.md` | superseded — rewritten |
| `docs/visual/app.js` | superseded — rewritten |
| `docs/visual/platform-data.js` | superseded — rewritten |
| `document-portal/README.md` | superseded — rewritten |
| `document-portal/js/data.js` | superseded — rewritten |
| `package.json` | superseded — rewritten |
| `scripts/build-endpoint-dataset.mjs` | not taken |
| `scripts/build-endpoint-workbook-model.mjs` | not taken |
| `scripts/build-provisioning-reference.mjs` | superseded — rewritten |
| `scripts/build_flow_harvest_collector.py` | not taken |
| `scripts/build_harvest_flow_package.py` | not taken |
| `scripts/build_watermark_flow_package.py` | not taken |
| `scripts/check-config-local.mjs` | superseded — rewritten |
| `scripts/commission-check.mjs` | superseded — rewritten |
| `scripts/flow-inventory.mjs` | superseded — rewritten |
| `scripts/flow-list-sweep.mjs` | superseded — rewritten |
| `scripts/lib/designer-paste-builder.mjs` | superseded — rewritten |
| `scripts/lib/flow-definition-reader.mjs` | superseded — rewritten |
| `scripts/lib/provisioning-reader.mjs` | superseded — rewritten |
| `scripts/package.mjs` | superseded — rewritten |
| `scripts/process-discovery.mjs` | superseded — rewritten |
| `scripts/render_endpoint_workbook.py` | not taken |
| `scripts/rotation-register.mjs` | superseded — rewritten |
| `scripts/setup.mjs` | superseded — rewritten |
| `scripts/verify_endpoint_workbook.py` | not taken |
| `scripts/verify_flow_harvest_collector.py` | not taken |
| `scripts/verify_harvest_flow_package.py` | not taken |
| `scripts/verify_watermark_flow_package.py` | not taken |
| `tests/audit-remediation.spec.js` | superseded — rewritten |
| `tests/check-secrets.mjs` | superseded — rewritten |
| `tests/commissioning.test.mjs` | superseded — rewritten |
| `tests/correspondence.spec.js` | superseded — rewritten |
| `tests/endpoint-dataset.test.mjs` | not taken |
| `tests/hardening.test.mjs` | superseded — rewritten |
| `tests/output-encoding.test.mjs` | superseded — rewritten |
| `tests/packaging.test.mjs` | superseded — rewritten |
| `tests/provisioning-reference.test.mjs` | superseded — rewritten |
| `tests/references.test.mjs` | superseded — rewritten |
| `tests/scan-intake.spec.js` | superseded — rewritten |
| `tests/secret-exposure.test.mjs` | superseded — rewritten |
| `tests/standing-claims.test.mjs` | superseded — rewritten |

</details>

<details><summary><code>claude/platform-visual-architecture-4zffpk</code> — 1 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/visual/platform-data.js` | superseded — rewritten |

</details>

<details><summary><code>claude/power-automate-actions-review-kjpsna</code> — 9 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/reference/README.md` | superseded — rewritten |
| `docs/reference/flow-authoring/AI_FLOW_GENERATION_DIRECTIVE.md` | not taken |
| `docs/reference/flow-authoring/fixtures/fail-cors-and-concat.json` | not taken |
| `docs/reference/flow-authoring/fixtures/fail-graph-and-expressions.json` | not taken |
| `docs/reference/flow-authoring/fixtures/fail-legacy-schema.json` | not taken |
| `docs/reference/flow-authoring/fixtures/pass-submission-post.json` | not taken |
| `docs/reference/flow-authoring/fixtures/pass-upload-put.json` | not taken |
| `docs/reference/flow-authoring/selftest.mjs` | not taken |
| `docs/reference/flow-authoring/validate-msla-paste.mjs` | not taken |

</details>

<details><summary><code>claude/power-automate-execution-flow-xihaj6</code> — 7 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/deployment/power-automate-flows/08-gap-remediation-provisioning.flow.json → docs/flows/packages/08-gap-remediation-provisioning.flow.json` | not taken |
| `docs/deployment/power-automate-flows/README.md → docs/flows/packages/README.md` | superseded — rewritten |
| `docs/deployment/power-automate-flows/codeview/08-gap-remediation-provisioning.definition.json → docs/flows/packages/codeview/08-gap-remediation-provisioning.definition.json` | not taken |
| `docs/deployment/power-automate-flows/paste/08-gap-remediation-provisioning.paste.json → docs/flows/packages/paste/08-gap-remediation-provisioning.paste.json` | not taken |
| `docs/deployment/power-automate-flows/provisioning-gap-register.json → docs/flows/packages/provisioning-gap-register.json` | not taken |
| `docs/reference/sharepoint-provisioning-spec.json` | superseded — rewritten |
| `docs/visual/platform-data.js` | superseded — rewritten |

</details>

<details><summary><code>claude/power-automate-internal-flows-snrmx2</code> — 95 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/deployment/power-automate-flows/README.md → docs/flows/packages/README.md` | superseded — rewritten |
| `docs/deployment/power-automate-flows/codeview/01-portal-submission.definition.json → docs/flows/packages/codeview/01-portal-submission.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/02-portal-upload.definition.json → docs/flows/packages/codeview/02-portal-upload.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/03-portal-support.definition.json → docs/flows/packages/codeview/03-portal-support.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/04-portal-verify-request.definition.json → docs/flows/packages/codeview/04-portal-verify-request.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/05-portal-verify-confirm.definition.json → docs/flows/packages/codeview/05-portal-verify-confirm.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/06-portal-status.definition.json → docs/flows/packages/codeview/06-portal-status.definition.json` | not taken |
| `docs/deployment/power-automate-flows/codeview/07-portal-provisioning.definition.json → docs/flows/packages/codeview/07-portal-provisioning.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/README.md → docs/flows/packages/internal/README.md` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/01-fetch-all.definition.json → docs/flows/packages/internal/codeview/01-fetch-all.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/02-get-docs.definition.json → docs/flows/packages/internal/codeview/02-get-docs.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/03-reference-data.definition.json → docs/flows/packages/internal/codeview/03-reference-data.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/04-fetch-email-attachments.definition.json → docs/flows/packages/internal/codeview/04-fetch-email-attachments.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/05-subsidiary-actions.definition.json → docs/flows/packages/internal/codeview/05-subsidiary-actions.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/06-dynamic-actions.definition.json → docs/flows/packages/internal/codeview/06-dynamic-actions.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/07-single-assignment.definition.json → docs/flows/packages/internal/codeview/07-single-assignment.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/08-bulk-assignment.definition.json → docs/flows/packages/internal/codeview/08-bulk-assignment.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/09-bulk-assignment-direct.definition.json → docs/flows/packages/internal/codeview/09-bulk-assignment-direct.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/10-email-related-task.definition.json → docs/flows/packages/internal/codeview/10-email-related-task.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/11-otp-generate.definition.json → docs/flows/packages/internal/codeview/11-otp-generate.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/12-otp-verify.definition.json → docs/flows/packages/internal/codeview/12-otp-verify.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/13-scan-intake.definition.json → docs/flows/packages/internal/codeview/13-scan-intake.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/14-ai-chat.definition.json → docs/flows/packages/internal/codeview/14-ai-chat.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/15-ai-email-analysis.definition.json → docs/flows/packages/internal/codeview/15-ai-email-analysis.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/codeview/16-ai-doc-analysis.definition.json → docs/flows/packages/internal/codeview/16-ai-doc-analysis.definition.json` | not taken |
| `docs/deployment/power-automate-flows/internal/flow-index.json → docs/flows/packages/internal/flow-index.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/01-fetch-all.paste.json → docs/flows/packages/internal/paste/01-fetch-all.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/02-get-docs.paste.json → docs/flows/packages/internal/paste/02-get-docs.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/03-reference-data.paste.json → docs/flows/packages/internal/paste/03-reference-data.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/04-fetch-email-attachments.paste.json → docs/flows/packages/internal/paste/04-fetch-email-attachments.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/05-subsidiary-actions.paste.json → docs/flows/packages/internal/paste/05-subsidiary-actions.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/06-dynamic-actions.paste.json → docs/flows/packages/internal/paste/06-dynamic-actions.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/07-single-assignment.paste.json → docs/flows/packages/internal/paste/07-single-assignment.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/08-bulk-assignment.paste.json → docs/flows/packages/internal/paste/08-bulk-assignment.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/09-bulk-assignment-direct.paste.json → docs/flows/packages/internal/paste/09-bulk-assignment-direct.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/10-email-related-task.paste.json → docs/flows/packages/internal/paste/10-email-related-task.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/11-otp-generate.paste.json → docs/flows/packages/internal/paste/11-otp-generate.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/12-otp-verify.paste.json → docs/flows/packages/internal/paste/12-otp-verify.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/13-scan-intake.paste.json → docs/flows/packages/internal/paste/13-scan-intake.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/14-ai-chat.paste.json → docs/flows/packages/internal/paste/14-ai-chat.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/15-ai-email-analysis.paste.json → docs/flows/packages/internal/paste/15-ai-email-analysis.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/paste/16-ai-doc-analysis.paste.json → docs/flows/packages/internal/paste/16-ai-doc-analysis.paste.json` | not taken |
| `docs/deployment/power-automate-flows/internal/sharepoint-lists.json → docs/flows/packages/internal/sharepoint-lists.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/01-fetch-all.variables.json → docs/flows/packages/internal/variables/01-fetch-all.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/02-get-docs.variables.json → docs/flows/packages/internal/variables/02-get-docs.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/03-reference-data.variables.json → docs/flows/packages/internal/variables/03-reference-data.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/04-fetch-email-attachments.variables.json → docs/flows/packages/internal/variables/04-fetch-email-attachments.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/05-subsidiary-actions.variables.json → docs/flows/packages/internal/variables/05-subsidiary-actions.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/06-dynamic-actions.variables.json → docs/flows/packages/internal/variables/06-dynamic-actions.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/07-single-assignment.variables.json → docs/flows/packages/internal/variables/07-single-assignment.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/08-bulk-assignment.variables.json → docs/flows/packages/internal/variables/08-bulk-assignment.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/09-bulk-assignment-direct.variables.json → docs/flows/packages/internal/variables/09-bulk-assignment-direct.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/10-email-related-task.variables.json → docs/flows/packages/internal/variables/10-email-related-task.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/11-otp-generate.variables.json → docs/flows/packages/internal/variables/11-otp-generate.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/12-otp-verify.variables.json → docs/flows/packages/internal/variables/12-otp-verify.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/13-scan-intake.variables.json → docs/flows/packages/internal/variables/13-scan-intake.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/14-ai-chat.variables.json → docs/flows/packages/internal/variables/14-ai-chat.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/15-ai-email-analysis.variables.json → docs/flows/packages/internal/variables/15-ai-email-analysis.variables.json` | not taken |
| `docs/deployment/power-automate-flows/internal/variables/16-ai-doc-analysis.variables.json → docs/flows/packages/internal/variables/16-ai-doc-analysis.variables.json` | not taken |
| `docs/deployment/power-automate-flows/paste/01-portal-submission.paste.json → docs/flows/packages/paste/01-portal-submission.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/01-portal-submission.variables.json → docs/flows/packages/paste/01-portal-submission.variables.json` | not taken |
| `docs/deployment/power-automate-flows/paste/02-portal-upload.paste.json → docs/flows/packages/paste/02-portal-upload.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/03-portal-support.paste.json → docs/flows/packages/paste/03-portal-support.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/04-portal-verify-request.paste.json → docs/flows/packages/paste/04-portal-verify-request.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/05-portal-verify-confirm.paste.json → docs/flows/packages/paste/05-portal-verify-confirm.paste.json` | not taken |
| `docs/deployment/power-automate-flows/paste/06-portal-status.paste.json → docs/flows/packages/paste/06-portal-status.paste.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/DEFECT_REGISTER.json → docs/flows/packages/portal-corrected/DEFECT_REGISTER.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/DEFECT_REGISTER.md → docs/flows/packages/portal-corrected/DEFECT_REGISTER.md` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/SUBMISSION_Scope_Global.paste.json → docs/flows/packages/portal-corrected/SUBMISSION_Scope_Global.paste.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/SUPPORT_Scope_Global.paste.json → docs/flows/packages/portal-corrected/SUPPORT_Scope_Global.paste.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/UPLOAD_Scope_Global.paste.json → docs/flows/packages/portal-corrected/UPLOAD_Scope_Global.paste.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/VERIFY_Scope_Flow_Data_Capture.paste.json → docs/flows/packages/portal-corrected/VERIFY_Scope_Flow_Data_Capture.paste.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/VERIFY_Scope_Global.paste.json → docs/flows/packages/portal-corrected/VERIFY_Scope_Global.paste.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/as-provided/SUBMISSION_Scope_Global.CORRECTED.json → docs/flows/packages/portal-corrected/as-provided/SUBMISSION_Scope_Global.CORRECTED.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/as-provided/SUPPORT_Scope_Global.CORRECTED.json → docs/flows/packages/portal-corrected/as-provided/SUPPORT_Scope_Global.CORRECTED.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/as-provided/UPLOAD_Scope_Global.CORRECTED_1.json → docs/flows/packages/portal-corrected/as-provided/UPLOAD_Scope_Global.CORRECTED_1.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/as-provided/VERIFY_Scope_Flow_Data_Capture.CORRECTED.json → docs/flows/packages/portal-corrected/as-provided/VERIFY_Scope_Flow_Data_Capture.CORRECTED.json` | not taken |
| `docs/deployment/power-automate-flows/portal-corrected/as-provided/VERIFY_Scope_Global.CORRECTED_1.json → docs/flows/packages/portal-corrected/as-provided/VERIFY_Scope_Global.CORRECTED_1.json` | not taken |
| `docs/reference/flow-contracts/INTERNAL_PLATFORM_FLOWS.md → docs/flows/contracts/INTERNAL_PLATFORM_FLOWS.md` | superseded — rewritten |
| `package.json` | superseded — rewritten |
| `scripts/build-power-automate-flows.mjs` | not taken |
| `scripts/lib/flows/builder.mjs` | not taken |
| `scripts/lib/flows/platform.mjs` | not taken |
| `scripts/lib/flows/repair.mjs` | not taken |
| `scripts/lib/flows/specs-ai.mjs` | not taken |
| `scripts/lib/flows/specs-assignment.mjs` | not taken |
| `scripts/lib/flows/specs-dynamic.mjs` | not taken |
| `scripts/lib/flows/specs-identity.mjs` | not taken |
| `scripts/lib/flows/specs-intake.mjs` | not taken |
| `scripts/lib/flows/specs-read.mjs` | not taken |
| `scripts/lib/flows/specs-subsidiary.mjs` | not taken |
| `scripts/lib/flows/validate.mjs` | not taken |
| `scripts/repair-portal-flow-artifacts.mjs` | not taken |
| `scripts/setup-sharepoint-portal.ps1` | superseded — retired |
| `tests/power-automate-flows.test.mjs` | not taken |

</details>

<details><summary><code>claude/sharepoint-lists-gap-docs-hyoup8</code> — 0 file(s)</summary>

| File | Bucket |
|---|---|

</details>

<details><summary><code>claude/system-remediation-gaps-audit-aw6a69</code> — 26 file(s)</summary>

| File | Bucket |
|---|---|
| `docs/audits/BRANCH_MERGE_AUDIT_2026-09-11.md` | ported |
| `docs/audits/INDEX.md` | merged or regenerated |
| `docs/deployment/ENDPOINT_REQUIREMENTS_ASSESSMENT_BRIEF.md` | ported |
| `docs/reference/ENDPOINTS_JSON_IN_POWER_AUTOMATE.md` | ported |
| `docs/reference/FLOW_HARVEST_COLLECTOR.md` | ported |
| `docs/reference/endpoints.json` | ported |
| `docs/reference/provisioning/README.md → docs/flows/provisioning/README.md` | merged or regenerated |
| `docs/reference/provisioning/packages/copy-of-fetch-all-data-references-matrix-post.md → docs/flows/provisioning/packages/copy-of-fetch-all-data-references-matrix-post.md` | merged or regenerated |
| `docs/reference/provisioning/packages/dynamic-multi-actions.md → docs/flows/provisioning/packages/dynamic-multi-actions.md` | merged or regenerated |
| `docs/reference/provisioning/packages/otp-verify-patched-definition.md → docs/flows/provisioning/packages/otp-verify-patched-definition.md` | merged or regenerated |
| `docs/reference/provisioning/packages/portal-verify-confirm-definition.md → docs/flows/provisioning/packages/portal-verify-confirm-definition.md` | merged or regenerated |
| `docs/reference/provisioning/packages/web-send-email-definition.md → docs/flows/provisioning/packages/web-send-email-definition.md` | merged or regenerated |
| `docs/visual/platform-data.js` | merged or regenerated |
| `package.json` | merged or regenerated |
| `scripts/build-endpoint-dataset.mjs` | ported |
| `scripts/build-endpoint-workbook-model.mjs` | ported |
| `scripts/build_flow_harvest_collector.py` | ported |
| `scripts/build_harvest_flow_package.py` | ported |
| `scripts/build_watermark_flow_package.py` | ported |
| `scripts/lib/provisioning-reader.mjs` | merged or regenerated |
| `scripts/render_endpoint_workbook.py` | ported |
| `scripts/verify_endpoint_workbook.py` | ported |
| `scripts/verify_flow_harvest_collector.py` | ported |
| `scripts/verify_harvest_flow_package.py` | ported |
| `scripts/verify_watermark_flow_package.py` | ported |
| `tests/endpoint-dataset.test.mjs` | ported |

</details>

