"use client";

import { useState } from "react";

export function AdminManagerPanel({ provider, model, ready }: { provider: string; model: string; ready: boolean }) {
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setResult("");
    try { const response = await fetch("/api/admin/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ instruction }) }); const payload = await response.json(); setResult(payload.ok ? JSON.stringify(payload, null, 2) : payload.error || "No change applied."); } catch { setResult("The admin manager could not be reached."); } finally { setBusy(false); }
  }
  return <section className="admin-manager"><div className="admin-manager-head"><div><p className="eyebrow">Admin manager</p><h2>{ready ? `${provider} / ${model}` : "AI provider not configured"}</h2></div><span className="meta">{ready ? "connected" : "setup required"}</span></div><form className="admin-manager-form" onSubmit={submit}><label htmlFor="admin-instruction">Instruction<textarea id="admin-instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder="Update the hero summary, publish Atlas, or change the support link..." maxLength={4000} required /></label><button type="submit" disabled={busy || !ready}>{busy ? "Working..." : "Apply instruction"}</button></form><pre className="admin-manager-result" aria-live="polite">{result}</pre></section>;
}
