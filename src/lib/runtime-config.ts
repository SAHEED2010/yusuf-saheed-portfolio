export type RuntimeConfig = {
  database: { provider: "sqlite" | "turso"; ready: boolean; missing: string[] };
  ai: { provider: "openai" | "none"; ready: boolean; missing: string[]; model: string };
  newsletter: { provider: "resend" | "none"; ready: boolean; missing: string[] };
};

function required(values: Record<string, string | undefined>) {
  return Object.entries(values).filter(([, value]) => !value?.trim()).map(([key]) => key);
}

export function getRuntimeConfig(): RuntimeConfig {
  const databaseProvider = process.env.DATABASE_PROVIDER?.trim().toLowerCase() === "turso" ? "turso" : "sqlite";
  const databaseValues = databaseProvider === "turso" ? { TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL, TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN } : {};
  const aiProvider = process.env.AI_PROVIDER?.trim().toLowerCase() === "openai" ? "openai" : "none";
  const aiMissing = aiProvider === "openai" ? required({ OPENAI_API_KEY: process.env.OPENAI_API_KEY, OPENAI_MODEL: process.env.OPENAI_MODEL }) : [];
  const newsletterProvider = process.env.NEWSLETTER_PROVIDER?.trim().toLowerCase() === "resend" ? "resend" : "none";
  const newsletterMissing = newsletterProvider === "resend" ? required({ RESEND_API_KEY: process.env.RESEND_API_KEY, RESEND_FROM: process.env.RESEND_FROM }) : [];
  return {
    database: { provider: databaseProvider, ready: databaseProvider === "sqlite" || required(databaseValues).length === 0, missing: required(databaseValues) },
    ai: { provider: aiProvider, ready: aiProvider === "none" || aiMissing.length === 0, missing: aiMissing, model: process.env.OPENAI_MODEL?.trim() || "" },
    newsletter: { provider: newsletterProvider, ready: newsletterProvider === "none" || newsletterMissing.length === 0, missing: newsletterMissing },
  };
}
