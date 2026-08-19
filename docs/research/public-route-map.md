# Public Route Map

Recorded: 2026-08-18

Status: approved architecture direction for the Signal Lab production application. The current HTML remains a throwaway visual prototype; these routes become real Next.js App Router pages during implementation.

## Public routes

| Route | Job | Primary content |
| --- | --- | --- |
| `/` | Introduce Yusuf and route visitors toward the strongest evidence or contact action. | Identity, concise thesis, verified activity, Atlas preview, Library preview, impact statement, social and support controls. |
| `/work` | Let visitors scan verified products and engineering work. | Project index, role, status, evidence level, repository/live links, filters. |
| `/work/[slug]` | Explain one project deeply enough to evaluate Yusuf's contribution. | Problem, constraints, decisions, Yusuf's role, implementation, result, evidence, collaborators, related work. |
| `/library` | Index Yusuf's public learning and knowledge work. | Tutorials, Research & Publications, Tough Questions, Videos & Resources, Hackathons & Achievements. |
| `/library/[type]/[slug]` | Present one sourced item with revision context. | Body, sources, publication status, revision history, related projects and materials. |
| `/achievements` | Present only independently supported milestones and recognitions. | Certificates, competitions, education milestones, evidence labels, dates and issuing organizations. |
| `/about` | Give relevant personal and professional context without turning the homepage into a biography. | Biography, Engineering Science & AI positioning, current goals, education, experience and selected timeline. |
| `/contact` | Give every visitor a clear, deliberate way to reach Yusuf. | Email, WhatsApp, social profiles, availability, inquiry form and Buy Me a Coffee route. |
| `/assistant` | Offer a larger visitor-assistant surface when a compact overlay is insufficient. | Suggested questions, evidence-linked answers, custom-question allowance and privacy guidance. |
| `/subscribe/verify` | Complete newsletter double opt-in. | Expiring verification result, selected notification categories, and next action. |
| `/unsubscribe` | Stop future release notifications. | Signed unsubscribe result and re-subscribe path. |
| `/privacy` | Explain public assistant, newsletter, external-source, and admin data handling. | Plain-language privacy notice and contact route. |

## Private routes

| Route | Job |
| --- | --- |
| `/admin` | Authenticated overview for drafts, published content, synchronization state and pending changes. |
| `/admin/content/*` | Structured editing for profile, work, Library, achievements, media, navigation and contact details. |
| `/admin/assistant` | Private assistant for preparing edits with validation, preview, confirmation, audit history and rollback. |
| `/admin/integrations` | Server-side GitHub, WakaTime, deployment and source synchronization status without exposing secrets. |

## Navigation rules

- The homepage is an overview, not the entire public application.
- Route changes use normal Next.js navigation and remain addressable, shareable and reload-safe.
- Each project and Library item has a canonical URL.
- Filters may update URL search parameters, but core content must not depend on client-only state.
- Public pages render useful content without JavaScript where practical; interactive enhancements layer on top.
- Admin and assistant permissions remain enforced on the server, not only hidden in the interface.
