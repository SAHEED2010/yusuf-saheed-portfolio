import type { LibraryRecord, ProjectRecord } from "./types";

export const projects: ProjectRecord[] = [
  {
    id: "project-atlas", slug: "atlas", contentType: "project", title: "Atlas",
    summary: "A human-approved data change intelligence agent that traces schema impact, ranks downstream risk, and prepares execution steps.",
    body: ["Atlas explores a safer interface for data change decisions: make lineage and risk legible before a human approves an execution step."],
    visibility: "public", lifecycle: "published", featured: true, sortOrder: 1,
    publishedAt: "2026-08-18", updatedAt: "2026-08-18", role: "AI systems and product engineering",
    tags: ["AI agents", "data systems", "risk evidence"],
    links: [{ label: "Repository", url: "https://github.com/coded-devs/Atlas" }, { label: "Live demo", url: "https://atlas-fivetran.streamlit.app/" }],
    evidence: [{ label: "31 visible commits attributed to SAHEED2010", url: "https://github.com/coded-devs/Atlas/commits/main", level: "verified", note: "The demo uses curated in-memory fixtures rather than live Fivetran credentials." }],
    sources: [{ label: "GitHub repository", url: "https://github.com/coded-devs/Atlas", kind: "github" }],
    templateData: { template: "product-system", problem: "Schema changes can create invisible downstream risk.", audience: "Teams working with data pipelines and dependent assets.", contribution: "AI system design, deterministic risk evidence, and the human approval flow.", decisions: ["Keep risk scoring deterministic", "Expose evidence before action", "Separate preparation from approval"], status: "Hackathon demo with a public Streamlit interface", nextImprovement: "Replace curated fixtures with an approved authenticated source adapter." }
  },
  {
    id: "project-twizrr", slug: "twizrr", contentType: "project", title: "Twizrr",
    summary: "A Nigerian social-commerce marketplace concept connecting shoppers and store owners through practical discovery and buyer-protection flows.",
    body: ["Twizrr is a flagship product candidate. The public record is intentionally conservative until Yusuf confirms the current product status and his exact contribution narrative."],
    visibility: "public", lifecycle: "published", featured: false, sortOrder: 2,
    publishedAt: "2026-08-18", updatedAt: "2026-08-18", role: "Contribution details pending editorial confirmation",
    tags: ["product development", "marketplaces", "TypeScript"],
    links: [{ label: "Repository", url: "https://github.com/SAHEED2010/Twizrr-Mvp" }],
    evidence: [{ label: "Public repository", url: "https://github.com/SAHEED2010/Twizrr-Mvp", level: "verified", note: "Adoption, revenue, and production claims are intentionally omitted." }],
    sources: [{ label: "GitHub repository", url: "https://github.com/SAHEED2010/Twizrr-Mvp", kind: "github" }],
    templateData: { template: "product-system", problem: "Store discovery and buyer confidence are fragmented.", audience: "Nigerian shoppers and independent store owners.", contribution: "Pending Yusuf's confirmed contribution narrative.", decisions: ["Keep the product record evidence-led"], status: "Public repository; current product status to be confirmed", nextImprovement: "Add a current walkthrough and contribution breakdown." }
  }
];

export const library: LibraryRecord[] = [
  { id: "library-tutorials", slug: "tutorials", contentType: "tutorial", title: "Tutorials", summary: "Practical walkthroughs for building software and learning technical ideas.", body: [], visibility: "public", lifecycle: "published", featured: true, sortOrder: 1, updatedAt: "2026-08-18", tags: ["learning", "engineering"], links: [], evidence: [], sources: [{ label: "Dashboard content", url: "/admin/content", kind: "dashboard" }] },
  { id: "library-research", slug: "research-publications", contentType: "research", title: "Research & Publications", summary: "Structured investigations, papers, and sourced explorations with clear uncertainty.", body: [], visibility: "public", lifecycle: "published", featured: true, sortOrder: 2, updatedAt: "2026-08-18", tags: ["research", "science"], links: [], evidence: [], sources: [{ label: "Dashboard content", url: "/admin/content", kind: "dashboard" }] },
  { id: "library-questions", slug: "tough-questions", contentType: "question", title: "Tough Questions", summary: "Mathematical and scientific questions worth examining carefully.", body: [], visibility: "public", lifecycle: "published", featured: true, sortOrder: 3, updatedAt: "2026-08-18", tags: ["mathematics", "science"], links: [], evidence: [], sources: [{ label: "Dashboard content", url: "/admin/content", kind: "dashboard" }] }
];
