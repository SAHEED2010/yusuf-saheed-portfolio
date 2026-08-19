import { mkdirSync } from "node:fs";
import path from "node:path";
import { createClient, type Client, type Row } from "@libsql/client";
import { library, projects } from "./seed";
import { defaultSiteSettings, type SiteSettings } from "./settings";
import type { AnyContentRecord, Lifecycle } from "./types";

declare global {
  var __portfolioDatabase: Client | undefined;
  var __portfolioDatabasePromise: Promise<Client> | undefined;
}

function databaseConfig() {
  const provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase() === "turso" ? "turso" : "sqlite";
  if (provider === "turso") {
    const url = process.env.TURSO_DATABASE_URL?.trim();
    const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
    if (!url || !authToken) throw new Error("DATABASE_PROVIDER=turso requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN");
    return { url, authToken };
  }
  const file = process.env.PORTFOLIO_DATABASE_PATH ?? path.join(process.cwd(), ".data", "portfolio.sqlite");
  mkdirSync(path.dirname(file), { recursive: true });
  return { url: file.startsWith("file:") ? file : `file:${file}`, timeout: 5000 };
}

function serialize(record: AnyContentRecord) {
  return {
    id: record.id,
    slug: record.slug,
    content_type: record.contentType,
    title: record.title,
    summary: record.summary,
    body_json: JSON.stringify(record.body),
    visibility: record.visibility,
    lifecycle: record.lifecycle,
    featured: record.featured ? 1 : 0,
    sort_order: record.sortOrder,
    published_at: record.publishedAt ?? null,
    updated_at: record.updatedAt,
    role: record.role ?? null,
    tags_json: JSON.stringify(record.tags),
    links_json: JSON.stringify(record.links),
    evidence_json: JSON.stringify(record.evidence),
    sources_json: JSON.stringify(record.sources),
    template_data_json: record.contentType === "project" ? JSON.stringify(record.templateData) : null,
  };
}

function hydrate(row: Row): AnyContentRecord {
  const base = {
    id: String(row.id), slug: String(row.slug), contentType: row.content_type as AnyContentRecord["contentType"],
    title: String(row.title), summary: String(row.summary), body: JSON.parse(String(row.body_json)),
    visibility: row.visibility as AnyContentRecord["visibility"], lifecycle: row.lifecycle as AnyContentRecord["lifecycle"],
    featured: Boolean(row.featured), sortOrder: Number(row.sort_order), publishedAt: row.published_at ? String(row.published_at) : undefined,
    updatedAt: String(row.updated_at), role: row.role ? String(row.role) : undefined, tags: JSON.parse(String(row.tags_json)),
    links: JSON.parse(String(row.links_json)), evidence: JSON.parse(String(row.evidence_json)), sources: JSON.parse(String(row.sources_json)),
  };
  if (base.contentType === "project") return { ...base, contentType: "project", templateData: JSON.parse(String(row.template_data_json)) };
  return base as AnyContentRecord;
}

