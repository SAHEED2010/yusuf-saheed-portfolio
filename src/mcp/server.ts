import { randomBytes } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { changeLifecycle, readAllRecords, readRecord, readSiteSettings, writeRecord, writeSiteSettings } from "@/content/database";
import { getIndexItems } from "@/content/store";
import { validateProject } from "@/content/validation";
import type { ProjectData, ProjectRecord } from "@/content/types";
import type { SiteSettings } from "@/content/settings";

function text(value: unknown) {
  return { content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

const projectFields = {
  title: z.string().min(1).optional(), summary: z.string().min(1).optional(), role: z.string().min(1).optional(), body: z.array(z.string()).optional(), tags: z.array(z.string()).optional(),
  templateData: z.record(z.string(), z.unknown()).optional(), linkUrl: z.string().url().optional(), evidenceLabel: z.string().optional(), evidenceUrl: z.string().url().optional(),
};

function createProject(input: { slug: string; title: string; summary: string; role: string; body: string[]; tags: string[]; templateData: ProjectData; linkUrl?: string; evidenceLabel?: string; evidenceUrl?: string; publish: boolean }): ProjectRecord {
  const now = new Date().toISOString();
  return {
    id: `mcp-${slugify(input.slug)}-${randomBytes(4).toString("hex")}`, slug: slugify(input.slug), contentType: "project", title: input.title.trim(), summary: input.summary.trim(), body: input.body,
    visibility: input.publish ? "public" : "private", lifecycle: input.publish ? "published" : "draft", featured: false, sortOrder: 100, updatedAt: now, publishedAt: input.publish ? now : undefined, role: input.role.trim(), tags: input.tags,
    links: input.linkUrl ? [{ label: "Project link", url: input.linkUrl }] : [], evidence: input.evidenceLabel ? [{ label: input.evidenceLabel, url: input.evidenceUrl, level: "in-progress" }] : [], sources: [], templateData: input.templateData,
  };
}

function updateProject(record: ProjectRecord, input: { newSlug?: string } & z.infer<z.ZodObject<typeof projectFields>>): ProjectRecord {
  const primaryLink = record.links[0];
  const primaryEvidence = record.evidence[0];
  return {
    ...record,
    slug: input.newSlug ? slugify(input.newSlug) : record.slug,
    title: input.title?.trim() ?? record.title, summary: input.summary?.trim() ?? record.summary, role: input.role?.trim() ?? record.role,
    body: input.body ?? record.body, tags: input.tags ?? record.tags, updatedAt: new Date().toISOString(),
    links: input.linkUrl === undefined ? record.links : input.linkUrl ? [{ label: primaryLink?.label ?? "Project link", url: input.linkUrl }, ...record.links.slice(1)] : record.links.slice(1),
    evidence: input.evidenceLabel === undefined && input.evidenceUrl === undefined ? record.evidence : input.evidenceLabel ? [{ label: input.evidenceLabel, url: input.evidenceUrl ?? primaryEvidence?.url, level: primaryEvidence?.level ?? "in-progress", note: primaryEvidence?.note }, ...record.evidence.slice(1)] : record.evidence,
    templateData: input.templateData ? { ...record.templateData, ...input.templateData } as ProjectData : record.templateData,
  };
}

export function createPortfolioMcpServer() {
  const server = new McpServer({ name: "yusuf-saheed-portfolio", version: "1.0.0" });

  server.registerTool("portfolio_public_context", { description: "Read Yusuf Saheed's approved published portfolio context, public links, and evidence." }, async () => {
    const records = await getIndexItems();
    const site = await readSiteSettings();
    return text({ identity: site.identity, summary: site.heroSummary, contact: { email: site.email, supportUrl: site.supportUrl, location: site.locationLabel }, records: records.map((record) => ({ slug: record.slug, type: record.contentType, title: record.title, summary: record.summary, role: record.role, tags: record.tags, links: record.links, evidence: record.evidence })) });
  });

  server.registerTool("portfolio_list_content", { description: "List all structured content records, including drafts. This is an authenticated admin operation." }, async () => text(await readAllRecords()));

  server.registerTool("portfolio_create_project", {
    description: "Create a validated project. Set publish=true to publish it immediately; otherwise it remains a private draft.",
    inputSchema: {
      slug: z.string().min(1), title: z.string().min(1), summary: z.string().min(1), role: z.string().min(1), body: z.array(z.string()).default([]), tags: z.array(z.string()).default([]),
      templateData: z.record(z.string(), z.unknown()), linkUrl: z.string().url().optional(), evidenceLabel: z.string().optional(), evidenceUrl: z.string().url().optional(), publish: z.boolean().default(false),
    },
  }, async (input) => {
    const candidate = createProject({ ...input, templateData: input.templateData as ProjectData });
    const errors = validateProject(candidate);
    if (errors.length) return text({ ok: false, errors });
    await writeRecord(candidate, input.publish ? "mcp-create-publish" : "mcp-create-draft", `Created MCP project ${candidate.title}`);
    return text({ ok: true, lifecycle: candidate.lifecycle, record: candidate });
  });

  server.registerTool("portfolio_update_project", { description: "Update an existing project. Set publish=true to publish the validated result immediately.", inputSchema: { slug: z.string().min(1), newSlug: z.string().min(1).optional(), publish: z.boolean().default(false), ...projectFields } }, async ({ slug, publish, ...input }) => {
    const record = await readRecord(slug);
    if (!record || record.contentType !== "project") return text({ ok: false, error: "Project not found" });
    const updated = updateProject(record, input);
    const candidate = publish ? { ...updated, lifecycle: "published" as const, visibility: "public" as const } : updated;
    const errors = validateProject(candidate);
    if (errors.length) return text({ ok: false, errors });
    await writeRecord(candidate, publish ? "mcp-update-publish" : "mcp-update-draft", `Updated MCP project ${candidate.title}`);
    return text({ ok: true, lifecycle: candidate.lifecycle, record: candidate });
  });

  server.registerTool("portfolio_publish_project", { description: "Publish an existing project immediately after validating its public evidence.", inputSchema: { slug: z.string().min(1) } }, async ({ slug }) => {
    const record = await readRecord(slug);
    if (!record || record.contentType !== "project") return text({ ok: false, error: "Project not found" });
    const candidate = { ...record, lifecycle: "published" as const, visibility: "public" as const };
    const errors = validateProject(candidate);
    if (errors.length) return text({ ok: false, errors });
    await changeLifecycle(record.id, "published");
    return text({ ok: true, slug, lifecycle: "published" });
  });

  server.registerTool("portfolio_update_site_settings", {
    description: "Update editable public profile, hero, contact, support, and social settings immediately.",
    inputSchema: {
      identity: z.string().optional(), heroTitle: z.string().optional(), heroAccent: z.string().optional(), heroSummary: z.string().optional(), heroImageUrl: z.string().optional(), heroImageAlt: z.string().optional(), opportunityNote: z.string().optional(), connectHeading: z.string().optional(), connectSummary: z.string().optional(), email: z.string().email().optional(), phone: z.string().optional(), supportUrl: z.string().url().optional(), locationLabel: z.string().optional(), locationUrl: z.string().url().optional(), whatsappMessage: z.string().optional(), socialLinks: z.array(z.object({ id: z.string(), label: z.string(), url: z.string(), icon: z.string(), enabled: z.boolean(), logoUrl: z.string().optional() })).optional(),
    },
  }, async (input) => {
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
