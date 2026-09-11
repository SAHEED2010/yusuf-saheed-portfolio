import { NextResponse } from "next/server";
import { changeLifecycle, readAllRecords, writeRecord } from "@/content/database";
import { isAdminSession, isSameOrigin } from "@/admin/auth";
import { validateContent } from "@/content/validation";
import { createContentRecord, describeChange, updateContentRecord, type ContentMutationInput } from "@/content/mutations";
import type { Evidence, ProjectData, ProjectRecord } from "@/content/types";

export const runtime = "nodejs";

function redirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function listValue(form: FormData, name: string) {
  return String(form.get(name) ?? "").split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
}

// "Label | https://…" per line. A line with no pipe is skipped rather than
// guessed at, since a malformed line silently becoming a link with an empty
// URL would fail validation with a confusing error far from its cause.
function parseLinkLines(form: FormData): { label: string; url: string }[] {
  return listValue(form, "links")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts.length >= 2 && parts[1])
    .map(([label, url]) => ({ label: label || "Link", url }));
}

// "Label | URL | level | note" per line. URL and note may be empty, but the
// pipes must stay in place so a later segment isn't mistaken for an earlier
// one — the form's own placeholder text says so.
function parseEvidenceLines(form: FormData): Evidence[] {
  const allowedLevels = ["verified", "self-reported", "in-progress"];
  return listValue(form, "evidence")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => parts[0])
    .map(([label, url, level, note]) => ({
      label,
      url: url || undefined,
      level: (allowedLevels.includes(level) ? level : "in-progress") as Evidence["level"],
      note: note || undefined,
    }));
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
  return existing?.templateData ?? { template: "product-system", problem: "", audience: "", contribution: "", decisions: [], status: "Draft", nextImprovement: "" };
}

function toMutationInput(form: FormData, existing?: ProjectRecord): ContentMutationInput {
  return {
    contentType: String(form.get("contentType") ?? existing?.contentType ?? "tutorial"),
    recordKind: String(form.get("recordKind") ?? existing?.recordKind ?? "entry") === "collection" ? "collection" : "entry",
    slug: String(form.get("slug") ?? "").trim() || undefined,
    title: String(form.get("title") ?? "").trim() || undefined,
    summary: String(form.get("summary") ?? "").trim() || undefined,
    role: String(form.get("role") ?? "").trim() || undefined,
    tags: String(form.get("tags") ?? "").split(",").map((tag) => tag.trim()).filter(Boolean),
    body: listValue(form, "body"),
    links: parseLinkLines(form),
    evidence: parseEvidenceLines(form),
    featured: form.get("featured") === "on",
    sortOrder: Number(form.get("sortOrder") ?? existing?.sortOrder ?? 10),
    templateData: parseTemplateData(form, existing) as unknown as Record<string, unknown>,
  };
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
    const nextLifecycle = action === "publish" ? "published" : action === "archive" ? "archived" : "draft";
    await changeLifecycle(existing.id, nextLifecycle);
    const summary = describeChange(existing, { ...existing, lifecycle: nextLifecycle });
    return redirect(request, `/admin/content?saved=1&summary=${encodeURIComponent(summary)}`);
  }

  const input = toMutationInput(form, existing?.contentType === "project" ? existing : undefined);
  const candidate = existing
    ? updateContentRecord(existing, input)
    : createContentRecord({ ...input, slug: input.slug ?? "", title: input.title ?? "", summary: input.summary ?? "" }, false);
  const errors = validateContent(candidate);
  if (errors.length > 0) return redirect(request, `/admin/content?error=${encodeURIComponent(errors[0])}`);
  await writeRecord(candidate, existing ? "update" : "create", existing ? `Updated ${candidate.title}` : `Created ${candidate.title}`);
  const summary = describeChange(existing, candidate);
  return redirect(request, `/admin/content?saved=1&summary=${encodeURIComponent(summary)}`);
}
