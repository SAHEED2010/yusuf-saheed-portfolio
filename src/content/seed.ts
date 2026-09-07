import type { LibraryRecord, ProjectRecord } from "./types";

// Content source of truth.
//
// Every record here is backed by evidence that can be checked: a public
// repository, a live deployment, a commit history, or a named issuing
// organisation. Where a claim cannot be verified from a public source it is
// marked `self-reported` and says so on the page. Nothing in this file
// asserts adoption, revenue, or production scale.

export const projects: ProjectRecord[] = [
  {
    id: "project-twizrr",
    slug: "twizrr",
    contentType: "project",
    recordKind: "entry",
    title: "Twizrr",
    summary:
      "A Nigerian social commerce platform where stores publish to a social feed and every checkout is covered by buyer protection. I own subscription billing, the WhatsApp commerce channel, and the order escrow and dispute flows.",
    body: [
      "Twizrr is Codedevs' flagship product: a social app where discovery and commerce sit in the same feed. Stores publish products and posts, shoppers find them through the feed or over WhatsApp, and checkout runs through an escrow-backed buyer protection flow.",
      "The system is a pnpm and Turborepo monorepo — a NestJS API and a Next.js App Router web app over PostgreSQL 16 with pgvector and Redis, containerised with Docker and reviewed through pull requests with CodeRabbit.",
      "My work concentrates in four areas. StorePass, the paid store subscription: the Nomba billing provider, checkout and webhook state, renewal, reconciliation, entitlement usage tracking, and the Store Mode API and interface. The WhatsApp channel: Gemini function calling, analytics event capture, phone normalisation to E.164, and the reply policy that keeps answers in plain language. Commerce: cart management, checkout handoff, hybrid search, sourced product management, and post CRUD. Orders: buy-now checkout, the escrow confirmation screen, the order tracking timeline, and the direct-order dispute workflow.",
    ],
    visibility: "public",
    lifecycle: "published",
    featured: true,
    sortOrder: 1,
    publishedAt: "2026-02-18",
    updatedAt: "2026-09-08",
    role: "Cofounder and CTO at Codedevs · billing, WhatsApp commerce, orders and disputes",
    tags: ["NestJS", "Next.js", "PostgreSQL", "Redis", "Gemini", "payments", "WhatsApp Business API"],
    links: [{ label: "Codedevs", url: "https://website-codeddevs.vercel.app" }],
    evidence: [
      {
        label: "84 commits attributed to SAHEED2010 across billing, WhatsApp, commerce and orders",
        level: "verified",
        note: "The repository is private, so there is no public link. It holds 1,631 commits from a three-person engineering team; my share is the feature areas listed above, not the whole system.",
      },
      {
        label: "WIZZA, the WhatsApp assistant built on this platform, placed 2nd at the 234 AI Hackathon",
        level: "self-reported",
        note: "Lagos, June 2026.",
      },
    ],
    sources: [{ label: "Codedevs", url: "https://website-codeddevs.vercel.app", kind: "external" }],
    templateData: {
      template: "product-system",
      problem:
        "Nigerian shoppers discover products socially and over WhatsApp, but paying a stranger online requires trust that neither side can establish.",
      audience: "Nigerian shoppers, independent store owners, and creators selling to their own audience.",
      contribution:
        "Subscription billing end to end (Nomba provider, webhooks, renewal, reconciliation, entitlements), the WhatsApp commerce channel including Gemini function calling and analytics, commerce surfaces (cart, checkout handoff, hybrid search, sourced products), and the order escrow, tracking and dispute workflows.",
      decisions: [
        "Hold funds in escrow until delivery is confirmed, so buyer protection is structural rather than a promise",
        "Drive the WhatsApp assistant with function calling against real catalogue data instead of free-form generation",
        "Reconcile subscription state from provider webhooks rather than trusting client-side checkout completion",
        "Normalise every inbound phone number to E.164 before it reaches business logic",
      ],
      status: "In active development. Private repository, deployed to Railway, last pushed September 2026.",
      nextImprovement:
        "A public product walkthrough so the work can be evaluated without repository access.",
    },
  },
  {
    id: "project-atlas",
    slug: "atlas",
    contentType: "project",
    recordKind: "entry",
    title: "Atlas",
    summary:
      "A data change intelligence agent that traces the downstream blast radius of a schema change, ranks the risk deterministically, and holds every destructive action behind a human approval gate.",
    body: [
      "Atlas answers a question data engineers ask before every column drop: what breaks if I do this? It walks a lineage graph from the target column, collects the dependent dbt models, dashboards, ML features and scheduled reports, and reports what each one is worth and who owns it.",
      "The architecture separates judgement from action. A Gemini model interprets the request and calls read-only tools during analysis; write tools are simply not available in that phase. Severity is calculated in Python from tier and ownership signals rather than generated by the model, so the risk badge cannot be hallucinated. Execution happens only after a human approves, and every action is written to a timestamped change log.",
      "The Fivetran tool layer mirrors the official MCP server's tool names and response shapes against an in-memory fixture. That is a deliberate, documented choice: there are no Fivetran credentials behind the demo, and the README says so.",
    ],
    visibility: "public",
    lifecycle: "published",
    featured: true,
    sortOrder: 2,
    publishedAt: "2026-06-10",
    updatedAt: "2026-09-08",
    role: "Sole author — agent architecture, lineage engine, risk ranking and interface",
    tags: ["Python", "Gemini", "AI agents", "function calling", "data lineage", "Streamlit"],
    links: [
      { label: "Repository", url: "https://github.com/coded-devs/Atlas" },
      { label: "Live demo", url: "https://atlas-fivetran.streamlit.app/" },
    ],
    evidence: [
      {
        label: "31 commits — the only contributor to the repository",
        url: "https://github.com/coded-devs/Atlas/commits/main",
        level: "verified",
      },
      {
        label: "Built for the Google Cloud Rapid Agent Hackathon 2026, Fivetran partner track",
        url: "https://github.com/coded-devs/Atlas",
        level: "verified",
        note: "The Fivetran tools run against curated in-memory fixtures rather than live credentials. This is stated in the project README.",
      },
    ],
    sources: [{ label: "GitHub repository", url: "https://github.com/coded-devs/Atlas", kind: "github" }],
    templateData: {
      template: "product-system",
      problem:
        "Dropping or renaming a data column can silently break dashboards, models and reports that nobody remembers depend on it.",
      audience: "Data engineers and analytics teams making schema changes against shared warehouses.",
      contribution:
        "The whole system: the two-phase agent loop, the lineage engine, the deterministic severity ranker, the Fivetran-compatible tool layer, the approval gate and change log, and the Streamlit interface.",
      decisions: [
        "Calculate severity in code, never in the prompt, so the model cannot invent a risk level",
        "Withhold write tools entirely during the analysis phase rather than instructing the model not to use them",
        "Require explicit human approval before any change executes, and log it with a timestamp",
        "Ship a response cache so the demo works when the free model quota is exhausted",
      ],
      status: "Public repository with an MIT licence and a live Streamlit deployment.",
      nextImprovement:
        "A visual lineage graph and rollback for an executed deprecation.",
    },
  },
  {
    id: "project-swifta",
    slug: "swifta",
    contentType: "project",
    recordKind: "entry",
    title: "Swifta",
    summary:
      "A product discovery platform with WhatsApp-based intent capture, built for the Africa's Talking BuildWithAI Pan-African finals — where it placed first against teams from four countries.",
    body: [
      "Swifta grew out of Hardware-OS. The earlier build indexed a narrow category — iron, ceramics, building materials — and the finals version widened it to general commerce while keeping the part that worked: letting someone describe what they want in their own words over WhatsApp instead of navigating a catalogue.",
      "The idea outlived the competition. It became the thinking behind Twizrr, Codedevs' flagship product.",
    ],
    visibility: "public",
    lifecycle: "published",
    featured: true,
    sortOrder: 3,
    publishedAt: "2025-12-01",
    updatedAt: "2026-09-08",
    role: "Team build — product direction and engineering",
    tags: ["AI", "WhatsApp", "product discovery", "hackathon"],
    links: [],
    evidence: [
      {
        label: "1st place, Africa's Talking BuildWithAI Pan-African finals",
        level: "self-reported",
        note: "Competed against teams from four African countries. The competition repository is not public, so this record has no verifying link. Happy to walk through the build on request.",
      },
    ],
    sources: [],
    templateData: {
      template: "product-system",
      problem:
        "Buyers know what they need but not what it is called, which makes catalogue search the wrong interface for them.",
      audience: "Shoppers searching for products across informal and semi-formal African retail.",
      contribution: "Product direction and engineering as part of the competing team.",
      decisions: [
        "Capture intent in natural language over WhatsApp rather than through catalogue navigation",
        "Widen the category scope from the earlier Hardware-OS build while keeping its intent-capture model",
      ],
      status: "Hackathon build. Not maintained as a product; its direction continued into Twizrr.",
      nextImprovement: "None planned — the work carried forward into Twizrr instead.",
    },
  },
  {
    id: "project-dialai",
    slug: "dialai",
    contentType: "project",
    recordKind: "entry",
    title: "DialAI",
    summary:
      "An AI assistant that reaches people over USSD, SMS and voice rather than the internet — health information, translation and practical guidance on a basic phone. First place at Africa's Talking BuildWithAI Lagos.",
    body: [
      "Most AI assistants assume a smartphone and a data plan. DialAI assumes neither. It runs over USSD and SMS so that someone on a feature phone with no internet can still ask a question and get a useful answer.",
      "That constraint drives the design. USSD sessions are short and character-limited, so answers have to be compressed without becoming useless, and the model has to be orchestrated behind a queue that tolerates a telecom protocol rather than an HTTP request.",
    ],
    visibility: "public",
    lifecycle: "published",
    featured: false,
    sortOrder: 4,
    publishedAt: "2025-11-01",
    updatedAt: "2026-09-08",
    role: "Team build at Codedevs",
    tags: ["AI", "USSD", "SMS", "Gemini", "accessibility", "hackathon"],
    links: [{ label: "Repository", url: "https://github.com/coded-devs/dial-ai" }],
    evidence: [
      {
        label: "Public repository under the Codedevs organisation",
        url: "https://github.com/coded-devs/dial-ai",
        level: "verified",
      },
      {
        label: "1st place, Africa's Talking BuildWithAI Lagos",
        level: "self-reported",
        note: "Built as a Codedevs team entry; the commit history is attributed to teammates. The original demo deployment is offline.",
      },
    ],
    sources: [{ label: "GitHub repository", url: "https://github.com/coded-devs/dial-ai", kind: "github" }],
    templateData: {
      template: "product-system",
      problem:
        "AI assistance is unavailable to anyone without a smartphone and a data plan, which is a large share of the people who would benefit most from it.",
      audience: "Feature-phone users in low-connectivity areas needing health information, translation or guidance.",
      contribution: "Team build at Codedevs; the competition entry was a shared effort.",
      decisions: [
        "Target USSD and SMS first so no internet connection is required",
        "Queue model calls behind the telecom session rather than blocking on them",
      ],
      status: "Hackathon build. Public repository; the original demo deployment is offline.",
      nextImprovement: "Redeploy a working demo so the flow can be tried rather than described.",
    },
  },
  {
    id: "project-hardware-os",
    slug: "hardware-os",
    contentType: "project",
    recordKind: "entry",
    title: "Hardware-OS",
    summary:
      "A discovery platform for hardware goods — iron, ceramics, building materials — that took third place at the Africa's Talking monthly hackathon and became the seed of everything after it.",
    body: [
      "Hardware-OS started from a specific observation: the hardware trade in Lagos runs on relationships and physical visits, and the products themselves are hard to search for because buyers describe them by use rather than by name.",
      "It placed third. More usefully, it produced the intent-capture idea that became Swifta, which won the Pan-African finals, which in turn became the thinking behind Twizrr.",
    ],
    visibility: "public",
    lifecycle: "published",
    featured: false,
    sortOrder: 5,
    publishedAt: "2025-10-01",
    updatedAt: "2026-09-08",
    role: "Team build",
    tags: ["product discovery", "commerce", "hackathon"],
    links: [],
    evidence: [
      {
        label: "3rd place, Africa's Talking monthly hackathon, Lagos",
        level: "self-reported",
        note: "The competition repository is not public, so this record has no verifying link.",
      },
    ],
    sources: [],
    templateData: {
      template: "product-system",
      problem: "Hardware buyers describe products by what they need them for, not by the names catalogues index them under.",
      audience: "Buyers and sellers of building materials and hardware goods in Lagos.",
      contribution: "Team build as part of the competing group.",
      decisions: ["Index products by described use rather than by catalogue name"],
      status: "Hackathon build. Not maintained; the idea continued into Swifta and then Twizrr.",
      nextImprovement: "None — superseded by later work.",
    },
  },
];

