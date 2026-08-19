import { getIndexItems } from "@/content/store";
import { getSiteSettings } from "@/lib/site";
import { generateText } from "@/ai/provider";

export type VisitorAnswer = { text: string; links: { label: string; href: string }[]; boundary?: boolean };

const blockedTerms = ["password", "private", "draft", "admin", "login", "publish", "secret", "message"];

function fallbackAnswer(question: string): VisitorAnswer {
  const normalized = question.trim().toLowerCase();
  if (!normalized) return { text: "Ask about Yusuf's published work, research direction, or how to get in touch.", links: [] };
  if (blockedTerms.some((term) => normalized.includes(term))) return { text: "I can only discuss Yusuf's published portfolio and approved public sources. I cannot expose private material, drafts, credentials, or account actions.", links: [], boundary: true };
  if (normalized.includes("atlas")) return { text: "Atlas is a human-approved data change intelligence system.", links: [{ label: "Open Atlas evidence", href: "/work/atlas" }] };
  if (normalized.includes("verified") || normalized.includes("evidence")) return { text: "Atlas is the clearest currently published engineering record. Its public repository and visible commit history are linked from the case study; adoption, revenue, and unsupported achievement claims are intentionally excluded.", links: [{ label: "Open Atlas evidence", href: "/work/atlas" }] };
  if (normalized.includes("help") || normalized.includes("team") || normalized.includes("work with")) return { text: "Yusuf is open to engineering roles, collaborations, research, startup work, and technology problems that need thoughtful product or AI systems work.", links: [{ label: "Start a conversation", href: "/contact" }] };
  if (normalized.includes("next") || normalized.includes("coming")) return { text: "The next public releases will grow the Library with tutorials, research, publications, tough questions, and evidence-backed achievements as each record is ready.", links: [{ label: "Browse the Library", href: "/library" }] };
  return { text: "I can help with Yusuf's published systems, research direction, evidence, and contact paths. Try one of the suggested questions or open the work index.", links: [{ label: "Explore selected systems", href: "/work" }] };
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
