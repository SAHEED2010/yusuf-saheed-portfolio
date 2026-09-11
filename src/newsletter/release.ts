import { readRecord } from "@/content/database";
import { getActiveSubscribers, unsubscribeToken } from "@/newsletter/store";
import { sendEmail, deliveryConfigured } from "@/newsletter/mailer";
import { siteUrl } from "@/lib/site-url";
import type { AnyContentRecord } from "@/content/types";

// Only a published, public, standalone entry can trigger a release --
// matching docs/research/newsletter-subscriptions.md: "Only a published
// content item with an eligible notification category can create a release
// event. Drafts, private items, and unverified achievements never trigger
// notifications." A collection landing page (recordKind "collection") is
// not itself a release-worthy item.
export function releaseEligible(record: AnyContentRecord): boolean {
  return record.lifecycle === "published" && record.visibility === "public" && record.recordKind === "entry";
}

export function publicPath(record: AnyContentRecord): string {
  return record.contentType === "project" ? `/work/${record.slug}` : `/library/${record.contentType}/${record.slug}`;
}

function releaseSubject(record: AnyContentRecord): string {
  return `New from Yusuf Saheed: ${record.title}`;
}

function releaseBody(record: AnyContentRecord, unsubscribeUrl: string): string {
  const url = `${siteUrl()}${publicPath(record)}`;
  return `<p>${record.summary}</p><p><a href="${url}">Read it here</a></p><hr /><p style="font-size:12px;color:#666;">You are receiving this because you subscribed to release notifications from Yusuf Saheed. <a href="${unsubscribeUrl}">Unsubscribe</a></p>`;
}

export type ReleasePreview = {
  eligible: boolean;
  reason?: string;
  subject: string;
  bodyPreview: string;
  recipientCount: number;
  deliveryConfigured: boolean;
};

export async function previewRelease(slug: string): Promise<ReleasePreview | undefined> {
  const record = await readRecord(slug);
  if (!record) return undefined;
  const eligible = releaseEligible(record);
  const recipients = eligible ? await getActiveSubscribers() : [];
  return {
    eligible,
    reason: eligible ? undefined : "Only a published, public, standalone entry can be released. Collections, drafts, and private records are never eligible.",
    subject: releaseSubject(record),
    bodyPreview: record.summary,
    recipientCount: recipients.length,
    deliveryConfigured: deliveryConfigured(),
  };
}

export type ReleaseResult = { ok: boolean; error?: string; sent?: number; failed?: number; recipientCount?: number };

export async function sendRelease(slug: string): Promise<ReleaseResult> {
  const record = await readRecord(slug);
  if (!record) return { ok: false, error: "Record not found." };
  if (!releaseEligible(record)) return { ok: false, error: "Only a published, public, standalone entry can be released." };
  if (!deliveryConfigured()) return { ok: false, error: "Configure RESEND_API_KEY and RESEND_FROM before sending release notifications." };

  const recipients = await getActiveSubscribers();
  const subject = releaseSubject(record);
  let sent = 0;
  let failed = 0;
  for (const email of recipients) {
    const unsubscribeUrl = `${siteUrl()}/unsubscribe?email=${encodeURIComponent(email)}&token=${encodeURIComponent(unsubscribeToken(email))}`;
    const delivered = await sendEmail(email, subject, releaseBody(record, unsubscribeUrl));
    if (delivered) sent += 1; else failed += 1;
  }
  return { ok: true, sent, failed, recipientCount: recipients.length };
}
