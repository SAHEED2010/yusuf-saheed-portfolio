# Portfolio Repository Instructions

Read `PORTFOLIO_AI_PROMPT.txt` before planning or changing this project. It is the detailed operating contract for the portfolio and the AI Hero workflow.

## Working rules

- Read `CONTEXT.md` and any relevant files under `docs/adr/` before proposing changes.
- Inspect the repository before deciding what to build. Preserve existing user work.
- Use the local issue tracker under `.scratch/` for specs and tickets.
- Keep work in small, end-to-end tracer bullets with a quick verification after each slice.
- Ask before external side effects such as deployment, publishing, sending messages, changing credentials, or deleting data.
- Report changed files, checks run, unresolved questions, and the next smallest step when finishing a task.

## Agent skills

### Issue tracker

Issues and specs live as Markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repository. Read `CONTEXT.md` and relevant decisions under `docs/adr/`. See `docs/agents/domain.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
