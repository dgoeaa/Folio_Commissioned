# Reading `endpoints.json` from a Power Automate flow

[`endpoints.json`](endpoints.json) is the endpoint surface of both platforms as data: 26 contract
keys, 59 HTTP-triggered flow definitions, and the 22 flows no key claims. `mailerEndpoints[]` holds the
Correspondence Mailer's seven endpoints beside them: they are not Folio contract keys, so they are not in
`endpoints[]`, and each names its workflow id and its definition under `mailer/flows/`. This page is about using
it *at run time* — a flow that looks up an endpoint, a flow id, or the lists a flow touches, while
it runs, instead of someone opening a document.

It exists because the obvious alternative does not work. The Excel master reference
(`npm run workbook`) cannot be read dynamically: Power Automate's Excel Online (Business) connector
reads **named Excel tables only**, never a sheet range, and that workbook writes formatted ranges
with an AutoFilter — which looks like a table and is not one. It is also a build artefact in
git-ignored `dist/`, so a flow pointed at it would read whatever copy someone last uploaded. This
file is tracked, generated from the packages, and gated by `npm run test:endpoints`.

---

## 1. Where to put the file

The connector has to be able to reach it, which means a document library or OneDrive for Business.
Upload `endpoints.json` to a library the flow's connection can read.

Two other routes exist and are worse. Fetching it from GitHub needs the HTTP action (premium) and a
token, because this repository is private. Pasting it into a `Compose` freezes it into the flow
definition, which is the opposite of dynamic.

## 2. Read it once per run

**Get file content** (SharePoint), then one **Compose** named `Dataset`:

```
json(base64ToString(body('Get_file_content')?['$content']))
```

`json(body('Get_file_content'))` usually works too — the runtime converts a text content type on its
own — but the explicit form does not depend on that inference.

Do this **once**, at the top of the run, and refer to `outputs('Dataset')` everywhere after. The
file is about 1 MB; fetching it inside a loop pays that cost per iteration for no gain.

## 3. Reach a row without scanning

Power Automate has no predicate over an array. Its array expressions are positional and set-shaped
— `first`, `last`, `take`, `skip`, `union`, `intersection`, `contains`, `length` — so filtering
means the **Filter array** *action*, scanning all 59 rows, once per lookup, every run.

`index`, at the foot of the file, removes that. It maps an identifier to the **zero-based position**
of the row carrying it:

| Index | Indexes | Keyed by |
| --- | --- | --- |
| `endpointsByKey` | `endpoints[]` | contract key, e.g. `FETCH_ACTIVITIES` |
| `endpointsByPlatform` | `endpoints[]` | `internal` / `portal` |
| `endpointsByWorkflowId` | `endpoints[]` | 32-hex workflow id |
| `mailerEndpointsByKey` | `mailerEndpoints[]` | Mailer endpoint key, e.g. `MAIL_SEND` |
| `flowsByCaptureId` | `flows[]` | this dataset's own row key |
| `flowsByFlowId` | `flows[]` | dashed GUID from the export |
| `flowsByWorkflowId` | `flows[]` | 32-hex workflow id |
| `flowsByDisplayName` | `flows[]` | the flow's name in the maker portal |
| `flowsByEstate` | `flows[]` | `internal` / `portal` |
| `flowsByTriggerMethod` | `flows[]` | `GET` / `POST` |
| `flowsByConnector` | `flows[]` | connection name, e.g. `shared_sharepointonline` |
| `flowsBySharePointList` | `flows[]` | list id or title as the action names it |

**Every value is a list**, including the keys that select exactly one row today. That is deliberate:
one `flowId` in this estate is carried by two differing captures, and one `workflowId` is named by
six flows. An index that returned a bare row for the common case would hand you the first of six and
never mention the other five. Write `first(...)` when you want one, and you will see the ambiguity
when it is real.

Rows are never repeated inside `index` — it holds positions, nothing else — so it cannot drift from
the data it points at.

## 4. Recipes

**One endpoint, by key**

