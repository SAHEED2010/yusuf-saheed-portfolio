import { readAllRecords, readRecord } from "./database";
import { validateProject } from "./validation";
import type { AnyContentRecord, ContentType, PreviewItem, ProjectRecord } from "./types";

function isPublished(item: AnyContentRecord) {
  return item.visibility === "public" && item.lifecycle === "published";
}

export async function getPublished(slug: string): Promise<AnyContentRecord | undefined> {
  const item = await readRecord(slug);
  return item && isPublished(item) ? item : undefined;
}

export async function getIndexItems(type?: ContentType): Promise<AnyContentRecord[]> {
  return (await readAllRecords()).filter((item) => isPublished(item) && (!type || item.contentType === type)).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAdminItems() {
  return await readAllRecords();
}

export function getPreview(item: AnyContentRecord, _placement: "homepage" | "index"): PreviewItem {
  const base = { slug: item.slug, title: item.title, summary: item.summary, role: item.role, tags: item.tags, evidence: item.evidence.slice(0, 1), links: item.links };
  return item.contentType === "project" ? { ...base, template: item.templateData.template } : base;
}

export function getCaseStudy(item: ProjectRecord): ProjectRecord {
  const errors = validateProject(item);
  if (errors.length > 0) throw new Error(`Invalid project ${item.slug}: ${errors.join(", ")}`);
  return item;
}
