import { generateText, getAiProviderStatus } from "@/ai/provider";
import { changeLifecycle, readAllRecords, readRecord, readSiteSettings, writeRecord, writeSiteSettings } from "@/content/database";
import { validateProject } from "@/content/validation";
import { createProject, updateProject, type ProjectUpdateInput } from "@/mcp/server";
import type { ProjectData, ProjectRecord } from "@/content/types";
import type { SiteSettings } from "@/content/settings";

type ManagerAction = { action: string; message?: string; slug?: string; publish?: boolean; changes?: Record<string, unknown>; project?: Record<string, unknown> };

function parseAction(raw: string): ManagerAction | undefined {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { const value = JSON.parse(cleaned) as unknown; return value && typeof value === "object" && !Array.isArray(value) ? value as ManagerAction : undefined; } catch { return undefined; }
}

function stringChanges(source: Record<string, unknown> | undefined, keys: string[]) {
  const output: Record<string, string> = {};
  for (const key of keys) if (typeof source?.[key] === "string") output[key] = source[key] as string;
  return output;
}

function isProject(record: Awaited<ReturnType<typeof readRecord>>): record is ProjectRecord { return Boolean(record && record.contentType === "project"); }

export async function runAdminManager(instruction: string) {
  const status = getAiProviderStatus();
  if (!status.configured) return { ok: false, error: "Configure AI_PROVIDER, the provider API key, and a model before using the admin manager." };
  const [records, settings] = await Promise.all([readAllRecords(), readSiteSettings()]);
  const response = await generateText([
    { role: "system", content: `You are the private admin manager for Yusuf Saheed's portfolio. Return exactly one JSON object and no markdown. You may select only these actions: reply, update_site_settings, update_project, create_project, publish_project. Never edit credentials, database configuration, MCP authentication, source code, or private account data. Never invent evidence, achievements, metrics, URLs, or project facts. For publish_project, only use an existing slug. For missing information, return {"action":"reply","message":"..."}. A publish flag means direct publication after server validation. Current settings: ${JSON.stringify(settings)}. Current records: ${JSON.stringify(records.map((record) => ({ id: record.id, slug: record.slug, type: record.contentType, title: record.title, summary: record.summary, lifecycle: record.lifecycle, role: record.role, tags: record.tags, links: record.links, evidence: record.evidence, templateData: record.contentType === "project" ? record.templateData : undefined })))}.` },
    { role: "user", content: instruction.trim().slice(0, 4000) },
  ]);
  if (!response) return { ok: false, error: "The configured AI provider did not return a response." };
  const command = parseAction(response);
  if (!command) return { ok: false, error: "The AI response was not a valid structured admin command.", raw: response };
  if (command.action === "reply") return { ok: true, action: command.action, message: command.message || "No change was applied." };

  if (command.action === "update_site_settings") {
    const changes = stringChanges(command.changes, ["identity", "heroTitle", "heroAccent", "heroSummary", "heroImageUrl", "heroImageAlt", "opportunityNote", "connectHeading", "connectSummary", "email", "phone", "supportUrl", "locationLabel", "locationUrl", "whatsappMessage"]) as Partial<SiteSettings>;
    const next = { ...settings, ...changes };
    if (!next.identity || !next.heroTitle || !next.heroAccent || !next.email || !next.supportUrl) return { ok: false, error: "Identity, hero, email, and support values are required." };
    await writeSiteSettings(next, "Updated public settings through admin manager");
    return { ok: true, action: command.action, settings: await readSiteSettings() };
  }

  if (command.action === "publish_project") {
    if (!command.slug) return { ok: false, error: "A project slug is required." };
    const record = await readRecord(command.slug);
    if (!isProject(record)) return { ok: false, error: "Project not found." };
    const candidate = { ...record, lifecycle: "published" as const, visibility: "public" as const };
    const errors = validateProject(candidate);
    if (errors.length) return { ok: false, error: errors.join("; ") };
    await changeLifecycle(record.id, "published");
    return { ok: true, action: command.action, slug: record.slug, lifecycle: "published" };
  }

  if (command.action === "update_project") {
    if (!command.slug || !command.changes) return { ok: false, error: "A project slug and changes are required." };
    const record = await readRecord(command.slug);
    if (!isProject(record)) return { ok: false, error: "Project not found." };
    const changes: ProjectUpdateInput = { ...stringChanges(command.changes, ["newSlug", "title", "summary", "role", "linkUrl", "evidenceLabel", "evidenceUrl"]), body: Array.isArray(command.changes.body) ? command.changes.body.filter((value): value is string => typeof value === "string") : undefined, tags: Array.isArray(command.changes.tags) ? command.changes.tags.filter((value): value is string => typeof value === "string") : undefined, templateData: command.changes.templateData && typeof command.changes.templateData === "object" ? command.changes.templateData as Record<string, unknown> : undefined };
    const updated = updateProject(record, changes);
    const candidate = command.publish ? { ...updated, lifecycle: "published" as const, visibility: "public" as const } : updated;
    const errors = validateProject(candidate);
    if (errors.length) return { ok: false, error: errors.join("; ") };
    await writeRecord(candidate, command.publish ? "admin-manager-update-publish" : "admin-manager-update", `Updated ${candidate.title} through admin manager`);
    return { ok: true, action: command.action, lifecycle: candidate.lifecycle, record: candidate };
  }

  if (command.action === "create_project" && command.project) {
    const project = command.project;
    if (typeof project.slug !== "string" || typeof project.title !== "string" || typeof project.summary !== "string" || typeof project.role !== "string" || !project.templateData || typeof project.templateData !== "object") return { ok: false, error: "The create command is missing required project fields." };
    const candidate = createProject({ slug: project.slug, title: project.title, summary: project.summary, role: project.role, body: Array.isArray(project.body) ? project.body.filter((value): value is string => typeof value === "string") : [], tags: Array.isArray(project.tags) ? project.tags.filter((value): value is string => typeof value === "string") : [], templateData: project.templateData as ProjectData, linkUrl: typeof project.linkUrl === "string" ? project.linkUrl : undefined, evidenceLabel: typeof project.evidenceLabel === "string" ? project.evidenceLabel : undefined, evidenceUrl: typeof project.evidenceUrl === "string" ? project.evidenceUrl : undefined, publish: Boolean(command.publish) });
    const errors = validateProject(candidate);
    if (errors.length) return { ok: false, error: errors.join("; ") };
    await writeRecord(candidate, command.publish ? "admin-manager-create-publish" : "admin-manager-create", `Created ${candidate.title} through admin manager`);
    return { ok: true, action: command.action, lifecycle: candidate.lifecycle, record: candidate };
  }
  return { ok: false, error: "Unsupported admin command." };
}
