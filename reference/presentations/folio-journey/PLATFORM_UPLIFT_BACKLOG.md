# Platform design uplift: reserved backlog

**Status: deferred. This work is reserved for later and has not started.**
Received 2026-10-02, alongside the Folio Journey v2 visual folio in this folder ([`index.html`](index.html)).
It is not a readiness item and does not appear in
`docs/deployment/PRODUCTION_READINESS_REGISTER.json`. Promote it there when the work is scheduled.

## Intent

The visual concepts built for the immersive journey can be applied to the operational platforms
without turning them into decorative presentation screens. The uplift transfers:

- visual hierarchy
- interaction patterns
- navigation model
- status language
- component quality

It preserves every existing capability, endpoint and operational contract.

Treat the journey as the **design reference layer**, not as a separate styling experiment. The aim
is one harmonised DGO design system, applied selectively according to each platform's role.

## Important constraint: no sample data

The journey views contain representative figures and records for presentation only.
`folio-data.json` and every number shown in the journey **must not** be copied into the production
applications as real data. In the operational platforms:

- KPIs come from the existing SharePoint lists, platform registries or flow responses.
- Health status comes from actual probes.
- User identity and role visibility come from the existing role and claims model.
- Correspondence records use the schemas already defined in the repository.
- Endpoint information comes from the existing endpoint registry.
- No sample records, invented metrics or simulated availability are introduced.

## Per-platform enhancements

### 1. Folio Workspace (strongest uplift: it is the main operational surface)

Design changes:

- An **Operational Pulse** header replaces the dense dashboard blocks.
- Compact KPI cards:
  - open assignments
  - approvals due
  - SLA compliance
  - correspondence awaiting triage
  - escalated items
  - flow health
- Dark canopy navigation with a brighter active-state indicator.
- A persistent command bar for:
  - global search
  - reference lookup
  - quick navigation
  - common actions
- Correspondence and task records shown as structured rows with these columns:
  - Reference ID
  - Subject
  - Owner
  - Processing stage
  - Priority
  - SLA status
  - Next required action
- A lifecycle indicator:
  Received → Classified → Registered → Assigned → Actioned → Approved → Dispatched → Closed.

Views to uplift:

- Home
- Activities
- Correspondence
- Document Registry
- Assignments
- Approvals
- Dispatch
- Reports
- Executive View
- Admin Suite

Effect: users see at once what needs action, what is close to breach, and where each document is
in the process.

### 2. NITDA Document Portal

Adopts the guided submission experience:

- Four stages: Document Details → Contact Information → Attachments → Review and Submit.
- A visible progress bar.
- A spacious attachment drop zone.
- Accepted formats and size limits shown before upload.
- Inline validation beside each field.
- A prominent submission reference after completion.
- A tracking timeline:
  Submission Received → Validation Completed → Registered by Agency → Assigned for Action →
  Response in Preparation → Completed.
- Success, validation-warning and service-failure states that look clearly different.
- The official NITDA identity kept, with less instructional text.

Public users must understand their status without knowing internal Registry terms.

### 3. Correspondence Mailer

A three-panel layout: **Recipient Directory | Letter Preview | Dispatch Control**.

- Readiness shown beside every addressee, with the number of resolved attachments per recipient.
- Unresolved mappings made visually prominent.
- A realistic correspondence preview.
- A pre-dispatch validation summary:
  - total recipients
  - valid addresses
  - missing addresses
  - resolved attachments
  - missing attachments
  - duplicate recipients
  - dispatch channel
- Prepare, Validate, Preview and Send as distinct stages.
- Delivery results shown as a completion dashboard built around evidence.
- Personalised attachments and existing dispatch capabilities unchanged.
- **Critical control:** Send stays unavailable until every required recipient and attachment
  mapping passes validation.

### 4. Folio Estate Console

- Estate-wide health tiles:
  - registered endpoints
  - healthy
  - degraded
  - unavailable
  - contract-valid
  - configuration-required
- Endpoints grouped by operational domain instead of one flat list.
- Status colours:

  | Colour | Meaning |
  |---|---|
  | Green | Healthy |
  | Amber | Degraded, or a configuration warning |
  | Red | Unavailable, or a contract failure |
  | Blue | Informational, or commissioning |
  | Grey | Disabled, or not configured |

- Expandable endpoint cards showing:
  - alias
  - owning flow
  - HTTP method
  - environment
  - last probe
  - latency
  - contract status
  - last error
- An "exceptions only" filter.
- Owner and remediation action shown beside every failed item.
- A compact dependency path: app surface → alias → flow → data service.

### 5. Flow Workbench

- A visual request pipeline: Payload → Alias Resolution → Flow Invocation → Contract Validation →
  Response → Evidence.