```
outputs('Dataset')?['endpoints'][first(outputs('Dataset')?['index']?['endpointsByKey']?['FETCH_ACTIVITIES'])]
```

If the designer objects to the bracket index, `first(skip(...))` is the same thing and is accepted
everywhere:

```
first(skip(outputs('Dataset')?['endpoints'], first(outputs('Dataset')?['index']?['endpointsByKey']?['FETCH_ACTIVITIES'])))
```

**A key supplied at run time** — from the trigger, a list column, wherever:

```
outputs('Dataset')?['index']?['endpointsByKey'][triggerBody()?['endpointKey']]
```

**One flow, by flow id**

```
outputs('Dataset')?['flows'][first(outputs('Dataset')?['index']?['flowsByFlowId']?['6d819704-0e1d-4557-9886-f1afe80155e4'])]
```

**Every flow a key selects** — a `Select` action turns positions into rows in one step:

- *From*: `outputs('Dataset')?['index']?['flowsByWorkflowId']?['818ec4053f1e4f0b87845114241d8b74']`
- *Map*: `outputs('Dataset')?['flows'][item()]`

That one returns six rows. `flowsByConnector` and `flowsBySharePointList` are the same shape and
answer "which flows touch this list" without a scan.

**Does anything carry this id?**

```
empty(coalesce(outputs('Dataset')?['index']?['flowsByFlowId']?['...'], createArray()))
```

Always `coalesce` an index lookup. A missing key is not an error — it means no row declares that
value — so an unguarded lookup yields null and the next expression fails on it.

## 5. What the values mean

Three conventions decide whether a flow reading this behaves correctly. All three are stated in
`meta.conventions` in the file itself.

**`null` means the package does not declare it — not "empty", and not a default.** Where the
distinction matters a sibling boolean says so: `triggerAuthenticationType` is `null` with
`triggerAuthenticationTypeDeclared: false` on the exports that carry no posture. A flow that renders
that as `All` would be asserting something no package says. The same applies to
`flowsByTriggerMethod`: it covers the 39 flows whose export declares a method, and the other 20
appear under no method key at all.

**Two identifier schemes, never interchangeable.** `flowId` is the dashed GUID the maker portal
uses; every flow has one. `workflowId` is the 32-hex id a *signed trigger URL* addresses; **no
package in this tree carries it**, so it is joined from the two registers and is `null` for 40 of
the 59 flows. `captureId` is neither — it is this dataset's row key.

**No credential is in the file.** `endpoints[].url` holds a sentence, not a URL, because a
SAS-signed trigger URL is a bearer credential. A flow that needs to *call* an endpoint still gets
its URL from the deployment configuration; this dataset tells it which endpoint and which flow, not
how to authenticate as one.

## 6. Costs, and what stays your problem

- **~1 MB per run.** Fetch and parse it once. The `Dataset` output is visible in run history at that
  size, which is fine for a handful of runs a day and heavy for thousands.
- **The library copy goes stale silently.** Nothing reconciles it against this repository. Carry
  `outputs('Dataset')?['meta']?['commit']` into the flow's response or telemetry so any run can be
  traced back to the build it read, and re-upload whenever `npm run endpoints` changes the file.
- **It enumerates the estate.** No credentials, but it does name flow ids, SharePoint site URLs and
  list GUIDs. Put it in a library with the access you would give that inventory.
- **Counts describe the export, not the tenant.** The capture used the maker cmdlet `Get-Flow`,
  which returns only flows the exporting account owns or co-owns — `meta.capture.limit` says so.
  A flow that treats `httpTriggeredFlows` as the environment's total will be wrong.

## 7. Regenerating

```
npm run endpoints        # rebuild docs/folio-Master-Flows-and-Endpoints/reference/endpoints.json from the packages
npm run test:endpoints   # assert it still says what the packages say, index included
```

The generator is [`scripts/build-endpoint-dataset.mjs`](../../../scripts/build-endpoint-dataset.mjs);
`--check` fails if the tracked file has drifted, and runs as part of `npm run test:node`.
