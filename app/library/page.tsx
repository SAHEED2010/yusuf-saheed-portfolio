import Link from "next/link";
import { getIndexItems } from "@/content/store";

export default function LibraryPage() { return <section className="detail"><p className="eyebrow">Library</p><h1>Useful ideas, made easier to enter.</h1><p className="lede">The collection is split by how a visitor wants to learn, not by an artificial choice between research and writing.</p><div className="library-grid">{getIndexItems().filter((item) => item.contentType !== "project").map((item) => <article className="library-card" key={item.slug}><p className="meta">{item.contentType}</p><h3>{item.title}</h3><p>{item.summary}</p><Link href={`/library/${item.contentType}/${item.slug}`}>Open collection →</Link></article>)}</div></section>; }
