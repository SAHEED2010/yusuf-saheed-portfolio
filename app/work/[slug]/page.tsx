import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaseStudy, getPublished } from "@/content/store";
import { breadcrumbSchema, jsonLd, projectSchema } from "@/lib/structured-data";
import type { ProjectData } from "@/content/types";

function ProjectDetails({ data }: { data: ProjectData }) {
  switch (data.template) {
    case "product-system": return <><p><strong>Problem:</strong> {data.problem}</p><p><strong>Audience:</strong> {data.audience}</p><p><strong>Contribution:</strong> {data.contribution}</p><p><strong>Status:</strong> {data.status}</p><h3>System decisions</h3><ul>{data.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul><p><strong>Next improvement:</strong> {data.nextImprovement}</p></>;
    case "research-experiment": return <><p><strong>Question:</strong> {data.question}</p><p><strong>Framing:</strong> {data.framing}</p><p><strong>Method:</strong> {data.method}</p><h3>Observations</h3><ul>{data.observations.map((observation) => <li key={observation}>{observation}</li>)}</ul><p><strong>Result:</strong> {data.result}</p><h3>Limitations</h3><ul>{data.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul><h3>Open questions</h3><ul>{data.openQuestions.map((question) => <li key={question}>{question}</li>)}</ul></>;
    case "tool-utility": return <><p><strong>Repeated pain:</strong> {data.repeatedPain}</p><p><strong>Interface:</strong> {data.interface}</p><p><strong>Usage:</strong> {data.usage}</p><p><strong>Implementation:</strong> {data.implementation}</p><p><strong>Verification:</strong> {data.verification}</p></>;
    case "team-startup": return <><p><strong>Mission:</strong> {data.mission}</p><p><strong>Team context:</strong> {data.teamContext}</p><p><strong>Yusuf&apos;s contribution:</strong> {data.contribution}</p><p><strong>Outcome:</strong> {data.outcome}</p><p><strong>Permission:</strong> {data.permission}</p></>;
    case "achievement-milestone": return <><p><strong>Organization:</strong> {data.organization}</p><p><strong>Date:</strong> {data.date}</p><p><strong>Type:</strong> {data.achievementType}</p><p><strong>What is proven:</strong> {data.whatIsProven}</p><p><strong>What remains unproven:</strong> {data.remainsUnproven}</p></>;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublished(slug);
  if (!item || item.contentType !== "project") return { title: "Project not found" };
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/work/${item.slug}` },
    openGraph: { title: `${item.title} | Yusuf Saheed`, description: item.summary, type: "article", url: `/work/${item.slug}` },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getPublished(slug);
  if (!item || item.contentType !== "project") notFound();
  const project = getCaseStudy(item);
  const schema = projectSchema(project);
  const crumbs = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Work", path: "/work" },
    { name: project.title, path: `/work/${project.slug}` },
  ]);
  const data = project.templateData;
  return <article className="detail"><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} /><script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(crumbs)} />
    <p className="eyebrow">{data.template.replaceAll("-", " ")}</p><h1>{project.title}</h1><p className="lede">{project.summary}</p><p className="provenance">{project.role}</p>
    {project.body.map((paragraph) => <p className="body" key={paragraph}>{paragraph}</p>)}
    <section className="detail-section"><h2>What this record says</h2><ProjectDetails data={data} /></section>
    <section className="detail-section"><h2>Evidence and sources</h2>
      {project.evidence.map((evidence) => <p className="provenance" key={evidence.label}><strong>{evidence.label}</strong>{evidence.note ? ` - ${evidence.note}` : ""}{evidence.url ? <> <a href={evidence.url}>Open source</a></> : null}</p>)}
      {project.links.map((link) => <p key={link.url}><a href={link.url}>{link.label} &rarr;</a></p>)}
    </section>
  </article>;
}
