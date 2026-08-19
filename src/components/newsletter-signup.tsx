"use client";

import { FormEvent, useState } from "react";

export function NewsletterSignup() {
  const [status, setStatus] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setStatus("Production signup will verify this address before activation."); }
  return <section className="home-newsletter" aria-labelledby="newsletter-title"><div className="newsletter-copy"><p className="home-kicker">Notes from the lab</p><h2 id="newsletter-title">Get the next useful release.</h2><p>Receive a short notification when Yusuf publishes an article, research note, publication, tutorial, or selected system update.</p></div><form className="newsletter-form" onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" /><button type="submit">Subscribe</button><small>Double opt-in and unsubscribe will be required in the production release.</small><p aria-live="polite">{status}</p></form></section>;
}
