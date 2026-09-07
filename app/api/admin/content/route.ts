import { NextResponse } from "next/server";
import { changeLifecycle, readAllRecords, writeRecord } from "@/content/database";
import { isAdminSession, isSameOrigin } from "@/admin/auth";
import { validateContent } from "@/content/validation";
import type { AnyContentRecord, ContentType, ProjectData, ProjectRecord } from "@/content/types";

export const runtime = "nodejs";

function redirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function listValue(form: FormData, name: string) {
  return String(form.get(name) ?? "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
}

function parseTemplateData(form: FormData, existing?: ProjectRecord): ProjectData {
  const raw = String(form.get("templateData") ?? "").trim();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as ProjectData;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Validation below reports the unsupported template instead of throwing.
    }
  }
  return existing?.templateData ?? {
    template: "product-system",
    problem: String(form.get("problem") ?? "").trim(),
    audience: String(form.get("audience") ?? "").trim(),
    contribution: String(form.get("contribution") ?? "").trim(),
    decisions: listValue(form, "decisions"),
    status: String(form.get("status") ?? "Draft").trim(),
    nextImprovement: String(form.get("nextImprovement") ?? "").trim(),
  };
}

function buildRecord(form: FormData, existing?: AnyContentRecord): AnyContentRecord {
  const rawContentType = String(form.get("contentType") ?? existing?.contentType ?? "project");
  const allowedTypes: ContentType[] = ["project", "tutorial", "research", "question", "resource", "achievement"];
  const contentType = (allowedTypes.includes(rawContentType as ContentType) ? rawContentType : "tutorial") as ContentType;
  const now = new Date().toISOString();
  const linkUrl = String(form.get("linkUrl") ?? "").trim();
  const evidenceLabel = String(form.get("evidenceLabel") ?? "").trim();
  const evidenceUrl = String(form.get("evidenceUrl") ?? "").trim();
  const links = [...(linkUrl ? [{ label: String(form.get("linkLabel") ?? "Primary link").trim() || "Primary link", url: linkUrl }] : []), ...(existing?.links.slice(1) ?? [])];
  const evidence = [...(evidenceLabel ? [{ label: evidenceLabel, url: evidenceUrl || undefined, level: String(form.get("evidenceLevel") ?? "in-progress") as "verified" | "self-reported" | "in-progress", note: String(form.get("evidenceNote") ?? "").trim() || undefined }] : []), ...(existing?.evidence.slice(1) ?? [])];
  const base = {
    id: existing?.id ?? `content-${crypto.randomUUID()}`,
    slug: slugify(String(form.get("slug") ?? existing?.slug ?? "")),
    contentType,
    recordKind: String(form.get("recordKind") ?? existing?.recordKind ?? "entry") === "collection" ? "collection" as const : "entry" as const,
    title: String(form.get("title") ?? existing?.title ?? "").trim(),
    summary: String(form.get("summary") ?? existing?.summary ?? "").trim(),
    body: listValue(form, "body"),
    visibility: existing?.visibility ?? "private" as const,
    lifecycle: existing?.lifecycle ?? "draft" as const,
    featured: form.get("featured") === "on",
    sortOrder: Number(form.get("sortOrder") ?? existing?.sortOrder ?? 10),
    publishedAt: existing?.publishedAt,
    updatedAt: now,
    role: String(form.get("role") ?? existing?.role ?? "").trim() || undefined,
    tags: String(form.get("tags") ?? existing?.tags.join(", ") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    links,
    evidence,
    sources: existing?.sources ?? [],
  };
  if (contentType === "project") return { ...base, contentType: "project", templateData: parseTemplateData(form, existing?.contentType === "project" ? existing : undefined) };
  return base as AnyContentRecord;
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
    if (action === "publish") {
      const errors = validateContent({ ...existing, lifecycle: "published", visibility: "public" });
      if (errors.length > 0) return redirect(request, `/admin/content?error=${encodeURIComponent(errors[0])}`);
    }
    await changeLifecycle(existing.id, action === "publish" ? "published" : action === "archive" ? "archived" : "draft");
    return redirect(request, "/admin/content?saved=1");
  }
  const candidate = buildRecord(form, existing);
  const errors = validateContent(candidate);
  if (errors.length > 0) return redirect(request, `/admin/content?error=${encodeURIComponent(errors[0])}`);
  await writeRecord(candidate, existing ? "update" : "create", existing ? `Updated ${candidate.title}` : `Created ${candidate.title}`);
  return redirect(request, "/admin/content?saved=1");
}
