# Endpoint run evidence — captured 2026-09-15, placed 2026-09-16

**Status: a record.** Read these files; never edit them to agree with a later state. They are what
five flows did on the dates stamped inside them.

## What is here

| File | What it establishes |
|---|---|
| `Portal_Verify_Confirm__…CU08__flow_run_record.json` | A live portal run, HTTP 200, 0 failed actions, 3,037 ms |
| `IP_Create_Task__…CU09__flow_run_record.json` | A live internal-platform **write**, HTTP 200, 0 failed actions, 12,448 ms |
| `Fetch_References_And_Lookups__…CU00__flow_run_record.json` | A live read, 2026-09-15, HTTP 200, 5,555 ms |
| `Fetch_References_And_Lookups__…CU18__flow_run_record.json` | The same flow a week earlier, 2026-09-09, HTTP 200, 12,966 ms |
| `flow-extraction-report__2026-09-07__credentials-removed.json` | A retrieval run that reports all 51 register workflows missing — **and is wrong**, see below |
| `Portal_Flow_Telemetry__2026-09-16__evidence-sample.json` | 15 of 100 telemetry rows, purposively sampled |
| `GOV-04-Audit-HTTP-Flow-Registry__…CU06__execution_report.json` | The registry audit flow, **Failed**, thresholds unconfigured |
| `GOV-06-Registry-Exception-Notification__…CU09__execution_report.json` | The exception notifier, Succeeded, 0 exceptions retrieved |
| `GOV-08-Discover-And-Register-HTTP-Consumers__…CU07__execution_report.json` | The consumer discovery flow, Succeeded, 0 rows retrieved |

Each run record carries the trigger definition, the request, the response and the outcome, in the
same shape as the records in `../2026-08-27-endpoint-runs/`.

## What was changed on the way in, and why

The delivered files were named `__sanitized`. They were not. The sanitizer replaced
`request.queries_redacted.sig` with `***REDACTED***` but left the signature intact where it appears
inside a URL string elsewhere in the same document — **four raw 43-character Power Automate
signatures across four files.** A signature is a bearer credential: possession alone authorises
invocation. Each was replaced here with `sig=***REDACTED***`, matching the existing convention.

Nothing else was altered. No field was removed, no value rewritten.

**Two of those four signatures were not previously known to this repository.** They belong to
workflows `cc655f80…` (`Portal_Verify_Confirm`) and `b25b5b71…` (a governance flow). Stripping them
here revokes nothing — only re-issuing the trigger in Power Automate does. Whether those two are
still live is a tenant question, not a repository one.

## The extraction report is misleading, and is kept because it is

`flow-extraction-report__2026-09-07__credentials-removed.json` states `flows_found: 0`,
`flows_not_found: 51`, `retrieval_errors: 51`, every one of them
`"The flow could not be retrieved with the configured Power Automate Management connection"`,
status `NotFoundOrUnauthorized`.

Read at face value that says the whole registry is dead. It is not:

- **Two of the 51 workflow ids it reports as not found have successful runs in this very directory.**
- The report ran with its credentials stripped — `registry_redistribution_status:
  "shareable_credentials_removed"`, with 45 entries `available_credentials_removed` and 6
  `endpoint_not_shared`.

So the 51/51 failure is an artefact of how the harvest was run, not a fact about the flows. It is
kept here, unedited, because a report that would mislead is worth having on the record next to the
evidence that corrects it.

## The telemetry sample is purposive, not representative

Its own metadata says so: 15 of 100 rows, *"Purposive stratified evidence sample"*, chosen to cover
*"recorded success and failure; empty diagnostics; false-success evidence; invalid duration;
duplicate run pair; authorization failures; longest scheduled-sweep run."*

**Do not read its failure rate as the estate's failure rate.** It was built to show defects. Three
it shows:

- **Row 9** — `CG_Verification_Endpoint`, `Outcome: Succeeded`, carrying
  `"stage":"task-creation","status":"failed","message":"Task creation scope failed or timed out."`
  A success reported over a failure.
- **Row 24** — `DurationMs` of `63923742318319`, about 2,026 years. Its own timestamps say the run
  took **9 seconds** (03:05:09 → 03:05:18). The field is measured from year zero, not from
  `StartedAtUtc`.
- **Rows 27 and 28** — identical `DurationMs` to the millisecond. One run recorded twice.

## The governance flows run over lists that do not exist yet

Three specified governance flows executed on 2026-09-15, and their reports are here.

- **04 Audit HTTP Flow Registry — Failed.** `staleAfterDays`, `consecutiveFailureThreshold` and
  `openAuditExceptionsChecked` are all `null`. Its thresholds were never configured.
- **06 Registry Exception Notification — Succeeded**, `openExceptionsRetrieved: 0`.
- **08 Discover and Register HTTP Consumers — Succeeded**, `executionRowsRetrieved: 0`.

`GOV-01` already records that the registry lists remain unprovisioned. This is what that looks like
from the tenant: the flow layer is deployed and running above a data layer that is not there.

**06 will report `Succeeded` for as long as the list is missing**, because a monitoring flow that
reads a list which does not exist finds nothing to report, and finding nothing is its success
condition. That is a green light wired to an absence.

None of the three flow ids — `3e9e1342…`, `87a74d7e…`, `f5e7679f…` — appears anywhere in
`docs/reference/governance-estate-position.json`. The estate has been tracking these flows by name,
not by identity.
