# Out-of-band artefacts

Scripts and packages that were **run against the tenant without passing through this repository**.

They are held here for one reason: a change that reached the tenant is estate state whether or not
the repository authorised it, and state that is not written down cannot be reconciled, verified, or
undone. Nothing in this directory is generated, checked, executed, or referenced by the
commissioning path. It is evidence.

| File | Reported executed | Finding |
|---|---|---|
| `NITDA_Flow_Truth_SharePoint_Provisioning_BROWSER_CONSOLE1.js` | 2026-09-10 | GOV-11 |
| `NITDA_Flow_Truth_SharePoint_Provisioning_RESUME_FIX.js` | 2026-09-10 | GOV-11 |

Both are held **verbatim as delivered**. Do not edit them, do not "fix" them, and do not run them.
`scripts/build-flow-truth-verifier.mjs` reads the first of them to derive what to look for on the
tenant, so an edit here silently changes what the verifier checks.

## Why they are not simply deleted

The repository's position on these three resources is recorded in
`docs/folio-Master-Flows-and-Endpoints/reference/governance-estate-position.json` under **GOV-11**, and the read-only script that
establishes what actually reached the tenant is `scripts/verify-flow-truth-provisioning.browser.js`.
Neither is meaningful without the source they are measured against.

Deleting a script does not un-provision a list. The same point holds one level up: the estate's
standing rule is that removing an artefact revokes nothing — only changing the thing it touched
does.
