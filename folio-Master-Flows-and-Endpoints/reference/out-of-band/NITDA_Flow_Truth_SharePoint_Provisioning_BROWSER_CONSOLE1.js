(() => {
  "use strict";

  const CONFIG = Object.freeze({
    siteUrl: (window._spPageContextInfo && window._spPageContextInfo.webAbsoluteUrl
      ? window._spPageContextInfo.webAbsoluteUrl
      : location.origin + location.pathname.split("/SitePages/")[0]).replace(/\/$/, ""),
    currentList: "NITDA Flow Truth Registry",
    historyList: "NITDA Flow Truth History",
    artefactLibrary: "NITDA Flow Truth Artefacts",
    currentDescription: "Current governed state of registered Power Automate flows. One record per EnvironmentId and FlowId.",
    historyDescription: "Immutable run-level history for registered Power Automate flows. One record per EnvironmentId, FlowId and RunId.",
    artefactDescription: "Restricted lossless JSON, HTML, governance, manifest and receipt artefacts for Power Automate flow truth records."
  });

  const LIST_TEMPLATE = 100;
  const LIBRARY_TEMPLATE = 101;
  const JSON_HEADERS = Object.freeze({
    Accept: "application/json;odata=verbose",
    "Content-Type": "application/json;odata=verbose"
  });

  let digest = "";

  const log = (message, data) => {
    const stamp = new Date().toISOString();
    if (data === undefined) console.log(`[NITDA Flow Truth] ${stamp} ${message}`);
    else console.log(`[NITDA Flow Truth] ${stamp} ${message}`, data);
  };

  const escapeOData = value => String(value).replace(/'/g, "''");
  const apiUrl = path => `${CONFIG.siteUrl}/_api/${path.replace(/^\//, "")}`;

  async function request(path, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = { ...JSON_HEADERS, ...(options.headers || {}) };
    if (method !== "GET" && method !== "HEAD") headers["X-RequestDigest"] = digest;
    const response = await fetch(apiUrl(path), {
      method,
      credentials: "same-origin",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    const text = await response.text();
    let payload = null;
    if (text) {
      try { payload = JSON.parse(text); } catch { payload = text; }
    }
    if (!response.ok) {
      const detail = payload && payload.error && payload.error.message
        ? payload.error.message.value
        : text || `${response.status} ${response.statusText}`;
      throw new Error(`${method} ${path} failed: ${detail}`);
    }
    return payload && payload.d !== undefined ? payload.d : payload;
  }

  async function acquireDigest() {
    const response = await fetch(apiUrl("contextinfo"), {
      method: "POST",
      credentials: "same-origin",
      headers: JSON_HEADERS
    });
    if (!response.ok) throw new Error(`Unable to obtain SharePoint request digest: ${response.status} ${response.statusText}`);
    const payload = await response.json();
    digest = payload.d.GetContextWebInformation.FormDigestValue;
  }

  async function getList(title) {
    try {
      return await request(`web/lists/GetByTitle('${escapeOData(title)}')?$select=Id,Title,BaseTemplate,RootFolder/ServerRelativeUrl&$expand=RootFolder`);
    } catch (error) {
      if (/does not exist|cannot be found|404/i.test(error.message)) return null;
      throw error;
    }
  }

  async function ensureList(title, description, template) {
    let list = await getList(title);
    if (!list) {
      log(`Creating ${template === LIBRARY_TEMPLATE ? "library" : "list"}: ${title}`);
      await request("web/lists", {
        method: "POST",
        body: {
          __metadata: { type: "SP.List" },
          BaseTemplate: template,
          Title: title,
          Description: description,
          ContentTypesEnabled: true,
          AllowContentTypes: true
        }
      });
      list = await getList(title);
    } else {
      log(`Reusing existing resource: ${title}`);
    }

    const settings = template === LIBRARY_TEMPLATE
      ? {
          __metadata: { type: "SP.List" },
          Description: description,
          EnableVersioning: true,
          EnableMinorVersions: false,
          EnableModeration: false,
          ForceCheckout: false,
          EnableFolderCreation: true,
          NoCrawl: false
        }
      : {
          __metadata: { type: "SP.List" },
          Description: description,
          EnableVersioning: true,
          EnableAttachments: false,
          EnableFolderCreation: false,
          NoCrawl: false
        };

    await request(`web/lists/GetByTitle('${escapeOData(title)}')`, {
      method: "POST",
      headers: { "IF-MATCH": "*", "X-HTTP-Method": "MERGE" },
      body: settings
    });
    return await getList(title);
  }

  async function listFields(listTitle) {
    const response = await request(`web/lists/GetByTitle('${escapeOData(listTitle)}')/fields?$select=InternalName,Title`);
    return new Set((response.results || []).map(field => field.InternalName));
  }

  async function ensureField(listTitle, definition, existing) {
    if (!existing.has(definition.internalName)) {
      await request(`web/lists/GetByTitle('${escapeOData(listTitle)}')/fields/createfieldasxml`, {
        method: "POST",
        body: {
          parameters: {
            __metadata: { type: "SP.XmlSchemaFieldCreationInformation" },
            SchemaXml: definition.xml,
            Options: 0
          }
        }
      });
      existing.add(definition.internalName);
      log(`Created field ${listTitle}.${definition.internalName}`);
    }

    if (definition.settings) {
      await request(`web/lists/GetByTitle('${escapeOData(listTitle)}')/fields/GetByInternalNameOrTitle('${escapeOData(definition.internalName)}')`, {
        method: "POST",
        headers: { "IF-MATCH": "*", "X-HTTP-Method": "MERGE" },
        body: { __metadata: { type: "SP.Field" }, ...definition.settings }
      });
    }
  }

  const textField = (name, display, max = 255, required = false) => ({
    internalName: name,
    xml: `<Field Type="Text" Name="${name}" StaticName="${name}" DisplayName="${display}" MaxLength="${max}" Required="${required ? "TRUE" : "FALSE"}" Group="NITDA Flow Truth" />`
  });
  const noteField = (name, display) => ({
    internalName: name,
    xml: `<Field Type="Note" Name="${name}" StaticName="${name}" DisplayName="${display}" NumLines="12" RichText="FALSE" AppendOnly="FALSE" UnlimitedLengthInDocumentLibrary="TRUE" Group="NITDA Flow Truth" />`
  });
  const dateField = (name, display) => ({
    internalName: name,
    xml: `<Field Type="DateTime" Name="${name}" StaticName="${name}" DisplayName="${display}" Format="DateTime" FriendlyDisplayFormat="Disabled" Group="NITDA Flow Truth" />`
  });
  const numberField = (name, display) => ({
    internalName: name,
    xml: `<Field Type="Number" Name="${name}" StaticName="${name}" DisplayName="${display}" Decimals="0" Min="0" Group="NITDA Flow Truth" />`
  });
  const boolField = (name, display, defaultValue = 0) => ({
    internalName: name,
    xml: `<Field Type="Boolean" Name="${name}" StaticName="${name}" DisplayName="${display}" Group="NITDA Flow Truth"><Default>${defaultValue}</Default></Field>`
  });
  const choiceField = (name, display, choices, defaultValue) => ({
    internalName: name,
    xml: `<Field Type="Choice" Name="${name}" StaticName="${name}" DisplayName="${display}" Format="Dropdown" FillInChoice="FALSE" Group="NITDA Flow Truth"><CHOICES>${choices.map(v => `<CHOICE>${v}</CHOICE>`).join("")}</CHOICES><Default>${defaultValue}</Default></Field>`
  });
  const urlField = (name, display) => ({
    internalName: name,
    xml: `<Field Type="URL" Name="${name}" StaticName="${name}" DisplayName="${display}" Format="Hyperlink" Group="NITDA Flow Truth" />`
  });

  function commonFields() {
    return [
      textField("RegistryKey", "Registry Key", 255, true),
      textField("HistoryKey", "History Key", 255, false),
      textField("EnvironmentId", "Environment ID", 255, true),
      textField("EnvironmentName", "Environment Name", 255),
      textField("FlowId", "Flow ID", 255, true),
      textField("FlowName", "Flow Name", 255),
      textField("FlowDisplayName", "Flow Display Name", 255),
      textField("RunId", "Run ID", 255),
      textField("CorrelationId", "Correlation ID", 255),
      choiceField("LifecycleStatus", "Lifecycle Status", ["Active", "Suspended", "Stopped", "Deleted", "Unknown"], "Unknown"),
      choiceField("RunStatus", "Run Status", ["Observed", "Running", "Succeeded", "Failed", "TimedOut", "Cancelled", "Unknown"], "Unknown"),
      choiceField("Criticality", "Criticality", ["Low", "Medium", "High", "Critical"], "Medium"),
      choiceField("DataClassification", "Data Classification", ["Public", "Internal", "Confidential", "Restricted"], "Restricted"),
      textField("TechnicalOwner", "Technical Owner", 255),
      textField("BusinessOwner", "Business Owner", 255),
      textField("SupportContact", "Support Contact", 255),
      textField("SystemName", "System Name", 255),
      textField("BusinessProcess", "Business Process", 255),
      textField("DefinitionVersion", "Definition Version", 100),
      textField("SchemaVersion", "Schema Version", 50),
      dateField("CapturedUtc", "Captured UTC"),
      dateField("CompletedUtc", "Completed UTC"),
      dateField("PersistedUtc", "Persisted UTC"),
      numberField("DurationMilliseconds", "Duration Milliseconds"),
      boolField("RequiresOwnerReview", "Requires Owner Review"),
      boolField("ContainsSensitiveData", "Contains Sensitive Technical Data", 1),
      boolField("CredentialsExcluded", "Credentials Excluded", 1),
      boolField("IntegrityVerified", "Integrity Verified"),
      textField("ContentSha256", "Content SHA-256", 128),
      numberField("ContentSizeBytes", "Content Size Bytes"),
      urlField("CurrentArtefactUrl", "Current Artefact URL"),
      urlField("HistoryArtefactUrl", "History Artefact URL"),
      urlField("HtmlReportUrl", "HTML Report URL"),
      urlField("IntegrityManifestUrl", "Integrity Manifest URL"),
      noteField("ComplianceIssuesJson", "Compliance Issues JSON"),
      noteField("PersistenceReceiptJson", "Persistence Receipt JSON"),
      noteField("LastErrorJson", "Last Error JSON")
    ];
  }

  function artefactFields() {
    return [
      textField("RegistryKey", "Registry Key", 255, true),
      textField("HistoryKey", "History Key", 255, true),
      textField("EnvironmentId", "Environment ID", 255, true),
      textField("FlowId", "Flow ID", 255, true),
      textField("RunId", "Run ID", 255, true),
      textField("CorrelationId", "Correlation ID", 255),
      choiceField("ArtefactType", "Artefact Type", ["CompleteFlowResource", "CompleteRunRecord", "CompleteReportHtml", "GovernanceRecord", "IntegrityManifest", "PersistenceReceipt", "FailureRecord"], "CompleteRunRecord"),
      textField("ContentType", "Content Type", 150),
      textField("SchemaVersion", "Schema Version", 50),
      textField("ContentSha256", "Content SHA-256", 128),
      numberField("ContentSizeBytes", "Content Size Bytes"),
      dateField("CapturedUtc", "Captured UTC"),
      dateField("PersistedUtc", "Persisted UTC"),
      boolField("IntegrityVerified", "Integrity Verified"),
      choiceField("DataClassification", "Data Classification", ["Public", "Internal", "Confidential", "Restricted"], "Restricted"),
      textField("RetentionClass", "Retention Class", 255)
    ];
  }

  async function configureTitle(listTitle, newTitle) {
    await request(`web/lists/GetByTitle('${escapeOData(listTitle)}')/fields/GetByInternalNameOrTitle('Title')`, {
      method: "POST",
      headers: { "IF-MATCH": "*", "X-HTTP-Method": "MERGE" },
      body: { __metadata: { type: "SP.Field" }, Title: newTitle, Required: true, Indexed: true }
    });
  }

  async function enforceField(listTitle, internalName, settings) {
    await request(`web/lists/GetByTitle('${escapeOData(listTitle)}')/fields/GetByInternalNameOrTitle('${escapeOData(internalName)}')`, {
      method: "POST",
      headers: { "IF-MATCH": "*", "X-HTTP-Method": "MERGE" },
      body: { __metadata: { type: "SP.Field" }, ...settings }
    });
  }

  async function ensureView(listTitle, viewTitle, fields, query, rowLimit = 100) {
    let exists = true;
    try {
      await request(`web/lists/GetByTitle('${escapeOData(listTitle)}')/views/GetByTitle('${escapeOData(viewTitle)}')?$select=Title`);
    } catch (error) {
      if (/does not exist|cannot be found|404/i.test(error.message)) exists = false;
      else throw error;
    }
    if (!exists) {
      await request(`web/lists/GetByTitle('${escapeOData(listTitle)}')/views`, {
        method: "POST",
        body: {
          __metadata: { type: "SP.View" },
          Title: viewTitle,
          PersonalView: false,
          RowLimit: rowLimit,
          ViewQuery: query,
          ViewFields: { __metadata: { type: "Collection(Edm.String)" }, results: fields }
        }
      });
      log(`Created view ${listTitle}.${viewTitle}`);
    }
  }

  async function ensureFolder(serverRelativeLibraryUrl, folderName) {
    const folderUrl = `${serverRelativeLibraryUrl}/${folderName}`;
    try {
      await request(`web/GetFolderByServerRelativeUrl('${escapeOData(folderUrl)}')?$select=ServerRelativeUrl`);
    } catch (error) {
      if (!/does not exist|cannot be found|404/i.test(error.message)) throw error;
      await request("web/folders", {
        method: "POST",
        body: { __metadata: { type: "SP.Folder" }, ServerRelativeUrl: folderUrl }
      });
      log(`Created folder ${folderUrl}`);
    }
  }

  async function provision() {
    console.group("NITDA Flow Truth Registry provisioning");
    try {
      log(`Target site: ${CONFIG.siteUrl}`);
      await acquireDigest();

      const current = await ensureList(CONFIG.currentList, CONFIG.currentDescription, LIST_TEMPLATE);
      const history = await ensureList(CONFIG.historyList, CONFIG.historyDescription, LIST_TEMPLATE);
      const artefacts = await ensureList(CONFIG.artefactLibrary, CONFIG.artefactDescription, LIBRARY_TEMPLATE);

      for (const [title, fields] of [
        [CONFIG.currentList, commonFields()],
        [CONFIG.historyList, commonFields()],
        [CONFIG.artefactLibrary, artefactFields()]
      ]) {
        const existing = await listFields(title);
        for (const field of fields) await ensureField(title, field, existing);
      }

      await configureTitle(CONFIG.currentList, "Flow Record");
      await configureTitle(CONFIG.historyList, "Run Record");

      await enforceField(CONFIG.currentList, "RegistryKey", { Indexed: true, EnforceUniqueValues: true, Required: true });
      await enforceField(CONFIG.historyList, "HistoryKey", { Indexed: true, EnforceUniqueValues: true, Required: true });
      await enforceField(CONFIG.artefactLibrary, "HistoryKey", { Indexed: true, Required: true });

      for (const listTitle of [CONFIG.currentList, CONFIG.historyList, CONFIG.artefactLibrary]) {
        for (const fieldName of ["EnvironmentId", "FlowId", "RunId", "CapturedUtc", "RunStatus"]) {
          try { await enforceField(listTitle, fieldName, { Indexed: true }); } catch (error) { log(`Index warning for ${listTitle}.${fieldName}: ${error.message}`); }
        }
      }

      await ensureView(CONFIG.currentList, "Current Flow Truth", ["Title", "EnvironmentName", "FlowDisplayName", "LifecycleStatus", "RunStatus", "Criticality", "RequiresOwnerReview", "CapturedUtc", "CurrentArtefactUrl"], "<OrderBy><FieldRef Name='CapturedUtc' Ascending='FALSE'/></OrderBy>");
      await ensureView(CONFIG.currentList, "Review Required", ["Title", "EnvironmentName", "FlowDisplayName", "TechnicalOwner", "SystemName", "Criticality", "CapturedUtc"], "<Where><Eq><FieldRef Name='RequiresOwnerReview'/><Value Type='Integer'>1</Value></Eq></Where><OrderBy><FieldRef Name='CapturedUtc' Ascending='FALSE'/></OrderBy>");
      await ensureView(CONFIG.historyList, "Run History", ["Title", "EnvironmentName", "FlowDisplayName", "RunId", "RunStatus", "DurationMilliseconds", "CapturedUtc", "HistoryArtefactUrl"], "<OrderBy><FieldRef Name='CapturedUtc' Ascending='FALSE'/></OrderBy>", 200);
      await ensureView(CONFIG.historyList, "Failed Runs", ["Title", "EnvironmentName", "FlowDisplayName", "RunId", "RunStatus", "CapturedUtc", "LastErrorJson"], "<Where><Or><Eq><FieldRef Name='RunStatus'/><Value Type='Choice'>Failed</Value></Eq><Eq><FieldRef Name='RunStatus'/><Value Type='Choice'>TimedOut</Value></Eq></Or></Where><OrderBy><FieldRef Name='CapturedUtc' Ascending='FALSE'/></OrderBy>", 200);
      await ensureView(CONFIG.artefactLibrary, "Artefacts by Run", ["DocIcon", "LinkFilename", "ArtefactType", "EnvironmentId", "FlowId", "RunId", "ContentSizeBytes", "ContentSha256", "PersistedUtc"], "<OrderBy><FieldRef Name='PersistedUtc' Ascending='FALSE'/></OrderBy>", 200);

      await ensureFolder(artefacts.RootFolder.ServerRelativeUrl, "current");
      await ensureFolder(artefacts.RootFolder.ServerRelativeUrl, "history");
      await ensureFolder(artefacts.RootFolder.ServerRelativeUrl, "failed");

      const result = {
        succeeded: true,
        siteUrl: CONFIG.siteUrl,
        currentList: `${CONFIG.siteUrl}/Lists/${encodeURIComponent(CONFIG.currentList)}`,
        historyList: `${CONFIG.siteUrl}/Lists/${encodeURIComponent(CONFIG.historyList)}`,
        artefactLibrary: `${CONFIG.siteUrl}/${artefacts.RootFolder.ServerRelativeUrl.split("/").pop()}`,
        names: {
          current: CONFIG.currentList,
          history: CONFIG.historyList,
          artefacts: CONFIG.artefactLibrary
        },
        keys: {
          registryKey: "EnvironmentId|FlowId",
          historyKey: "EnvironmentId|FlowId|RunId"
        },
        completedUtc: new Date().toISOString()
      };
      log("Provisioning completed successfully", result);
      console.table(result.names);
      window.NITDA_FLOW_TRUTH_PROVISIONING_RESULT = result;
      return result;
    } catch (error) {
      console.error("[NITDA Flow Truth] Provisioning failed", error);
      window.NITDA_FLOW_TRUTH_PROVISIONING_RESULT = { succeeded: false, error: error.message, failedUtc: new Date().toISOString() };
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  provision();
})();
