import type { MetadataRoute } from "next";
import { getIndexItems } from "@/content/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> { const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"; const records = await getIndexItems(); return [{ url: `${base}/`, changeFrequency: "weekly", priority: 1 }, ...["/work", "/library", "/about", "/achievements", "/contact", "/assistant", "/privacy"].map((path) => ({ url: `${base}${path}`, changeFrequency: "monthly" as const, priority: 0.6 })), ...records.map((record) => ({ url: `${base}/${record.contentType === "project" ? "work" : "library/" + record.contentType}/${record.slug}`, lastModified: record.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 }))]; }
