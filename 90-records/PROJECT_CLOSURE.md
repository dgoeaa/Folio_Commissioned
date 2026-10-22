# Project closure report

**Status:** Part record, part instrument. §1–§4 state what is true and verifiable now. §5–§7
are for the closing authority to complete and are **unsigned by design.**
**Document ID** `DOC-9009` · **Written** 15 September 2026
**Carries no commands.** Commands are named so claims can be checked, not so this page runs them.

---

## 1. What was built

Five standalone platforms, an automation estate, and a documentation corpus. The platforms are
independently deployable and do not import from each other — the property, and how to check it,
is [`../architecture/PLATFORM_INDEPENDENCE.md`](../architecture/PLATFORM_INDEPENDENCE.md).

| | Measured |
|---|---|
| Platforms | 5 — two day-to-day, three specialised |
| Package surfaces | 2 (`runtime`, `portal`) in `scripts/package.mjs` |
| Routes in the internal platform | 31 |
| Front-end files | 153 |
| SharePoint lists / fields | 10 / 98 |
| Contract keys | 25 |
| npm scripts | 248, of which 59 carry a `--check` mode |
| Test suites in the node gate | 134 stages |
| Tracked files | 1,942, of which 1,405 are under `docs/` — 72% of the repository is documentation |

Figures come from `docs/visual/platform-data.js` and `docs/reference/process-inventory.json`,
both generated and both drift-tested. `npm run commission` reports the live position and is the
authority where this page and a fresh run disagree.

## 2. What is open

Every row cites where it is tracked. None is closed by this document.

| Item | What | Where it is tracked |
|---|---|---|
| **G-04** | Authentication is provisioned and **inert**. Caller identity is client-asserted; RBAC is advisory. The server half is outstanding | `docs/audits/CAPABILITY_ASSESSMENT_R11.6.md`, `docs/architecture/AUTHENTICATION_CONTRACT.md` |
| **GOV-06** | The exported flow definitions and the tenant register share no identifier. 7 of 25 contract keys resolve, by display name, which the map itself calls evidence rather than proof | `docs/folio-Master-Flows-and-Endpoints/registers/http-flow-registry-spec.json`; held from widening by `tests/flow-definition-coverage.test.mjs` |
| **Tenant-side notification items** | Live acceptance, rehearsed rollback and production authorisation | `npm run tenant:validate` reports them outstanding |
| **OTP topology** | Recorded as contradicted and open | `docs/audits/BRANCH_CONSOLIDATION_AUDIT_2026-09-05.md` §7.2 |
| **Unassessed branches** | 21 of 27 branches were never assessed in the consolidation audit | same document |
| **Two proposals** | The documentation set and the folder structure, neither adopted | `docs/proposals/` |

**G-03 is discharged.** The 43 signatures were rotated and the superseded corpus is retained
deliberately. The repository stays private because git history is not revocable — not because
rotation is outstanding. The capability assessment still shows G-03 open; it is a dated record
and is not edited, so read `README.md` for the current position.

## 3. What was deliberately not done

These are decisions, not omissions, and should not be read as backlog by whoever inherits this.

- **The two design systems were not merged.** Only the 8 shared token files are held identical,
  by `tests/design-tokens.test.mjs`. The five component stylesheets differ by 2, 26, 2, 39 and
  236 lines because the two products differ.
- **The response envelope was not unified.** The two clients read different shapes by design;
  `scripts/verify-response-contract.mjs` verifies each package against its own client.
- **The error taxonomy was not extended to the portal.** That is a product decision for the
  portal's owner.
- **The superseded reference corpus was not deleted** (decision D5). It documents an estate
  that no longer runs and is kept as evidence, with its signatures rotated.
- **Forensic snapshots were not rewritten** to match later reorganisations. Correcting their
  paths would falsify them.
- **The portal flow definitions were not de-duplicated.** Three naming generations exist and the
  only join is a display name; consolidating them on filename evidence could collapse two flows
  or split one. Blocked on GOV-06.

## 4. What this project did not have

Stated because a successor will otherwise assume it existed and look for it.

No load or performance testing against production traffic. No penetration test. No privacy
impact assessment, data-protection notice, records-retention schedule or accessibility
conformance statement — though `core/retention.js` and `core/audit-log.js` implement behaviour
those documents would describe. No user documentation of any kind: no citizen guide, no officer
guide, no administrator guide, no training material. The documentation set proposal
(`docs/proposals/DOCUMENTATION_SET.md`) enumerates these as 43 absent documents against 122
proposed titles.

## 5. Lessons — for the closing authority to complete

`[ Written by the people who did the work, not summarised from the commit log. Three prompts,
not a template to fill for its own sake: ]`

- `[ What took longer than expected, and what would have shortened it? ]`
- `[ What was believed true for a long time and turned out not to be? ]`
- `[ What would you tell a team starting the same system tomorrow? ]`

One is already evidenced and can be recorded as written: **an estate that generates its own
documentation will reproduce an undocumented assumption as a fact.** `CG_` names the Document
Portal, that equivalence was never written down, and `scripts/process-discovery.mjs`
consequently emits a process group whose entries read *"Not evidenced"* for owner and purpose —
describing, as unowned, a platform with a README, a contract of record and a named audience.
A glossary entry would have prevented it; its absence is reproduced on every regeneration.

## 6. Closure conditions

Closure is not the same as completion. `[ State which of these the closing authority requires
before the project is closed, and strike the rest: ]`

- `[ ] Handover certificate signed` — [`HANDOVER_CERTIFICATE.md`](./HANDOVER_CERTIFICATE.md)
- `[ ] Acceptance signed, or signed with conditions` — [`ACCEPTANCE_SIGNOFF.md`](./ACCEPTANCE_SIGNOFF.md)
- `[ ] Every open item in §2 has a named owner outside this project`
- `[ ] The two proposals in docs/proposals/ are adopted, rejected or explicitly deferred`
- `[ ] A decision recorded on whether this repository stays private`

## 7. Authority

| Role | Name | Signature | Date |
|---|---|---|---|
| Project owner | `[ ]` | `[ ]` | `[ ]` |
| Sponsor | `[ ]` | `[ ]` | `[ ]` |

---

Once signed this is a **record.** It states a position at a date and is never edited to agree
with a later one. If the position changes, that is a new document, and this one stays as
written.
