# Termux validation and continuation handover

## Purpose

This record preserves the repository work completed on Android Termux, distinguishes passed checks from blocked or unexecuted checks, and defines the remaining commissioning actions without exposing endpoint URLs or signatures.

## Repository baseline

- Branch: `claude/system-remediation-gaps-ahpmsy`
- Required historical fix: `257cbc3`, confirmed as an ancestor of the active branch
- Pulled repository checkpoint before local regeneration: `a93e233`
- Validated generated-artifact commit: `585bb77 Regenerate commissioning surface and scheduled sweep`
- Android-storage comparison: suspended; the repository is the active source of truth

## Completed and evidenced

- The branch was fast-forwarded from `dfff4b0` to `a93e233`.
- The working tree was clean before repository validation.
- `npm run wire -- --dry` stopped safely because no endpoint values source was supplied. It did not write blank configuration.
- `npm run surface` regenerated `docs/deployment/COMMISSIONING_SURFACE.md`.
- `npm run sweep` regenerated `docs/folio-Master-Flows-and-Endpoints/surfaces/internal/import-package/DGO_SCHEDULED_SWEEP.zip`.
- `npm run test:surface` returned exit status `0`.
- `npm run test:sweep` returned exit status `0`.
- `git diff --check` produced no output.
- The generated changes were committed as `585bb77`.
- The working tree was clean after that commit.

## Test posture

| Validation area | Status | Evidence or limitation |
|---|---|---|
| Repository update | Passed | Fast-forward pull completed |
| Required fix `257cbc3` | Passed | Ancestor check succeeded |
| Node test chain | Passed in the recorded full test run | Execution progressed to `test:smoke` |
| Commissioning surface | Passed | `npm run test:surface`, exit `0` |
| Scheduled sweep | Passed | `npm run test:sweep`, exit `0` |
| Git diff integrity | Passed | `git diff --check` produced no output |
| Browser smoke tests | Blocked, not run | Playwright stopped during initialisation with `Unsupported platform: android` |
| Endpoint wiring | Not run | No endpoint values source was supplied |
| Live runtime acceptance | Not run | Requires wired values and live environment |

## Playwright environment blocker

The repository defines `test:smoke` as `playwright test`. On Termux with Node.js `v24.17.0`, Playwright stopped during module initialisation with:

```text
Error: Unsupported platform: android
```

No browser test assertion ran. This must be recorded as **blocked/not run**, not as an application smoke-test failure. Do not patch `node_modules/playwright-core/lib/coreBundle.js` to conceal the platform check.

## Endpoint and runtime work still outstanding

1. Run browser smoke validation in the repository's supported CI, Codespace, or desktop environment.
2. Validate the complete values file with:

   ```bash
   npm run check:values -- ~/dgo-values.txt
   ```

3. Only after values validation succeeds, wire explicitly from the file and verify endpoints:

   ```bash
   npm run wire -- --values ~/dgo-values.txt
   npm run verify:endpoints
   ```

4. Retest `FETCH_ALL` with the client correction from `257cbc3`, which gives the endpoint its intended 90-second budget.
5. If `FETCH_ACTIVITIES` and `GET_DOCS` still return `403`, regenerate the shared trigger URL and update both keys without printing the URL or signature.
6. If `DYNAMIC_ACTIONS` still returns `502`, inspect the corresponding Power Automate run and repair the first failed server-side action.
7. Perform final full-platform runtime acceptance after endpoint wiring and server-side remediation.

## Resolved since, with the session transcript as the evidence

The transcript of 2026-09-19 14:17:42+01:00 records two `npm test` runs. Both are worth reading,
because they say different things and only the second was carried into this document.

**The first failed at `test:sweep`** — `❌ DGO_SCHEDULED_SWEEP artifacts are stale — run: npm run
sweep` — on a package whose content had not changed by one character. `npm run sweep` was then run
and committed as `585bb77`, which cleared it here and broke it everywhere else. The cause is that
the check compared the zip byte for byte: the container is deterministic, but DEFLATE at level 9
differs between zlib versions, so each host reported the other host's zip as stale. The check now
compares entries — same names, same bytes once decompressed — and is mutation-tested, so a real
change still fails it. Nothing about the package needed to change.

The determinism check run in the same session (`npm run surface`, `npm run sweep`, twice, then
`cmp` on the two diffs → *"OK: generated artifacts are deterministic"*) was sound and could not
have caught this: it proves determinism on ONE host, and the defect is variance BETWEEN hosts.

**The second reached `test:wiring-path` — 17/17, the last of the 142 Node steps — and failed only
at `test:smoke`** with `Error: Unsupported platform: android`. That is the evidence behind the
"Node test chain passed" row above, and it holds.

`npm run test:surface` passed here and failed elsewhere for a related reason: the generator listed
a cited path only when the file was on disk, so a wired host emitted a row an unwired host did not.
The two deploy-time configs are now listed either way. (That row is also the evidence that
`config/config.local.js` existed on this device: `npm run surface` added it, taking the active
count from 80 to 81.)

Both defects were in the checks, not in the package or the platform. Both are fixed; `npm run
test:node` is 142 of 142 and the browser suite is 184 of 184 on a Playwright-capable host.

## Security and evidence handling

- Do not print clipboard contents, signed trigger URLs, or endpoint signatures in the recorded terminal session.
- Do not commit `config.local.js`, `dgo-values.txt`, `.env` files, or any live credential.
- Preserve the Termux session transcript as the raw execution record, subject to the organisation's retention and access-control requirements.
- The detailed Word report generated during the session is an external handover artefact and is not committed by this change.

## Continuation commands in a Playwright-supported environment

```bash
git switch claude/system-remediation-gaps-ahpmsy
git pull --ff-only origin claude/system-remediation-gaps-ahpmsy
npm ci
npm run test:smoke
npm test
```

Record the commit hash and command exit statuses. Do not mark commissioning complete until browser smoke validation, endpoint wiring, endpoint verification, and live runtime acceptance have all completed successfully.