async function initialize(db: Client) {
  await db.execute("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)");
  const applied = new Set((await db.execute("SELECT version FROM schema_migrations")).rows.map((row) => Number(row.version)));
  if (!applied.has(1)) {
    await db.migrate([
      "CREATE TABLE IF NOT EXISTS content_records (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, content_type TEXT NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, body_json TEXT NOT NULL, visibility TEXT NOT NULL, lifecycle TEXT NOT NULL, featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, published_at TEXT, updated_at TEXT NOT NULL, role TEXT, tags_json TEXT NOT NULL, links_json TEXT NOT NULL, evidence_json TEXT NOT NULL, sources_json TEXT NOT NULL, template_data_json TEXT)",
      "CREATE TABLE IF NOT EXISTS audit_entries (id INTEGER PRIMARY KEY AUTOINCREMENT, record_id TEXT NOT NULL, action TEXT NOT NULL, summary TEXT NOT NULL, created_at TEXT NOT NULL)",
      "CREATE TABLE IF NOT EXISTS site_settings (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, updated_at TEXT NOT NULL)",
      "CREATE TABLE IF NOT EXISTS integration_snapshots (key TEXT PRIMARY KEY, value_json TEXT NOT NULL, refreshed_at TEXT NOT NULL)",
      "CREATE TABLE IF NOT EXISTS rate_limit_buckets (key TEXT PRIMARY KEY, count INTEGER NOT NULL, started_at INTEGER NOT NULL)",
      { sql: "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)", args: [1, new Date().toISOString()] },
    ]);
  }
  const count = Number((await db.execute("SELECT COUNT(*) AS count FROM content_records")).rows[0]?.count ?? 0);
  if (count === 0) {
    await db.batch([...projects, ...library].map((record) => ({ sql: `INSERT INTO content_records (id, slug, content_type, title, summary, body_json, visibility, lifecycle, featured, sort_order, published_at, updated_at, role, tags_json, links_json, evidence_json, sources_json, template_data_json) VALUES (:id, :slug, :content_type, :title, :summary, :body_json, :visibility, :lifecycle, :featured, :sort_order, :published_at, :updated_at, :role, :tags_json, :links_json, :evidence_json, :sources_json, :template_data_json)`, args: serialize(record) })));
  }
  if (!(await db.execute("SELECT key FROM site_settings WHERE key = 'site'")).rows.length) {
    await db.execute({ sql: "INSERT INTO site_settings (key, value_json, updated_at) VALUES ('site', ?, ?)", args: [JSON.stringify(defaultSiteSettings), defaultSiteSettings.updatedAt] });
  }
  return db;
}

export function getDatabase(): Promise<Client> {
  if (globalThis.__portfolioDatabase) return Promise.resolve(globalThis.__portfolioDatabase);
  globalThis.__portfolioDatabasePromise ??= initialize(createClient(databaseConfig())).then((db) => { globalThis.__portfolioDatabase = db; return db; });
  return globalThis.__portfolioDatabasePromise;
}

export function closeDatabase() {
  globalThis.__portfolioDatabase?.close();
  globalThis.__portfolioDatabase = undefined;
  globalThis.__portfolioDatabasePromise = undefined;
}

export async function readSiteSettings(): Promise<SiteSettings> {
  const row = (await (await getDatabase()).execute("SELECT value_json FROM site_settings WHERE key = 'site'")).rows[0];
  if (!row?.value_json) return defaultSiteSettings;
  try { const parsed = JSON.parse(String(row.value_json)) as Partial<SiteSettings>; return { ...defaultSiteSettings, ...parsed, socialLinks: parsed.socialLinks ?? defaultSiteSettings.socialLinks }; } catch { return defaultSiteSettings; }
}

export async function writeSiteSettings(settings: SiteSettings, summary: string) {
  const db = await getDatabase(); const updatedAt = new Date().toISOString(); const next = { ...settings, updatedAt };
  await db.batch([{ sql: "INSERT INTO site_settings (key, value_json, updated_at) VALUES ('site', ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, updated_at = ?", args: [JSON.stringify(next), updatedAt, JSON.stringify(next), updatedAt] }, { sql: "INSERT INTO audit_entries (record_id, action, summary, created_at) VALUES (?, ?, ?, ?)", args: ["site-settings", "update", summary, updatedAt] }], "write");
}

export async function readIntegrationSnapshot<T>(key: string): Promise<{ value: T; refreshedAt: string } | undefined> {
  const row = (await (await getDatabase()).execute({ sql: "SELECT value_json, refreshed_at FROM integration_snapshots WHERE key = ?", args: [key] })).rows[0];
  if (!row?.value_json || !row.refreshed_at) return undefined;
  try { return { value: JSON.parse(String(row.value_json)) as T, refreshedAt: String(row.refreshed_at) }; } catch { return undefined; }
}

