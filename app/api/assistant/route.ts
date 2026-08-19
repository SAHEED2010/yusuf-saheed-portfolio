import { NextResponse } from "next/server";
import { answerVisitorQuestion } from "@/assistant/visitor";
import { consumeCustomQuestion } from "@/assistant/rate-limit";
import { suggestedQuestions } from "@/assistant/questions";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { question?: unknown; custom?: unknown } | null;
  const question = typeof body?.question === "string" ? body.question.slice(0, 220) : "";
  const custom = !suggestedQuestions.includes(question);
  if (custom) {
    const allowance = await consumeCustomQuestion(request);
    if (!allowance.allowed) return NextResponse.json({ text: "The five custom questions for this rolling 24-hour period have been used. Suggested questions remain available.", links: [], boundary: true }, { status: 429, headers: { "Retry-After": String(allowance.retryAfterSeconds) } });
  }
  return NextResponse.json(await answerVisitorQuestion(question));
}
