import { createHash, createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "yusuf-admin-session";

function secret() {
  return process.env.PORTFOLIO_SESSION_SECRET ?? "";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function adminConfigurationReady() {
  return Boolean(process.env.PORTFOLIO_ADMIN_EMAIL && (process.env.PORTFOLIO_ADMIN_PASSWORD_SCRYPT || process.env.PORTFOLIO_ADMIN_PASSWORD_SHA256) && secret());
}

export function passwordDigest(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function credentialsMatch(email: string, password: string) {
  const configuredEmail = process.env.PORTFOLIO_ADMIN_EMAIL ?? "";
  const configuredScrypt = process.env.PORTFOLIO_ADMIN_PASSWORD_SCRYPT?.trim() ?? "";
  const configuredDigest = process.env.PORTFOLIO_ADMIN_PASSWORD_SHA256 ?? "";
  const emailMatches = email.trim().toLowerCase() === configuredEmail.trim().toLowerCase();
  if (!emailMatches) return false;
  if (configuredScrypt) {
    const [salt, expectedHex] = configuredScrypt.split(":");
    if (!salt || !expectedHex || !/^[a-f0-9]+$/i.test(expectedHex)) return false;
    const expected = Buffer.from(expectedHex, "hex");
    const received = scryptSync(password, salt, expected.length);
    return received.length === expected.length && timingSafeEqual(received, expected);
  }
  const digest = passwordDigest(password);
  return digest.length === configuredDigest.length && timingSafeEqual(Buffer.from(digest), Buffer.from(configuredDigest));
}

export function createSession(email: string) {
  const payload = `${email.trim().toLowerCase()}.${Date.now()}`;
  return `${payload}.${signature(payload)}`;
}

function sessionValid(value: string | undefined) {
  if (!value || !secret()) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [email, timestamp, received] = parts;
  const age = Date.now() - Number(timestamp);
  if (!email || !Number.isFinite(age) || age < 0 || age > 1000 * 60 * 60 * 24 * 7) return false;
  const expected = signature(`${email}.${timestamp}`);
  return received.length === expected.length && timingSafeEqual(Buffer.from(received), Buffer.from(expected)) && email === (process.env.PORTFOLIO_ADMIN_EMAIL ?? "").trim().toLowerCase();
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
