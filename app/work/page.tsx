import Link from "next/link";
import { getIndexItems, getPreview } from "@/content/store";

export default async function WorkPage() {
  const items = await getIndexItems("project");
  return <section className="detail">
    <p className="eyebrow">Selected systems</p>
    <h1>Work with evidence attached.</h1>
    <p className="lede">A scan-friendly index of products, experiments, tools, and team work. Each record distinguishes Yusuf&apos;s role from the team&apos;s outcome.</p>
    <div className="project-grid">{items.map((item) => {
      const preview = getPreview(item, "index");
      return <article className="project-card" key={item.slug}>
        <p className="meta">{preview.template?.replaceAll("-", " ")}</p>
        <h3>{preview.title}</h3><p>{preview.summary}</p><p className="meta">{preview.role}</p>
        <Link href={`/work/${preview.slug}`}>View case study &rarr;</Link>
      </article>;
    })}</div>
  </section>;
}
