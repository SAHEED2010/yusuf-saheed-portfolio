import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { library, projects } from "./seed";
import { defaultSiteSettings, type SiteSettings } from "./settings";
import type { AnyContentRecord, Lifecycle } from "./types";

declare global {
    var __portfolioDatabase: DatabaseSync | undefined;
}

function databasePath() {
  return process.env.PORTFOLIO_DATABASE_PATH ?? path.join(process.cwd(), ".data", "portfolio.sqlite");
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

function hydrate(row: Record<string, unknown>): AnyContentRecord {
  const base = {
    id: String(row.id),
    slug: String(row.slug),
    contentType: row.content_type as AnyContentRecord["contentType"],
    title: String(row.title),
    summary: String(row.summary),
    body: JSON.parse(String(row.body_json)),
    visibility: row.visibility as AnyContentRecord["visibility"],
    lifecycle: row.lifecycle as AnyContentRecord["lifecycle"],
    featured: Boolean(row.featured),
    sortOrder: Number(row.sort_order),
    publishedAt: row.published_at ? String(row.published_at) : undefined,
    updatedAt: String(row.updated_at),
    role: row.role ? String(row.role) : undefined,
    tags: JSON.parse(String(row.tags_json)),
    links: JSON.parse(String(row.links_json)),
    evidence: JSON.parse(String(row.evidence_json)),
    sources: JSON.parse(String(row.sources_json)),
  };
  if (base.contentType === "project") {
    return { ...base, contentType: "project", templateData: JSON.parse(String(row.template_data_json)) };
  }
  return base as AnyContentRecord;
}

export function getDatabase() {
  if (globalThis.__portfolioDatabase) return globalThis.__portfolioDatabase;
  const file = databasePath();
  mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS content_records (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      content_type TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      body_json TEXT NOT NULL,
      visibility TEXT NOT NULL,
      lifecycle TEXT NOT NULL,
      featured INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      updated_at TEXT NOT NULL,
      role TEXT,
      tags_json TEXT NOT NULL,
      links_json TEXT NOT NULL,
      evidence_json TEXT NOT NULL,
      sources_json TEXT NOT NULL,
      template_data_json TEXT
    );
    CREATE TABLE IF NOT EXISTS audit_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id TEXT NOT NULL,
      action TEXT NOT NULL,
      summary TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS integration_snapshots (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      refreshed_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rate_limit_buckets (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      started_at INTEGER NOT NULL
    );
  `);
  const countRow = db.prepare("SELECT COUNT(*) AS count FROM content_records").get() as { count?: number } | undefined;
  const count = Number(countRow?.count ?? 0);
  if (count === 0) {
    const insert = db.prepare(`INSERT INTO content_records
      (id, slug, content_type, title, summary, body_json, visibility, lifecycle, featured, sort_order, published_at, updated_at, role, tags_json, links_json, evidence_json, sources_json, template_data_json)
      VALUES (@id, @slug, @content_type, @title, @summary, @body_json, @visibility, @lifecycle, @featured, @sort_order, @published_at, @updated_at, @role, @tags_json, @links_json, @evidence_json, @sources_json, @template_data_json)`);
    for (const record of [...projects, ...library]) insert.run(serialize(record));
  }
  const settings = db.prepare("SELECT key FROM site_settings WHERE key = 'site'").get();
  if (!settings) db.prepare("INSERT INTO site_settings (key, value_json, updated_at) VALUES ('site', ?, ?)").run(JSON.stringify(defaultSiteSettings), defaultSiteSettings.updatedAt);
  globalThis.__portfolioDatabase = db;
  return db;
}

export function readSiteSettings(): SiteSettings {
  const row = getDatabase().prepare("SELECT value_json FROM site_settings WHERE key = 'site'").get() as { value_json?: string } | undefined;
  if (!row?.value_json) return defaultSiteSettings;
  try {
    const parsed = JSON.parse(row.value_json) as Partial<SiteSettings>;
    return { ...defaultSiteSettings, ...parsed, socialLinks: parsed.socialLinks ?? defaultSiteSettings.socialLinks };
  } catch { return defaultSiteSettings; }
}

export function writeSiteSettings(settings: SiteSettings, summary: string) {
  const db = getDatabase();
  const updatedAt = new Date().toISOString();
  const next = { ...settings, updatedAt };
  db.prepare("INSERT INTO site_settings (key, value_json, updated_at) VALUES ('site', ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, updated_at = ?").run(JSON.stringify(next), updatedAt, JSON.stringify(next), updatedAt);
  db.prepare("INSERT INTO audit_entries (record_id, action, summary, created_at) VALUES (?, ?, ?, ?)").run("site-settings", "update", summary, updatedAt);
}

export function readIntegrationSnapshot<T>(key: string): { value: T; refreshedAt: string } | undefined {
  const row = getDatabase().prepare("SELECT value_json, refreshed_at FROM integration_snapshots WHERE key = ?").get(key) as { value_json?: string; refreshed_at?: string } | undefined;
  if (!row?.value_json || !row.refreshed_at) return undefined;
  try { return { value: JSON.parse(row.value_json) as T, refreshedAt: row.refreshed_at }; } catch { return undefined; }
}

export function writeIntegrationSnapshot<T>(key: string, value: T, refreshedAt = new Date().toISOString()) {
  getDatabase().prepare("INSERT INTO integration_snapshots (key, value_json, refreshed_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value_json = ?, refreshed_at = ?")
    .run(key, JSON.stringify(value), refreshedAt, JSON.stringify(value), refreshedAt);
}

export function consumeRateLimit(key: string, maximum: number, windowMs: number) {
  const db = getDatabase();
  const now = Date.now();
  const row = db.prepare("SELECT count, started_at FROM rate_limit_buckets WHERE key = ?").get(key) as { count?: number; started_at?: number } | undefined;
  const count = Number(row?.count ?? 0);
  const startedAt = Number(row?.started_at ?? 0);
  if (!row || now - startedAt >= windowMs || now < startedAt) {
    db.prepare("INSERT INTO rate_limit_buckets (key, count, started_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, started_at = ?").run(key, now, now);
    return { allowed: true, remaining: maximum - 1, retryAfterSeconds: 0 };
  }
  if (count >= maximum) return { allowed: false, remaining: 0, retryAfterSeconds: Math.ceil((windowMs - (now - startedAt)) / 1000) };
  db.prepare("UPDATE rate_limit_buckets SET count = count + 1 WHERE key = ?").run(key);
  return { allowed: true, remaining: maximum - count - 1, retryAfterSeconds: 0 };
}

export function readAllRecords() {
  return getDatabase().prepare("SELECT * FROM content_records ORDER BY sort_order ASC, title ASC").all().map((row) => hydrate(row as Record<string, unknown>));
}

export function readRecord(slug: string) {
  const row = getDatabase().prepare("SELECT * FROM content_records WHERE slug = ?").get(slug);
  return row ? hydrate(row as Record<string, unknown>) : undefined;
}

export function writeRecord(record: AnyContentRecord, action: string, summary: string) {
  const db = getDatabase();
  const values = serialize(record);
  db.prepare(`INSERT INTO content_records
    (id, slug, content_type, title, summary, body_json, visibility, lifecycle, featured, sort_order, published_at, updated_at, role, tags_json, links_json, evidence_json, sources_json, template_data_json)
    VALUES (@id, @slug, @content_type, @title, @summary, @body_json, @visibility, @lifecycle, @featured, @sort_order, @published_at, @updated_at, @role, @tags_json, @links_json, @evidence_json, @sources_json, @template_data_json)
    ON CONFLICT(id) DO UPDATE SET slug=@slug, content_type=@content_type, title=@title, summary=@summary, body_json=@body_json, visibility=@visibility, lifecycle=@lifecycle, featured=@featured, sort_order=@sort_order, published_at=@published_at, updated_at=@updated_at, role=@role, tags_json=@tags_json, links_json=@links_json, evidence_json=@evidence_json, sources_json=@sources_json, template_data_json=@template_data_json`).run(values);
  db.prepare("INSERT INTO audit_entries (record_id, action, summary, created_at) VALUES (?, ?, ?, ?)").run(record.id, action, summary, new Date().toISOString());
}

export function changeLifecycle(id: string, lifecycle: Lifecycle) {
  const db = getDatabase();
  const publishedAt = lifecycle === "published" ? new Date().toISOString() : null;
  db.prepare("UPDATE content_records SET lifecycle = ?, visibility = ?, published_at = ?, updated_at = ? WHERE id = ?")
    .run(lifecycle, lifecycle === "published" ? "public" : lifecycle === "review" ? "preview" : "private", publishedAt, new Date().toISOString(), id);
  db.prepare("INSERT INTO audit_entries (record_id, action, summary, created_at) VALUES (?, ?, ?, ?)").run(id, lifecycle, `Lifecycle changed to ${lifecycle}`, new Date().toISOString());
}
