# Scan intake and Create Task flows: review, alignment and optimisation (2026-10-02)

## What was reviewed

| Flow | Role | Source reviewed |
|---|---|---|
| ` DGSO INCOMING AI PROCESSING` (`b6d92bae-…`) | Live trigger for scanned documents. It polls a OneDrive folder every minute, creates the document item in DDOPS and runs Gemini extraction and classification. | [`docs/folio-Master-Flows-and-Endpoints/contracts/deployed/DGSO INCOMING AI PROCESSING__b6d92bae-591e-fa1e-52eb-b350cad988a7__full_definition.json`](../contracts/deployed/DGSO INCOMING AI PROCESSING__b6d92bae-591e-fa1e-52eb-b350cad988a7__full_definition.json) (export 2026-08-19, 101 actions) |
| `Deployed - Create Task` (`b9d07010-…`) | HTTP flow that turns one DDOPS document into a task. It is called from the app. | [full definition](../contracts/deployed/Deployed - Create Task__b9d07010-1d98-417c-ad97-a305af770772__full_definition.json) (108 actions) and [trigger schema](../../reference/foundational/flows/definitions/Deployed - Create Task__08584163567415046851552846639CU194__trigger_input_schema.json) |
| `Deployed Bulk Task Assignment_Create Task` (`122bb363-…`) | The bulk variant of Create Task. It loops over `SelectedItems`. | [full definition](../contracts/deployed/Deployed Bulk Task Assignment_Create Task__122bb363-ddea-40c7-8578-d0d613a17bf7__full_definition.json) (144 actions) |

The files uploaded on 2026-10-02 match the committed copies byte for byte (same definition; the trigger
schema passes `cmp`), so this review cites the committed paths. API keys in the export are already redacted.

The three flows share one SharePoint site (`NITDADGO-EAAACTIVITYTRACKING`) and these lists:

| List id | Used as | Written by |
|---|---|---|
| `1f1cb303-…` | DDOPS document register (the "doc") | Intake creates it, Create Task updates it |
| `d46a2be7-…` | AI extraction record | Intake only |
| `ee82725a-…` | Tasks | Create Task (both variants) |
| `8aab9c4e-…` | Departments lookup | Create Task (single) only |

## How the intake flow runs today

The top-level `runAfter` chain is strictly sequential:

```
Init vars (6) → Scope_References → Preliminaries_and_Backup → Scope_Processing
  → Compose_7 → Compose_6 → Send_an_email_(V2) → Scope_HTML_Templates
  → Scope_Gemini_Text_Processing → Terminate → Scope_Flow_Definition_Email
```

Three consequences follow from that order:

1. **The notification email goes out before the AI runs.** `Send_an_email_(V2)` (to `dgs@`) sends
   `Compose_7`, which has no summary, category or sender. Both AI notification templates
   (`Compose_Email_Notification_with_AI_Processed_Information_version_1/2`) are composed and never sent.
2. **The file is renamed, moved and attached twice.** `Scope_Processing` renames the trigger file, moves
   the backup copy and adds an attachment. `Scope_Successful_Rename_File_Processing` then does all three
   again with the AI-derived name. Each scan leaves **two attachments** on the DDOPS item.
3. **AI work depends on cosmetic steps.** The Gemini scope runs only if `Scope_HTML_Templates` succeeds.
   That scope only builds three unused HTML templates (`Compose_4/5`, `Compose_Email_Attachments_3`).

## Findings: intake flow (`DGSO INCOMING AI PROCESSING`)

Severity: **H** breaks data or security, **M** wrong behaviour or silent failure, **L** cleanup.

