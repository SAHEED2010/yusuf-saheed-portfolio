import type { Metadata } from "next";
import Link from "next/link";
import { getIndexItems } from "@/content/store";
import { getSiteSettings } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Yusuf Saheed — cofounder and CTO at Codedevs, building production web and AI products from Lagos, Nigeria.",
};

// Editorial content for the About page. Project and achievement records are
// managed through the admin dashboard; this narrative is versioned in code
// until the settings model carries long-form fields.
const story = [
  "I started writing code in August 2025. Thirteen months later I was shipping subscription billing against a live payment provider, a WhatsApp commerce channel driven by model function calling, and the escrow and dispute flows that decide whether a stranger's money is safe.",
  "That slope is the most honest thing I can tell you about how I work. I learn by building something that has to survive contact with a real constraint — a telecom protocol that only allows short sessions, a payment webhook that arrives twice, a buyer who has no reason to trust a seller they found in a feed.",
  "I build for the environment I am actually in. Bandwidth drops, devices are limited, and a lot of commerce runs over WhatsApp rather than a web app. Designing for that is not a limitation to apologise for; it is the interesting part of the problem.",
];

const experience = [
  {
    role: "Cofounder & CTO",
    org: "Codedevs Technology Limited",
    period: "2025 — present",
    detail:
      "A Lagos software company helping African businesses adopt AI. I lead technical architecture across the product portfolio and drive the engineering on Twizrr, our social commerce platform.",
  },
  {
    role: "Science Tutor — WAEC & JAMB preparation",
    org: "Independent",
    period: "2024 — present",
    detail:
      "Teaching Chemistry, Physics and Mathematics at secondary level, and designing quizzes and revision material around exam patterns. Explaining a hard idea to someone who does not yet have the vocabulary for it is the same skill as writing a good interface.",
  },
];

const education = [
  {
    title: "University of Lagos — Systems Engineering",
    period: "Aspirant, pending admission",
    detail: "JAMB UTME score 294. Preparing for POST-UTME.",
  },
  {
    title: "GOMYCODE — Software Development Bootcamp with AI Skills",
    period: "Completed December 2025",
    detail: "React, Next.js, Node.js, Express, MongoDB, REST API design and project structure.",
  },
  {
    title: "Senior Secondary School Certificate (WAEC)",
    period: "Completed",
    detail: "Science track: Chemistry, Physics, Mathematics, Further Mathematics.",
  },
];

const skills = [
  { group: "Languages", items: "TypeScript, JavaScript, Python" },
  { group: "Frontend", items: "React, Next.js (App Router), Tailwind CSS, Redux / Zustand, Framer Motion" },
  { group: "Backend", items: "Node.js, NestJS, Express, REST API design, JWT auth, webhooks, middleware patterns" },
  { group: "Data", items: "PostgreSQL, MongoDB, Supabase, Neon, Prisma, Redis, SQLite / libSQL" },
  { group: "AI", items: "Gemini, OpenAI and Claude APIs, function calling, prompt design, agent architecture" },
  { group: "Platform", items: "Git, Docker, Vercel, Railway, GitHub Actions, Linux / Bash" },
];

export default async function AboutPage() {
  const [site, records] = await Promise.all([getSiteSettings(), getIndexItems()]);
  const projects = records.filter((record) => record.contentType === "project").length;
  const achievements = records.filter(
    (record) => record.contentType === "achievement" && record.recordKind === "entry",
  ).length;

  return (
    <section className="detail">
      <p className="eyebrow">About</p>
      <h1>Thirteen months from first commit to production payment flows.</h1>
      <p className="lede">{site.heroSummary}</p>

      <section className="detail-section">
        <h2>How I got here</h2>
        {story.map((paragraph) => (
          <p className="body" key={paragraph.slice(0, 32)}>
            {paragraph}
          </p>
        ))}
        <p className="provenance">
          I am 16, based in {site.locationLabel}, and working while preparing for university. I mention it because
          it is the context for everything above, not because it should change how the work is judged.
        </p>
      </section>

      <section className="detail-section">
        <h2>Experience</h2>
        <ul className="about-list">
          {experience.map((item) => (
            <li key={item.role}>
              <p className="meta">{item.period}</p>
              <h3>
                {item.role} · <span>{item.org}</span>
              </h3>
              <p className="body">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h2>Education</h2>
        <ul className="about-list">
          {education.map((item) => (
            <li key={item.title}>
              <p className="meta">{item.period}</p>
              <h3>{item.title}</h3>
              <p className="body">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h2>What I work with</h2>
        <dl className="about-skills">
          {skills.map((skill) => (
            <div key={skill.group}>
              <dt>{skill.group}</dt>
              <dd>{skill.items}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="detail-section">
        <h2>What I am looking for</h2>
        <p className="body">{site.opportunityNote}</p>
        <div className="actions">
          <Link className="button" href="/work">
            See the work
          </Link>
          <Link className="text-link" href="/contact">
            Get in touch
          </Link>
        </div>
        <p className="provenance">
          {projects} published project{projects === 1 ? "" : "s"} · {achievements} recorded achievement
          {achievements === 1 ? "" : "s"}. Every record states what it proves and what it does not.
        </p>
      </section>
    </section>
  );
}
