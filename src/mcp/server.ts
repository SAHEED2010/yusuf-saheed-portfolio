import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { changeLifecycle, readAllRecords, readRecord, writeRecord } from "@/content/database";
import { getIndexItems } from "@/content/store";
import { validateProject } from "@/content/validation";
import { getSiteSettings } from "@/lib/site";
import type { ProjectData, ProjectRecord } from "@/content/types";

function text(value: unknown) {
  return { content: [{ type: "text" as const, text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function draftFromInput(input: { slug: string; title: string; summary: string; role: string; body: string[]; tags: string[]; templateData: ProjectData; linkUrl?: string; evidenceLabel?: string; evidenceUrl?: string }): ProjectRecord {
  const now = new Date().toISOString();
  return {
    id: `mcp-${slugify(input.slug)}-${randomBytes(4).toString("hex")}`,
    slug: slugify(input.slug), contentType: "project", title: input.title.trim(), summary: input.summary.trim(), body: input.body,
    visibility: "private", lifecycle: "draft", featured: false, sortOrder: 100, updatedAt: now, role: input.role.trim(), tags: input.tags,
    links: input.linkUrl ? [{ label: "Project link", url: input.linkUrl }] : [],
    evidence: input.evidenceLabel ? [{ label: input.evidenceLabel, url: input.evidenceUrl, level: "in-progress" }] : [], sources: [], templateData: input.templateData,
  };
}

export function createPortfolioMcpServer() {
  const server = new McpServer({ name: "yusuf-saheed-portfolio", version: "1.0.0" });

  server.registerTool("portfolio_public_context", { description: "Read Yusuf Saheed's approved published portfolio context, public links, and evidence." }, async () => {
    const [records, site] = await Promise.all([getIndexItems(), getSiteSettings()]);
    return text({ identity: site.identity, summary: site.heroSummary, contact: { email: site.email, supportUrl: site.supportUrl, location: site.locationLabel }, records: records.map((record) => ({ slug: record.slug, type: record.contentType, title: record.title, summary: record.summary, role: record.role, tags: record.tags, links: record.links, evidence: record.evidence })) });
  });

  server.registerTool("portfolio_list_content", { description: "List all structured content records, including drafts. This is an authenticated admin operation." }, async () => text(await readAllRecords()));

  server.registerTool("portfolio_create_project_draft", {
    description: "Create a validated private project draft. Drafts are never published by this tool.",
    inputSchema: {
      slug: z.string().min(1), title: z.string().min(1), summary: z.string().min(1), role: z.string().min(1), body: z.array(z.string()).default([]), tags: z.array(z.string()).default([]),
      templateData: z.record(z.string(), z.unknown()), linkUrl: z.string().url().optional(), evidenceLabel: z.string().optional(), evidenceUrl: z.string().url().optional(),
    },
  }, async (input) => {
    const candidate = draftFromInput({ ...input, templateData: input.templateData as ProjectData });
    const errors = validateProject(candidate);
    if (errors.length) return text({ ok: false, errors });
    await writeRecord(candidate, "mcp-create-draft", `Created MCP draft ${candidate.title}`);
    return text({ ok: true, lifecycle: candidate.lifecycle, record: candidate });
  });

  server.registerTool("portfolio_request_publish", { description: "Validate a draft for publication and return a short-lived confirmation challenge. A human must provide the configured confirmation phrase to publish." , inputSchema: { slug: z.string().min(1) } }, async ({ slug }) => {
    const record = await readRecord(slug);
    if (!record || record.contentType !== "project") return text({ ok: false, error: "Project not found" });
    const candidate = { ...record, lifecycle: "published" as const, visibility: "public" as const };
    const errors = validateProject(candidate);
    if (errors.length) return text({ ok: false, errors, next: "Add the missing evidence or fields before requesting publication." });
    const payload = Buffer.from(JSON.stringify({ slug, updatedAt: record.updatedAt, expiresAt: Date.now() + 10 * 60 * 1000 })).toString("base64url");
    const challenge = `${payload}.${createHmac("sha256", process.env.MCP_SERVER_TOKEN || "").update(payload).digest("base64url")}`;
    return text({ ok: true, challenge, expiresInSeconds: 600, instruction: "A human must call portfolio_publish_draft with this challenge and the MCP_PUBLISH_CONFIRMATION phrase." });
  });

  server.registerTool("portfolio_publish_draft", { description: "Publish a validated draft only after a human supplies the server-side confirmation phrase.", inputSchema: { slug: z.string().min(1), challenge: z.string().min(1), confirmation: z.string().min(1) } }, async ({ slug, challenge, confirmation }) => {
    const [payload, signature] = challenge.split(".");
    let claims: { slug?: string; updatedAt?: string; expiresAt?: number } = {};
    try { claims = JSON.parse(Buffer.from(payload || "", "base64url").toString("utf8")) as typeof claims; } catch { return text({ ok: false, error: "Publication challenge is malformed" }); }
    const expected = createHmac("sha256", process.env.MCP_SERVER_TOKEN || "").update(payload || "").digest("base64url");
    if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) || claims.slug !== slug || !claims.expiresAt || claims.expiresAt < Date.now()) return text({ ok: false, error: "Publication challenge is missing or expired" });
    if (!process.env.MCP_PUBLISH_CONFIRMATION || confirmation !== process.env.MCP_PUBLISH_CONFIRMATION) return text({ ok: false, error: "Human confirmation phrase did not match" });
    const current = await readRecord(slug);
    if (!current || current.contentType !== "project" || current.updatedAt !== claims.updatedAt) return text({ ok: false, error: "Draft changed after the publication preview; request a new challenge" });
    await changeLifecycle(current.id, "published");
    return text({ ok: true, slug, lifecycle: "published" });
  });

  return server;
}

export function mcpTokenConfigured() {
  return Boolean(process.env.MCP_SERVER_TOKEN?.trim());
}

export function mcpTokenMatches(value: string | null | undefined) {
  const expected = process.env.MCP_SERVER_TOKEN?.trim();
  return Boolean(expected && value && value === `Bearer ${expected}`);
}
