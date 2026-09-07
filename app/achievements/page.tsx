import type { Metadata } from "next";
import Link from "next/link";
import { getLibraryEntries, getPublished } from "@/content/store";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Hackathon results and certifications for Yusuf Saheed, each recorded with what it proves and what it does not.",
};

export default async function AchievementsPage() {
  const [collection, entries] = await Promise.all([getPublished("achievements"), getLibraryEntries("achievement")]);

  return (
    <section className="detail">
      <p className="eyebrow">Achievements</p>
      <h1>{collection?.title ?? "Hackathons & Achievements"}</h1>
      <p className="lede">
        {collection?.summary ?? "Competition results and certifications, each recorded with what it does and does not prove."}
      </p>
      {entries.length === 0 ? (
        <p className="provenance">No achievement records are published yet.</p>
      ) : (
        <div className="library-grid">
          {entries.map((entry) => (
            <article className="library-card" key={entry.slug}>
              <p className="meta">{(entry.publishedAt ?? entry.updatedAt).slice(0, 7)}</p>
              <h2>{entry.title}</h2>
              <p>{entry.summary}</p>
              {entry.evidence[0] && (
                <p className="provenance">
                  {entry.evidence[0].level === "verified" ? "Verified" : "Self-reported"} · {entry.evidence[0].label}
                </p>
              )}
              <Link href={`/library/achievement/${entry.slug}`}>View evidence &rarr;</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
