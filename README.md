# Yusuf Saheed Portfolio

Yusuf Saheed's Engineering, Science & AI portfolio is a multi-page Next.js application with an admin-managed content model, a provider-neutral AI assistant, GitHub and WakaTime integrations, and a local or Turso-compatible database.

## What is included

- Public portfolio pages for the profile, work, writing, research, publications, and contact details.
- Authenticated admin dashboard for site settings and structured project content.
- Grok/xAI, OpenAI, and Anthropic adapters behind one AI provider interface.
- Visitor assistant with published-source boundaries and five custom questions per rolling 24-hour period.
- Admin AI manager at `/admin/assistant` for structured, reviewed content operations.
- MCP endpoint at `/api/mcp` and a local MCP process through `npm run mcp`.
- GitHub repository activity and WakaTime statistics when their integrations are configured.
- GitHub Actions CI, CodeQL analysis, dependency review, and CodeRabbit configuration.

## Local setup

Requirements: Node.js 22 or newer and npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The default local database is SQLite. Keep `.env.local`, `.data/`, and any API keys out of git.

Before production use, set a strong `PORTFOLIO_SESSION_SECRET`, an admin password hash, and the provider variables you intend to use. The complete environment contract is documented in `.env.example`.

## Admin and AI

The admin login uses `PORTFOLIO_ADMIN_EMAIL`, `PORTFOLIO_ADMIN_PASSWORD_SHA256`, and `PORTFOLIO_SESSION_SECRET`. Use `/admin` to manage the public profile and projects, and `/admin/assistant` to ask the configured AI provider for whitelisted operations.

For Grok, set `AI_PROVIDER=xai`, `XAI_API_KEY`, and the exact `XAI_MODEL` available in the xAI console. OpenAI and Anthropic can be selected with their corresponding provider and model variables. No key or model is fabricated by the application.

The MCP server is deliberately protected. Set `MCP_SERVER_TOKEN` before exposing `/api/mcp`; use `npm run mcp` for a local stdio server. MCP write tools validate structured operations before changing the database.

## Verification

```powershell
npm run lint
npm run typecheck
npm run test:backend
npm run test:mcp
npm run build
```

## Branch and review workflow

`master` is the production branch and is protected by required CI, CodeQL, one CODEOWNER review, and conversation resolution. Use short feature or maintenance branches for changes and open a pull request into `master`. CodeRabbit is advisory; GitHub branch protection is the enforcement layer.

Dependabot major updates are merged only when the complete toolchain is compatible. In particular, TypeScript 7 and ESLint 10 remain unmerged until their Next.js and `typescript-eslint` support is available.