| # | Sev | Finding | Evidence (action) | Fix |
|---|---|---|---|---|
| I-1 | H | Every scanned document gets an **anonymous edit** share link. Anyone holding the link can change government correspondence. | `CREATE_SHARELINK_OF_TRIGGER_DOCUMENT`: `type: Edit`, `scope: Anonymous` | Use `type: View`, `scope: Organization`. Where the share policy allows it, store the file's `WebUrl` and skip the share link entirely. |
| I-2 | H | Three Gemini API keys are held as plain `Compose` values. One is named after a personal Gmail account. The HTTP actions do not hide inputs or outputs, so the key and the whole document appear in run history. | `Compose_API_Key`, `Compose_API_Key_2`, `Compose_API_Key_kanihamza@gmail.com__v2`; `HTTP_Text_Extraction`, `HTTP_Extracted_Text_Processing` | Keep one key, owned by the organisation, in an environment variable of type *Secret* (Key Vault-backed). Turn on Secure inputs and Secure outputs on both HTTP actions. Rotate all three keys, because they are already in run history. |
| I-3 | H | The backup copy is moved to the **drive root**. `Move_or_rename_a_file_3` sets `destination` to the bare file name with no folder, so the copy leaves `/2024 DOCUMENTS/Documente Volume II`. A later move then tries the trigger folder's path on a different OneDrive connection (`_2`). | `Move_or_rename_a_file_3`, `Move_or_rename_a_file`, `Move_or_rename_a_file_2` | Leave the backup copy where it is created, or move it within its own folder (`concat('/2024 DOCUMENTS/Documente Volume II/', name)`). Never move it using the trigger drive's `{Path}`. |
| I-4 | H | The deep link is broken. The literal suffix `veggie ` is appended to the item ID, and the link is set twice. | `Set_variable_Deeplink`, `Set_variable_Deeplink_2` | Replace both with the committed patch `02-Set_variable_Deeplink.txt` (retired 2026-10-21; the flow was replaced 2026-10-16) and delete `_2`. `APP_FAST_TRACK_LINK` should take `01-APP_FAST_TRACK_LINK.txt` (retired 2026-10-21; the flow was replaced 2026-10-16). |
| I-5 | M | The error handler watches the wrong scope. `Scope_Preliminaries_and_Backup_Error` runs after `Scope_HTML_Templates` fails, not after `Preliminaries_and_Backup` fails. | `Scope_Preliminaries_and_Backup_Error.runAfter` | Point it at `Preliminaries_and_Backup` (Failed, TimedOut). |
| I-6 | M | Failures are silent. The extraction and classification error scopes only set `varResponse`, which no action sends or saves. The DDOPS item stays at `Not Assigned` or `Pending` with no flag. | `Scope_HTTP_Error`, `Scope_HTTP_Error_2` | In each catch, patch the doc with `AssignmentStatus = AI Failed` (or write a `ProcessingError` column) and send one failure email. End with `Terminate` set to **Failed** so the run history shows it. |
| I-7 | M | `Terminate` needs **both** `Scope_Gemini_Text_Processing` and `Scope_Preliminaries_and_Backup_Error` to succeed. The error scope is normally skipped, so `Terminate`, and with it `Scope_Flow_Definition_Email`, never runs. | `Terminate.runAfter` | Remove the self-export scope (`Scope_Flow_Definition_Email`, 6 actions). Definitions are captured by `scripts/export-power-automate-flows.ps1`. If it stays, gate it behind an environment-variable flag, not on every scan. |
| I-8 | M | Gemini is told every file is a PDF. `mimeType` is hard-coded `application/pdf`, and the trigger has no file-type or size guard. Inline data is capped at about 20 MB per request. | `HTTP_Text_Extraction` | Use `triggerOutputs()?['headers/x-ms-file-content-type']` (or `inferContentType`). Add a trigger condition so only `.pdf`, `.jpg`, `.png` and `.tif` files under about 18 MB start a run. |
| I-9 | M | Two Gemini calls where one would do, and three JSON parses where one would do. The second call re-sends the full text. The first parse uses an **OpenRouter** schema (`statusCode/headers/choices`) on a Gemini body. The second parses the cleaned document JSON against a Gemini-envelope schema. A string replace strips ```` ```json ```` fences. | `HTTP_Text_Extraction`, `HTTP_Extracted_Text_Processing`, `Parse_JSON_*` ×3, `Compose_Clean_Extract_Parse_JSON_Text` | Make one call with the file inline that returns `{full_text, document_type, …}`. Set `generationConfig.responseMimeType = application/json` and a `responseSchema`, then use one `Parse_JSON` with the document schema below. That removes about 6 actions and halves token cost. |
| I-10 | M | The AI classification is never written to the document. Category, sub-category and code go only to the AI list (`d46a2be7`), so the Create Task form cannot prefill them (see A-2). The prompt also asks for one `Category Code`, but Create Task needs both `CategoryCode` and `SubCategoryCode`. | `Create_item`, `Update_item`, prompt | Ask for `category_code` and `sub_category_code`, both validated against `Categories_List`. Write `Category0`, the codes, `Priority` and `Classification` to the doc in the same `Update_item`. |
| I-11 | M | The status vocabulary disagrees across the lifecycle. Intake creates the item as `Not Assigned`, then `Update_item_2` sets it to `Pending`. Create Task sets `AssignmentStatus = Processed` and `Status = Treated`. Nothing defines `Pending`. | `CREATE_MAIN_ITEM_IN_DDOPS`, `Update_item_2` | Use one set: `Not Assigned` → `AI Processed` (or `AI Failed`) → `Processed`. Delete `Update_item_2`. |
| I-12 | M | The DDOPS item is patched three times (`Update_item_2`, `Update_item_3`, `Update_item`/`_4`). Each patch overwrites `Title`, `Notes` and `TextExtraxt` with a different value. `Update_item_2` blanks `BodyExtract` and `TextExtraxt`. | the four `Update_item*` actions | Create once, then patch once, after AI. |
| I-13 | M | Extracted text goes into HTML columns unescaped (`<p>@{variables('varText')}</p>`). A letter containing `<` or `&` breaks the markup. `Key_x0020_Points` stores the JSON array text, while the `<li>` list built in `varKeyPoints` is never used. | `Update_item*`, `Create_item`, `Apply_to_each_Key_Point` | Wrap the value in `replace(replace(replace(x,'&','&amp;'),'<','&lt;'),'>','&gt;')`. Write `concat('<ul>', variables('varKeyPoints'), '</ul>')` to `Key Points`. |
| I-14 | L | Five OneDrive or SharePoint connection references are used for one site and one drive (`onedriveforbusiness`, `_1`, `_2`, `sharepointonline`, `_1`), and two Office 365 references. File ids from one connection are passed to another (I-3). | section 4 of [the provisioning page](../provisioning/flows/dgso-incoming-ai-processing.md) | Use one service-account reference per connector: one OneDrive, one SharePoint, one Outlook. |
| I-15 | L | Dead actions: `Compose_4`, `Compose_5`, `Compose_6`, `Compose_Email_Attachments_3`, `Compose` (unused prompt), `Compose_AI_Prompt`, `Compose_API_Key*` (two of three), the AI email `version_1/2`, `Set_variable_Deeplink_2`, `Scope_Successful_Rename_File_Processing_2` (it reads `Final_Safe_File_Name`, which does not exist in the only case where that scope runs), and the trigger description `yup`. | — | Delete them. About 25 actions go, out of 101. |
| I-16 | L | `gemini-2.0-flash` is pinned in two URIs. | HTTP URIs | Move the model name into an environment variable and check Google's model deprecation list before each release. |

## Findings: Create Task (single) and the bulk variant

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| C-1 | H | **Create Task erases the AI output.** `Update_item_Doc` writes `BodyExtract: ""` and `TextExtraxt: ""` on the doc, deleting what intake extracted. The bulk variant does the same. | `Update_item_Doc` (both) | Remove both keys from the patch. PatchItem leaves fields it is not given unchanged. |
| C-2 | M | `Compose_Config_BaseURL` holds a **Markdown link**, `[https://taskack.page.gd](https://taskack.page.gd)`, not a URL. Anything that concatenates it produces a broken link. | `Compose_Config_BaseURL` (single) | Set it to `https://taskack.page.gd`, or better an environment variable. Build `Compose_Task_Acknowledgement_Link` and `Compose_SupportLink` from it rather than repeating the host. The patch files that were under `patches/deeplinks/Deployed-Create-Task` covered the link composition; they were retired with `Deployed - Create Task` on 2026-10-05 ([`registers/flow-retirement.json`](../registers/flow-retirement.json)); `SINGLE_ASSIGNMENT` is served by `Single_Task_Assignment` (3caf9458). |
| C-3 | M | The support link strips line breaks with `'\n'` and `'\r'`. In a flow expression these are literal backslash strings, so line breaks pass through. The acknowledgement link uses `decodeUriComponent('%0A')` correctly. | `Compose_SupportLink` | Use `decodeUriComponent('%0A')` and `decodeUriComponent('%0D')`, as in the acknowledgement link. |
| C-4 | M | The validation message is always "No selected item was provided.", even when the item is present and `AssignedTo` is the missing field. | `Condition_Validate_Input`, `Append_to_array_variable_varErrrors…` | Return a `missing` array: `if(empty(Selected.ID),'Selected.ID')`, `if(empty(AssignedTo),'NewActivityTask.AssignedTo')`. |
| C-5 | M | The doc is marked done at assignment: `Status = Treated`, `AssignmentStatus = Processed`, `OverallStatus = In Progress`. Three columns describe one state and contradict each other. | `Update_item_Doc` | Agree one lifecycle (see I-11). At assignment, write only `AssignmentStatus = Assigned` and `OverallStatus = In Progress`. Leave `Status` for task completion. |
| C-6 | L | The task type is written twice, and one value has a typo: `TaskTypeChoice = "Standard Task"`, `TaskType = "STandard Task"`. | `Update_item_Task` | Write `Standard Task` to one column, and fold it into `Create_Task` to save a call. |
| C-7 | L | `Create_Task` writes `Classification` from `NewActivityTask.Category`. The doc's security classification (Public Access, Restricted, Secret) is never sent. | `Create_Task` | Send `NewActivityTask.Classification` and map it. Write the category to its own column. |
| C-8 | L | Each run emails its own definition and a telemetry record (`Get_Flow_Definition`, `Send_Telemetry_Email`, `Send_an_email_(V2)_2` to an individual staff address in the bulk variant). That is two to three extra mails per assignment. | Scope_Flow_Data_Capture | Keep telemetry behind a flag. Replace the hard-coded individual recipient with a role mailbox. |
| C-9 | L | Single and bulk are two flows with about 80 shared actions, already drifting apart: 40 shared actions differ (for example, only single resolves the department title, and the email templates differ). | action-set diff below | Make one flow. Normalise `Selected` into a one-item `SelectedItems` array, then run one loop (concurrency 1 for counters, or Select/Filter with no shared variables). Keep the single trigger URL as a thin wrapper, or point the app at the merged URL. |

Action-set diff (single vs bulk): 31 actions only in single, 69 only in bulk, 40 shared names with different bodies.

## Alignment: intake output → Create Task input

| Create Task reads | Today it comes from | Gap |
|---|---|---|
| `Selected.ID` | doc `ID` (intake also copies it to `RefIDD`) | none |
| `NewActivityTask.Title` | doc `Title`, the AI file name | none |
| `NewActivityTask.Category`, `CategoryCode` | typed by the user | **A-2**: intake knows these but never writes them to the doc (I-10) |
| `NewActivityTask.SubCategoryCode` | typed by the user | **A-2**: the AI never produces it |
| `NewActivityTask.Priority` | typed by the user | **A-3**: `Priorities_List` is `High, Medium, Low`; the Create Task error payload defaults to `Normal`. Use one list. |
| `NewActivityTask.AttachmentLink` | doc `AttachmentLink` (Create Task re-reads it from the doc) | **A-4**: this is the anonymous edit link (I-1) and gets passed to task emails |
| doc `BodyExtract` / `TextExtraxt` | intake AI | **A-1**: wiped by Create Task (C-1) |

**Request schema.** The live trigger schema accepts 30 `NewActivityTask` properties. Single reads 18 of
them and bulk reads 20. The schema holds duplicate pairs: `AckDue` and `AcknolwedgementDueBy` (misspelt),
`TaskDue` and `TaskDueDate`, `supportingAssignedTo` and `SupportAssignedTo`. It also holds fields no
variant reads: `Timeline`, `SupportAssignedToTitle`, `SupportDSUKey`, `AssignedDSU`, `PreReferenceID`,
`Categorization`, `Description`, `Status`, `mode`, `method`, `device`. The bulk flow reads root fields the
schema does not declare: `requestId`, `trackingId`, `requestorEmail`, `requestedBy`, `AgencyName`,
`OrganizationName`, `NotificationTitle`, `AuditTitle`, `supportEmail`.

[`docs/folio-Master-Flows-and-Endpoints/contracts/create-task.aligned.request-schema.json`](../contracts/create-task.aligned.request-schema.json)
is the proposed single contract for both variants:

- It declares only the fields either flow reads.
- It names one spelling per field, and lists legacy aliases under `x-legacy-aliases` so the app can keep sending them while the flow coalesces them.
- It requires `Selected.ID` or `SelectedItems`, plus `NewActivityTask.AssignedTo`, which matches what `Condition_Validate_Input` already enforces.

The schema keeps `additionalProperties: true`, so callers already sending extra fields are not rejected.

## Optimised target design for intake

```
Trigger: OneDrive new file (one connection)
  trigger conditions: extension in pdf/jpg/png/tif AND size < 18 MB
  concurrency: 5
Scope_Try
  1. Create DDOPS item: Title = original name, AssignmentStatus = Not Assigned
  2. Get file WebUrl (no anonymous link); copy to the backup folder (stays in its folder)
  3. Gemini (one call; secure in/out; retry 4× exponential; key from a Secret env var)
       inline file + responseSchema → {full_text, document_type, date, sender_name,
       recipient_name, subject, summary, key_points[], category, category_code,
       sub_category, sub_category_code, priority, classification}
  4. Parse_JSON (document schema) → build safe file name
  5. Rename trigger file (same drive), attach once
  6. Patch DDOPS item ONCE: Title, Description (summary), Notes/TextExtraxt (escaped),
       Category0, CategoryCode, SubCategory, SubCategoryCode, Priority, Classification,
       AttachmentLink = WebUrl, RefIDD, AssignmentStatus = AI Processed
  7. Create AI record (d46a2be7), with key points as <ul>
  8. Send ONE email (the AI template) with the deep link from the patched APP_FAST_TRACK_LINK
Scope_Catch (runAfter Scope_Try: Failed, TimedOut)
  patch DDOPS item AssignmentStatus = AI Failed + error text; send one failure mail;
  Terminate Failed
```

Expected effect: from 101 actions to about 30, from two Gemini calls to one, from four DDOPS writes to
two, from two attachments to one, and from five or more connection references to three. The mail that
reaches `dgs@` would carry the classification. Failures would show in the item and in run history.

## Order of work

1. **Now, small edits in the live flows:** I-1 (share scope), I-2 (secure the key and rotate), C-1 (stop wiping the AI fields), I-4 and C-2 (the committed deep-link patches and the BaseURL), I-3 (backup move).
2. **Next:** I-5, I-6 and I-7 error handling; I-10 and I-11 to write the classification and agree the status values; C-4 and C-5.
3. **Then:** rebuild intake to the target design, merge single and bulk Create Task (C-9), and move callers to the aligned schema.

Each change to a live flow needs a fresh export into `docs/folio-Master-Flows-and-Endpoints/contracts/deployed/`. Its generated
provisioning page is then rebuilt by `scripts/build-provisioning-reference.mjs`.
