import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLibraryEntries, getPublished } from "@/content/store";
import type { ContentType } from "@/content/types";

const validTypes = new Set<ContentType>(["tutorial", "research", "question", "resource", "achievement"]);

export async function generateMetadata({ params }: { params: Promise<{ type: string; slug: string }> }): Promise<Metadata> {
  const { type, slug } = await params;
  const record = await getPublished(slug);
  if (!record || record.contentType !== type) return { title: "Not found" };
  return {
    title: record.title,
    description: record.summary,
    alternates: { canonical: `/library/${record.contentType}/${record.slug}` },
    openGraph: { title: `${record.title} | Yusuf Saheed`, description: record.summary, type: "article", url: `/library/${record.contentType}/${record.slug}` },
  };
}

export default async function LibraryCollectionPage({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  if (!validTypes.has(type as ContentType)) notFound();
  const collection = await getPublished(slug);
  if (!collection || collection.contentType !== type) notFound();
  if (collection.recordKind === "entry") return <article className="detail"><p className="eyebrow">Library / {collection.contentType}</p><h1>{collection.title}</h1><p className="lede">{collection.summary}</p>{collection.role ? <p className="provenance">{collection.role}</p> : null}{collection.body.map((paragraph) => <p className="body" key={paragraph}>{paragraph}</p>)}<section className="detail-section"><h2>Sources and links</h2>{collection.evidence.map((evidence) => <p className="provenance" key={evidence.label}><strong>{evidence.label}</strong>{evidence.note ? ` - ${evidence.note}` : ""}{evidence.url ? <> <a href={evidence.url}>Open source</a></> : null}</p>)}{collection.links.map((link) => <p key={link.url}><a href={link.url}>{link.label} &rarr;</a></p>)}</section></article>;
  const entries = await getLibraryEntries(type as ContentType);
  return <article className="detail"><p className="eyebrow">Library / {collection.contentType}</p><h1>{collection.title}</h1><p className="lede">{collection.summary}</p>{collection.body.map((paragraph) => <p className="body" key={paragraph}>{paragraph}</p>)}<section className="detail-section"><h2>Published entries</h2>{entries.length === 0 ? <p className="provenance">No entries have been published in this collection yet.</p> : <div className="library-grid">{entries.map((entry) => <article className="library-card" key={entry.slug}><p className="meta">{entry.updatedAt.slice(0, 10)}</p><h3>{entry.title}</h3><p>{entry.summary}</p><a href={`/library/${entry.contentType}/${entry.slug}`}>Read entry &rarr;</a></article>)}</div>}</section></article>;
}