const collection = (
  id: string,
  slug: string,
  contentType: LibraryRecord["contentType"],
  title: string,
  summary: string,
  sortOrder: number,
  tags: string[],
): LibraryRecord => ({
  id,
  slug,
  contentType,
  recordKind: "collection",
  title,
  summary,
  body: [],
  visibility: "public",
  lifecycle: "published",
  featured: true,
  sortOrder,
  updatedAt: "2026-09-08",
  tags,
  links: [],
  evidence: [],
  sources: [{ label: "Dashboard content", url: "/admin/content", kind: "dashboard" }],
});

const achievement = (
  id: string,
  slug: string,
  title: string,
  summary: string,
  sortOrder: number,
  publishedAt: string,
  tags: string[],
  evidence: LibraryRecord["evidence"],
  body: string[],
  links: LibraryRecord["links"] = [],
): LibraryRecord => ({
  id,
  slug,
  contentType: "achievement",
  recordKind: "entry",
  title,
  summary,
  body,
  visibility: "public",
  lifecycle: "published",
  featured: false,
  sortOrder,
  publishedAt,
  updatedAt: "2026-09-08",
  tags,
  links,
  evidence,
  sources: [],
});

export const library: LibraryRecord[] = [
  collection(
    "library-tutorials",
    "tutorials",
    "tutorial",
    "Tutorials",
    "Practical walkthroughs for building software and learning technical ideas.",
    1,
    ["learning", "engineering"],
  ),
  collection(
    "library-research",
    "research-publications",
    "research",
    "Research & Publications",
    "Structured investigations and sourced explorations, with the uncertainty stated rather than hidden.",
    2,
    ["research", "science"],
  ),
  collection(
    "library-questions",
    "tough-questions",
    "question",
    "Tough Questions",
    "Mathematics and science problems worth sitting with, and the reasoning that gets through them.",
    3,
    ["mathematics", "science"],
  ),
  collection(
    "library-resources",
    "resources",
    "resource",
    "Videos & Resources",
    "Materials that make hard engineering, science and AI topics easier to enter.",
    4,
    ["learning", "resources"],
  ),
  collection(
    "library-achievements",
    "achievements",
    "achievement",
    "Hackathons & Achievements",
    "Competition results and certifications, each recorded with what it does and does not prove.",
    5,
    ["achievements", "evidence"],
  ),

  achievement(
    "achievement-buildwithai-africa",
    "buildwithai-pan-african-finals",
    "1st place — Africa's Talking BuildWithAI, Pan-African finals",
    "First place at the continental finals, competing against teams from four African countries, with Swifta.",
    1,
    "2025-12-01",
    ["hackathon", "AI", "first place"],
    [
      {
        label: "1st place, Pan-African finals",
        level: "self-reported",
        note: "Organised by Africa's Talking. The competition repository is not public, so there is no verifying link here.",
      },
    ],
    [
      "Swifta captured buying intent in natural language over WhatsApp instead of asking people to navigate a catalogue. It won the continental finals against teams from four countries.",
      "What this proves: the ability to take a build from a narrow category to a general one under competition time pressure, and to present it well enough to win. What it does not prove: that Swifta ran at scale — it was a competition build, and it was not maintained afterwards.",
    ],
  ),
  achievement(
    "achievement-buildwithai-lagos",
    "buildwithai-lagos",
    "1st place — Africa's Talking BuildWithAI, Lagos",
    "First place in the Lagos round with DialAI, an AI assistant delivered over USSD and SMS for people without internet access.",
    2,
    "2025-11-01",
    ["hackathon", "AI", "accessibility", "first place"],
    [
      {
        label: "1st place, Lagos round",
        level: "self-reported",
        note: "Organised by Africa's Talking. Built as a Codedevs team entry.",
      },
      {
        label: "Public repository",
        url: "https://github.com/coded-devs/dial-ai",
        level: "verified",
      },
    ],
    [
      "DialAI put a Gemini-backed assistant behind USSD and SMS so that a feature phone with no data plan could still reach it, for health information, translation and practical guidance.",
      "What this proves: designing for a hard delivery constraint rather than the comfortable case. What it does not prove: sustained usage — the original demo deployment is offline.",
    ],
    [{ label: "Repository", url: "https://github.com/coded-devs/dial-ai" }],
  ),
  achievement(
    "achievement-234-ai",
    "234-ai-hackathon",
    "2nd place — 234 AI Hackathon, Lagos",
    "Second place with WIZZA, the WhatsApp shopping assistant that became part of Twizrr.",
    3,
    "2026-06-01",
    ["hackathon", "AI", "WhatsApp", "second place"],
    [
      {
        label: "2nd place, 234 AI Hackathon, Lagos, June 2026",
        level: "self-reported",
        note: "Team sprint. WIZZA is now part of the Twizrr platform, whose repository is private.",
      },
    ],
    [
      "WIZZA answers shopping questions over WhatsApp using live product data with locally-sourced pricing, so the assistant quotes real listings instead of inventing them.",
      "What this proves: shipping a grounded LLM feature quickly under sprint conditions. What it does not prove: independent authorship — this was a team build, and it is now maintained inside Twizrr.",
    ],
  ),
  achievement(
    "achievement-at-monthly",
    "africas-talking-monthly",
    "3rd place — Africa's Talking monthly hackathon, Lagos",
    "Third place with Hardware-OS, the product discovery build that started the line of work leading to Twizrr.",
    4,
    "2025-10-01",
    ["hackathon", "commerce", "third place"],
    [
      {
        label: "3rd place, Africa's Talking monthly hackathon, Lagos",
        level: "self-reported",
        note: "The competition repository is not public.",
      },
    ],
    [
      "Hardware-OS indexed hardware goods by what buyers need them for rather than by catalogue name. It placed third, and its central idea carried into Swifta and then into Twizrr.",
      "What this proves: an idea good enough to survive two rewrites. What it does not prove: a finished product — it was a weekend build.",
    ],
  ),
  achievement(
    "achievement-gomycode",
    "gomycode-bootcamp",
    "GOMYCODE — Software Development Bootcamp with AI Skills",
    "Certificate of completion, graduated 13 December 2025, from a state-approved training centre.",
    5,
    "2025-12-13",
    ["certification", "training"],
    [
      {
        label: "Certificate of completion, GOMYCODE, 13 December 2025",
        level: "verified",
        note: "The certificate is available on request. It is not published here because it carries personal identifying details.",
      },
    ],
    [
      "Structured training in React, Next.js, Node.js, Express, MongoDB, REST API design and project structure, completed December 2025.",
      "What this proves: formal grounding in the web stack. What it does not prove: production experience — that is what the project records are for.",
    ],
  ),
  achievement(
    "achievement-gdg-lagos",
    "gdg-lagos-build-with-ai",
    "Build with AI Lagos 2026 — GDG Lagos",
    "Participant in Google Developer Group Lagos' 24-hour AI buildathon, May 2026.",
    6,
    "2026-05-01",
    ["community", "AI", "participation"],
    [
      {
        label: "Participant, GDG Lagos Build with AI 2026",
        level: "self-reported",
        note: "Participation, not a placement.",
      },
    ],
    [
      "A 24-hour team buildathon run by Google Developer Group Lagos, with mentorship and live product demos.",
      "Recorded as participation rather than a result, because that is what it was.",
    ],
  ),
];
