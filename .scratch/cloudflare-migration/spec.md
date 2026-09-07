# Cloudflare-native portfolio migration

Status: planned
Recorded: 2026-08-21

## Outcome

Run Yusuf Saheed's full-stack portfolio on Cloudflare while preserving its public pages, authenticated administration, structured content, AI/MCP permission boundaries, newsletter records, source integrations, and local development workflow.

The production stack is:

- Cloudflare Workers with the OpenNext adapter for the Next.js application and route handlers.
- Cloudflare D1 for content records, site settings, audits, integration snapshots, newsletter subscribers, and the initial low-volume rate-limit records.
- Cloudflare R2 for future administrator-uploaded images, PDFs, certificates, publication files, and project media.
- Cloudflare Worker secrets for runtime credentials.
- GitHub Actions plus protected GitHub environments for controlled preview and production deployment.

## Environment layout

| Environment | Worker | D1 database | R2 bucket | Purpose |
| --- | --- | --- | --- | --- |
| Local | Next dev / Wrangler preview | Local D1 state | Local R2 state | Development and automated tests |
| Preview | `yusuf-saheed-portfolio-preview` | `yusuf-portfolio-preview` | `yusuf-portfolio-media-preview` | Cloudflare compatibility and release verification |
| Production | `yusuf-saheed-portfolio` | `yusuf-portfolio-prod` | `yusuf-portfolio-media-prod` | Public portfolio after explicit cutover approval |

Binding names are stable across environments:

- `DB`: D1 database.
- `MEDIA`: R2 bucket.
- `ASSETS`: generated OpenNext static assets binding.

## Architecture seams

The content, admin, newsletter, AI, MCP, and integration callers must not depend directly on Cloudflare runtime objects.

- A SQL persistence module hides libSQL/local and D1 execution, batching, migration, and row normalization behind one small interface.
- A media module hides R2 object keys, metadata, validation, upload, retrieval, and deletion behind one small interface.
- Runtime configuration resolves Worker bindings and secrets in one place rather than spreading Cloudflare checks across routes.
- The existing public/admin modules continue calling domain-level persistence functions during the migration.

## Security and cost guardrails

- Start on Workers Free and do not upgrade a plan or enable billable extras without Yusuf's approval.
- Enable account two-factor authentication before creating deployment credentials.
- Use `wrangler login` for local human access; create a narrowly scoped API token only for CI deployment.
- Never paste a Cloudflare API token, provider key, session secret, or administrator password into chat or commit it to git.
- Store CI deployment credentials only in protected GitHub environments.
- Store application runtime secrets through Cloudflare Worker secrets.
- Use separate preview and production data resources.
- Production deployment and domain cutover require an explicit confirmation gate.
- Keep exports/backups of the source database and the target D1 database during migration.
- Add Cloudflare usage notifications or budget controls available to the account before production launch.

## Acceptance criteria

- `npm run dev` remains usable for normal local development.
- A Wrangler/OpenNext preview runs the full application under `workerd`.
- Public pages, admin login, content editing, newsletter verification, visitor rate limiting, AI provider calls, MCP authentication, GitHub sync, and WakaTime sync pass smoke tests in preview.
- No route reads from a production filesystem database.
- D1 migrations are explicit, repeatable, environment-targeted, and recorded.
- Record counts and representative content match between the migration source and D1.
- R2 uploads validate type and size, use non-guessable object keys, and never expose write credentials to the browser.
- Preview deployments cannot mutate production D1 or R2 resources.
- Production deploys only from the protected `master` branch after required checks and environment approval.
- Rollback can restore the previous application deployment without losing the pre-cutover database export.

## Out of scope for the first migration

- Replacing the existing admin model with Cloudflare Access.
- Moving AI inference to Workers AI.
- Adding KV, Queues, Durable Objects, Vectorize, or Analytics Engine before a measured need exists.
- Moving DNS or a custom domain before the workers.dev preview is accepted.
- Sending newsletter releases; the migration only preserves subscription and verification behavior.
