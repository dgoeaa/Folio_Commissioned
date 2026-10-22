# Harvesting the flow estate into Excel

A Power Automate flow that lists every flow in the environment, reads each one in full, and
writes the result into a workbook — data, metadata, definitions, structures, connections, owners,
and every failure along the way. Build the workbook with `npm run collector`; it lands at
`dist/DGO_Flow_Harvest_Collector.xlsx`.

This is the opposite direction to [`endpoints.json`](endpoints.json), which is built from packages
already exported into this repository. Those packages came from the maker cmdlet `Get-Flow`, which
returns **only flows the exporting account owns or co-owns** — the limitation behind every "these
figures describe what the export found, not what the environment contains" caveat in the estate.
Run this harvest with the admin listing and that limitation is gone: it is the tenant inventory.

---

## 1. What the workbook is

Nine named Excel tables — real `ListObject`s, not formatted ranges — because the Excel Online
(Business) connector writes into tables and nothing else, and maps values to columns **by name**.

| Sheet | Table | Holds | Written by |
| --- | --- | --- | --- |
| 01 Collection Run | `tblCollectionRun` | one row per harvest, with counts | the flow |
| 02 Flows | `tblFlow` | one row per flow, scalar metadata | the flow (mostly) |
| 03 Definition Parts | `tblDefinitionPart` | the definition, split losslessly | the flow |
| 04 Properties Parts | `tblPropertiesPart` | the whole `properties` object | the flow |
| 05 Connections | `tblConnection` | one row per connection reference | a script, afterwards |
| 06 Owners | `tblOwner` | one row per principal with a role | the flow |
| 07 Actions | `tblAction` | one row per action in a definition | a script, afterwards |
| 08 Errors | `tblError` | one row per failed call | the flow |
| 09 Data Dictionary | `tblDictionary` | all 108 columns, typed and explained | generated |

Three rules make the result trustworthy rather than merely present:

**Nothing is truncated.** A cell holds 32,767 characters; definitions in this estate already exceed
91,000. A definition is split into ordered 32,000-character parts, one row each, and concatenating
a flow's parts in `PartNo` order returns the original exactly. `PartChars` summed per flow must
equal `tblFlow.DefinitionChars` — that equality is the proof, and it is worth asserting downstream.

**Nothing is filtered.** `tblPropertiesPart` holds the entire `properties` object the API returned,
not a selection from it. If Microsoft adds a field, or a flow carries one nobody anticipated, it is
still captured — `tblFlow` is a convenience view over the same data, not the record of it.

**Failures are rows.** `tblError` takes one row per failed call. A harvest that skips a flow
silently is worse than one that fails outright, because the output looks complete.

### The placeholder row

Every table spans its header plus **one empty row**. Excel treats a header-only table as damaged
and repairs the file on open, which silently destroys the table the flow was going to write to.
That row is structure, not data — delete it after the first collection, or exclude blank `RunId`
in anything reading the tables.

## 2. Two phases, and why

The flow captures; a script shreds. That split is forced, not a preference.

Power Automate's expression language has **no way to enumerate an object's keys**. `triggers`,
`actions` and `connectionReferences` are all objects keyed by name, so nothing that requires
walking them can be done in the flow. That is why `tblConnection`, `tblAction`, and `tblFlow`'s
`Trigger*` columns and its two counts are left for afterwards.

Nothing is lost by deferring it. The definition and the whole properties object are captured
verbatim in phase one, so the shredding step reads them back out of this same workbook and needs
no second harvest.

The usual workaround — convert the object to XML and read element names with `xpath` — mangles
them: a trigger called `When a HTTP request is received` comes back as
`When_x0020_a_x0020_HTTP_x0020_request_x0020_is_x0020_received`. That trades verbatim capture for
one saved step, which is the wrong trade for a source of truth.

## 3. Before you build the flow

1. **Upload the workbook** to a SharePoint document library or OneDrive for Business. The Excel
   connector cannot reach a local file or a repository.
2. **Decide the scope.** The admin listing returns every flow in the environment and needs a Power
   Platform or environment administrator account; the Power Automate Management connector is
   **premium**. The non-admin listing runs on a standard licence and returns only what the
   connection's account owns — which is exactly the blind spot this harvest exists to remove, so
   use admin unless you cannot.
3. **Restrict the library.** See §7 — the harvest captures full definitions.

## 4. The flow

### Import it, rather than build it

`npm run harvestflow` writes `dist/flow-package/DGO_Flow_Estate_Harvest_to_Excel.zip` — the whole
flow, ready to import. In Power Automate: **My flows → Import → Import Package (Legacy)**, upload
the zip, and pick a connection for **Power Automate Management** and **Excel Online (Business)**.

