import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getDatabase } from "@/content/database";

export type SubscriptionResult = { ok: boolean; status: "pending" | "active" | "unsubscribed"; token?: string; deliveryConfigured: boolean };

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalized(email: string) {
  return email.trim().toLowerCase();
}

function unsubscribeSecret() {
  return process.env.PORTFOLIO_SESSION_SECRET ?? "";
}

// The unsubscribe link is a stateless HMAC of the address, not a stored
// one-time token. The subscriber's original signup-verification token is
// deleted the moment they verify (verifySubscription clears token_hash), so
// an unsubscribe link built from that same token would already be broken
// on every release email sent after the first -- there would be no valid
// token left to check it against, for every subscriber who ever verified.
// A stateless signature works for as many release emails as are ever sent,
// needs no extra database column, and never expires the way a one-time
// verification token correctly should.
export function unsubscribeToken(email: string): string {
  return createHmac("sha256", unsubscribeSecret()).update(normalized(email)).digest("base64url");
}

function unsubscribeTokenValid(email: string, token: string): boolean {
  if (!unsubscribeSecret() || !token) return false;
  const expected = unsubscribeToken(email);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createSubscription(email: string): Promise<SubscriptionResult> {
  const address = normalized(email);
  const now = new Date().toISOString();
  const token = randomBytes(32).toString("base64url");
  const db = await getDatabase();
  const existing = (await db.execute({ sql: "SELECT status FROM newsletter_subscribers WHERE email = ?", args: [address] })).rows[0];
  if (existing?.status === "active") return { ok: true, status: "active", deliveryConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM) };
  await db.execute({ sql: `INSERT INTO newsletter_subscribers (id, email, status, token_hash, token_expires_at, consent_text_version, consented_at, created_at, updated_at) VALUES (?, ?, 'pending', ?, ?, '2026-08-21-v1', ?, ?, ?) ON CONFLICT(email) DO UPDATE SET status='pending', token_hash=?, token_expires_at=?, consented_at=?, updated_at=?`, args: [`subscriber-${randomBytes(8).toString("hex")}`, address, hash(token), Date.now() + 24 * 60 * 60 * 1000, now, now, now, hash(token), Date.now() + 24 * 60 * 60 * 1000, now, now] });
  return { ok: true, status: "pending", token, deliveryConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM) };
}

export async function verifySubscription(token: string) {
  const db = await getDatabase();
  const row = (await db.execute({ sql: "SELECT id FROM newsletter_subscribers WHERE token_hash = ? AND token_expires_at > ?", args: [hash(token), Date.now()] })).rows[0];
  if (!row?.id) return false;
  const now = new Date().toISOString();
  await db.execute({ sql: "UPDATE newsletter_subscribers SET status='active', token_hash=NULL, token_expires_at=NULL, verified_at=?, updated_at=? WHERE id=?", args: [now, now, String(row.id)] });
  return true;
}

export async function unsubscribe(email: string, token: string) {
  if (!unsubscribeTokenValid(email, token)) return false;
  const db = await getDatabase();
  const address = normalized(email);
  const existing = (await db.execute({ sql: "SELECT status FROM newsletter_subscribers WHERE email = ?", args: [address] })).rows[0];
  if (!existing) return false;
  if (existing.status === "unsubscribed") return true; // already done -- clicking the link twice is not an error
  const now = new Date().toISOString();
  await db.execute({ sql: "UPDATE newsletter_subscribers SET status='unsubscribed', unsubscribed_at=?, updated_at=? WHERE email=?", args: [now, now, address] });
  return true;
}

export async function getActiveSubscribers(): Promise<string[]> {
  const db = await getDatabase();
  const rows = (await db.execute("SELECT email FROM newsletter_subscribers WHERE status = 'active'")).rows;
  return rows.map((row) => String(row.email));
}
