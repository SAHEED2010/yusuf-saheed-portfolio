import { generateText, getAiProviderStatus } from "@/ai/provider";
import { changeLifecycle, readAllRecords, readRecord, readSiteSettings, writeRecord, writeSiteSettings } from "@/content/database";
import { validateContent } from "@/content/validation";
import { contentTypes, createContentRecord, describeChange, updateContentRecord, type ContentMutationInput } from "@/content/mutations";
import type { SiteSettings } from "@/content/settings";

function directPublishAllowed() {
  return process.env.PORTFOLIO_ALLOW_DIRECT_PUBLISH?.trim().toLowerCase() === "true";
}

function settingsMutationAllowed() {
  return process.env.PORTFOLIO_ALLOW_SETTINGS_MUTATION?.trim().toLowerCase() === "true";
}

type ManagerAction = {
  action: string;
  message?: string;
  slug?: string;
  publish?: boolean;
  changes?: Record<string, unknown>;
  record?: Record<string, unknown>;
};

function parseAction(raw: string): ManagerAction | undefined {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try { const value = JSON.parse(cleaned) as unknown; return value && typeof value === "object" && !Array.isArray(value) ? value as ManagerAction : undefined; } catch { return undefined; }
}

function stringChanges(source: Record<string, unknown> | undefined, keys: string[]) {
  const output: Record<string, string> = {};
  for (const key of keys) if (typeof source?.[key] === "string") output[key] = source[key] as string;
  return output;
}

function toStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : undefined;
}

function toLinks(value: unknown): { label: string; url: string }[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({ label: String(item.label ?? "Link"), url: String(item.url ?? "") }))
    .filter((link) => link.url);
}

function toEvidence(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      label: String(item.label ?? "Evidence"),
      url: typeof item.url === "string" ? item.url : undefined,
      level: (["verified", "self-reported", "in-progress"].includes(String(item.level)) ? item.level : "in-progress") as "verified" | "self-reported" | "in-progress",
      note: typeof item.note === "string" ? item.note : undefined,
    }));
}

function toMutationInput(source: Record<string, unknown> | undefined): ContentMutationInput {
  return {
    ...stringChanges(source, ["contentType", "slug", "newSlug", "title", "summary", "role"]),
    recordKind: source?.recordKind === "collection" ? "collection" : source?.recordKind === "entry" ? "entry" : undefined,
    body: toStringArray(source?.body),
    tags: toStringArray(source?.tags),
    links: toLinks(source?.links),
    evidence: toEvidence(source?.evidence),
    templateData: source?.templateData && typeof source.templateData === "object" ? source.templateData as Record<string, unknown> : undefined,
    featured: typeof source?.featured === "boolean" ? source.featured : undefined,
    sortOrder: typeof source?.sortOrder === "number" ? source.sortOrder : undefined,
  };
}