- Each stage drawn as a node, with completed, active, failed and skipped states marked distinctly.
- Request and response inspectors side by side.
- Tabs:
  - Headers
  - Body
  - Timing
  - Contract
  - Evidence
  - Errors
- Latency and HTTP-status indicators above the response.
- The exact failed contract field highlighted, not just the raw error.
- One-click evidence export.
- The signed endpoint stays behind its alias and never appears in the interface.

### 6. Folio Vault

- A protected-core visual as the landing-state identity. The operational interface stays concise.
- Aliases shown, never signed URLs.
- Shown for each alias:
  - alias state
  - environment
  - owning platform
  - owning flow
  - last resolution
  - last rotation
  - access policy
- Security status values: Protected, Rotation required, Disabled, Validation failed.
- Controlled reveal for non-sensitive metadata only.
- An immutable audit timeline covering:
  - creation
  - update
  - disablement
  - rotation
  - resolution failure
- Protected endpoint values must never appear in HTML, browser storage, logs, diagnostics or
  copied metadata.

### 7. Platform Hub

- All eight platforms shown as launch cards. Each card shows:
  - name
  - purpose
  - audience
  - exposure
  - availability
  - environment
  - an Open action
- Groups: Operations, Service, Correspondence, Administration, Commissioning, Navigation.
- Search and audience filters.
- Live availability without aggressive auto-refresh.
- A compact list mode for small screens.
- Role-aware visibility, so engineering and administration surfaces are hidden from users who are
  not authorised to see them.

### 8. Central Administration Centre

- The trust-orbit concept becomes an operational governance overview: a central estate-health
  indicator surrounded by selectable domains:
  - Identity
  - Access
  - Endpoints
  - Incidents
  - Changes
  - Audit
  - Configuration
  - Evidence
  - Platform Health
- Unresolved alerts and required actions shown beside each domain.
- Views:
  - incident queue
  - change register
  - configuration-drift view
  - access-review status
  - evidence completeness
  - platform health
- Prioritised by severity, not equal visual weight.
- A single executive state first, then drill-down detail.

## Cross-Folio design system

Build the uplift as shared components in the existing DGO design system
(`styles/dgo-design-system/`), not as CSS repeated inside each application.

Components:

- `dgo-app-shell`
- `dgo-topbar`
- `dgo-sidebar`
- `dgo-command-bar`
- `dgo-page-header`
- `dgo-kpi-card`
- `dgo-status-chip`
- `dgo-data-grid`
- `dgo-workflow-timeline`
- `dgo-stepper`
- `dgo-detail-drawer`
- `dgo-empty-state`
- `dgo-error-state`
- `dgo-evidence-panel`
- `dgo-health-indicator`
- `dgo-platform-card`
- `dgo-confirmation-dialog`
- `dgo-toast`

Proposed tokens. Reconcile them with the existing token layers in
`styles/dgo-design-system/tokens/` before adoption; `npm run test:tokens` and `npm run test:brand`
enforce those layers.

```css
:root {
  --dgo-canopy-950: #061a13;
  --dgo-canopy-900: #08271d;
  --dgo-canopy-800: #093d2e;
  --dgo-verdant-500: #18c681;
  --dgo-verdant-300: #62e5a8;
  --dgo-signal-500: #f5b942;
  --dgo-cloud-50: #f3f6f4;
  --dgo-ink-900: #0a251c;
  --dgo-border: #dfe7e2;

  --dgo-success: #18c681;
  --dgo-warning: #f5b942;
  --dgo-danger: #d85b52;
  --dgo-info: #34a5df;
  --dgo-disabled: #7c8c84;

  --dgo-radius-sm: 5px;
  --dgo-radius-md: 8px;
  --dgo-radius-lg: 14px;
  --dgo-shadow-panel: 0 20px 55px rgb(6 26 19 / 12%);
}
```

## Implementation priority

1. **Shared foundation.**
   - Merge the journey tokens into the DGO design system.
   - Build the shared shell, KPI, status, drawer and timeline components.
   - Apply the accessibility, responsive and reduced-motion rules.
   - Keep current routes, selectors, endpoint contracts and IDs.
2. **Main operational surfaces:** Folio Workspace, Document Portal, Correspondence Mailer,
   Platform Hub.
3. **Administration and engineering:** Estate Console, Flow Workbench, Folio Vault,
   Central Administration Centre.
4. **Validation:**
   - existing functional tests
   - routes
   - endpoint contracts
   - role visibility
   - keyboard navigation and focus order
   - responsive layout
   - reduced motion
   - direct `file://` execution where supported
   - the hosted environment
   - visual-regression comparison

Immediate targets, when this work starts:

- Workspace operational dashboards
- Portal submission and tracking
- Mailer recipient and dispatch control
- Estate Console health visualisation
- Workbench execution pipeline
- Hub launch cards
