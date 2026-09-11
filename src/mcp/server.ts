import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { changeLifecycle, readAllRecords, readRecord, readSiteSettings, writeRecord, writeSiteSettings } from "@/content/database";
import { getIndexItems } from "@/content/store";
import { validateContent } from "@/content/validation";
import { contentTypes, createContentRecord, describeChange, updateContentRecord } from "@/content/mutations";
import type { SiteSettings } from "@/content/settings";

function text(value: unknown) {
  return { content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

function directPublishAllowed() {
  return process.env.MCP_ALLOW_DIRECT_PUBLISH?.trim().toLowerCase() === "true";
}

function settingsMutationAllowed() {
  return process.env.MCP_ALLOW_SETTINGS_MUTATION?.trim().toLowerCase() === "true";
}

const linkSchema = z.object({ label: z.string().min(1), url: z.string().url() });
const evidenceSchema = z.object({ label: z.string().min(1), url: z.string().url().optional(), level: z.enum(["verified", "self-reported", "in-progress"]).default("in-progress"), note: z.string().optional() });

// Shared field set for both create and update. Providing links/evidence
// replaces the record's full list, matching the admin assistant's semantics
// (src/content/mutations.ts) rather than only ever touching one item.
const contentFields = {
  title: z.string().min(1).optional(),
  summary: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  body: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  links: z.array(linkSchema).optional(),
  evidence: z.array(evidenceSchema).optional(),
  templateData: z.record(z.string(), z.unknown()).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().optional(),
};

export function createPortfolioMcpServer() {
  const server = new McpServer({ name: "yusuf-saheed-portfolio", version: "1.0.0" });

  server.registerTool("portfolio_public_context", { description: "Read Yusuf Saheed's approved published portfolio context, public links, and evidence." }, async () => {
    const records = await getIndexItems();
    const site = await readSiteSettings();
    return text({ identity: site.identity, summary: site.heroSummary, contact: { email: site.email, supportUrl: site.supportUrl, location: site.locationLabel }, records: records.map((record) => ({ slug: record.slug, type: record.contentType, title: record.title, summary: record.summary, role: record.role, tags: record.tags, links: record.links, evidence: record.evidence })) });
  });

  server.registerTool("portfolio_list_content", { description: "List all structured content records, including drafts. This is an authenticated admin operation." }, async () => text(await readAllRecords()));

  server.registerTool("portfolio_create_content", {
    description: `Create a validated content record of any type (${contentTypes.join(", ")}). Set publish=true to publish it immediately; otherwise it remains a private draft. "project" additionally requires templateData shaped for one of the five project templates.`,
    inputSchema: {
      ...contentFields,
      contentType: z.enum(contentTypes as [string, ...string[]]).default("tutorial"),
      recordKind: z.enum(["entry", "collection"]).default("entry"),
      slug: z.string().min(1),
      title: z.string().min(1),
      summary: z.string().min(1),
      publish: z.boolean().default(false),
    },
  }, async ({ publish, ...input }) => {
    const canPublish = publish && directPublishAllowed();
    const candidate = createContentRecord(input, canPublish);
    const errors = validateContent(candidate);
    if (errors.length) return text({ ok: false, errors });
    await writeRecord(candidate, canPublish ? "mcp-create-publish" : "mcp-create-draft", `Created MCP ${candidate.contentType} ${candidate.title}`);
    return text({ ok: true, lifecycle: candidate.lifecycle, requiresConfirmation: publish && !canPublish, record: candidate, summary: describeChange(undefined, candidate) });
  });

  server.registerTool("portfolio_update_content", {
    description: "Update an existing content record of any type. Set publish=true to publish the validated result immediately. Providing links or evidence replaces the record's entire list.",
    inputSchema: { slug: z.string().min(1), newSlug: z.string().min(1).optional(), publish: z.boolean().default(false), ...contentFields },
  }, async ({ slug, publish, ...input }) => {
    const record = await readRecord(slug);
    if (!record) return text({ ok: false, error: "Record not found" });
    const updated = updateContentRecord(record, input);
    const canPublish = publish && directPublishAllowed();
    const candidate = canPublish ? { ...updated, lifecycle: "published" as const, visibility: "public" as const } : updated;
    const errors = validateContent(candidate);
    if (errors.length) return text({ ok: false, errors });
    await writeRecord(candidate, canPublish ? "mcp-update-publish" : "mcp-update-draft", `Updated MCP ${candidate.contentType} ${candidate.title}`);
    return text({ ok: true, lifecycle: candidate.lifecycle, requiresConfirmation: publish && !canPublish, record: candidate, summary: describeChange(record, candidate) });
  });

  server.registerTool("portfolio_publish_content", { description: "Publish an existing content record immediately after validating it.", inputSchema: { slug: z.string().min(1) } }, async ({ slug }) => {
    const record = await readRecord(slug);
    if (!record) return text({ ok: false, error: "Record not found" });
    if (!directPublishAllowed()) return text({ ok: false, requiresConfirmation: true, error: "Direct publishing is disabled. Review the draft in the admin dashboard and confirm publication there." });
    const candidate = { ...record, lifecycle: "published" as const, visibility: "public" as const };
    const errors = validateContent(candidate);
    if (errors.length) return text({ ok: false, errors });
    await changeLifecycle(record.id, "published");
    return text({ ok: true, slug, lifecycle: "published", summary: describeChange(record, candidate) });
  });

  server.registerTool("portfolio_archive_content", { description: "Archive an existing content record. This never deletes it -- it can be restored later from the admin dashboard.", inputSchema: { slug: z.string().min(1) } }, async ({ slug }) => {
    const record = await readRecord(slug);
    if (!record) return text({ ok: false, error: "Record not found" });
    await changeLifecycle(record.id, "archived");
    return text({ ok: true, slug, lifecycle: "archived", summary: `Archived "${record.title}". It is no longer public and can be restored later.` });
  });

  server.registerTool("portfolio_update_site_settings", {
    description: "Update editable public profile, hero, contact, support, and social settings immediately.",
    inputSchema: {
      name: z.string().optional(), identity: z.string().optional(), heroTitle: z.string().optional(), heroAccent: z.string().optional(), heroSummary: z.string().optional(), heroImageUrl: z.string().optional(), heroImageAlt: z.string().optional(), opportunityNote: z.string().optional(), connectHeading: z.string().optional(), connectSummary: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), supportUrl: z.string().url().optional(), locationLabel: z.string().optional(), locationUrl: z.string().url().optional(), whatsappMessage: z.string().optional(), footerNote: z.string().optional(), navigation: z.array(z.object({ id: z.string(), label: z.string(), href: z.string(), enabled: z.boolean() })).optional(), socialLinks: z.array(z.object({ id: z.string(), label: z.string(), url: z.string(), icon: z.string(), enabled: z.boolean(), logoUrl: z.string().optional() })).optional(),
    },
  }, async (input) => {
    if (!settingsMutationAllowed()) return text({ ok: false, requiresConfirmation: true, error: "Direct settings mutation is disabled. Review the proposed settings change in the admin dashboard before applying it." });
    const current = await readSiteSettings();
    const next = { ...current, ...input, socialLinks: input.socialLinks ?? current.socialLinks } as SiteSettings;
    if (!next.identity || !next.heroTitle || !next.heroAccent || !next.email || !next.supportUrl) return text({ ok: false, error: "Identity, hero, email, and support values are required" });
    await writeSiteSettings(next, "Updated public settings through MCP");
    return text({ ok: true, settings: await readSiteSettings() });
  });

  return server;
}

export function mcpTokenConfigured() { return Boolean(process.env.MCP_SERVER_TOKEN?.trim()); }
export function mcpTokenMatches(value: string | null | undefined) { const expected = process.env.MCP_SERVER_TOKEN?.trim(); return Boolean(expected && value && value === `Bearer ${expected}`); }
