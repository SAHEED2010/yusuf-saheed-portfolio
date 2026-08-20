"use client";

import { FormEvent, useEffect, useState } from "react";
import { suggestedQuestions } from "@/assistant/questions";
import type { VisitorAnswer } from "@/assistant/visitor";

const allowanceKey = "yusuf-visitor-assistant-allowance";

function allowanceStorageKey() {
  return `${allowanceKey}:${new Date().toISOString().slice(0, 10)}`;
}

export function VisitorAssistant() {
  const [question, setQuestion] = useState("");
  const [remaining, setRemaining] = useState(5);
  const [answer, setAnswer] = useState<VisitorAnswer>({ text: "Ask about Yusuf's published work, research direction, or how to get in touch.", links: [] });

  useEffect(() => {
    const stored = Number(sessionStorage.getItem(allowanceStorageKey()));
    if (Number.isFinite(stored) && stored >= 0 && stored <= 5) {
      const timer = window.setTimeout(() => setRemaining(stored), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  function ask(value: string, custom = false) {
    if (custom && remaining <= 0) {
      setAnswer({ text: "Your five custom questions for this rolling 24-hour period are used. Suggested questions remain available; the allowance resets automatically.", links: [] });
      return;
    }
    fetch("/api/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: value, custom }) })
      .then((response) => response.json())
      .then((nextAnswer: VisitorAnswer) => setAnswer(nextAnswer))
      .catch(() => setAnswer({ text: "The assistant is temporarily unavailable. Please use the contact page instead.", links: [] }));
    if (custom) {
      const next = remaining - 1;
      setRemaining(next);
      sessionStorage.setItem(allowanceStorageKey(), String(next));
    }
    setQuestion("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (question.trim()) ask(question.trim(), true);
  }

  return <section className="assistant-surface" aria-labelledby="assistant-title"><div className="assistant-intro"><p className="eyebrow">Visitor assistant</p><h1 id="assistant-title">Ask about the work.</h1><p className="lede">Yusuf's AI portfolio assistant answers from published records and approved public sources. It is not Yusuf, and it cannot edit the portfolio or expose private material.</p></div><div className="assistant-workspace"><div className="assistant-prompts"><p className="meta">Suggested questions</p>{suggestedQuestions.map((prompt) => <button type="button" key={prompt} onClick={() => ask(prompt)}>{prompt}<span aria-hidden="true">→</span></button>)}</div><div className="assistant-answer" aria-live="polite"><p className="meta">Answer</p><p>{answer.text}</p>{answer.boundary && <small className="assistant-boundary">Published sources only</small>}{answer.links.length > 0 && <div className="assistant-sources">{answer.links.map((link) => <a key={link.href} href={link.href}>{link.label} →</a>)}</div>}</div><form className="assistant-form-large" onSubmit={submit}><label htmlFor="assistant-question">Ask one custom question</label><div className="form-row"><input id="assistant-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={220} placeholder="What would you like to know?" /><button type="submit" disabled={remaining <= 0 || question.trim().length === 0}>Ask</button></div><small>{remaining} custom question{remaining === 1 ? "" : "s"} remaining in this rolling 24-hour period. Suggested questions do not use the allowance.</small></form></div></section>;
}
