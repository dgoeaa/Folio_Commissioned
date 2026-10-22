# Acceptance sign-off

**Status:** Instrument — **unsigned by design.** This is the form and the criteria, not a
record of an acceptance that happened.
**Document ID** `DOC-9008` · **Written** 15 September 2026
**Carries no commands.** Every criterion names a command; none is run by reading this.

---

## What acceptance means here

Handover transfers responsibility. **Acceptance is the separate statement that what was
transferred does what it was said to do.** They are different decisions and can have different
answers: a system can be handed over and not accepted, which is an honest position and a
common one.

Acceptance is judged against criteria agreed **before** the demonstration, not assembled
afterwards from whatever passed. The criteria below are proposed on that basis. `[ The
accepting party amends this list before any of it is run, and initials the amendment. ]`

---

## 1. Parties and scope

| | |
|---|---|
| **Accepting party** | `[ name, role, organisation ]` |
| **Demonstrated by** | `[ name, role ]` |
| **Date of demonstration** | `[ YYYY-MM-DD ]` |
| **Commit under test** | `[ sha ]` — record it with `git rev-parse HEAD` at the start, not the end |
| **Environment** | `[ local / pilot tenant / production tenant — state which ]` |

**Scope of this acceptance:** `[ state which of the seven platforms is being accepted. They are
independently deployable and may be accepted separately. ]`

## 2. Mechanical criteria — the gates

These are objective and repeatable. Run them on the commit named above, on the accepting
party's own machine where possible.

| # | Criterion | Command | Pass condition | Result |
|---|---|---|---|---|
| M-1 | Every module import resolves | `npm run test:imports` | exit 0 | `[ ]` |
| M-2 | The non-browser gate passes in full | `npm run test:node` | exit 0 | `[ ]` |
| M-3 | Both applications boot and render | `npm run test:smoke` | exit 0 | `[ ]` |
| M-4 | No credential has been committed | `npm run test:secrets` | exit 0 | `[ ]` |
| M-5 | Both packages build and verify | `npm run package` then `npm run package:verify` | both surfaces, manifest verifies | `[ ]` |
| M-6 | Generated documentation is current | included in M-2 (49 `--check` stages) | exit 0 | `[ ]` |
| M-7 | Links and assets resolve | `npm run test:links` | exit 0 | `[ ]` |

**A known exception, recorded rather than hidden.** `npm run test:governanceagentbrief` fails
on any branch other than the one its brief was generated on: the generator embeds
`git rev-parse --abbrev-ref HEAD`. If M-2 fails only on that stage, it is not a defect in the
system under test. `[ Confirm this is the only failing stage before accepting the exception. ]`

## 3. Functional criteria — the principle

The product definition states the test the platform must meet:

> a user can receive or locate a matter from any ingestion source, register it, minute it,
> assign it, track it, review it, dispatch it, close it and archive it without confusion.

Acceptance should demonstrate that end to end, by a person who does the work, not by the
person who built it.

| # | Criterion | Demonstrated by | Result |
|---|---|---|---|
| F-1 | A matter from **scanned intake** reaches registry and can be assigned | `[ ]` | `[ ]` |
| F-2 | A matter from **customer-service email** reaches registry and can be assigned | `[ ]` | `[ ]` |
| F-3 | A matter from the **public portal** reaches intake and is visible internally | `[ ]` | `[ ]` |
| F-4 | A **DGCEO outgoing** item can be dispatched and tracked | `[ ]` | `[ ]` |
| F-5 | A matter can be **minuted, assigned, responded to, closed and archived** | `[ ]` | `[ ]` |
| F-6 | A citizen can **submit, track and get support** on the portal unaided | `[ ]` | `[ ]` |
| F-7 | An administrator can **provision a user and a role** and see it take effect | `[ ]` | `[ ]` |

`[ The accepting party adds, removes or reweights these before the demonstration. ]`

## 4. Criteria this acceptance cannot meet, and why

Stated plainly so that nobody later reads a signature as covering them.

| Not demonstrable | Why |
|---|---|
| That authentication enforces anything | It is provisioned and **inert** (G-04). Caller identity is client-asserted; RBAC is advisory. Acceptance can cover the client's behaviour, not access control |
| That a documented flow is the flow the platform calls | GOV-06. 7 of 25 contract keys resolve to an exported definition, and that join is by display name — evidence, not proof |
| Live notification acceptance, rehearsed rollback, production authorisation | `npm run tenant:validate` reports these as outstanding; they are tenant-side and were never in this repository |
| Performance under real load | No load test exists. `config/performance-budget.config.js` states budgets; nothing measures them against production traffic |

Accepting the system does **not** accept these. If the accepting party needs them, they are
scope for a further phase and should be written down as such before signing.

## 5. Outcome

Choose one. A qualified acceptance is a real outcome and should be used where it is the honest
one.

- `[ ] Accepted` — criteria met; no conditions.
- `[ ] Accepted with conditions` — criteria met except those listed, which are to be closed
  by `[ date ]` and owned by `[ name ]`:
  `[ list ]`
- `[ ] Not accepted` — the criteria not met, and what would change the answer:
  `[ list ]`

| Role | Name | Signature | Date |
|---|---|---|---|
| Accepting party | `[ ]` | `[ ]` | `[ ]` |
| Demonstrated by | `[ ]` | `[ ]` | `[ ]` |

---

Once signed this is a **record** — it states what was true on a date and is not edited later.
A re-test after conditions are closed gets its own sign-off.
