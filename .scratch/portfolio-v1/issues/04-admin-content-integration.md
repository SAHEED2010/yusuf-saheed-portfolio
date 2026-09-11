# Admin Content and External Sources

Type: task
Status: ready-for-human
Blocked by: 01-content-template-model

## Goal

Connect the dashboard to structured content records and approved external sources so public pages update without source edits.

## Acceptance criteria

- Admin can create, edit, preview, publish, archive, and restore content.
- Project template selection controls field validation and presentation.
- GitHub and WakaTime sync states include refresh time and graceful unavailable states.
- AI-assisted edits produce drafts and a change summary; Yusuf confirms publication.
- Footer, support link, social URLs, newsletter settings, and profile details are editable.

## Comments

The current tracer bullet persists public profile, social routes, support, contact copy, and the hero media URL in site settings. The project workspace can create and edit product-system drafts with role, tags, narrative, decisions, status, ordering, a primary public link, and evidence; published featured records now drive the homepage visualization without project-specific page code. Remaining work includes template selection beyond product systems, preview/review workflow, richer multi-link and multi-evidence editing, WakaTime configuration, and admin-assistant draft review.

The backend synchronization slice now adds SQLite-backed GitHub snapshots with optional server-side contribution-calendar access, a WakaTime adapter, a protected integrations dashboard, server-side visitor-assistant rate limiting, and same-origin protection on admin login. GitHub repository creation, remote configuration, branch protection, and push remain human-approved external setup steps because the stored CLI token is invalid and no repository remote is configured.

The admin assistant (`src/assistant/admin-manager.ts`) previously handled only projects, through project-only actions and helpers duplicated from the MCP server. It now shares a single mutation module (`src/content/mutations.ts`) that covers all six content types, replaces the old single-link/single-evidence limitation with full-array editing, and returns a plain-language change summary shown before publish confirmation. The MCP server still uses its original project-only helpers; migrating it to the shared module is the natural next slice, not yet done.

Remaining after this slice: Library entries still share the generic content form in the dashboard UI rather than a type-aware one; there is no distinct preview render before publish (only the text summary); no rollback; suggested questions remain hardcoded rather than admin-editable; and the newsletter release/broadcast system described in `docs/research/newsletter-subscriptions.md` does not exist yet.
