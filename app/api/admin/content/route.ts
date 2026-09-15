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

// Reads the pd_* fields written by src/components/project-template-fields.tsx.
// The template picker there always submits pd_template, so this only falls
// back to the existing record (or a blank product-system) when the form
// field is genuinely missing -- never by guessing at partial input.
function parseTemplateData(form: FormData, existing?: ProjectRecord): ProjectData {
  const field = (name: string) => String(form.get(`pd_${name}`) ?? "").trim();
  const list = (name: string) => listValue(form, `pd_${name}`);
  const template = String(form.get("pd_template") ?? "");

  switch (template) {
    case "product-system":
      return { template: "product-system", problem: field("problem"), audience: field("audience"), contribution: field("contribution"), decisions: list("decisions"), status: field("status") || "Draft", nextImprovement: field("nextImprovement") };
    case "research-experiment":
      return { template: "research-experiment", question: field("question"), framing: field("framing"), method: field("method"), observations: list("observations"), result: field("result"), limitations: list("limitations"), openQuestions: list("openQuestions") };
    case "tool-utility":
      return { template: "tool-utility", repeatedPain: field("repeatedPain"), interface: field("interface"), usage: field("usage"), implementation: field("implementation"), verification: field("verification") };
    case "team-startup":
      return { template: "team-startup", mission: field("mission"), teamContext: field("teamContext"), contribution: field("contribution"), outcome: field("outcome"), permission: field("permission") };
    case "achievement-milestone":
      return { template: "achievement-milestone", organization: field("organization"), date: field("date"), achievementType: field("achievementType"), whatIsProven: field("whatIsProven"), remainsUnproven: field("remainsUnproven") };
    default:
      return existing?.templateData ?? { template: "product-system", problem: "", audience: "", contribution: "", decisions: [], status: "Draft", nextImprovement: "" };
  }
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
