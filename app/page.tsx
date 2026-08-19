import Link from "next/link";
import { FloatingAssistant } from "@/components/floating-assistant";
import { BrandIcon } from "@/components/brand-icon";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getIndexItems } from "@/content/store";
import { getGithubSnapshot } from "@/integrations/github";
import { getSiteSettings } from "@/lib/site";
import { ProjectVisual } from "@/components/project-visual";
import type { ProjectRecord } from "@/content/types";

export const dynamic = "force-dynamic";

const libraryRows = [
  { slug: "tutorials", code: "LIBRARY / TUTORIALS", title: "Tutorials", summary: "Practical walkthroughs for building software, learning technical ideas and turning scattered materials into a usable path.", status: "Publishing soon" },
  { slug: "research-publications", code: "LIBRARY / RESEARCH", title: "Research & Publications", summary: "Structured investigations, papers and sourced explorations with clear evidence, uncertainty and revision history.", status: "0 verified publications" },
  { slug: "tough-questions", code: "LIBRARY / QUESTIONS", title: "Tough Questions", summary: "Mathematical problems, scientific questions and unfinished lines of thought worth examining carefully.", status: "Draft collection" },
  { slug: "resources", code: "LIBRARY / RESOURCES", title: "Videos & Resources", summary: "Curated explanations and materials that make difficult engineering, science and AI topics easier to enter.", status: "Collection planned" },
  { slug: "achievements", code: "LIBRARY / MILESTONES", title: "Hackathons & Achievements", summary: "Evidence-backed records of competitions, certificates, projects, placements and the lessons behind them.", status: "Proof being prepared" },
];

export default async function HomePage() {
  const [github, records, site] = await Promise.all([getGithubSnapshot(), getIndexItems(), getSiteSettings()]);
  const featuredProject = records.find((item) => item.contentType === "project" && item.featured) ?? records.find((item) => item.contentType === "project");
  const project = featuredProject?.contentType === "project" ? featuredProject as ProjectRecord : undefined;
  const publications = records.filter((item) => item.contentType === "research" && item.id !== "library-research").length;
  const whatsappFallback = `https://wa.me/${site.phone.replace(/\D/g, "")}?text=${encodeURIComponent(site.whatsappMessage)}`;
  const socialLinks = site.socialLinks.filter((link) => link.enabled && (link.url || link.id === "whatsapp"));
  return <>
    <div className="home-shell site-shell">
      <section className="home-hero"><div><p className="home-kicker">{site.identity}</p><h1>{site.heroTitle} <span>{site.heroAccent}</span></h1><p className="home-lede">{site.heroSummary}</p></div><figure className={`home-portrait${site.heroImageUrl ? "" : " hero-image-slot"}`} aria-label={site.heroImageUrl ? site.heroImageAlt : "Hero media slot"}>{site.heroImageUrl ? <img src={site.heroImageUrl} alt={site.heroImageAlt} width="720" height="900" fetchPriority="high" /> : <span className="sr-only">Add a hero image from the admin settings.</span>}</figure></section>
      <section className="home-stats" aria-label="Selected activity statistics"><div className="home-stat"><strong>{github.contributions ?? (github.state === "unavailable" ? "Unavailable" : "Sync pending")}</strong><span>GitHub contributions</span><small>{github.tokenConfigured ? "Server-synced contribution calendar · refreshed hourly" : "Public profile connected · contribution calendar needs a server token"}</small></div><div className="home-stat"><strong>{github.publicRepos ?? (github.state === "unavailable" ? "Unavailable" : "Sync pending")}</strong><span>Public repositories</span><small>{github.state === "stale" ? "Showing the last verified snapshot" : "Server-synced public profile value"}</small></div><div className="home-stat"><strong className="home-stat-word">Sync pending</strong><span>WakaTime activity</span><small>No hours shown until a verified server integration is configured</small></div><div className="home-stat"><strong>{publications}</strong><span>Verified publications</span><small>{publications === 0 ? "First release in preparation" : "Published research records"}</small></div></section>
      <section className="home-connect" aria-label="Contact and social links"><div className="home-connect-copy"><strong>{site.connectHeading}</strong><p>{site.connectSummary}</p><p className="home-opportunity">{site.opportunityNote}</p></div><div className="contact-icons">{socialLinks.map((link) => <a className={link.icon === "buymeacoffee" ? "contact-support" : undefined} href={link.id === "whatsapp" && !link.url ? whatsappFallback : link.url} aria-label={link.label} title={link.label} key={link.id}>{link.logoUrl ? <img src={link.logoUrl} alt="" aria-hidden="true" width="21" height="21" /> : <BrandIcon icon={link.icon} />}</a>)}</div></section>
      <section className="home-section" id="work"><div className="section-heading"><h2>Selected systems and useful work.</h2><p>Claims are connected to repositories, live demonstrations and Yusuf's exact contribution.</p></div>{project ? <article className="featured-project"><ProjectVisual project={project} /><div className="featured-copy"><div><small>FEATURED {project.templateData.template.replaceAll("-", " ").toUpperCase()}</small><h3>{project.title}</h3><p>{project.summary}</p><ul><li>{project.role || "Contribution being documented"}</li>{project.tags.slice(0, 2).map((tag) => <li key={tag}>{tag}</li>)}{project.evidence.length > 0 && <li>{project.evidence.length} evidence item{project.evidence.length === 1 ? "" : "s"} attached</li>}</ul></div><Link href={`/work/${project.slug}`}>Open project evidence →</Link></div></article> : <div className="empty-featured">Feature a published project from the admin dashboard.</div>}</section>
      <section className="home-section" id="library"><div className="section-heading"><h2>A Library for learning in public.</h2><p>Technical guidance, scientific questions and hard-earned lessons sit beside the projects that produced them.</p></div><div className="library-rows">{libraryRows.map((row) => <article className="library-row" key={row.slug}><code>{row.code}</code><div><h3>{row.title}</h3><p>{row.summary}</p></div><span>{row.status}</span></article>)}</div></section>
      <section className="home-impact" id="impact"><h2>Build deeply. Learn openly. Create <span>useful impact.</span></h2><div className="impact-copy"><p>I work with teams, founders and organizations that need thoughtful technology, and I share what I learn for people finding their way into engineering, science and AI.</p><Link href="/contact">Discuss a project or opportunity</Link></div></section>
      <NewsletterSignup />
      <a className="support-float" href={site.supportUrl} aria-label="Support Yusuf's work" title="Support Yusuf's work"><BrandIcon icon="buymeacoffee" size={22} /><span>Support my work</span></a>
    </div><FloatingAssistant />
  </>;
}
