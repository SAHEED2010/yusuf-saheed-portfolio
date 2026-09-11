"use client";

import { useState } from "react";

type ManagerResult = {
  ok?: boolean;
  error?: string;
  message?: string;
  summary?: string;
  requiresConfirmation?: boolean;
  action?: string;
  slug?: string;
  lifecycle?: string;
  raw?: string;
};

export function AdminManagerPanel({ provider, model, ready }: { provider: string; model: string; ready: boolean }) {
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState<ManagerResult | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch("/api/admin/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ instruction }) });
      const payload = await response.json() as ManagerResult;
      setResult(payload);
    } catch {
      setResult({ ok: false, error: "The admin manager could not be reached." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-manager">
      <div className="admin-manager-head">
        <div>
          <p className="eyebrow">Admin manager</p>
          <h2>{ready ? `${provider} / ${model}` : "AI provider not configured"}</h2>
        </div>
        <span className="meta">{ready ? "connected" : "setup required"}</span>
      </div>
      <form className="admin-manager-form" onSubmit={submit}>
        <label htmlFor="admin-instruction">
          Instruction
          <textarea id="admin-instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder="Prepare a hero-summary update, create a research draft, or archive a project…" maxLength={4000} required />
        </label>
        <button type="submit" disabled={busy || !ready}>{busy ? "Working…" : "Prepare change"}</button>
      </form>

      {result && (
        <div className="admin-manager-result" aria-live="polite">
          {result.message && <p className="admin-manager-message">{result.message}</p>}
          {result.summary && (
            <p className={result.requiresConfirmation ? "admin-manager-summary admin-manager-summary-pending" : "admin-manager-summary"}>
              {result.requiresConfirmation ? "Awaiting your confirmation: " : "Applied: "}
              {result.summary}
            </p>
          )}
          {result.error && <p className="admin-manager-error">{result.error}</p>}
          {result.requiresConfirmation && (
            <p className="provenance">
              Nothing has been published. Open <a href="/admin/content">Admin / Content</a> to review and confirm.
            </p>
          )}
          <details className="admin-manager-raw">
            <summary>Raw response</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </section>
  );
}
