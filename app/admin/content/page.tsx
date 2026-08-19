import { redirect } from "next/navigation";
import { isAdminSession } from "@/admin/auth";
import { getAdminItems } from "@/content/store";
import type { ProjectRecord } from "@/content/types";

export const dynamic = "force-dynamic";

function ProjectForm({ project }: { project?: ProjectRecord }) {
  const data = project?.templateData.template === "product-system" ? project.templateData : undefined;
  const primaryLink = project?.links[0];
  const primaryEvidence = project?.evidence[0];
  const isNew = !project;

  return <form className="admin-form admin-record" action="/api/admin/content" method="post">
    <div className="admin-record-head"><div><p className="meta">{isNew ? "new draft" : `${project.lifecycle} / ${project.visibility}`}</p><h2>{project?.title || "Add a new system"}</h2></div>{project ? <span className="provenance">{project.updatedAt.slice(0, 10)}</span> : null}</div>
    {project ? <input type="hidden" name="id" value={project.id} /> : null}<input type="hidden" name="action" value="save" />
    <label>Slug<input name="slug" defaultValue={project?.slug ?? ""} placeholder="project-name" required /></label>
    <label>Title<input name="title" defaultValue={project?.title ?? ""} required /></label>
    <label>Summary<textarea name="summary" defaultValue={project?.summary ?? ""} required /></label>
    <label>Your role<input name="role" defaultValue={project?.role ?? ""} required /></label>
    <label>Tags<input name="tags" defaultValue={project?.tags.join(", ") ?? ""} placeholder="AI systems, product engineering" /></label>
    <label>Body paragraphs<textarea name="body" defaultValue={project?.body.join("\n") ?? ""} placeholder="One paragraph per line" /></label>
    <fieldset><legend>Product system template</legend>
      <label>Problem<input name="problem" defaultValue={data?.problem ?? ""} required /></label>
      <label>Audience<input name="audience" defaultValue={data?.audience ?? ""} required /></label>
      <label>Contribution<input name="contribution" defaultValue={data?.contribution ?? ""} required /></label>
      <label>Important decisions<textarea name="decisions" defaultValue={data?.decisions.join("\n") ?? ""} placeholder="One decision per line" /></label>
      <label>Status<input name="status" defaultValue={data?.status ?? "Draft"} required /></label>
      <label>Next improvement<input name="nextImprovement" defaultValue={data?.nextImprovement ?? ""} /></label>
    </fieldset>
    <fieldset><legend>Primary public link</legend>
      <label>Link label<input name="linkLabel" defaultValue={primaryLink?.label ?? ""} placeholder="Repository or live demo" /></label>
      <label>Link URL<input name="linkUrl" type="url" defaultValue={primaryLink?.url ?? ""} placeholder="https://..." /></label>
    </fieldset>
    <fieldset><legend>Primary evidence</legend>
      <label>Evidence label<input name="evidenceLabel" defaultValue={primaryEvidence?.label ?? ""} placeholder="What this source proves" /></label>
      <label>Evidence URL<input name="evidenceUrl" type="url" defaultValue={primaryEvidence?.url ?? ""} placeholder="https://..." /></label>
      <label>Evidence level<select name="evidenceLevel" defaultValue={primaryEvidence?.level ?? "in-progress"}><option value="verified">Verified</option><option value="self-reported">Self-reported</option><option value="in-progress">In progress</option></select></label>
      <label>Evidence note<textarea name="evidenceNote" defaultValue={primaryEvidence?.note ?? ""} /></label>
    </fieldset>
    <label>Homepage order<input name="sortOrder" type="number" min="0" defaultValue={project?.sortOrder ?? 10} /></label>
    <label className="checkbox-label"><input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} /> Feature on homepage</label>
    <div className="actions"><button type="submit">{isNew ? "Create draft" : "Save draft"}</button>{project && project.lifecycle !== "published" ? <button type="submit" name="action" value="publish">Publish</button> : null}{project?.lifecycle === "published" ? <button type="submit" name="action" value="archive">Archive</button> : null}{project?.lifecycle === "archived" ? <button type="submit" name="action" value="restore">Restore draft</button> : null}</div>
  </form>;
}

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string }> }) {
  if (!(await isAdminSession())) redirect("/admin/login");
  const query = await searchParams;
  const projects = (await getAdminItems()).filter((item): item is ProjectRecord => item.contentType === "project");
  return <section className="admin-panel"><p className="eyebrow">Admin / Content</p><h1>Structured content workspace</h1><p className="lede">Create and edit project records through a reusable product-system template. Saves remain drafts until you explicitly publish them.</p>{query.saved && <p className="form-status">Saved.</p>}{query.error && <p className="form-status">{query.error}</p>}<div className="admin-records"><ProjectForm />{projects.map((project) => <ProjectForm project={project} key={project.id} />)}</div></section>;
}
