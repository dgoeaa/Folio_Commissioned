# Handover certificate

**Status:** Instrument — **unsigned and incomplete by design.** This is the form, not a record
of a handover that happened.
**Document ID** `DOC-9007` · **Written** 15 September 2026
**Carries no commands.** Every check below names a command; none is run by reading this.

---

## What this is, and what it is not

A handover certificate states, on one page, **what was handed over, to whom, in what
condition, and what the receiving party is now responsible for.** Signed, it is the moment
responsibility transfers.

This copy is **unsigned**. Every field marked `[ … ]` is a fact this repository does not
contain — a receiving party, a date, a name. They are left blank rather than filled with a
plausible guess, because a certificate with an invented signatory is worse than no
certificate: it looks like evidence.

**Do not sign this document until §4 is true and §5 has been read aloud to the receiving
party.** A handover of a system whose open items the receiver has not seen is a handover of a
surprise.

---

## 1. Parties

| | |
|---|---|
| **Handing over** | `[ name, role, organisation ]` |
| **Receiving** | `[ name, role, organisation ]` |
| **Date of handover** | `[ YYYY-MM-DD ]` |
| **Repository at handover** | `dgoeaa/ECM_DOCS_DEV`, commit `[ sha ]`, branch `[ branch ]` |

## 2. What is handed over

Five standalone platforms, an automation estate, and the documentation of both. Each platform
is independently deployable — see
[`../architecture/PLATFORM_INDEPENDENCE.md`](../architecture/PLATFORM_INDEPENDENCE.md), which
the receiving party should read before changing anything.

| # | Platform | Class | Handed over as | Confirmed |
|---|---|---|---|---|
| 1 | Internal platform (DGO runtime) | Day-to-day | Source + built package | `[ ]` |
| 2 | Document portal | Day-to-day | Source + built package | `[ ]` |
| 3 | Flow capsule | Specialised | Source + installer | `[ ]` |
| 4 | Admin console | Specialised | Generated artefact + generator | `[ ]` |
| 5 | Flow workbench | Specialised | Source | `[ ]` |
| 6 | Automation estate | — | Flow definitions, paste packages, SharePoint specification, notification templates | `[ ]` |
| 7 | Documentation | — | `docs/`, and the two proposals in `docs/proposals/` awaiting a decision | `[ ]` |

**Not handed over, because this repository never held them:** the Power Platform tenant, the
SharePoint site, the identity provider, and any live credential. Those transfer separately and
are not evidenced here.

## 3. Credentials and access

| | |
|---|---|
| Live trigger URLs in this repository | **None.** `npm run test:secrets` is the standing check |
| Rotation position | 43 signatures rotated; the superseded corpus is retained deliberately under decision D5 |
| Git history | **Not sanitised.** Every pre-rotation signature remains in history and is not revocable by deletion |
| Repository visibility at handover | `[ private / other — state it ]` |

The receiving party is asked to confirm they understand that **making this repository public
requires a history rewrite**, not a file deletion. See [`../../SECURITY.md`](../../SECURITY.md).

## 4. Condition at handover — the evidence hooks

Each row is a command the receiving party can run themselves. Record the result; do not
transcribe a result from elsewhere.

| Check | Command | Expected | Result | Date |
|---|---|---|---|---|
| Module graph resolves | `npm run test:imports` | exit 0 | `[ ]` | `[ ]` |
| Full non-browser gate | `npm run test:node` | exit 0 | `[ ]` | `[ ]` |
| Browser smoke suite | `npm run test:smoke` | exit 0 | `[ ]` | `[ ]` |
| No new committed credential | `npm run test:secrets` | exit 0 | `[ ]` | `[ ]` |
| Both packages build | `npm run package` | two surfaces emitted | `[ ]` | `[ ]` |
| Readiness position | `npm run commission` | **reports**; does not assert | `[ ]` | `[ ]` |
| Link and asset crawl | `npm run test:links` | exit 0 | `[ ]` | `[ ]` |

`npm run commission` is the live authority on readiness. Where this document and a fresh
`commission` run describe different positions, run it again and record what it says — it is
regenerated, this page is written.

## 5. What the receiving party is taking on

**This must be read before signing, not after.** The system is not finished, and the
certificate does not pretend otherwise. `[ Confirm the open-items register in`
[`PROJECT_CLOSURE.md`](./PROJECT_CLOSURE.md) `has been walked through, item by item. ]`

The two items that change what the receiver can safely do on day one:

1. **Authentication is provisioned and inert (G-04).** Caller identity is client-asserted and
   RBAC is advisory. Every flow must authenticate and authorise its own callers. Activating
   auth is a configuration event with server-side obligations, specified in
   [`../architecture/AUTHENTICATION_CONTRACT.md`](../architecture/AUTHENTICATION_CONTRACT.md).
2. **The flow corpus cannot be joined to the tenant register by identifier (GOV-06).** 7 of 25
   contract keys resolve to an exported definition; the join is by display name and is
   evidence, not proof. Do not assume a file in `docs/folio-Master-Flows-and-Endpoints/contracts/deployed/` is
   the flow a platform calls.

## 6. Signatures

Signing asserts that §4 was run by the signatory, that §5 was read, and that the items in
§2 were received.

| Role | Name | Signature | Date |
|---|---|---|---|
| Handing over | `[ ]` | `[ ]` | `[ ]` |
| Receiving | `[ ]` | `[ ]` | `[ ]` |
| Witness / sponsor | `[ ]` | `[ ]` | `[ ]` |

---

Once signed, this becomes a **record**: it states what was true on a date and is never edited
to agree with a later position. A subsequent handover gets a new certificate, and this one
stays as written.
