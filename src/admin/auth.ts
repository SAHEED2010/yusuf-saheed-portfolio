import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "yusuf-admin-session";

function secret() {
  return process.env.PORTFOLIO_SESSION_SECRET ?? "";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function adminConfigurationReady() {
  return Boolean(process.env.PORTFOLIO_ADMIN_EMAIL && process.env.PORTFOLIO_ADMIN_PASSWORD_SCRYPT && secret());
}

export function credentialsMatch(email: string, password: string) {
  const configuredEmail = process.env.PORTFOLIO_ADMIN_EMAIL ?? "";
  const configuredScrypt = process.env.PORTFOLIO_ADMIN_PASSWORD_SCRYPT?.trim() ?? "";
  if (email.trim().toLowerCase() !== configuredEmail.trim().toLowerCase()) return false;
  // scrypt only. A fast digest such as SHA-256 has too little computational
  // effort to protect a password against offline brute force.
  if (!configuredScrypt) return false;
  const [salt, expectedHex] = configuredScrypt.split(":");
  if (!salt || !expectedHex || !/^[a-f0-9]+$/i.test(expectedHex)) return false;
  const expected = Buffer.from(expectedHex, "hex");
  const received = scryptSync(password, salt, expected.length);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

// The session token is `base64url(JSON payload).signature`. The payload is
// base64url-encoded specifically so the token can be safely split on its one
// literal separator: splitting a plain `email.timestamp.signature` string on
// "." breaks for almost every real email address, because a domain like
// gmail.com already contains a dot. That bug let a session set on a correct
// login be rejected on the very next request, for any email with a dotted
// domain — which is nearly all of them.
export function createSession(email: string) {
  const payload = Buffer.from(JSON.stringify({ email: email.trim().toLowerCase(), issuedAt: Date.now() })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

function sessionValid(value: string | undefined) {
  if (!value || !secret()) return false;
  const separatorIndex = value.lastIndexOf(".");
  if (separatorIndex === -1) return false;
  const payload = value.slice(0, separatorIndex);
  const received = value.slice(separatorIndex + 1);
  const expected = signature(payload);
  if (received.length !== expected.length || !timingSafeEqual(Buffer.from(received), Buffer.from(expected))) return false;
  let decoded: { email?: unknown; issuedAt?: unknown };
  try {
    decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return false;
  }
  const email = typeof decoded.email === "string" ? decoded.email : "";
  const age = Date.now() - Number(decoded.issuedAt);
  if (!email || !Number.isFinite(age) || age < 0 || age > 1000 * 60 * 60 * 24 * 7) return false;
  return email === (process.env.PORTFOLIO_ADMIN_EMAIL ?? "").trim().toLowerCase();
}

export async function isAdminSession() {
  const jar = await cookies();
  return sessionValid(jar.get(cookieName)?.value);
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export const adminSessionCookie = cookieName;
