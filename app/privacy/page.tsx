import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How this portfolio handles visitor questions, newsletter consent and third-party integrations.",
};

export default function PrivacyPage() { return <section className="detail"><p className="eyebrow">Privacy</p><h1>Clear boundaries for a public portfolio.</h1><p className="lede">The portfolio uses published content, public-source integrations, privacy-conscious assistant rate limits and verified newsletter consent.</p><section className="detail-section"><h2>Information processed</h2><p>Visitor questions may be rate-limited using a one-way identifier derived from the network address. Newsletter email addresses are stored only for subscription verification and release notifications.</p><h2>External services</h2><p>GitHub, WakaTime and the configured AI provider receive only the information required for their enabled feature. Draft portfolio records are available only to authenticated administrator tools.</p><h2>Your choices</h2><p>Newsletter messages include an unsubscribe link. Questions about stored subscription information can be sent through the public contact page.</p></section></section>; }
