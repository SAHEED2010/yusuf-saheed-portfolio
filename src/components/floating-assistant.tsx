"use client";

import { FormEvent, useEffect, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { suggestedQuestions } from "@/assistant/questions";
import type { VisitorAnswer } from "@/assistant/visitor";

const allowanceKey = "yusuf-visitor-assistant-allowance";
const initialAnswer: VisitorAnswer = { text: "Select a question or ask your own. Answers link back to published portfolio evidence.", links: [] };

function allowanceStorageKey() { return `${allowanceKey}:${new Date().toISOString().slice(0, 10)}`; }

export function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [remaining, setRemaining] = useState(5);
  const [answer, setAnswer] = useState<VisitorAnswer>(initialAnswer);
  useEffect(() => {
    const stored = Number(sessionStorage.getItem(allowanceStorageKey()));
    if (Number.isFinite(stored) && stored >= 0 && stored <= 5) {
      const timer = window.setTimeout(() => setRemaining(stored), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);
  async function ask(value: string, custom = false) {
    if (custom && remaining <= 0) { setAnswer({ text: "Your five custom questions for this rolling 24-hour period are used. Suggested questions remain available; the allowance resets automatically.", links: [] }); return; }
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: value, custom }) });
      setAnswer(await response.json() as VisitorAnswer);
    } catch { setAnswer({ text: "The assistant is temporarily unavailable. Please use the contact page instead.", links: [] }); }
    if (custom) { const next = remaining - 1; setRemaining(next); sessionStorage.setItem(allowanceStorageKey(), String(next)); }
    setQuestion("");
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (question.trim()) void ask(question.trim(), true); }
  return <><button className="assistant-toggle" type="button" aria-expanded={open} aria-controls="floating-assistant-panel" aria-label="Ask Yusuf's AI" title="Ask Yusuf's AI" onClick={() => setOpen((value) => !value)}><Sparkles aria-hidden="true" size={18} /><span>Ask Yusuf's AI</span></button>{open && <aside className="assistant-panel" id="floating-assistant-panel"><div className="assistant-head"><div><strong>Yusuf's AI portfolio assistant</strong><small>Published sources only · not Yusuf · read-only</small></div><button className="assistant-close" type="button" aria-label="Close assistant" title="Close assistant" onClick={() => setOpen(false)}><X aria-hidden="true" size={18} /></button></div><div className="assistant-body"><div className="assistant-prompts" aria-label="Suggested questions">{suggestedQuestions.map((prompt) => <button type="button" key={prompt} onClick={() => void ask(prompt)}>{prompt}</button>)}</div><div className="assistant-message" aria-live="polite">{answer.text}{answer.boundary && <small className="assistant-boundary">Published sources only</small>}{answer.links.length > 0 && <div className="assistant-sources">{answer.links.map((link) => <a key={link.href} href={link.href}>{link.label} →</a>)}</div>}</div><form className="assistant-form" onSubmit={submit}><label className="sr-only" htmlFor="floating-assistant-question">Ask a custom question</label><input id="floating-assistant-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={220} placeholder="Ask a custom question…" /><button type="submit" aria-label="Send question" title="Send question">→</button></form><p className="assistant-count">{remaining} custom question{remaining === 1 ? "" : "s"} remaining in this rolling 24-hour period. Suggested questions do not use the allowance.</p></div></aside>}</>;
}
