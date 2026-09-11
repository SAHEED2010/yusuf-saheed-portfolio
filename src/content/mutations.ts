import { randomBytes } from "node:crypto";
import type { AnyContentRecord, ContentType, Evidence, ProjectData } from "./types";

// Shared record-mutation logic for every AI-driven or form-driven editor
// (the in-dashboard admin assistant today; the MCP server can adopt the same
// functions later). Centralizing this in one place means "how a content
// record is built or changed" has one definition, rather than the admin
// assistant and MCP server drifting into two slightly different rules for
// the same operation.

export const contentTypes: ContentType[] = ["project", "tutorial", "research", "question", "resource", "achievement"];

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export type ContentMutationInput = {
  contentType?: string;
  recordKind?: "collection" | "entry";
  slug?: string;
  newSlug?: string;
  title?: string;
  summary?: string;
  role?: string;
  body?: string[];
  tags?: string[];
  // Providing links/evidence replaces the record's full list, not just the
  // first entry. The caller (the model, or a form) is always given the
  // record's current complete list in context, so it can return the whole
  // desired list rather than only ever touching one slot.
  links?: { label: string; url: string }[];
  evidence?: Evidence[];
  templateData?: Record<string, unknown>;
  featured?: boolean;
  sortOrder?: number;
};

function normalizedContentType(value: string | undefined, fallback: ContentType): ContentType {
  return value && contentTypes.includes(value as ContentType) ? (value as ContentType) : fallback;
}

export function createContentRecord(input: ContentMutationInput & { slug: string; title: string; summary: string }, publish: boolean): AnyContentRecord {
  const contentType = normalizedContentType(input.contentType, "tutorial");
  const now = new Date().toISOString();
  const base = {
    id: `content-${randomBytes(4).toString("hex")}`,
    slug: slugify(input.slug),
    contentType,
    recordKind: input.recordKind ?? "entry",
    title: input.title.trim(),
    summary: input.summary.trim(),
    body: input.body ?? [],
    visibility: publish ? ("public" as const) : ("private" as const),
    lifecycle: publish ? ("published" as const) : ("draft" as const),
    featured: input.featured ?? false,
    sortOrder: input.sortOrder ?? 100,
    publishedAt: publish ? now : undefined,
    updatedAt: now,
    role: input.role?.trim() || undefined,
    tags: input.tags ?? [],
    links: input.links ?? [],
    evidence: input.evidence ?? [],
    sources: [],
  };
  if (contentType === "project") {
    return { ...base, contentType: "project", templateData: (input.templateData as ProjectData) ?? { template: "product-system", problem: "", audience: "", contribution: "", decisions: [], status: "Draft", nextImprovement: "" } };
  }
  return base as AnyContentRecord;
}

export function updateContentRecord(record: AnyContentRecord, input: ContentMutationInput): AnyContentRecord {
  const base = {
    ...record,
    slug: input.newSlug ? slugify(input.newSlug) : record.slug,
    title: input.title?.trim() ?? record.title,
    summary: input.summary?.trim() ?? record.summary,
    role: input.role !== undefined ? input.role.trim() || undefined : record.role,
    body: input.body ?? record.body,
    tags: input.tags ?? record.tags,
    links: input.links ?? record.links,
    evidence: input.evidence ?? record.evidence,
    featured: input.featured ?? record.featured,
    sortOrder: input.sortOrder ?? record.sortOrder,
    updatedAt: new Date().toISOString(),
  };
  if (record.contentType === "project") {
    return { ...base, contentType: "project", templateData: input.templateData ? ({ ...record.templateData, ...input.templateData } as ProjectData) : record.templateData };
  }
  return base as AnyContentRecord;
}

// A short, human-readable description of what changed, shown to Yusuf before
// he confirms a publish. This is deliberately plain text, not a JSON diff --
// the point is that he can read one sentence and know what he is approving.
export function describeChange(before: AnyContentRecord | undefined, after: AnyContentRecord): string {
  if (!before) return `Create "${after.title}" (${after.contentType}, ${after.lifecycle}).`;
  const changes: string[] = [];
  if (before.title !== after.title) changes.push(`title changed to "${after.title}"`);
  if (before.summary !== after.summary) changes.push("summary updated");
  if (before.role !== after.role) changes.push(`role changed to "${after.role ?? "(none)"}"`);
  if (JSON.stringify(before.body) !== JSON.stringify(after.body)) changes.push("body text updated");
  if (JSON.stringify(before.tags) !== JSON.stringify(after.tags)) changes.push(`tags set to ${after.tags.join(", ") || "(none)"}`);
  if (before.links.length !== after.links.length) changes.push(`links changed from ${before.links.length} to ${after.links.length}`);
  if (before.evidence.length !== after.evidence.length) changes.push(`evidence items changed from ${before.evidence.length} to ${after.evidence.length}`);
  if (before.lifecycle !== after.lifecycle) changes.push(`lifecycle moves from ${before.lifecycle} to ${after.lifecycle}`);
  if (before.slug !== after.slug) changes.push(`slug changes from "${before.slug}" to "${after.slug}"`);
  return changes.length > 0 ? `Update "${after.title}": ${changes.join("; ")}.` : `No visible change to "${after.title}".`;
}