export async function runAdminManager(instruction: string) {
  const status = getAiProviderStatus();
  if (!status.configured) return { ok: false, error: "Configure AI_PROVIDER, the provider API key, and a model before using the admin manager." };
  const [records, settings] = await Promise.all([readAllRecords(), readSiteSettings()]);
  const response = await generateText([
    {
      role: "system",
      content: `You are the private admin manager for Yusuf Saheed's portfolio. Return exactly one JSON object and no markdown.

You may select only these actions: reply, update_site_settings, create_content, update_content, publish_content, archive_content.

Content types you may create or update: ${contentTypes.join(", ")}. "project" additionally carries templateData (product-system, research-experiment, tool-utility, team-startup, or achievement-milestone) — preserve its shape.

Rules:
- Never edit credentials, database configuration, MCP authentication, source code, or private account data.
- Never invent evidence, achievements, metrics, URLs, or facts. If a fact is missing, ask for it via {"action":"reply","message":"..."} instead of guessing.
- For update_content and create_content, "links" and "evidence" — when provided — REPLACE the record's entire list. If you only want to add one item, include it alongside every existing item you were shown, unchanged.
- For publish_content and archive_content, "slug" must reference an existing record.
- Publication confirmation is ${directPublishAllowed() ? "enabled by an explicit server setting" : "disabled by default; prepare a reviewable draft instead"}.

Current settings: ${JSON.stringify(settings)}.
Current records: ${JSON.stringify(records.map((record) => ({ id: record.id, slug: record.slug, type: record.contentType, recordKind: record.recordKind, title: record.title, summary: record.summary, lifecycle: record.lifecycle, role: record.role, tags: record.tags, links: record.links, evidence: record.evidence, templateData: record.contentType === "project" ? record.templateData : undefined })))}.`,
    },
    { role: "user", content: instruction.trim().slice(0, 4000) },
  ]);
  if (!response) return { ok: false, error: "The configured AI provider did not return a response." };
  const command = parseAction(response);
  if (!command) return { ok: false, error: "The AI response was not a valid structured admin command.", raw: response };
  if (command.action === "reply") return { ok: true, action: command.action, message: command.message || "No change was applied." };

  if (command.action === "update_site_settings") {
    if (!settingsMutationAllowed()) return { ok: false, requiresConfirmation: true, error: "Direct settings mutation is disabled. Review the proposed change in Admin / Site settings before applying it." };
    const changes = stringChanges(command.changes, ["name", "identity", "heroTitle", "heroAccent", "heroSummary", "heroImageUrl", "heroImageAlt", "opportunityNote", "connectHeading", "connectSummary", "email", "phone", "supportUrl", "locationLabel", "locationUrl", "whatsappMessage", "footerNote"]) as Partial<SiteSettings>;
    const next = { ...settings, ...changes };
    if (!next.identity || !next.heroTitle || !next.heroAccent || !next.email || !next.supportUrl) return { ok: false, error: "Identity, hero, email, and support values are required." };
    await writeSiteSettings(next, "Updated public settings through admin manager");
    return { ok: true, action: command.action, settings: await readSiteSettings() };
  }

  if (command.action === "publish_content" || command.action === "archive_content") {
    if (!command.slug) return { ok: false, error: "A slug is required." };
    const record = await readRecord(command.slug);
    if (!record) return { ok: false, error: "Record not found." };
    if (command.action === "archive_content") {
      await changeLifecycle(record.id, "archived");
      return { ok: true, action: command.action, slug: record.slug, lifecycle: "archived", summary: `Archived "${record.title}". It is no longer public and can be restored later.` };
    }
    const candidate = { ...record, lifecycle: "published" as const, visibility: "public" as const };
    const errors = validateContent(candidate);
    if (errors.length) return { ok: false, error: errors.join("; ") };
    if (!directPublishAllowed()) return { ok: false, action: command.action, requiresConfirmation: true, message: "Direct publishing is disabled. Review this record in Admin / Content and publish it manually after confirmation.", summary: describeChange(record, candidate) };
    await changeLifecycle(record.id, "published");
    return { ok: true, action: command.action, slug: record.slug, lifecycle: "published", summary: describeChange(record, candidate) };
  }

  if (command.action === "update_content") {
    if (!command.slug || !command.changes) return { ok: false, error: "A slug and changes are required." };
    const record = await readRecord(command.slug);
    if (!record) return { ok: false, error: "Record not found." };
    const updated = updateContentRecord(record, toMutationInput(command.changes));
    const canPublish = Boolean(command.publish && directPublishAllowed());
    const candidate = canPublish ? { ...updated, lifecycle: "published" as const, visibility: "public" as const } : updated;
    const errors = validateContent(candidate);
    if (errors.length) return { ok: false, error: errors.join("; ") };
    await writeRecord(candidate, canPublish ? "admin-manager-update-publish" : "admin-manager-update", `Updated ${candidate.title} through admin manager`);
    return { ok: true, action: command.action, lifecycle: candidate.lifecycle, requiresConfirmation: Boolean(command.publish && !canPublish), record: candidate, summary: describeChange(record, candidate) };
  }

  if (command.action === "create_content" && command.record) {
    const input = command.record;
    if (typeof input.slug !== "string" || typeof input.title !== "string" || typeof input.summary !== "string") return { ok: false, error: "The create command is missing a slug, title, or summary." };
    const canPublish = Boolean(command.publish && directPublishAllowed());
    const candidate = createContentRecord({ ...toMutationInput(input), slug: input.slug, title: input.title, summary: input.summary }, canPublish);
    const errors = validateContent(candidate);
    if (errors.length) return { ok: false, error: errors.join("; ") };
    await writeRecord(candidate, canPublish ? "admin-manager-create-publish" : "admin-manager-create", `Created ${candidate.title} through admin manager`);
    return { ok: true, action: command.action, lifecycle: candidate.lifecycle, requiresConfirmation: Boolean(command.publish && !canPublish), record: candidate, summary: describeChange(undefined, candidate) };
  }
  return { ok: false, error: "Unsupported admin command." };
}
