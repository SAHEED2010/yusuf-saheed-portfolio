import { notFound } from "next/navigation";
import { getPublished } from "@/content/store";

export default async function LibraryItemPage({ params }: { params: Promise<{ type: string; slug: string }> }) { const { slug } = await params; const item = getPublished(slug); if (!item || item.contentType === "project") notFound(); return <article className="detail"><p className="eyebrow">Library / {item.contentType}</p><h1>{item.title}</h1><p className="lede">{item.summary}</p><p className="provenance">This collection is ready for admin-managed entries. Published items will appear here with sources, revision context, and related systems.</p></article>; }
