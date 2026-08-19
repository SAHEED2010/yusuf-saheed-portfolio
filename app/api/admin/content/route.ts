import { NextResponse } from "next/server";
import { changeLifecycle, readAllRecords, writeRecord } from "@/content/database";
import { isAdminSession, isSameOrigin } from "@/admin/auth";
import { validateProject } from "@/content/validation";
import type { ProjectRecord } from "@/content/types";

export const runtime = "nodejs";

function redirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Cross-site request rejected" }, { status: 403 });
  if (!(await isAdminSession())) return redirect(request, "/admin/login?error=session");
  const form = await request.formData();
  const action = String(form.get("action") ?? "save");
  const id = String(form.get("id") ?? "");
  const existing = (await readAllRecords()).find((item) => item.id === id);
  if (action === "publish" || action === "archive" || action === "restore") {
    if (!existing) return redirect(request, "/admin/content?error=missing");
    if (action === "publish" && existing.contentType === "project") {
      const errors = validateProject({ ...existing, lifecycle: "published", visibility: "public" });
      if (errors.length > 0) return redirect(request, `/admin/content?error=${encodeURIComponent(errors[0])}`);
    }
    await changeLifecycle(existing.id, action === "publish" ? "published" : action === "archive" ? "archived" : "draft");
    return redirect(request, "/admin/content?saved=1");
  }
  const now = new Date().toISOString();
  const template = existing?.contentType === "project" && existing.templateData.template === "product-system" ? existing.templateData : { template: "product-system" as const, problem: "", audience: "", contribution: "", decisions: [], status: "Draft", nextImprovement: "" };
  const linkUrl = String(form.get("linkUrl") ?? "").trim();
  const evidenceLabel = String(form.get("evidenceLabel") ?? "").trim();
  const evidenceUrl = String(form.get("evidenceUrl") ?? "").trim();
  const evidenceLevel = String(form.get("evidenceLevel") ?? "in-progress") as "verified" | "self-reported" | "in-progress";
  const candidate: ProjectRecord = {
    id: existing?.id ?? `project-${crypto.randomUUID()}`,
    slug: String(form.get("slug") ?? existing?.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
    contentType: "project",
    title: String(form.get("title") ?? "").trim(),
    summary: String(form.get("summary") ?? "").trim(),
    body: String(form.get("body") ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean),
    visibility: existing?.visibility ?? "private",
    lifecycle: existing?.lifecycle ?? "draft",
    featured: form.get("featured") === "on",
    sortOrder: Number(form.get("sortOrder") ?? existing?.sortOrder ?? 10),
    publishedAt: existing?.publishedAt,
    updatedAt: now,
    role: String(form.get("role") ?? "").trim(),
    tags: String(form.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    links: [...(linkUrl ? [{ label: String(form.get("linkLabel") ?? "Project link").trim() || "Project link", url: linkUrl }] : []), ...(existing?.links.slice(1) ?? [])],
    evidence: [...(evidenceLabel ? [{ label: evidenceLabel, url: evidenceUrl || undefined, level: evidenceLevel, note: String(form.get("evidenceNote") ?? "").trim() || undefined }] : []), ...(existing?.evidence.slice(1) ?? [])],
    sources: existing?.sources ?? [],
    templateData: { ...template, template: "product-system", problem: String(form.get("problem") ?? template.problem).trim(), audience: String(form.get("audience") ?? template.audience).trim(), contribution: String(form.get("contribution") ?? template.contribution).trim(), decisions: String(form.get("decisions") ?? "").split(/\r?\n/).map((decision) => decision.trim()).filter(Boolean), status: String(form.get("status") ?? template.status).trim(), nextImprovement: String(form.get("nextImprovement") ?? template.nextImprovement).trim() },
  };
  const errors = validateProject(candidate);
  if (errors.length > 0) return redirect(request, `/admin/content?error=${encodeURIComponent(errors[0])}`);
  await writeRecord(candidate, existing ? "update" : "create", existing ? `Updated ${candidate.title}` : `Created ${candidate.title}`);
  return redirect(request, "/admin/content?saved=1");
}
