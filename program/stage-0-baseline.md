# Stage-0 repository baseline

As of 2026-10-22. **Stage 0 remains blocked, not passed.** Read-only ZIP inspection establishes packaged evidence, not authoritative full-source ownership or tenant deployment knowledge. No endpoints were called, flows imported, mail sent, data removed or UI decommissioned.

### Owner-confirmed review update

The owner has confirmed private workflow approval, containment, and that the disclosed
signatures are stale and already rotated. These are **owner-confirmed**, not independently
tenant-verified; no further tenant calls or private evidence collection are required for
this repository review. Historical exposure records below are not current live-secret
findings. The owner is the sole administrator, user and developer; separate role assignments
are not required. These confirmations do not supply the missing application source or
release inputs and do not close the remaining Stage-0 gates.

### Uploaded-source reconciliation

The current branch includes uploaded source commit `462a6c8` while preserving the earlier
repository fixes. The unpacked suite is at
[`Folio_Platform_Packs_Supplementary/folio-platform-suite-1.0.2/`](../Folio_Platform_Packs_Supplementary/folio-platform-suite-1.0.2/README.md).
Workspace, Portal, Mailer and administration entry points are present there.

- All 14 Mailer ZIPs were recovered byte-for-byte from the previously committed
  supplementary archive. All 70 expanded members match those ZIPs; both forms are
  retained and indexed in the reconciled manifest.
- Four version files were recovered with their original manifest hashes. The POSIX
  `folio` wrapper was reconstructed to call the existing Node launcher; it is not
  claimed to match the missing original wrapper.
- The PR #1 transport overlay is integrated into this suite. Its runtime and suite
  integrity records are regenerated from the reconciled files, with provenance in
  `RELEASE_MANIFEST.json`. The other uploaded Workspace package is unchanged.
- The original `runtime/LICENSE` could not be recovered from the available uploads.
  Its original manifest entry remains: verification must still fail for that missing
  file. This is not a fully verified distributable release, and no licensing terms
  are inferred from repository ownership.

The archive results below describe the earlier packaged baseline, not a fresh failure
to locate the now-uploaded source. Tenant and release acceptance remain outside this
repository-only reconciliation.

Checks run on the reconciled source:

| Existing check | Result |
| --- | --- |
| Root control-pack and transport tests | 4 + 37 passed; integrated suite transport is byte-identical to the tested overlay |
| Capsule tests | 12 passed |
| Administration Centre tests | 53 passed, 7 failed; the same seven failures reproduce on uploaded commit `462a6c8` before reconciliation (catalogue/register and hosted-resource expectations) |
| Suite release verifier | 514 indexed entries; only `runtime/LICENSE` missing; no altered or unlisted entries |
| Launcher registry and POSIX launcher help | Passed; all eight declared entry-point files exist; no services or tenant calls started |

The seven inherited administration failures are not waived or represented as passes.
These checks do not establish full browser acceptance or a working deployed tenant.

## Historical provenance and source candidates