export async function writeIntegrationSnapshot<T>(key: string, value: T, refreshedAt = new Date().toISOString()) {
  await (await getDatabase()).execute({ sql: "INSERT INTO integration_snapshots (key, value_json, refreshed_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, refreshed_at = ?", args: [key, JSON.stringify(value), refreshedAt, JSON.stringify(value), refreshedAt] });
}

export async function consumeRateLimit(key: string, maximum: number, windowMs: number) {
  const db = await getDatabase(); const now = Date.now();
  const result = await db.execute({
    sql: `INSERT INTO rate_limit_buckets (key, count, started_at) VALUES (?, 1, ?)
      ON CONFLICT(key) DO UPDATE SET
        count = CASE WHEN ? - started_at >= ? OR ? < started_at THEN 1 WHEN count <= ? THEN count + 1 ELSE count END,
        started_at = CASE WHEN ? - started_at >= ? OR ? < started_at THEN ? ELSE started_at END
      RETURNING count, started_at`,
    args: [key, now, now, windowMs, now, maximum, now, windowMs, now, now],
  });
  const count = Number(result.rows[0]?.count ?? maximum + 1);
  const startedAt = Number(result.rows[0]?.started_at ?? now);
  const allowed = count <= maximum;
  return { allowed, remaining: allowed ? maximum - count : 0, retryAfterSeconds: allowed ? 0 : Math.max(1, Math.ceil((windowMs - (now - startedAt)) / 1000)) };
}

export async function readAllRecords() { return (await (await getDatabase()).execute("SELECT * FROM content_records ORDER BY sort_order ASC, title ASC")).rows.map(hydrate); }
export async function readRecord(slug: string) { const row = (await (await getDatabase()).execute({ sql: "SELECT * FROM content_records WHERE slug = ?", args: [slug] })).rows[0]; return row ? hydrate(row) : undefined; }

export async function writeRecord(record: AnyContentRecord, action: string, summary: string) {
  const db = await getDatabase(); const values = serialize(record); const updatedAt = new Date().toISOString();
  await db.batch([{ sql: `INSERT INTO content_records (id, slug, content_type, title, summary, body_json, visibility, lifecycle, featured, sort_order, published_at, updated_at, role, tags_json, links_json, evidence_json, sources_json, template_data_json) VALUES (:id, :slug, :content_type, :title, :summary, :body_json, :visibility, :lifecycle, :featured, :sort_order, :published_at, :updated_at, :role, :tags_json, :links_json, :evidence_json, :sources_json, :template_data_json) ON CONFLICT(id) DO UPDATE SET slug=:slug, content_type=:content_type, title=:title, summary=:summary, body_json=:body_json, visibility=:visibility, lifecycle=:lifecycle, featured=:featured, sort_order=:sort_order, published_at=:published_at, updated_at=:updated_at, role=:role, tags_json=:tags_json, links_json=:links_json, evidence_json=:evidence_json, sources_json=:sources_json, template_data_json=:template_data_json`, args: values }, { sql: "INSERT INTO audit_entries (record_id, action, summary, created_at) VALUES (?, ?, ?, ?)", args: [record.id, action, summary, updatedAt] }], "write");
}

export async function changeLifecycle(id: string, lifecycle: Lifecycle) {
  const db = await getDatabase(); const now = new Date().toISOString(); const publishedAt = lifecycle === "published" ? now : null;
  await db.batch([{ sql: "UPDATE content_records SET lifecycle = ?, visibility = ?, published_at = ?, updated_at = ? WHERE id = ?", args: [lifecycle, lifecycle === "published" ? "public" : lifecycle === "review" ? "preview" : "private", publishedAt, now, id] }, { sql: "INSERT INTO audit_entries (record_id, action, summary, created_at) VALUES (?, ?, ?, ?)", args: [id, lifecycle, `Lifecycle changed to ${lifecycle}`, now] }], "write");
}
