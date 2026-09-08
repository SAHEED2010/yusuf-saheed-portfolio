import { redirect } from "next/navigation";
import { isAdminSession } from "@/admin/auth";
import { getAdminItems } from "@/content/store";
import type { AnyContentRecord, ProjectRecord } from "@/content/types";

export const dynamic = "force-dynamic";

const types = ["project", "tutorial", "research", "question", "resource", "achievement"] as const;

function ContentForm({ record }: { record?: AnyContentRecord }) {
  const project = record?.contentType === "project" ? record as ProjectRecord : undefined;
  return <form className="admin-form admin-record" action="/api/admin/content" method="post">
    <div className="admin-record-head"><div><p className="meta">{record ? `${record.lifecycle} / ${record.contentType}` : "new draft"}</p><h2>{record?.title || "Add content"}</h2></div>{record ? <span className="provenance">{record.updatedAt.slice(0, 10)}</span> : null}</div>
    {record ? <input type="hidden" name="id" value={record.id} /> : null}
    <input type="hidden" name="action" value="save" />
    <label>Content type<select name="contentType" defaultValue={record?.contentType ?? "tutorial"}>{types.map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
    <label>Record kind<select name="recordKind" defaultValue={record?.recordKind ?? "entry"}><option value="entry">Entry</option><option value="collection">Collection landing page</option></select></label>
    <label>Slug<input name="slug" defaultValue={record?.slug ?? ""} placeholder="content-slug" required /></label>
    <label>Title<input name="title" defaultValue={record?.title ?? ""} required /></label>
    <label>Summary<textarea name="summary" defaultValue={record?.summary ?? ""} required /></label>
    <label>Role or framing<input name="role" defaultValue={record?.role ?? ""} /></label>
    <label>Tags<input name="tags" defaultValue={record?.tags.join(", ") ?? ""} placeholder="research, learning" /></label>
    <label>Body paragraphs<textarea name="body" defaultValue={record?.body.join("\n") ?? ""} placeholder="One paragraph per line" /></label>
    <label>Project template JSON<textarea name="templateData" defaultValue={project ? JSON.stringify(project.templateData, null, 2) : JSON.stringify({ template: "product-system", problem: "", audience: "", contribution: "", decisions: [], status: "Draft", nextImprovement: "" }, null, 2)} /></label>
    <p className="provenance">Used when content type is project. Choose product systems, research experiments, tools, team/startup work, or achievement milestones. The server validates required fields before publishing.</p>
    <fieldset><legend>Primary public link</legend><label>Link label<input name="linkLabel" defaultValue={record?.links[0]?.label ?? ""} placeholder="Repository or source" /></label><label>Link URL<input name="linkUrl" type="url" defaultValue={record?.links[0]?.url ?? ""} placeholder="https://…" /></label></fieldset>
    <fieldset><legend>Primary evidence</legend><label>Evidence label<input name="evidenceLabel" defaultValue={record?.evidence[0]?.label ?? ""} placeholder="What this source proves" /></label><label>Evidence URL<input name="evidenceUrl" type="url" defaultValue={record?.evidence[0]?.url ?? ""} placeholder="https://…" /></label><label>Evidence level<select name="evidenceLevel" defaultValue={record?.evidence[0]?.level ?? "in-progress"}><option value="verified">Verified</option><option value="self-reported">Self-reported</option><option value="in-progress">In progress</option></select></label><label>Evidence note<textarea name="evidenceNote" defaultValue={record?.evidence[0]?.note ?? ""} /></label></fieldset>
    <label>Display order<input name="sortOrder" type="number" min="0" defaultValue={record?.sortOrder ?? 10} /></label>
    <label className="checkbox-label"><input type="checkbox" name="featured" defaultChecked={record?.featured ?? false} /> Feature on homepage</label>
    <div className="actions"><button type="submit">{record ? "Save draft" : "Create draft"}</button>{record && record.lifecycle !== "published" ? <button type="submit" name="action" value="publish">Publish after review</button> : null}{record?.lifecycle === "published" ? <button type="submit" name="action" value="archive">Archive</button> : null}{record?.lifecycle === "archived" ? <button type="submit" name="action" value="restore">Restore draft</button> : null}</div>
  </form>;
}

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const query = await searchParams;
  const records = await getAdminItems();
  return <section className="admin-panel"><p className="eyebrow">Admin / Content</p><h1>Structured content workspace</h1><p className="lede">Create and edit projects, library collections, and entries from one validated workflow. Publishing remains an explicit action after review.</p>{query.saved && <p className="form-status" role="status">Saved.</p>}{query.error && <p className="form-status" role="alert">{query.error}</p>}<div className="admin-records"><ContentForm />{records.map((record) => <ContentForm record={record} key={record.id} />)}</div></section>;
}
