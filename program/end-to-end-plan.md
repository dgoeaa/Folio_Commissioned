# Folio end-to-end delivery and closure plan

**Status:** reconciled execution framework, not delivered software. **Scope:** Workspace, correspondence gateway/Mailer, public Document Portal, Central Administration Centre (CentaAxre), Hub, Estate Console, Flow Workbench, Vault and related applications. Origin: planning commit `d9e71b9b0d1c91ce8e664fb5fa89704d05fd7128`; review this reconciliation against `main`, not as a release.

## Starting position and evidence rules

- The [three](../Internal%20Platform%20Module%20Rationalisation.md) [root](../ESSENTIALS_MAP.md) [reports](../LAYOUT_REVIEW.md) are proposals/older-baseline observations. The [execution plan](decommission-plan.md), [backlog](decommission-backlog.json) and [decision register](decision-register.md) are controls, not acceptance evidence.
- [PR #1](https://github.com/dgoeaa/Folio_Commissioned/pull/1) merged on 2026-10-22: one Workspace source overlay fixes non-JSON HTTP-refusal classification, with 37 focused tests. No repackaging or deployment, tenant durability, role enforcement or active-flow compatibility is established.
- The [inventory](../runtime-remediation-inventory.json) identifies the ZIPs and selected module. The suite is demo with zero provisioned endpoints; its pre-overlay release check fails on six missing manifest-listed files. See the [Stage-0 baseline](stage-0-baseline.md) for exact paths, reproducible checks and blockers. Historical flow exports are not active-flow evidence.
- No production flow import, tenant operation, mail, migration, UI removal or deployment is authorized by this plan. Require a named change owner and explicit authorization for each.
- Inventory source, artifacts and historical evidence separately. ZIP timestamps and incomparable version schemes do not establish authority. Keep secrets and personal data out of repository evidence.

## Delivery contract

Each workstream must record owner, source commit/artifact hash, deployed version evidence, mutation/data-owner and role/authorization matrices, tests (failure/reload/cross-user), migration/rollback, decision dependencies and acceptance evidence. Track evidence and PRs in the [JSON](decommission-backlog.json) and matching [CSV](decommission-backlog.csv).

Allowed statuses: `planned`, `investigating`, `blocked`, `in_review`, `verified`, `released`, `accepted`. `verified` must name exactly what was tested and does not mean deployed; `released` requires approved deployment evidence. **Only `accepted` with the applicable exit evidence closes an item.** Unknown tenant details are blockers, never green checks. No owner sign-off is recorded.

These eight canonical stages supersede the original seven phases through the [crosswalk](decommission-plan.md#canonical-stages-and-original-plan-crosswalk).

| Stage | Outcome and workstreams | Required evidence / exit gate |
| --- | --- | --- |
| 0. Baseline and governance | Recover authoritative full source per app; reconcile ZIPs, deployed hashes and flows; integrate control pack. Assign technical, product, security and tenant change owners. | Reproducible clean checkout/build and release-integrity verification; six manifest gaps resolved or excluded through an approved reproducible rebuild; app/endpoint/data map; redacted active contracts; recorded owners. D-1–D-7 must be decided before their dependent cutovers, not guessed at baseline. |
| 1. Workspace integrity (P0) | Inventory all mutations and queue replay; validate operations, envelopes and errors. Repair or hide unsupported writes; persist completion, comments, minutes, approvals, DG/CEO decisions, custody and closure. Notices follow durable acknowledgement; remove stale derived status snapshots. | Contract tests per operation; rejection, timeout and replay tests; server authorization; reload and independent authorized-user evidence; audited queue drops; no false success or data loss. PR #1 is only a source-tested refusal subset. |
| 2. Outbound correspondence / gateway | Determine separate gateway vs Mailer integration; map reply, dispatch, mass mail, archive, receipts and idempotency. Apply D-4; record-linked reply vs approved bulk sending. | Sandbox send/receipt/retry without real recipients; authorization/classification, duplicate prevention, failure recovery and timeline reconciliation; correspondence-owner acceptance. Contract work can precede stage 4; final record integration cannot. |
| 3. Public Document Portal | Verify submission/authentication/consent/attachment contracts; reconcile Portal, Email, Counter/scan and Internal provenance with Inbox. | Count/identity reconciliation for all sources; validation, attachment/malware policy, authorization, duplicate and failed-delivery tests; public accessibility and Portal-owner acceptance. Preserve original references and submissions. |
| 4. Record-centred office experience | Behind a switch: Record/timeline, Inbox, Tasks and Overview with canonical ownership; server role/state gating; redirect legacy routes and notification links. Keep old UI during parallel run. | Receive → Register → Assign → Acknowledge → Work → Decide → Reply/Dispatch → Close journeys including refusal/handoff; consistent counts; actual supported roles and legacy routes; rollback without orphaning writes. D-1 and stage-1 integrity gate cutover. |
| 5. Central administration and other applications | Inventory CentaAxre, Estate Console, Hub, Workbench, Vault, Mailer and Workspace Admin Suite: endpoint/flow ownership, credentials, permissions, telemetry, destructive controls. Apply D-7 and other relevant decisions. | Named control-plane owner per endpoint/flow; privileged-role tests including direct URLs/APIs; destructive confirmation/audit; demo/live segregation; no officer access to admin-only actions. Retain tools with distinct supported jobs. |
| 6. Simplification, reporting and layout | After parity and D-2/D-3/D-5/D-6 decisions, retire duplicate controls, not data or links. Normalize report labels/metrics; apply layout target and mobile filter-sheet alternative. | Old/new result comparison and retention proof; report/export equality; 1366x768 and mobile accessibility/navigation/focus/long-and-empty-list tests. Redirects and rollback pass before any UI retirement. |
| 7. Release, operate and close | Rebuild reviewed source; verify manifests/security/contracts/migrations; rehearse staging rollback; approved release, monitoring and runbooks. | Source/version provenance and change approval; staged/canary release and rollback drill; observation window/thresholds agreed by operations before deployment; no unresolved critical/high integrity/security issue; office, correspondence, Portal, administration and operations sign-off. |

## Execution sequence and release boundaries

1. Stage 0 precedes every release. Integrate the PR #1 overlay into owner-confirmed full source, rebuild and reverify integrity before deployment.
2. Stage 1 gates record-centred cutover. Isolated source review/tests can proceed but are not deployed remediation.
3. Investigate stages 2/3/5 in parallel with stage 1 without tenant changes. Backlog dependencies govern final integration, even where a higher stage supplies the record UI.
4. Stage 4 is incremental behind a switch. Stage 6 retirement requires parity, redirects, retention and rollback evidence. Navigation rollback must not undo newly persisted records.
5. Stage 7 requires all applicable earlier gates and separate approvals for UI retirement versus data deletion. This plan authorizes **no data deletion**.

## Explicit definition of done

All of the following must be evidenced, not merely planned:

- One reviewed, reproducible authoritative source/build per in-scope application, or a signed exclusion.
- Every retained mutation persists through reload and across authorized users, without premature success or notices.
- Portal intake, gateway/Mailer delivery, Workspace lifecycle and administration pass integration and role tests.
- Accepted D-1–D-7 decisions and traceable retained/retired UI, legacy-link and report-measure mappings.
- Verified release/rollback, approved deployment, completed agreed observation window and runbooks.
- Named business and operations owners sign off with no open critical/high integrity/security issue and documented residual risks.

If source authority, tenant evidence or owner decisions are unavailable, the exercise is **blocked/incomplete**. Deliver the verified subset and blocker register; do not state completion.

## Current bounded delivery and next slice

This reconciliation adds all five program controls and repository-only Stage-0 findings, preserving the PR #1 overlay, tests and inventory. It does not recover an owner-approved full-source build or resolve manifest gaps.

Next: obtain the evidence named in [Stage-0 blockers](stage-0-baseline.md#blockers-and-needed-evidence), select the authoritative full-source baseline in a separate reviewed change, and resolve release-integrity gaps without fabricating missing files. Only then select one supported durable Workspace mutation for a separate contract/reload test slice. Do not attempt estate remediation or UI decommissioning in this PR.
