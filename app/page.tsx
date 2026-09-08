import Link from "next/link";
import { FloatingAssistant } from "@/components/floating-assistant";
import { BrandIcon } from "@/components/brand-icon";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { GithubPanel } from "@/components/github-panel";
import { getIndexItems } from "@/content/store";
import { getGithubSnapshot } from "@/integrations/github";
import { getWakatimeSnapshot } from "@/integrations/wakatime";
import { getSiteSettings } from "@/lib/site";
import { getAiProviderStatus } from "@/ai/provider";
import { ProjectVisual } from "@/components/project-visual";
import type { ProjectRecord } from "@/content/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [github, wakatime, records, site] = await Promise.all([getGithubSnapshot(), getWakatimeSnapshot(), getIndexItems(), getSiteSettings()]);
  const featuredProject = records.find((item) => item.contentType === "project" && item.featured) ?? records.find((item) => item.contentType === "project");
  const project = featuredProject?.contentType === "project" ? featuredProject as ProjectRecord : undefined;
  const otherProjects = records.filter(
    (item): item is ProjectRecord => item.contentType === "project" && item.slug !== project?.slug,
  );
  const entries = records.filter((item) => item.contentType !== "project" && item.recordKind === "entry");
  // Only surface collections that actually hold published entries — an empty
  // row on the homepage reads as an unfinished site.
  const collections = records.filter(
    (item) =>
      item.contentType !== "project" &&
      item.recordKind === "collection" &&
      entries.some((entry) => entry.contentType === item.contentType),
  );
  const podiums = entries.filter(
    (item) => item.contentType === "achievement" && item.tags.some((tag) => /place$/.test(tag)),
  ).length;

  // The strip under the hero carries portfolio facts. Live GitHub and WakaTime
  // figures have their own panel further down, so they are not repeated here.
  const projectCount = records.filter((item) => item.contentType === "project").length;
  const stats: { value: string; label: string; note: string }[] = [];
  if (podiums > 0) {
    stats.push({
      value: String(podiums),
      label: "Hackathon podiums",
      note: "Including 1st place at the Africa's Talking BuildWithAI Pan-African finals",
    });
  }
  if (projectCount > 0) {
    stats.push({
      value: String(projectCount),
      label: "Documented systems",
      note: "Each with the contribution and evidence stated",
    });
  }
  stats.push({ value: "2025", label: "First commit", note: "Shipping production payment flows by mid-2026" });

  const whatsappFallback = `https://wa.me/${site.phone.replace(/\D/g, "")}?text=${encodeURIComponent(site.whatsappMessage)}`;
  const socialLinks = site.socialLinks.filter((link) => link.enabled && (link.url || link.id === "whatsapp"));
  return <>
    <div className="home-shell site-shell">
      <section className="home-hero"><div><p className="home-kicker">{site.identity}</p><h1>{site.heroTitle} <span>{site.heroAccent}</span></h1><p className="home-lede">{site.heroSummary}</p></div><figure className={`home-portrait${site.heroImageUrl ? "" : " hero-image-slot"}`} aria-label={site.heroImageUrl ? site.heroImageAlt : "Hero media slot"}>{site.heroImageUrl ? <img src={site.heroImageUrl} alt={site.heroImageAlt} width="720" height="900" fetchPriority="high" /> : <span className="sr-only">Add a hero image from the admin settings.</span>}</figure></section>
      {stats.length > 0 && <section className="home-stats" aria-label="Selected activity statistics">{stats.map((stat) => <div className="home-stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span><small>{stat.note}</small></div>)}</section>}
      <section className="home-connect" aria-label="Contact and social links"><div className="home-connect-copy"><strong>{site.connectHeading}</strong><p>{site.connectSummary}</p><p className="home-opportunity">{site.opportunityNote}</p></div><div className="contact-icons">{socialLinks.map((link) => <a className={link.icon === "buymeacoffee" ? "contact-support" : undefined} href={link.id === "whatsapp" && !link.url ? whatsappFallback : link.url} aria-label={link.label} title={link.label} key={link.id}>{link.logoUrl ? <img src={link.logoUrl} alt="" aria-hidden="true" width="21" height="21" /> : <BrandIcon icon={link.icon} />}</a>)}</div></section>
      <section className="home-section" id="work"><div className="section-heading"><h2>Selected systems and useful work.</h2><p>Claims are connected to repositories, live demonstrations and Yusuf&apos;s exact contribution.</p></div>{project ? <article className="featured-project"><ProjectVisual project={project} /><div className="featured-copy"><div><small>FEATURED {project.templateData.template.replaceAll("-", " ").toUpperCase()}</small><h3>{project.title}</h3><p>{project.summary}</p><ul><li>{project.role || "Contribution being documented"}</li>{project.tags.slice(0, 2).map((tag) => <li key={tag}>{tag}</li>)}{project.evidence.length > 0 && <li>{project.evidence.length} evidence item{project.evidence.length === 1 ? "" : "s"} attached</li>}</ul></div><Link href={`/work/${project.slug}`}>Open project evidence →</Link></div></article> : <div className="empty-featured">No featured project is published yet.</div>}{otherProjects.length > 0 && <div className="project-grid home-project-grid">{otherProjects.map((item) => <article className="project-card" key={item.slug}><p className="meta">{item.tags.slice(0, 2).join(" · ")}</p><h3>{item.title}</h3><p>{item.summary}</p><p className="meta">{item.role}</p><Link href={`/work/${item.slug}`}>View case study &rarr;</Link></article>)}</div>}<p className="home-work-more"><Link href="/work">See all {otherProjects.length + (project ? 1 : 0)} projects &rarr;</Link></p></section>
      {collections.length > 0 && <section className="home-section" id="library"><div className="section-heading"><h2>A Library for learning in public.</h2><p>Technical guidance, scientific questions and hard-earned lessons sit beside the projects that produced them.</p></div><div className="library-rows">{collections.map((row) => { const count = entries.filter((entry) => entry.contentType === row.contentType).length; return <Link className="library-row" href={`/library/${row.contentType}/${row.slug}`} key={row.slug}><code>LIBRARY / {row.contentType.toUpperCase()}</code><div><h3>{row.title}</h3><p>{row.summary}</p></div><span>{count} published entr{count === 1 ? "y" : "ies"}</span></Link>; })}</div></section>}
      <GithubPanel github={github} wakatime={wakatime} />
      <section className="home-impact" id="impact"><h2>Build deeply. Learn openly. Create <span>useful impact.</span></h2><div className="impact-copy"><p>I work with teams, founders and organizations that need thoughtful technology, and I share what I learn for people finding their way into engineering, science and AI.</p><Link href="/contact">Discuss a project or opportunity</Link></div></section>
      <NewsletterSignup />
      <a className="support-float" href={site.supportUrl} aria-label="Support Yusuf&apos;s work" title="Support Yusuf&apos;s work"><BrandIcon icon="buymeacoffee" size={22} /><span>Support my work</span></a>
    </div><FloatingAssistant aiLive={getAiProviderStatus().configured} />
  </>;
}