Then open the flow and set three variables at the top. They are the only things the package
cannot know, because they do not exist until the workbook is uploaded:

| Variable | Set it to |
| --- | --- |
| `varExcelSource` | `me` for OneDrive, or the site for a SharePoint library |
| `varExcelDrive` | the document library holding the collector workbook |
| `varExcelFile` | the workbook's file id |

The easiest way to fill them is to add a throwaway *Add a row into a table* action, pick the
workbook and a table from the dropdowns, read the values off it in code view, then delete it.
The flow checks both before it does anything and stops with a message naming them, so a
misconfigured run writes nothing rather than half-filling the tables.

The environment is already set to `Default-ca6a4b3f-9123-49bc-bcb9-27085ebbf1a1`. The trigger is
a monthly **Recurrence**, not an HTTP request — a Request trigger would mint another signed URL
into an estate that already has 55 outstanding. Use **Run flow** in the portal whenever the
schedule is not soon enough.

Two things to check on first open. The package uses `ListFlowsInEnvironmentAsAdmin` and
`GetFlowAsAdmin`. The Power Automate Management host block and the `environmentName` /
`flowName` parameter pair are verbatim from a deployed flow in this repository that already
calls that connector, but the two admin operation names could not be verified against your
tenant. If either card opens as unrecognised, re-pick the action from the connector — the
parameters are unchanged.

### Or build it by hand

The rest of this section is the same flow, action by action. It is worth reading even if you
import the package, because it says what each expression is for.

Rename each action exactly as named below; the expressions reference these names, and Power
Automate's internal names are derived from whatever you type.

**Trigger:** *Manually trigger a flow* (or a weekly *Recurrence* once it is proven).

**Initialize variable**, one per row:

| Name | Type | Value |
| --- | --- | --- |
| `varRunId` | String | `workflow()?['run']?['name']` |
| `varStarted` | String | `utcNow()` |
| `varEnvironment` | String | the environment's name, e.g. `Default-ca6a4b3f-9123-49bc-bcb9-27085ebbf1a1` |
| `varPartNo` | Integer | `0` |
| `varFlowsDetailed` | Integer | `0` |
| `varDefinitionRows` | Integer | `0` |
| `varPropertiesRows` | Integer | `0` |
| `varOwnerRows` | Integer | `0` |
| `varErrorRows` | Integer | `0` |

**`List_Flows`** — *List Flows as Admin (V2)* (Power Automate Management), Environment =
`variables('varEnvironment')`. This returns identifying information only, which is why every flow
needs a second call.

**`Apply_to_each_Flow`** — over `body('List_Flows')?['value']`.
**Turn concurrency OFF** in the action's settings. Parallel writes to one workbook conflict, and
the row counters below are only correct in sequence.

### Inside the loop — scope `Detail`

**`Get_Flow_Detail`** — *Get Flow as Admin*, Environment = `variables('varEnvironment')`,
Flow = `items('Apply_to_each_Flow')?['name']`.

Four **Compose** actions:

| Name | Expression |
| --- | --- |
| `Properties` | `body('Get_Flow_Detail')?['properties']` |
| `DefinitionText` | `string(outputs('Properties')?['definition'])` |
| `PropertiesText` | `string(outputs('Properties'))` |
| `DefinitionChunks` | `chunk(outputs('DefinitionText'), 32000)` |
| `PropertiesChunks` | `chunk(outputs('PropertiesText'), 32000)` |

**`Add_Flow_Row`** — *Add a row into a table*, table `tblFlow`:

