# Victor Eke Portfolio Reference

Audited: 2026-08-18

Sources:

- [victoreke.com](https://victoreke.com/)
- [Evavic44/victoreke.com](https://github.com/Evavic44/victoreke.com)
- [Repository README](https://github.com/Evavic44/victoreke.com#readme)

## What the reference actually contains

Victor Eke's portfolio is a Next.js application backed by Sanity. The Sanity Studio is embedded at `/studio`, so portfolio information can be maintained without editing source files. Sanity webhooks call a signed revalidation endpoint when content changes.

The public information architecture includes:

- Home with a concise identity statement, social links, contribution graph, and work experience.
- About with biography, current work, soft skills, technology usage, portrait, resume links, email, and Buy Me a Coffee.
- Projects with individual detail pages.
- Blog with articles and links to external publications.
- Photos as a separate personal dimension.

The repository defines structured content for:

- Profile information, image, biography, email, location, resume, and tools.
- Work experience.
- Projects with taglines, media, live and repository URLs, and long descriptions.
- Blog posts with publication state, tags, authors, cover media, canonical URLs, and rich content.
- Additional personal content including heroes, quizzes, tables, code, and media blocks.

The repository uses Next.js, TypeScript, Sanity, Tailwind CSS, theme switching, GitHub contribution data, rich portable content, Vercel deployment, and Umami analytics. The repository is MIT-licensed and allows reuse with attribution, but Yusuf's portfolio should use it as structural inspiration rather than reproduce Victor's identity or design.

## Important limits of the reference

- The administration experience is Sanity Studio, not a bespoke portfolio dashboard.
- There is no public AI assistant in the audited repository.
- There is no natural-language content-editing assistant.
- The content model is suited to Victor's career and writing; it does not include Yusuf's planned research, publications, mathematical explorations, startup work, or AI knowledge controls.

## Direction for Yusuf's portfolio

Keep the useful principles:

- Evidence before decorative claims.
- Structured, editable content.
- Dedicated case studies and writing.
- Resume, contact, social, support, and current-work paths.
- A personal dimension beyond a list of technologies.

Extend them with Yusuf-specific capabilities:

- Research and publication records.
- Mathematical and scientific explorations.
- Product and startup work with exact contribution attribution.
- A private admin dashboard with preview, publishing, media, and content organization.
- A visitor-facing assistant grounded only in approved public content.
- A private administrator assistant that can propose structured content changes.
- Explicit review, confirmation, audit history, and rollback before AI-generated changes become public.
