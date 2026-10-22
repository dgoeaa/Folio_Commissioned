# Folio owner decision register

Status: **D-1 through D-7 remain open; no owner sign-off recorded.** Approval of planning/execution authorizes this control pack, not irreversible decommissioning or an answer to each product choice. Record owner, date, rationale and affected releases before dependent cutover.

| ID | Choice | Proposed direction from ESSENTIALS_MAP.md | Status / gate |
| --- | --- | --- | --- |
| D-1 | Record-centred Inbox / Tasks / Overview / Record target | Adopt, with runtime integrity fixed first | Open (proposed); confirm before irreversible cutover |
| D-2 | Physical file custody | Record panel plus Inbox Physical files filter; preserve separate custody data | Open; gates Registry UI retirement |
| D-3 | Meetings / Projects / Briefs | Remove from office navigation unless these are correspondence record types; keep server data | Open; gates retirement and retention design |
| D-4 | Workspace Reply versus Mailer | Record-linked reply in Workspace; mass mail in Mailer | Open; gates outbound consolidation |
| D-5 | AI chat assistant | Remove standalone chat; retain support request in Help | Open; gates Assistant retirement |
| D-6 | GTQ and M1-M10 reports | Obtain plain-language measure definitions or remove undefined options | Open; gates report UX changes |
| D-7 | Workspace Endpoints versus Estate Console | Estate Console owns endpoint tooling; remove redundant Workspace entry | Open; gates admin UI retirement |

Source proposals: [ESSENTIALS_MAP](../ESSENTIALS_MAP.md). Decision entry template (append only on explicit approval): `ID | chosen option | owner | date | rationale | migrations/retention | evidence | release gate satisfied`.

Additional release gates are not product decisions: establish authoritative full source, resolve the six manifest gaps, confirm active flow contracts and deployment/change ownership, and prove authorized durable writes. See [Stage-0 blockers](stage-0-baseline.md#blockers-and-needed-evidence) and the [canonical stages](end-to-end-plan.md). Historical exports/simulator results do not establish current tenant state. PR #1's source-tested overlay closes none of D-1–D-7 and provides no tenant release authorization.