| Column | Value |
| --- | --- |
| RunId | `variables('varRunId')` |
| CollectedUtc | `utcNow()` |
| EnvironmentName | `variables('varEnvironment')` |
| FlowName | `items('Apply_to_each_Flow')?['name']` |
| FlowResourceId | `items('Apply_to_each_Flow')?['id']` |
| DisplayName | `outputs('Properties')?['displayName']` |
| State | `outputs('Properties')?['state']` |
| CreatedTime | `outputs('Properties')?['createdTime']` |
| LastModifiedTime | `outputs('Properties')?['lastModifiedTime']` |
| CreatorObjectId | `outputs('Properties')?['creator']?['objectId']` |
| CreatorTenantId | `outputs('Properties')?['creator']?['tenantId']` |
| CreatorUserId | `outputs('Properties')?['creator']?['userId']` |
| CreatorUserType | `outputs('Properties')?['creator']?['userType']` |
| TemplateName | `outputs('Properties')?['templateName']` |
| ProvisioningMethod | `outputs('Properties')?['provisioningMethod']` |
| FlowFailureAlertSubscribed | `string(outputs('Properties')?['flowFailureAlertSubscribed'])` |
| FlowSuspensionReason | `outputs('Properties')?['flowSuspensionReason']` |
| FlowSuspensionTime | `outputs('Properties')?['flowSuspensionTime']` |
| ApiId | `outputs('Properties')?['apiId']` |
| Type | `items('Apply_to_each_Flow')?['type']` |
| DefinitionSchema | `outputs('Properties')?['definition']?['$schema']` |
| DefinitionContentVersion | `outputs('Properties')?['definition']?['contentVersion']` |
| DefinitionChars | `length(outputs('DefinitionText'))` |
| DefinitionParts | `length(outputs('DefinitionChunks'))` |
| PropertiesChars | `length(outputs('PropertiesText'))` |
| PropertiesParts | `length(outputs('PropertiesChunks'))` |
| MakerUrl | `concat('https://make.powerautomate.com/environments/', variables('varEnvironment'), '/flows/', items('Apply_to_each_Flow')?['name'], '/details')` |
| DetailStatus | `ok` |

Leave the `Trigger*` columns, `ActionCount` and `ConnectionReferenceCount` **empty** — §2.

**The definition parts.** *Set variable* `varPartNo` to `0`, then **`Apply_to_each_Definition_Part`**
over `outputs('DefinitionChunks')`, concurrency off:

- *Increment variable* `varPartNo` by 1
- **`Add_Definition_Part`** into `tblDefinitionPart`:

| Column | Value |
| --- | --- |
| RunId | `variables('varRunId')` |
| FlowName | `items('Apply_to_each_Flow')?['name']` |
| PartNo | `variables('varPartNo')` |
| PartCount | `length(outputs('DefinitionChunks'))` |
| PartChars | `length(items('Apply_to_each_Definition_Part'))` |
| DefinitionPart | `items('Apply_to_each_Definition_Part')` |

- *Increment variable* `varDefinitionRows` by 1

Repeat the same three actions over `outputs('PropertiesChunks')` into `tblPropertiesPart`, with
its own `varPartNo` reset before the loop.

**Owners, optional.** *List Flow Owners as Admin* for the same flow, then an *Apply to each* over
its value array writing `tblOwner`. This is one extra call per flow and roughly doubles the
harvest's duration — leave it out of the first run.

Finally *Increment variable* `varFlowsDetailed` by 1.

### Inside the loop — scope `Detail_Failed`

Add a second scope beside `Detail` and set its **run after** to *has failed*, *has timed out* and
*is skipped*. Inside, **`Add_Error_Row`** into `tblError`:

| Column | Value |
| --- | --- |
| RunId | `variables('varRunId')` |
| OccurredUtc | `utcNow()` |
| Stage | `detail` |
| FlowName | `items('Apply_to_each_Flow')?['name']` |
| StatusCode | `string(outputs('Get_Flow_Detail')?['statusCode'])` |
| Message | `string(body('Get_Flow_Detail')?['error']?['message'])` |
| RawError | `string(body('Get_Flow_Detail'))` |

Then *Increment variable* `varErrorRows`. Because the catch scope succeeds, the iteration succeeds
and the loop carries on to the next flow — which is the whole point.

### After the loop

**`Add_Run_Row`** into `tblCollectionRun`: `variables('varRunId')`, `variables('varStarted')`,
`utcNow()` for FinishedUtc, the environment, `admin` for Scope, the two action names, the counters,
`length(body('List_Flows')?['value'])` for FlowsListed, and `1.0.0` for
CollectorWorkbookVersion. Leave `ConnectionRows` empty — the shredding step fills that table.

Write this row **last**. A run that died leaves rows in the other tables and none here, and that
asymmetry is how a partial harvest is recognised.

### How the splitting works

The package does **not** use `chunk()`. It is exactly the right function for the job and it
appears in none of the sixty deployed definitions in this repository — and Power Automate
validates every expression in a definition *before it will accept the package*, so an
unavailable function fails the import, not the run, and the import error names the package
rather than the expression. `npm run harvestflow:verify` now checks every function the flow uses
against the ones this tenant's own flows demonstrably run; all 18 are attested.

So each stream is split by a *Do until* over a remainder variable, using `substring`, `length`,
`greater`, `if`, `sub` and `empty` — and the part count is `add(div(sub(length, 1), 32000), 1)`,
which is `ceil(length / 32000)` in integer arithmetic. The order inside the loop matters: the
part is composed from the remainder **before** the remainder is shortened, or every row would
hold the next part's text.

