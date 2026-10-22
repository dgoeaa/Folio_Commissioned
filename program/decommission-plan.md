# Folio remediation execution plan

Status: reconciled Phase 1 control pack, not completed remediation or a release.
Origin: `copilot/folio-remediation-execution` at `d9e71b9b0d1c91ce8e664fb5fa89704d05fd7128`.
These files are selectively reconciled onto the post-PR-#1 development line; the older planning branch's history is not merged.

## Evidence and scope

The original plan drew on [Internal Platform Module Rationalisation](../Internal%20Platform%20Module%20Rationalisation.md), [ESSENTIALS_MAP](../ESSENTIALS_MAP.md) and [LAYOUT_REVIEW](../LAYOUT_REVIEW.md). Those reports describe proposals, an older baseline and simulator results, not a verified current tenant.

[PR #1](https://github.com/dgoeaa/Folio_Commissioned/pull/1), merged on 2026-10-22, delivered a tested Workspace **source overlay**: non-JSON permanent HTTP refusals preserve their status and are not retried or queued. Its 37 focused tests do not prove deployed P0 remediation, all mutation contracts, persistence or authorization. The runtime file, tests and [inventory](../runtime-remediation-inventory.json) are preserved unchanged by this reconciliation.

The inventory records a demo suite with zero provisioned endpoints and six missing release-manifest files: `VERSION`, `folio`, `mailer/VERSION`, `mailer/web/VERSION`, `runtime/LICENSE`, `tools/flow-capsule/VERSION`. The suite is not release-ready. Integrating the overlay also changes a recorded digest and requires a reviewed rebuild, not copying over an old release. See the [Stage-0 baseline](stage-0-baseline.md) for repository-only evidence and named blockers; authoritative full source, active tenant contracts and owners remain unverified.

## Canonical stages and original-plan crosswalk

The eight stages (0–7) in the [end-to-end plan](end-to-end-plan.md) supersede the original seven-phase sequence. Original numbers are historical references only; use canonical stage numbers in backlog and release evidence.

| Original phase | Canonical stage(s) | Reconciled scope |
| --- | --- | --- |
| 0 Inventory and contract baseline | 0 Baseline and governance | Full-source authority, integrity, active-flow evidence, owners |
| 1 P0 persistence and honesty | 1 Workspace integrity | All writes, errors, queue replay, durable acknowledgement |
| 2 Record page behind a switch | 4 Record-centred office experience | Record, timeline, roles and lifecycle |
| 3 Inbox | 3 Public Document Portal; 4 Record-centred office experience | Intake contracts and provenance before office integration |
| 4 Tasks and Overview | 4 Record-centred office experience; 6 Simplification, reporting and layout | Canonical counts, filters and reporting |
| 5 Estate boundaries and outbound | 2 Outbound correspondence; 5 Central administration | Reply/Mailer and control-plane boundaries |
| 6 Layout, redirects and cutover | 4 Record-centred office experience; 6 Simplification; 7 Release, operate and close | Link parity, safe retirement, release approval and rollback |

Stage numbers identify workstreams, not permission to bypass dependencies. Contract investigation for stages 2/3/5 can run in parallel; final record integration can depend on stage 4. Stage 0 gates releases, stage 1 gates office cutover, and stage 7 gates release/closure.

## Non-negotiable safeguards

- No flow edit, import or tenant release based on historical exports or simulator results. Obtain active version/contract evidence and change-owner authorization first.
- Never mask server rejection as connectivity failure. Establish transient/idempotent retry rules and audit dropped queue items; PR #1 addresses only the documented HTTP-refusal subset.
- Never claim completion, approval, dispatch or immutable closure before durable server acknowledgement, reload and authorized cross-user evidence.
- Preserve records underlying retired Meetings, Projects, Briefs or Registry UI. This plan authorizes no data deletion.
- Do not remove office screens before replacement, authorization, notification/deep-link parity and rollback tests pass.
- Keep credentials, endpoints and destructive engineering controls out of office workflows; enforce privilege on the server.
- Preserve [D-1 through D-7](decision-register.md) as open gates. Planning approval is not product acceptance or release authorization.

## Verification and tracking

The [CSV](decommission-backlog.csv) and [JSON](decommission-backlog.json) carry identical item fields, stages, dependencies, status and evidence. JSON is the board feed. No item is accepted or released. FOL-00 is blocked on source/tenant/owner evidence; FOL-03 remains planned with a tested source-only subset recorded, not full queue remediation.

Existing focused runtime check:

```sh
node --experimental-vm-modules --test /home/runner/work/Folio_Commissioned/Folio_Commissioned/tests/data-client.test.mjs
```

Inspect the authoritative application's scripts before using report-suggested commands such as `npm run test:node`, `npx playwright test` or `tests/server-writes.test.mjs`. This checkout has no complete application build/test pipeline. Do not claim those suites ran. Contract, rejection/replay, server authorization, reload/cross-user, intake/outbound, redirect and viewport evidence remain required for their respective stage gates.
