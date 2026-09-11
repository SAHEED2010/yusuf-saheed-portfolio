import { redirect } from "next/navigation";
import { isAdminSession } from "@/admin/auth";
import { getAdminItems } from "@/content/store";
import { ReleasePanel } from "@/components/release-panel";
import type { AnyContentRecord, Evidence, ProjectRecord } from "@/content/types";

export const dynamic = "force-dynamic";

const types = ["project", "tutorial", "research", "question", "resource", "achievement"] as const;

// One link or evidence item per line, pipe-separated, so any number of them
// can be edited in a plain textarea without client-side add/remove buttons.
// This mirrors the array-replace semantics the admin assistant already uses:
// the full list is always shown and always replaced on save, never a single
// "primary" slot.
function linksToLines(links: { label: string; url: string }[]) {
  return links.map((link) => `${link.label} | ${link.url}`).join("\n");
}

function evidenceToLines(evidence: Evidence[]) {
  return evidence.map((item) => `${item.label} | ${item.url ?? ""} | ${item.level} | ${item.note ?? ""}`).join("\n");
}

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
    <label>
      Links (one per line: label | URL)
      <textarea name="links" defaultValue={record ? linksToLines(record.links) : ""} placeholder="Repository | https://github.com/…" />
    </label>
    <p className="provenance">Saving replaces the entire link list with exactly what is here — remove a line to remove that link.</p>
    <label>
      Evidence (one per line: label | URL | verified/self-reported/in-progress | note)
      <textarea name="evidence" defaultValue={record ? evidenceToLines(record.evidence) : ""} placeholder="31 visible commits | https://github.com/… | verified | Sole author on this repository" />
    </label>
    <p className="provenance">Saving replaces the entire evidence list the same way. Leave the URL or note segment blank if there is none, but keep the pipes: "Label | | verified | ".</p>
    <label>Display order<input name="sortOrder" type="number" min="0" defaultValue={record?.sortOrder ?? 10} /></label>
    <label className="checkbox-label"><input type="checkbox" name="featured" defaultChecked={record?.featured ?? false} /> Feature on homepage</label>
    <div className="actions"><button type="submit">{record ? "Save draft" : "Create draft"}</button>{record && record.lifecycle !== "published" ? <button type="submit" name="action" value="publish">Publish after review</button> : null}{record?.lifecycle === "published" ? <button type="submit" name="action" value="archive">Archive</button> : null}{record?.lifecycle === "archived" ? <button type="submit" name="action" value="restore">Restore draft</button> : null}</div>
    {record && record.lifecycle === "published" && record.recordKind === "entry" ? <ReleasePanel slug={record.slug} /> : null}
  </form>;
}

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; summary?: string }> }) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const query = await searchParams;
  const records = await getAdminItems();
  return <section className="admin-panel"><p className="eyebrow">Admin / Content</p><h1>Structured content workspace</h1><p className="lede">Create and edit projects, library collections, and entries from one validated workflow. Publishing remains an explicit action after review.</p>{query.saved && <p className="form-status" role="status">{query.summary ? decodeURIComponent(query.summary) : "Saved."}</p>}{query.error && <p className="form-status" role="alert">{query.error}</p>}<div className="admin-records"><ContentForm />{records.map((record) => <ContentForm record={record} key={record.id} />)}</div></section>;
}
