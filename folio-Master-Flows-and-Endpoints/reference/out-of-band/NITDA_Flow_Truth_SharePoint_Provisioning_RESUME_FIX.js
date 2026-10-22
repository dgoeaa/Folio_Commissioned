(async () => {
  "use strict";
  const C = {
    siteUrl: (window._spPageContextInfo?.webAbsoluteUrl || location.origin + location.pathname.split("/SitePages/")[0]).replace(/\/$/, ""),
    current: "NITDA Flow Truth Registry",
    history: "NITDA Flow Truth History",
    artefacts: "NITDA Flow Truth Artefacts"
  };
  const H = { Accept: "application/json;odata=verbose", "Content-Type": "application/json;odata=verbose" };
  let digest = "";
  const esc = x => String(x).replace(/'/g, "''");
  const url = p => `${C.siteUrl}/_api/${p.replace(/^\//, "")}`;
  const log = (m, d) => d === undefined ? console.log(`[NITDA Flow Truth] ${m}`) : console.log(`[NITDA Flow Truth] ${m}`, d);
  async function req(path, options = {}) {
    const method = (options.method || "GET").toUpperCase();
    const headers = { ...H, ...(options.headers || {}) };
    if (!/^(GET|HEAD)$/.test(method)) headers["X-RequestDigest"] = digest;
    const r = await fetch(url(path), { method, credentials: "same-origin", headers, body: options.body === undefined ? undefined : JSON.stringify(options.body) });
    const text = await r.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!r.ok) {
      const detail = data?.error?.message?.value || text || `${r.status} ${r.statusText}`;
      throw new Error(`${method} ${path}: ${detail}`);
    }
    return data?.d ?? data;
  }
  async function getDigest() {
    const r = await fetch(url("contextinfo"), { method: "POST", credentials: "same-origin", headers: H });
    if (!r.ok) throw new Error(`Request digest failed: ${r.status} ${r.statusText}`);
    digest = (await r.json()).d.GetContextWebInformation.FormDigestValue;
  }
  async function list(title) {
    return req(`web/lists/GetByTitle('${esc(title)}')?$select=Id,Title,RootFolder/ServerRelativeUrl&$expand=RootFolder`);
  }
  async function fieldNames(title) {
    const x = await req(`web/lists/GetByTitle('${esc(title)}')/fields?$select=InternalName`);
    return new Set((x.results || []).map(f => f.InternalName));
  }
  async function index(title, name, unique = false) {
    const names = await fieldNames(title);
    if (!names.has(name)) { log(`Skipping absent field ${title}.${name}`); return; }
    await req(`web/lists/GetByTitle('${esc(title)}')/fields/GetByInternalNameOrTitle('${esc(name)}')`, {
      method: "POST", headers: { "IF-MATCH": "*", "X-HTTP-Method": "MERGE" },
      body: { __metadata: { type: "SP.Field" }, Indexed: true, EnforceUniqueValues: unique, Required: unique }
    });
    log(`Indexed ${title}.${name}${unique ? " with uniqueness" : ""}`);
  }
  async function ensureView(listTitle, title, fields, query, rowLimit = 100) {
    const views = await req(`web/lists/GetByTitle('${esc(listTitle)}')/views?$select=Id,Title`);
    if ((views.results || []).some(v => v.Title === title)) { log(`Reusing view ${listTitle}.${title}`); return; }
    await req(`web/lists/GetByTitle('${esc(listTitle)}')/views/add`, {
      method: "POST",
      body: { parameters: { __metadata: { type: "SP.ViewCreationInformation" }, Title: title, PersonalView: false, SetAsDefaultView: false, RowLimit: rowLimit, Paged: true, Query: query, ViewFields: { results: fields }, ViewTypeKind: 0 } }
    });
    log(`Created view ${listTitle}.${title}`);
  }
  async function folder(root, name) {
    const relative = `${root}/${name}`;
    try { await req(`web/GetFolderByServerRelativeUrl('${esc(relative)}')?$select=ServerRelativeUrl`); log(`Reusing folder ${relative}`); }
    catch (e) {
      if (!/does not exist|cannot be found|404/i.test(e.message)) throw e;
      await req("web/folders", { method: "POST", body: { __metadata: { type: "SP.Folder" }, ServerRelativeUrl: relative } });
      log(`Created folder ${relative}`);
    }
  }
  console.group("NITDA Flow Truth provisioning resume/fix");
  try {
    await getDigest();
    const current = await list(C.current), history = await list(C.history), artefacts = await list(C.artefacts);
    await index(C.current, "RegistryKey", true);
    await index(C.history, "HistoryKey", true);
    await index(C.artefacts, "HistoryKey");
    for (const [title, fields] of [[C.current,["EnvironmentId","FlowId","RunId","CapturedUtc","RunStatus"]],[C.history,["EnvironmentId","FlowId","RunId","CapturedUtc","RunStatus"]],[C.artefacts,["EnvironmentId","FlowId","RunId","CapturedUtc","ArtefactType"]]]) for (const f of fields) try { await index(title,f); } catch(e) { log(`Index warning ${title}.${f}: ${e.message}`); }
    await ensureView(C.current,"Current Flow Truth",["Title","EnvironmentName","FlowDisplayName","LifecycleStatus","RunStatus","Criticality","RequiresOwnerReview","CapturedUtc","CurrentArtefactUrl"],"<OrderBy><FieldRef Name='CapturedUtc' Ascending='FALSE'/></OrderBy>");
    await ensureView(C.current,"Review Required",["Title","EnvironmentName","FlowDisplayName","TechnicalOwner","SystemName","Criticality","CapturedUtc"],"<Where><Eq><FieldRef Name='RequiresOwnerReview'/><Value Type='Integer'>1</Value></Eq></Where><OrderBy><FieldRef Name='CapturedUtc' Ascending='FALSE'/></OrderBy>");
    await ensureView(C.history,"Run History",["Title","EnvironmentName","FlowDisplayName","RunId","RunStatus","DurationMilliseconds","CapturedUtc","HistoryArtefactUrl"],"<OrderBy><FieldRef Name='CapturedUtc' Ascending='FALSE'/></OrderBy>",200);
    await ensureView(C.history,"Failed Runs",["Title","EnvironmentName","FlowDisplayName","RunId","RunStatus","CapturedUtc","LastErrorJson"],"<Where><Or><Eq><FieldRef Name='RunStatus'/><Value Type='Choice'>Failed</Value></Eq><Eq><FieldRef Name='RunStatus'/><Value Type='Choice'>TimedOut</Value></Eq></Or></Where><OrderBy><FieldRef Name='CapturedUtc' Ascending='FALSE'/></OrderBy>",200);
    await ensureView(C.artefacts,"Artefacts by Run",["DocIcon","LinkFilename","ArtefactType","EnvironmentId","FlowId","RunId","ContentSizeBytes","ContentSha256","PersistedUtc"],"<OrderBy><FieldRef Name='PersistedUtc' Ascending='FALSE'/></OrderBy>",200);
    for (const f of ["current","history","failed"]) await folder(artefacts.RootFolder.ServerRelativeUrl,f);
    const result = { succeeded:true, siteUrl:C.siteUrl, currentList:`${location.origin}${current.RootFolder.ServerRelativeUrl}`, historyList:`${location.origin}${history.RootFolder.ServerRelativeUrl}`, artefactLibrary:`${location.origin}${artefacts.RootFolder.ServerRelativeUrl}`, completedUtc:new Date().toISOString() };
    window.NITDA_FLOW_TRUTH_PROVISIONING_RESULT = result; log("Provisioning completed successfully",result);
  } catch(e) { window.NITDA_FLOW_TRUTH_PROVISIONING_RESULT={succeeded:false,error:e.message,failedUtc:new Date().toISOString()}; console.error("[NITDA Flow Truth] Resume/fix failed",e); throw e; }
  finally { console.groupEnd(); }
})();
