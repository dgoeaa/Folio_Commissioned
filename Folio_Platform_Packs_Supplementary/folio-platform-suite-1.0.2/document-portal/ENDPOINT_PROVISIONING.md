# Endpoint provisioning — Public document portal

**Build** `77c26e7b4c3addb6` · **posture** demo · **built** 2026-01-01T00:00:00.000Z

This package calls each Power Automate flow **directly**. There is no proxy, broker or
other intermediary in the request path, and none is required to deploy or run it. Every
URL below is delivered to the browser and is readable by anyone who can fetch a static
asset from this deployment, so **each flow must authenticate and authorise its own
callers, validate its own input, and return only what that caller is entitled to see.**
Nothing else in the request path can do it for them.

## What is wired

| Key | Transport | Pilot set | State | Flow |
|---|---|---|---|---|
| `SUBMISSION` | json | yes | not provisioned | — |
| `UPLOAD` | bytes | yes | not provisioned | — |
| `STATUS` | json | — | not provisioned | — |
| `SUPPORT` | json | — | not provisioned | — |
| `VERIFY` | json | — | not provisioned | — |
| `VERIFY_CONFIRM` | json | — | not provisioned | — |
| `WRITEBACK` | json | — | not provisioned | — |

Each wired key names the flow it reached and the reference document that establishes the
mapping in **`FLOW_CATALOGUE.json`**, which also carries **every URL in full, unredacted** —
this table redacts, because it travels.

## Not provisioned — 7

Each of these reports itself unconfigured at runtime rather than failing mid-action:

- `SUBMISSION` — register a submission, mint its reference, issue upload tickets
- `UPLOAD` — redeem one ticket with the bytes of one attachment
- `STATUS` — citizens tracking a submission (reference + email pair)
- `SUPPORT` — public help desk — CASE- references, never enters the registry
- `VERIFY` — mail a one-time code to a submitter
- `VERIFY_CONFIRM` — exchange that code for the proof SUBMISSION accepts
- `WRITEBACK` — D13 / INT-007 — a verified citizen responds, adds a note, or withdraws; only withdraw changes status

## Flows available but not called

The documented estate contains 0 flows with complete trigger
URLs. 0 of them are reached
by no contract key on either platform — GET EMAILS, GET TASKS, BULK OPS GET DOCS and
"get correspondence (flat response)" among them — because the platform routes those reads
through `SUBSIDIARY_ACTIONS` and `FETCH_ALL` rather than calling dedicated flows.

They are **not** omitted. All of them are listed in `FLOW_CATALOGUE.json` with their
complete URLs and the documents that name them, so if a live probe shows a route is not
implemented on the shared flow, repointing a key at the dedicated flow is one line in a
values file and a rebuild.

## Flow routes reached from this package

One URL can carry several routes: the flow switches on `action`, so provisioning a URL
commissions every obligation listed against it. A flow implementing only the first of them
fails at a desk, not at the gate.

- `WRITEBACK` — `respond`, `note`, `withdraw`

## Rotation

Rotation is the only revocation. A signed trigger URL cannot be retired, only regenerated.

1. Regenerate the signature in Power Automate.
2. Rebuild: `npm run package -- --values <file> --posture demo`.
3. Redeploy. The build id changes, which is how this deployment is told apart from the one
   it replaces, and is what invalidates the service-worker cache so a returning visitor stops calling the revoked URL.

## Verify before deploying

```
npm run package:verify -- --verify <this directory>   # bytes match the manifest
npm run verify:endpoints                              # the flows answer, live
npm run commission                                    # readiness obligations
```
