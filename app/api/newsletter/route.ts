import { NextResponse } from "next/server";
import { createSubscription } from "@/newsletter/store";

export const runtime = "nodejs";

async function sendVerificationEmail(email: string, verificationUrl: string) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!apiKey || !from) return false;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" }, body: JSON.stringify({ from, to: [email], ...(process.env.RESEND_REPLY_TO?.trim() ? { reply_to: process.env.RESEND_REPLY_TO.trim() } : {}), subject: "Verify Yusuf Saheed release notifications", html: `<p>Confirm your subscription to Yusuf Saheed's release notifications.</p><p><a href="${verificationUrl}">Verify subscription</a></p><p>This link expires in 24 hours.</p>` }), signal: AbortSignal.timeout(10_000) });
  return response.ok;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const result = await createSubscription(email);
  const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin}/subscribe/verify?token=${encodeURIComponent(result.token ?? "")}`;
  if (result.status === "pending" && result.token && result.deliveryConfigured && !(await sendVerificationEmail(email, verificationUrl))) return NextResponse.json({ error: "The subscription was saved, but the verification email could not be sent. Please try again later." }, { status: 502 });
  return NextResponse.json({ ok: true, status: result.status, deliveryConfigured: result.deliveryConfigured, ...(process.env.NODE_ENV !== "production" && result.token ? { verificationUrl: `/subscribe/verify?token=${encodeURIComponent(result.token)}` } : {}) });
}