Archive paths below are relative to `/home/runner/work/Folio_Commissioned/Folio_Commissioned/`. Hashes and entry counts were rechecked against the unchanged [PR #1 inventory](../runtime-remediation-inventory.json).

| Archive | SHA-256 | Entries | Evidence role |
| --- | --- | --- | --- |
| `Folio_Platforms_Pack.zip` | `25437266c500ff09200c64a5aed32288858964a2910795c3ff9366152074f0aa` | 412 | Workspace/Portal upload trees, administrator toolkit, Rationalisation overlay |
| `Folio_Platform_Packs_Supplementary.zip` | `c183a853a056048a858f646b89ee7f673e54e2a6e912116e643d2cac227ea0ff` | 447 | Multi-app demo suite plus Rationalisation overlay |
| `NITDA-Folio-Handover-Pack-v2026.10.20-1-c6e49d73.zip` | `4c5a7f41b269a70709388dcd064b9ff61de1e773394a3b2c3d694aeacd854b6c` | 63 | Historical commissioning and flow exports; not active-flow proof |

The supplementary root `folio-platform-suite-1.0.2/` is a **candidate packaged baseline**, not an owner-approved authoritative source tree. Its `RELEASE_MANIFEST.json` declares eight platforms: Workspace (`runtime/`), Portal (`document-portal/`), Estate Console (`tools/admin-console.html`), Mailer (`mailer/`), Workbench (`tools/flow-workbench/`), Vault (`tools/flow-capsule/`), Central Administration Centre (`tools/admin-centre/`), Hub (`tools/hub/`). Entry points and local launch commands are recorded in that manifest; declaration is not proof that each application starts or is deployed.

The platforms pack instead has `FOLIO-WORKSPACE-v2026.10.21-2-upload-to-site-root/`, `FOLIO-PORTAL-v2026.10.21-2-upload-to-site-root/` and `NITDA-Folio-Administrator-Toolkit-v2026.10.21-2-31e80475/`. Workspace `BUILD-ID.json` declares version `2026.10.21-2`, source commit `31e804758d7244d3178571b3ee6d014ba2dba98f`. The suite declares version `1.0.2`; its runtime manifest declares build ID `f4e797added9eea9`. These schemes do not establish a common authoritative build or deployed version.

### Conflicts and limits

- Comparing relative Workspace file paths gives **211 common files, all byte-identical**. Suite-only: `DEPLOY.md`, `ENDPOINT-CHECK-STANDALONE.html`, `ENDPOINT-CHECK.html`, `ENDPOINT_PROVISIONING.md`, `FLOW_CATALOGUE.json`, `PACKAGE_MANIFEST.json`, `config/config.local.js`. Platforms-only: `BUILD-ID.json`, `mailer.html`. Packaging differs even though common source matches; no whole-estate equivalence is claimed.
- Archived `core/data-client.js` SHA-256 is `de00366c2f95c307529f3116f7d07502584fceec1e2a141e5f1b75925e3e72ad` in both. [PR #1](https://github.com/dgoeaa/Folio_Commissioned/pull/1) deliberately changes that module in the [repository overlay](../runtime/core/data-client.js); archived digests do not cover the fix.
- `Rationalisation_pack/package.json` in both packs names a broad source/test/build toolchain, but the pack does not supply that complete tree. It is not a replacement build pipeline. The repository itself contains a single runtime module and isolated tests, not the full application's imports.
- Administrator toolkit versus suite control-plane tools, and Portal package equivalence, still need app-by-app ownership and build reconciliation. No automatic selection, combined source import or history merge is justified by these comparisons.

## Release integrity and posture

Suite `RELEASE_MANIFEST.json` lists **444 files**. Direct ZIP checks find six absent paths; all 438 present entries match both recorded byte counts and SHA-256:

```text
VERSION
folio
mailer/VERSION
mailer/web/VERSION
runtime/LICENSE
tools/flow-capsule/VERSION
```

This independently corroborates the inventory's recorded pre-overlay `scripts/verify-release.mjs` failure. The packaged verifier was inspected, not rerun in this slice; direct ZIP checks are not a claim of executing its full unlisted-file/signature checks. Do not fabricate empty files or edit hashes to produce green output. Recover the intended inputs/licensing and rebuild through the owner's release pipeline, or obtain an explicit approved exclusion with reproducible packaging evidence.

`runtime/PACKAGE_MANIFEST.json` declares `posture: "demo"`, `endpointCount: 19`, `provisionedCount: 0`; all 19 endpoint entries have `provisioned: false`. The suite manifest also says no endpoint is wired. These are **package declarations**, not an observation of any running tenant. The six gaps, unapplied overlay integration and unverified tenant contracts prevent release-readiness claims.

## Flow evidence, not active-flow evidence

Within the handover root `NITDA-Folio-Handover-Pack-v2026.10.20-1-c6e49d73/`:

- `03 Power Automate Flows/3.3 Flow Packages/1 Folio Workspace/DYNAMIC_ACTIONS__IP_Dynamic_Global_Actions_Endpoint__31c0aaf0.paste.json` has `/serializedValue/actions/Scope_Global_Dynamic/actions`. `Compose_Dynamic_Input` reads operation and other fields directly under `payload` with root fallbacks, not `payload.data`. `Compose_Dynamic_Gate` / `Switch_Dynamic_Gate` include unknown, unauthenticated, not-implemented, forbidden, invalid and replay cases. Result Compose nodes include 400/401/403 and 501 for recognized-but-unserved operations. This is a contract investigation lead, not proof of compatibility or active server writes.
- `03 Power Automate Flows/3.3 Flow Packages/2 Document Portal/` contains submission, upload, status, verification, verification-confirmation, writeback and support exports.
- `03 Power Automate Flows/3.3 Flow Packages/4 Correspondence Mailer/` contains seven `DGO_MAIL_*.zip` packages. Each is byte-identical to its supplementary-suite copies under `mailer/flows/packages/` and `mailer/web/flows/packages/`: AUTH, DATA, DIRECTORY, LOG, PROVISION, SEND, TEMPLATES. Matching exports do not prove which versions are installed, enabled or invoked.

The suite also includes `docs/folio-Master-Flows-and-Endpoints/audits/flow-usage-analysis-2026-09-26.json`, a generated historical analysis (`dgo-flow-usage-analysis/v1`), not a tenant observation. The older rationalisation's 14/15 rejection result is historical simulation, not a new test result. No repository artifact establishes current active-flow IDs/hashes, connections, caller permissions, persistence or release approval.

## Blockers and needed evidence

The owner covers the roles below; no additional approvers are required. The remaining
source, release and acceptance gaps are unchanged. Tenant behavior not established by
the repository remains unverified; it will not be probed as part of this review.

| ID | Blocker | Evidence needed / role to assign |
| --- | --- | --- |
| B-01 | Authoritative full source and build chain unknown | Technical/release owner selects commit/tree per app; supplies complete build inputs, tests, licenses and reproducible artifact mapping; integrates PR #1 and regenerates integrity manifests. |
| B-02 | Six release-manifest paths missing | Release owner supplies intended contents or approved exclusions through reproducible rebuild; verifier output and reviewed new manifest. Not resolved by this baseline. |
| B-03 | Active flow and runtime contracts unknown | Tenant/change owner provides approved redacted export/version/hash ledger, enabled routes, connection/environment mapping and supported operation/envelope/error/idempotency contracts matched to the selected client. Include Portal/Mailer and clarify separate gateway authority. No signed URLs or credentials. |
| B-04 | Server roles, durable writes and safe release unverified | Security/data/tenant owners provide approved sandbox authorization and reload/cross-user persistence evidence for each mutation; queue replay/business-error and outbound receipt tests with synthetic recipients; approved deployment/rollback evidence before release. No such tests are authorized by this PR. |
| B-05 | Governance and acceptance missing | Assign technical/product/security/change/operations and app owners; record D-1–D-7 decisions, scope exclusions, observation thresholds and explicit release/acceptance approvals. Planning approval is not sign-off. |

## Reproduce without extraction or tenant access

Python standard library only. This reads ZIP bytes/JSON; it does not execute archived applications or provision anything. The recursive audit rejects absolute/drive/traversal paths and symlinks, including nested ZIPs, before inspecting content. Do not extract or publish credential-bearing configuration.

```sh
python3 - <<'PY'
from pathlib import Path, PurePosixPath
from zipfile import ZipFile
from io import BytesIO
from hashlib import sha256
import json, stat

root = Path('/home/runner/work/Folio_Commissioned/Folio_Commissioned')
inventory = json.loads((root / 'runtime-remediation-inventory.json').read_text())
def audit(z):
    for i in z.infolist():
        n = i.filename.replace('\\', '/')
        p = PurePosixPath(n)
        assert not (p.is_absolute() or '..' in p.parts or n[1:2] == ':'
                    or stat.S_ISLNK(i.external_attr >> 16)), n
        if n.lower().endswith('.zip'):
            with ZipFile(BytesIO(z.read(i))) as child:
                audit(child)

for a in inventory['archives']:
    p = root / Path(a['path']).name
    assert sha256(p.read_bytes()).hexdigest() == a['sha256']
    with ZipFile(p) as z:
        audit(z)
        assert len(z.infolist()) == a['entries']
    print(p.name, 'hash/count/path audit PASS')

with ZipFile(root / 'Folio_Platform_Packs_Supplementary.zip') as s, \
     ZipFile(root / 'Folio_Platforms_Pack.zip') as p, \
     ZipFile(root / 'NITDA-Folio-Handover-Pack-v2026.10.20-1-c6e49d73.zip') as h:
    base = 'folio-platform-suite-1.0.2/'
    m = json.loads(s.read(base + 'RELEASE_MANIFEST.json'))
    missing, altered = [], []
    for f in m['files']:
        if base + f['path'] not in s.namelist():
            missing.append(f['path'])
            continue
        b = s.read(base + f['path'])
        if len(b) != f['bytes'] or sha256(b).hexdigest() != f['sha256']:
            altered.append(f['path'])
    print('manifest entries:', len(m['files']), 'missing:', missing, 'altered:', altered)
    pkg = json.loads(s.read(base + 'runtime/PACKAGE_MANIFEST.json'))
    print('posture/counts:', pkg['posture'], pkg['provisionedCount'], pkg['endpointCount'])
    assert sum(bool(e['provisioned']) for e in pkg['endpoints']) == 0
    a, b = base + 'runtime/', 'FOLIO-WORKSPACE-v2026.10.21-2-upload-to-site-root/'
    sa = {n[len(a):] for n in s.namelist() if n.startswith(a) and not n.endswith('/')}
    pb = {n[len(b):] for n in p.namelist() if n.startswith(b) and not n.endswith('/')}
    print('Workspace common:', len(sa & pb),
          'altered:', sorted(n for n in sa & pb if s.read(a+n) != p.read(b+n)))
    print('suite-only:', sorted(sa-pb), 'platforms-only:', sorted(pb-sa))
    for n in s.namelist():
        if n.startswith(base + 'mailer/flows/packages/') and n.endswith('.zip'):
            hn = next(x for x in h.namelist()
                      if '/4 Correspondence Mailer/' in x and x.endswith('/'+n.split('/')[-1]))
            assert s.read(n) == h.read(hn) == s.read(n.replace('/mailer/flows/', '/mailer/web/flows/'))
            print(n.split('/')[-1], 'three packaged copies match')
PY
```

## Checks actually run in this slice

| Check | Result |
| --- | --- |
| Exact Python reproduction block above | PASS; hashes/counts/path audit match; 444 entries, six missing, zero altered; demo 0/19; 211 common files identical; seven Mailer packages match |
| `node --test /home/runner/work/Folio_Commissioned/Folio_Commissioned/tests/control-pack.test.mjs` | 4 passed, 0 failed: JSON parsing and all 15 CSV/JSON rows field-for-field; IDs/stages/dependencies; open gates; local Markdown targets/anchors |
| `node --experimental-vm-modules --test /home/runner/work/Folio_Commissioned/Folio_Commissioned/tests/data-client.test.mjs` | 37 passed, 0 failed; isolated synthetic HTTP tests, not tenant calls |
| Git diff of PR #1 runtime module, original tests and inventory against merged `main` (`248d5cf`) | Empty; all three preserved |
| `git diff --check` | PASS |

No new dependencies or build/lint tools were introduced. No incomplete archived full-suite toolchain, full application build, browser acceptance or tenant verification ran. Backlog FOL-00 remains blocked and FOL-03 records only partial source evidence.
