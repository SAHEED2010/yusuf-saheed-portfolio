"use client";

import { useState } from "react";

type Preview = { eligible: boolean; reason?: string; subject: string; bodyPreview: string; recipientCount: number; deliveryConfigured: boolean };
type SendResult = { ok: boolean; error?: string; sent?: number; failed?: number; recipientCount?: number };

// Two distinct clicks, on purpose: "Check" only ever previews, never sends,
// and "Send" only becomes available once a preview for this exact slug has
// been fetched. There is no single control that both composes and dispatches
// an email to every active subscriber.
export function ReleasePanel({ slug }: { slug: string }) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<SendResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function check() {
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, action: "preview" }) });
      setPreview(await response.json());
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (!preview?.eligible) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/newsletter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ slug, action: "send" }) });
      setResult(await response.json());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="release-panel">
      <button type="button" onClick={check} disabled={busy}>{busy ? "Checking…" : "Check subscriber notification"}</button>
      {preview && (
        <div className="release-preview">
          {!preview.eligible && <p className="admin-manager-error">{preview.reason}</p>}
          {preview.eligible && !preview.deliveryConfigured && <p className="admin-manager-error">Email delivery is not configured (RESEND_API_KEY / RESEND_FROM). This can be previewed but not sent yet.</p>}
          {preview.eligible && (
            <>
              <p className="admin-manager-summary">
                Subject: {preview.subject}
                <br />
                {preview.recipientCount} active subscriber{preview.recipientCount === 1 ? "" : "s"}.
              </p>
              <p className="provenance">{preview.bodyPreview}</p>
              {preview.deliveryConfigured && preview.recipientCount > 0 && (
                <button type="button" onClick={send} disabled={busy}>
                  {busy ? "Sending…" : `Send to ${preview.recipientCount} subscriber${preview.recipientCount === 1 ? "" : "s"}`}
                </button>
              )}
              {preview.deliveryConfigured && preview.recipientCount === 0 && <p className="provenance">No active subscribers yet — nothing to send.</p>}
            </>
          )}
        </div>
      )}
      {result && (
        <p className={result.ok ? "admin-manager-summary" : "admin-manager-error"}>
          {result.ok ? `Sent to ${result.sent} of ${result.recipientCount} subscribers${result.failed ? ` (${result.failed} failed)` : ""}.` : result.error}
        </p>
      )}
    </div>
  );
}
