import { NextResponse } from "next/server";
import { adminConfigurationReady, adminSessionCookie, createSession, credentialsMatch, isSameOrigin } from "@/admin/auth";
import { consumeRateLimit } from "@/content/database";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Cross-site request rejected" }, { status: 403 });
  if (!adminConfigurationReady()) return NextResponse.redirect(new URL("/admin/login?error=setup", request.url), 303);
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
  const allowance = consumeRateLimit(`admin-login:${email.trim().toLowerCase()}:${address}`, 10, 15 * 60 * 1000);
  if (!allowance.allowed) return NextResponse.redirect(new URL("/admin/login?error=rate-limit", request.url), 303);
  if (!credentialsMatch(email, password)) return NextResponse.redirect(new URL("/admin/login?error=invalid", request.url), 303);
  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(adminSessionCookie, createSession(email), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
  return response;
}
