import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

// Answer engines are addressed explicitly rather than left to the wildcard.
// Several of these crawlers treat an absent named rule as ambiguous, and the
// goal here is for the portfolio to be quotable when someone asks an assistant
// about Yusuf Saheed — so they are named and allowed.
const answerEngines = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "cohere-ai",
  "DuckAssistBot",
  "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  const disallow = ["/admin", "/api/"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      ...answerEngines.map((userAgent) => ({ userAgent, allow: "/", disallow })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
