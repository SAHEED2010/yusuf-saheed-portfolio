import type { Metadata } from "next";
import Link from "next/link";
import { getLibraryCollections, getLibraryEntries } from "@/content/store";

export const metadata: Metadata = {
  title: "Library",
  description:
    "Tutorials, research, tough questions and achievement records from Yusuf Saheed — organised by how you want to learn.",
};

export default async function LibraryPage() {
  const collections = (await getLibraryCollections()).filter((item) => item.contentType !== "project");
  const withCounts = await Promise.all(
    collections.map(async (item) => ({ item, count: (await getLibraryEntries(item.contentType)).length })),
  );
  // A collection with nothing in it reads as an abandoned section, so it stays
  // off the index until it has at least one published entry. Adding an entry
  // through the admin dashboard brings the collection back automatically.
  const populated = withCounts.filter(({ count }) => count > 0);

  return (
    <section className="detail">
      <p className="eyebrow">Library</p>
      <h1>Useful ideas, made easier to enter.</h1>
      <p className="lede">
        Split by how you want to learn, rather than by an artificial line between research and writing. Collections
        appear here once they hold published work.
      </p>
      {populated.length === 0 ? (
        <p className="provenance">The first entries are being written. The project records under Work are complete.</p>
      ) : (
        <div className="library-grid">
          {populated.map(({ item, count }) => (
            <article className="library-card" key={item.slug}>
              <p className="meta">{item.contentType}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <p className="provenance">
                {count} published entr{count === 1 ? "y" : "ies"}
              </p>
              <Link href={`/library/${item.contentType}/${item.slug}`}>Open collection &rarr;</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
