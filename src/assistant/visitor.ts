import { getPublished } from "@/content/store";

export type VisitorAnswer = {
  text: string;
  links: { label: string; href: string }[];
  boundary?: boolean;
};

const blockedTerms = ["password", "private", "draft", "admin", "login", "publish", "secret", "message"];

export function answerVisitorQuestion(question: string): VisitorAnswer {
  const normalized = question.trim().toLowerCase();
  if (!normalized) return { text: "Ask about Yusuf's published work, research direction, or how to get in touch.", links: [] };
  if (blockedTerms.some((term) => normalized.includes(term))) {
    return { text: "I can only discuss Yusuf's published portfolio and approved public sources. I cannot expose private material, drafts, credentials, or account actions.", links: [], boundary: true };
  }
  if (normalized.includes("atlas")) {
    const atlas = getPublished("atlas");
    return { text: atlas?.summary ?? "Atlas is a human-approved data change intelligence system.", links: atlas?.links.map((link) => ({ label: link.label, href: link.url })) ?? [] };
  }
  if (normalized.includes("verified") || normalized.includes("evidence")) {
    return { text: "Atlas is the clearest currently published engineering record. Its public repository and visible commit history are linked from the case study; adoption, revenue, and unsupported achievement claims are intentionally excluded.", links: [{ label: "Open Atlas evidence", href: "/work/atlas" }] };
  }
  if (normalized.includes("help") || normalized.includes("team") || normalized.includes("work with")) {
    return { text: "Yusuf is open to engineering roles, collaborations, research, startup work, and technology problems that need thoughtful product or AI systems work.", links: [{ label: "Start a conversation", href: "/contact" }] };
  }
  if (normalized.includes("next") || normalized.includes("coming")) {
    return { text: "The next public releases will grow the Library with tutorials, research, publications, tough questions, and evidence-backed achievements as each record is ready.", links: [{ label: "Browse the Library", href: "/library" }] };
  }
  return { text: "I can help with Yusuf's published systems, research direction, evidence, and contact paths. Try one of the suggested questions or open the work index.", links: [{ label: "Explore selected systems", href: "/work" }] };
}
