import { siteUrl } from "./site-url";

// Structured data for search engines and answer engines.
//
// Everything here restates facts already published on the site. Nothing is
// asserted in schema that a visitor cannot verify on the page itself — an
// answer engine quoting this should end up saying the same thing the portfolio
// says.

export const personId = () => `${siteUrl()}/#yusuf-saheed`;

const awards = [
  "1st place, Africa's Talking BuildWithAI Pan-African finals (2025)",
  "1st place, Africa's Talking BuildWithAI Lagos (2025)",
  "2nd place, 234 AI Hackathon Lagos (2026)",
  "3rd place, Africa's Talking monthly hackathon Lagos (2025)",
];

export function personSchema(description: string) {
  const base = siteUrl();
  return {
    "@type": "Person",
    "@id": personId(),
    name: "Yusuf Saheed",
    alternateName: "Saheed Yusuf",
    jobTitle: "Software Engineer",
    description,
    url: base,
    image: `${base}/opengraph-image`,
    email: "mailto:yusufsaheed2012@gmail.com",
    telephone: "+2348106249995",
    nationality: { "@type": "Country", name: "Nigeria" },
    address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
    homeLocation: { "@type": "Place", name: "Lagos, Nigeria" },
    worksFor: {
      "@type": "Organization",
      name: "Codedevs Technology Limited",
      description: "A Lagos software company helping African businesses adopt AI.",
    },
    alumniOf: [
      { "@type": "EducationalOrganization", name: "GOMYCODE", description: "Software Development Bootcamp with AI Skills, completed December 2025" },
    ],
    award: awards,
    knowsAbout: [
      "TypeScript",
      "JavaScript",
      "Python",
      "Next.js",
      "React",
      "NestJS",
      "Node.js",
      "PostgreSQL",
      "Redis",
      "AI agents",
      "Large language model function calling",
      "Payment systems",
      "WhatsApp Business API",
      "Social commerce",
      "Offline-first engineering",
    ],
    knowsLanguage: [{ "@type": "Language", name: "English" }],
    seeks: { "@type": "Demand", name: "Software engineering internships, junior engineering roles and freelance contracts" },
    sameAs: [
      "https://github.com/SAHEED2010",
      "https://www.linkedin.com/in/yusuf-saheed123/",
      "https://x.com/yusufsaheed01",
    ],
  };
}

export function websiteSchema(description: string) {
  const base = siteUrl();
  return {
    "@type": "WebSite",
    "@id": `${base}/#website`,
    url: base,
    name: "Yusuf Saheed",
    description,
    inLanguage: "en",
    publisher: { "@id": personId() },
  };
}

export function profilePageSchema(description: string) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema(description),
      personSchema(description),
      {
        "@type": "ProfilePage",
        "@id": `${base}/#profilepage`,
        url: base,
        name: "Yusuf Saheed — Engineering, Science & AI",
        isPartOf: { "@id": `${base}/#website` },
        about: { "@id": personId() },
        mainEntity: { "@id": personId() },
      },
    ],
  };
}

// Answer engines reward direct question-and-answer pairs, and these are the
// questions a recruiter actually asks. Each answer is short enough to be
// quoted whole and matches what the pages say.
export const faq: { question: string; answer: string }[] = [
  {
    question: "Who is Yusuf Saheed?",
    answer:
      "Yusuf Saheed is a software engineer based in Lagos, Nigeria, and cofounder and CTO at Codedevs Technology Limited. He builds production web and AI products — escrow-backed payment flows, commerce over WhatsApp, and AI agents that show their reasoning before they act.",
  },
  {
    question: "What does Yusuf Saheed build?",
    answer:
      "He works across the stack in TypeScript and Python. On Twizrr, a Nigerian social commerce platform, he owns subscription billing, the WhatsApp commerce channel driven by model function calling, and the order escrow and dispute flows. He is also the sole author of Atlas, a data change intelligence agent that traces the downstream impact of a schema change before anyone approves it.",
  },
  {
    question: "What has Yusuf Saheed won?",
    answer:
      "Four hackathon podium finishes: first place at the Africa's Talking BuildWithAI Pan-African finals with Swifta, first place at BuildWithAI Lagos with DialAI, second at the 234 AI Hackathon with WIZZA, and third at an Africa's Talking monthly hackathon with Hardware-OS.",
  },
  {
    question: "What technologies does Yusuf Saheed use?",
    answer:
      "TypeScript, JavaScript and Python; React and Next.js on the front end; Node.js, NestJS and Express on the back end; PostgreSQL, MongoDB and Redis for data; and the Gemini, OpenAI and Claude APIs for AI features, including function calling and agent architecture.",
  },
  {
    question: "Is Yusuf Saheed available for work?",
    answer:
      "Yes. He is open to software engineering internships, junior engineering roles and freelance contracts, and to founders who need a technical partner. He can be reached at yusufsaheed2012@gmail.com.",
  },
];

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${base}${crumb.path}`,
    })),
  };
}

export function projectSchema(project: {
  title: string;
  summary: string;
  slug: string;
  tags: string[];
  links: { label: string; url: string }[];
  publishedAt?: string;
  updatedAt: string;
}) {
  const base = siteUrl();
  const repository = project.links.find((link) => /repositor|github/i.test(link.label))?.url;
  return {
    "@context": "https://schema.org",
    "@type": repository ? "SoftwareSourceCode" : "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: `${base}/work/${project.slug}`,
    ...(repository ? { codeRepository: repository } : {}),
    keywords: project.tags.join(", "),
    programmingLanguage: project.tags.filter((tag) =>
      ["TypeScript", "JavaScript", "Python", "NestJS", "Next.js"].includes(tag),
    ),
    ...(project.publishedAt ? { datePublished: project.publishedAt } : {}),
    dateModified: project.updatedAt,
    author: { "@id": personId() },
  };
}

export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data) };
}
