import { getIndexItems } from "@/content/store";
import { getSiteSettings } from "@/lib/site";
import { generateText } from "@/ai/provider";

export type VisitorAnswer = { text: string; links: { label: string; href: string }[]; boundary?: boolean };

const blockedTerms = ["password", "private", "draft", "admin", "login", "publish", "secret", "message"];

function fallbackAnswer(question: string): VisitorAnswer {
  const normalized = question.trim().toLowerCase();
  if (!normalized) return { text: "Ask about Yusuf's published work, research direction, or how to get in touch.", links: [] };
  if (blockedTerms.some((term) => normalized.includes(term))) return { text: "I can only discuss Yusuf's published portfolio and approved public sources. I cannot expose private material, drafts, credentials, or account actions.", links: [], boundary: true };
  if (normalized.includes("atlas")) return { text: "Atlas is a data change intelligence agent: it traces what breaks downstream when a schema column is dropped, ranks the risk in code rather than in the model so the severity cannot be hallucinated, and holds every destructive action behind a human approval gate. Yusuf is the sole contributor — 31 commits, public repository, live Streamlit demo.", links: [{ label: "Open the Atlas case study", href: "/work/atlas" }] };
  if (normalized.includes("twizrr") || normalized.includes("commerce") || normalized.includes("whatsapp")) return { text: "Twizrr is Codedevs' social commerce platform — a NestJS and Next.js monorepo over PostgreSQL and Redis. Yusuf owns subscription billing (the Nomba provider, webhooks, renewal and reconciliation), the WhatsApp commerce channel with Gemini function calling, and the order escrow, tracking and dispute flows. 84 of the repository's 1,631 commits are his; the team has three engineers.", links: [{ label: "Open the Twizrr case study", href: "/work/twizrr" }] };
  if (normalized.includes("won") || normalized.includes("win") || normalized.includes("hackathon") || normalized.includes("award") || normalized.includes("achieve")) return { text: "Four hackathon podiums: 1st at the Africa's Talking BuildWithAI Pan-African finals with Swifta, 1st at BuildWithAI Lagos with DialAI, 2nd at the 234 AI Hackathon with WIZZA, and 3rd at an Africa's Talking monthly with Hardware-OS. Each record states what it proves and what it does not.", links: [{ label: "See the achievement records", href: "/achievements" }] };
  if (normalized.includes("verified") || normalized.includes("evidence") || normalized.includes("proof")) return { text: "Atlas and Twizrr carry verified commit evidence; the hackathon placements are marked self-reported because the competition repositories are not public. Every record on the site says which it is. Adoption, revenue and production-scale claims are deliberately absent.", links: [{ label: "Browse the work index", href: "/work" }] };
  if (normalized.includes("available") || normalized.includes("hire") || normalized.includes("help") || normalized.includes("team") || normalized.includes("work with") || normalized.includes("intern")) return { text: "Yusuf is open to internships, junior engineering roles and freelance contracts, and to founders who need a technical partner. He is cofounder and CTO at Codedevs in Lagos.", links: [{ label: "Start a conversation", href: "/contact" }] };
  if (normalized.includes("who") || normalized.includes("about") || normalized.includes("build")) return { text: "Yusuf Saheed is a software engineer in Lagos and cofounder and CTO at Codedevs. He builds production web and AI products — escrow-backed payments, WhatsApp commerce, and AI agents that show their reasoning before acting. He wrote his first commit in August 2025.", links: [{ label: "Read the full background", href: "/about" }] };
  if (normalized.includes("next") || normalized.includes("coming")) return { text: "The Library is being filled with tutorials, research, tough questions and resources. The project and achievement records are complete.", links: [{ label: "Browse the Library", href: "/library" }] };
  return { text: "I can answer questions about Yusuf's published systems, his exact contribution to each one, the evidence behind them, and how to reach him. Try one of the suggested questions or open the work index.", links: [{ label: "Explore selected systems", href: "/work" }] };
}

export async function answerVisitorQuestion(question: string): Promise<VisitorAnswer> {
  const fallback = fallbackAnswer(question);
  const normalized = question.trim().toLowerCase();
  if (!normalized || blockedTerms.some((term) => normalized.includes(term))) return fallback;
  const [records, site] = await Promise.all([getIndexItems(), getSiteSettings()]);
  const context = records.map((record) => ({ slug: record.slug, type: record.contentType, title: record.title, summary: record.summary, role: record.role, links: record.links, evidence: record.evidence })).slice(0, 30);
  const generated = await generateText([
    { role: "system", content: `You are Yusuf Saheed's read-only portfolio assistant. Answer only from the approved published context below. Never claim to be Yusuf. Never reveal drafts, credentials, private messages, account actions, or unsupported metrics. If context is insufficient, say so and direct the visitor to /contact. Keep the response under 120 words. Public identity: ${site.identity}. Published context: ${JSON.stringify(context)}` },
    { role: "user", content: question.trim().slice(0, 220) },
  ]);
  return generated ? { text: generated, links: fallback.links } : fallback;
}
