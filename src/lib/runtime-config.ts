export type RuntimeConfig = {
  database: { provider: "sqlite" | "turso"; ready: boolean; missing: string[] };
  ai: { provider: "xai" | "openai" | "anthropic" | "none"; ready: boolean; missing: string[]; model: string };
  mcp: { ready: boolean; missing: string[] };
  newsletter: { provider: "resend" | "none"; ready: boolean; missing: string[] };
};

function required(values: Record<string, string | undefined>) {
  return Object.entries(values).filter(([, value]) => !value?.trim()).map(([key]) => key);
}

export function getRuntimeConfig(): RuntimeConfig {
  const databaseProvider = process.env.DATABASE_PROVIDER?.trim().toLowerCase() === "turso" ? "turso" : "sqlite";
  const databaseValues = databaseProvider === "turso" ? { TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL, TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN } : {};
  const configuredAiProvider = process.env.AI_PROVIDER?.trim().toLowerCase();
  const aiProvider = configuredAiProvider === "xai" || configuredAiProvider === "openai" || configuredAiProvider === "anthropic" ? configuredAiProvider : "none";
  const aiKey = aiProvider === "xai" ? process.env.XAI_API_KEY || process.env.AI_API_KEY : aiProvider === "openai" ? process.env.OPENAI_API_KEY || process.env.AI_API_KEY : aiProvider === "anthropic" ? process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY : undefined;
  const aiModel = process.env.AI_MODEL?.trim() || (aiProvider === "xai" ? process.env.XAI_MODEL?.trim() : aiProvider === "openai" ? process.env.OPENAI_MODEL?.trim() : process.env.ANTHROPIC_MODEL?.trim()) || "";
  const aiMissing = aiProvider === "none" ? [] : required({ AI_API_KEY: aiKey, AI_MODEL: aiModel });
  const mcpMissing = required({ MCP_SERVER_TOKEN: process.env.MCP_SERVER_TOKEN });
  const newsletterProvider = process.env.NEWSLETTER_PROVIDER?.trim().toLowerCase() === "resend" ? "resend" : "none";
  const newsletterMissing = newsletterProvider === "resend" ? required({ RESEND_API_KEY: process.env.RESEND_API_KEY, RESEND_FROM: process.env.RESEND_FROM }) : [];
  return {
    database: { provider: databaseProvider, ready: databaseProvider === "sqlite" || required(databaseValues).length === 0, missing: required(databaseValues) },
    ai: { provider: aiProvider, ready: aiProvider === "none" || aiMissing.length === 0, missing: aiMissing, model: aiModel },
    mcp: { ready: mcpMissing.length === 0, missing: mcpMissing },
    newsletter: { provider: newsletterProvider, ready: newsletterProvider === "none" || newsletterMissing.length === 0, missing: newsletterMissing },
  };
}
