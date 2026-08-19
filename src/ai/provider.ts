export type AiProvider = "xai" | "openai" | "anthropic" | "none";
export type AiMessage = { role: "system" | "user" | "assistant"; content: string };

type AiConfig = { provider: AiProvider; key: string; model: string; baseUrl: string };

function config(): AiConfig {
  const rawProvider = process.env.AI_PROVIDER?.trim().toLowerCase();
  const provider: AiProvider = rawProvider === "xai" || rawProvider === "openai" || rawProvider === "anthropic" ? rawProvider : "none";
  const key = provider === "xai" ? process.env.XAI_API_KEY || process.env.AI_API_KEY || "" : provider === "openai" ? process.env.OPENAI_API_KEY || process.env.AI_API_KEY || "" : provider === "anthropic" ? process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY || "" : "";
  const model = process.env.AI_MODEL?.trim() || (provider === "xai" ? process.env.XAI_MODEL?.trim() : provider === "openai" ? process.env.OPENAI_MODEL?.trim() : process.env.ANTHROPIC_MODEL?.trim()) || "";
  const baseUrl = process.env.AI_BASE_URL?.trim().replace(/\/$/, "") || (provider === "xai" ? "https://api.x.ai/v1" : provider === "openai" ? "https://api.openai.com/v1" : "https://api.anthropic.com");
  return { provider, key, model, baseUrl };
}

async function openAiCompatible(configured: AiConfig, messages: AiMessage[]) {
  const response = await fetch(`${configured.baseUrl}/chat/completions`, { method: "POST", headers: { authorization: `Bearer ${configured.key}`, "content-type": "application/json" }, body: JSON.stringify({ model: configured.model, messages, temperature: 0.2, max_tokens: 500 }), signal: AbortSignal.timeout(12_000), cache: "no-store" });
  if (!response.ok) return null;
  const payload = await response.json() as { choices?: { message?: { content?: unknown } }[] };
  const text = payload.choices?.[0]?.message?.content;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

async function anthropic(configured: AiConfig, messages: AiMessage[]) {
  const system = messages.find((message) => message.role === "system")?.content;
  const input = messages.filter((message) => message.role !== "system");
  const response = await fetch(`${configured.baseUrl}/v1/messages`, { method: "POST", headers: { "x-api-key": configured.key, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: configured.model, max_tokens: 500, ...(system ? { system } : {}), messages: input }), signal: AbortSignal.timeout(12_000), cache: "no-store" });
  if (!response.ok) return null;
  const payload = await response.json() as { content?: { type?: string; text?: unknown }[] };
  const text = payload.content?.find((part) => part.type === "text")?.text;
  return typeof text === "string" && text.trim() ? text.trim() : null;
}

export async function generateText(messages: AiMessage[]) {
  const configured = config();
  if (configured.provider === "none" || !configured.key || !configured.model) return null;
  try {
    return configured.provider === "anthropic" ? await anthropic(configured, messages) : await openAiCompatible(configured, messages);
  } catch {
    return null;
  }
}

export function getAiProviderStatus() {
  const configured = config();
  return { provider: configured.provider, model: configured.model, configured: Boolean(configured.key && configured.model) };
}
