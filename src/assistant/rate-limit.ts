import { createHash } from "node:crypto";
import { consumeRateLimit } from "@/content/database";

const windowMs = 24 * 60 * 60 * 1000;
const limit = 5;

function keyFor(request: Request) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  return createHash("sha256").update(address).digest("hex").slice(0, 24);
}

export async function consumeCustomQuestion(request: Request) {
  const key = keyFor(request);
  return await consumeRateLimit(`visitor-assistant:${key}`, limit, windowMs);
}
