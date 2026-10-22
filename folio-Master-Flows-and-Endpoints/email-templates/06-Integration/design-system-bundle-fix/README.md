# Design-system bundle fix (2026-10-21)

Removes the console error `Cannot set properties of null (setting 'innerHTML')` at `_ds_bundle.js:5327`. The error appeared on every page that loads the NITDA design-system bundle and has no `#quickPicks` element.

**Cause.** The shared bundle compiled every script in the design-system project, including the citizen portal's page scripts. `document-portal/js/track.js` sets `PF.page`, and `core.js` runs `PF.page()` on load. The Track page code then wrote into `#quickPicks`, which exists only on `track.html`.

## Fix 1 — the Track page code runs only on the Track page

File: `document-portal/js/track.js` (full patched source in this folder). Two lines are added at the top of `PF.page`:

```js
PF.page = function () {
  var out = PF.$('#trackOut');
  var form = PF.$('#lookup');
  /* Run only on the Track page: these elements exist nowhere else. */
  if (!out || !form || !PF.$('#quickPicks')) return;
```

Nothing else changes. `track.html` behaves exactly as before.

## Fix 2 — the shared bundle contains only the ten components

File: `_ds_bundle.js` (in this folder; 15.2 KB, down from 395 KB).

- Kept: `components/Alert`, `Button`, `Card`, `EmptyState`, `Field`, `Metric`, `Pill`, `Stepper`, `Table`, `Tabs`, and the `NITDADesignSystem_019ddc.*` exports for all ten.
- Removed: `document-portal/**` (9 scripts, including the service worker), `ui_kits/**` and `dgo_digital_ops/ui_kits/**` (app, screen and canvas demos, one of which calls `ReactDOM.createRoot(document.getElementById("root"))`), and `tweaks-panel.jsx`. These are page scripts. Each page that needs them already loads them with its own `<script>` tags.
- The header metadata lists only component source hashes and records the exclusion rule.

Build rule for the design-system project: the bundle source set is `components/*/*.jsx`. Application and UI-kit folders are excluded.

## Where it is applied

| Place | State |
|---|---|
| This project's design-system copy (`_ds/nitda-design-system-…/_ds_bundle.js`) | Applied. `Folio Template Index.dc.html` loads with no console errors and all components render. |
| NITDA Design System project (source) | Apply both files from this folder. This project has read-only access to it. Until it is applied there, a re-sync of the design system into this project restores the old bundle and the error. |

The original bundle is kept outside the package in `work/_ds_bundle.original.js` in case it needs to be restored.