### The hand-built equivalent, if `chunk()` is available to you

Replace the chunk Compose and its loop with a *Do until* — set the loop's iteration limit above
the default 60 first:

- *Initialize variable* `varRest` (String) = `outputs('DefinitionText')`
- *Do until* `empty(variables('varRest'))`:
  - *Compose* `Part` = `if(greater(length(variables('varRest')), 32000), substring(variables('varRest'), 0, 32000), variables('varRest'))`
  - add the row using `outputs('Part')`
  - *Set variable* `varRest` = `if(greater(length(variables('varRest')), 32000), substring(variables('varRest'), 32000, sub(length(variables('varRest')), 32000)), '')`

## 5. What it costs

- **Rows.** About one per flow, two to four definition and properties parts each, one per owner.
  Sixty flows land near 400 rows.
- **Time.** Every row is one connector call, the connector throttles near 100 calls per 60 seconds,
  and there is no bulk insert in it. Budget minutes. Reported per-insert latency on large workbooks
  runs into tens of seconds, so keep the file to one environment's harvest and start a fresh
  workbook rather than appending forever.
- **Scale.** A tenant with hundreds of flows will take a long time and may throttle. Harvest one
  environment at a time. If that is still too slow, have the flow write each flow's JSON as a file
  to the library instead and shred the files afterwards — same data, one call per flow.

## 6. Afterwards

`tblAction` and `tblConnection` are waiting. A script reads `tblDefinitionPart`, concatenates each
flow's parts in `PartNo` order, parses the result, and walks it: one row per action with its path,
type and `runAfter` edges; one row per connection reference. `tblFlow`'s `Trigger*` columns and its
two counts are filled from the same parse.

Two checks worth running first, because they catch a truncated harvest before it becomes a
conclusion:

- `PartChars` summed per flow equals `tblFlow.DefinitionChars`, and the highest `PartNo` equals
  `PartCount`, for every flow.
- `tblCollectionRun.FlowsDetailed` equals the row count in `tblFlow` for that `RunId`, and
  `FlowsListed` minus `FlowsDetailed` equals the `tblError` rows at stage `detail`.

The harvest also reconciles against the existing dataset: `tblFlow.FlowName` is the same identifier
as `flows[].identifiers.flowId` in [`endpoints.json`](endpoints.json), and
`index.flowsByFlowId` resolves it in one expression — see
[the consumption guide](ENDPOINTS_JSON_IN_POWER_AUTOMATE.md). Flows in the harvest with no match
there are the ones the `Get-Flow` export never saw, and that difference is the answer the estate
has been missing.

## 7. What the harvest holds, and who should see it

A definition carries every value a maker typed into an action: SharePoint site URLs, list GUIDs,
recipient addresses, and any literal a maker hardcoded — including, if someone did it, an API key
in an HTTP action's headers. **Read the first harvest before sharing the workbook**, and put the
library behind the access you would give the flows themselves.

One thing it does **not** capture: a signed trigger URL. A flow definition does not contain the
signature — that is why `full_resource_id` is null in every package in this repository — so the
harvest cannot leak one. Rotation of the published URLs remains a separate, outstanding action and
nothing here changes it.

## 8. Rebuilding the workbook

```
npm run collector           # build dist/DGO_Flow_Harvest_Collector.xlsx
npm run collector:verify    # assert every table is real and the columns match the contract
npm run harvestflow         # build the import-ready flow package
npm run harvestflow:verify  # assert the flow and the workbook agree, column for column
```

`harvestflow:verify` is the one that matters most. It opens the delivered `.xlsx`, reads the
real column names out of the real Excel tables, opens the delivered `.zip`, reads every
`item/<Column>` the flow writes, and compares them. "Add a row into a table" maps by column
name: a column the flow writes that the table does not have is dropped, the row lands without
it, and the run reports success. Nothing in Power Automate will ever tell you.

The generator is [`scripts/build_flow_harvest_collector.py`](../../../scripts/build_flow_harvest_collector.py)
and the verifier is [`scripts/verify_flow_harvest_collector.py`](../../../scripts/verify_flow_harvest_collector.py),
which opens the delivered file and checks what a flow author would otherwise find out the hard
way: that each table is a real `ListObject`, that its columns are exactly the specified ones in
order, that no two share a name, and that the placeholder row is genuinely empty.

Both the workbook and its contract are versioned. `tblCollectionRun.CollectorWorkbookVersion`
records which contract a harvest was written against, so a mapping built for one version and run
against another is visible in the data rather than in a support call.
