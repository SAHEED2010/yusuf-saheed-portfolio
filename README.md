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

The admin login uses `PORTFOLIO_ADMIN_EMAIL`, `PORTFOLIO_ADMIN_PASSWORD_SCRYPT`, and `PORTFOLIO_SESSION_SECRET`. Use `/admin` to manage the public profile and projects, and `/admin/assistant` to ask the configured AI provider for whitelisted operations.

For Grok, set `AI_PROVIDER=xai`, `XAI_API_KEY`, and the exact `XAI_MODEL` available in the xAI console. OpenAI and Anthropic can be selected with their corresponding provider and model variables. No key or model is fabricated by the application.

The MCP server is deliberately protected. Set `MCP_SERVER_TOKEN` before exposing `/api/mcp`; use `npm run mcp` for a local stdio server. MCP write tools validate structured operations before changing the database. Direct AI/MCP publication and settings mutation are disabled by default; enable their explicit environment switches only after reviewing the proposed change and publishing policy.

For production, set `PORTFOLIO_REQUIRE_DURABLE_DB=true` and configure Turso/libSQL. The repository contains only empty environment placeholders; add real credentials to a local ignored `.env.local` or the deployment secret store.

The administrator password is stored as scrypt in `salt:keyHex` format. Generate it with `npm run admin:hash -- "your-password"` and paste the output into `PORTFOLIO_ADMIN_PASSWORD_SCRYPT`. Fast digests such as SHA-256 are not accepted: they have too little computational effort to resist offline brute force.

## Deployment (Vercel)

The site is deployment-ready on Vercel with no environment variables at all — every public page renders from the seeded content in `src/content/seed.ts`. Variables only switch on optional features.

**Recommended — import from GitHub (no CLI):** sign in at <https://vercel.com/new> with GitHub, import `SAHEED2010/yusuf-saheed-portfolio`, and deploy `master`. Next.js is detected automatically and the build command is `npm run build`. Every later push to `master` redeploys, and pull requests get preview URLs.

**CLI alternative**, if you prefer it:

```powershell
npm install -g vercel
vercel login
vercel --prod
```

Set `NEXT_PUBLIC_SITE_URL` to the deployed origin immediately after the first deploy, then redeploy. Canonical URLs, the sitemap, Open Graph tags and newsletter verification links all derive from it.

### What each optional variable turns on

| Variable | Effect if unset |
| --- | --- |
| `GITHUB_TOKEN` | The yearly contribution total is hidden. Repository count, followers, stars and last-push date still work unauthenticated. Set it: the contribution total is the most valuable figure on the GitHub panel, and a token also raises the API rate limit from 60 to 5,000 requests an hour. A classic token with no scopes is enough for public data. |
| `WAKATIME_API_KEY` | The WakaTime tile is hidden. |
| `AI_PROVIDER` + key + model | The assistant runs in preview mode with scripted answers and says so on screen. |
| `RESEND_API_KEY` + `RESEND_FROM` | Subscribers are stored but no verification email is sent; the form says delivery is still being set up. |
| `PORTFOLIO_ADMIN_PASSWORD_SCRYPT` + `PORTFOLIO_SESSION_SECRET` | Admin login is unusable. Set both before relying on `/admin`. |
| `MCP_SERVER_TOKEN` | `/api/mcp` stays closed. |

### Content persistence caveat

The default database is a SQLite file. On Vercel's serverless filesystem that file is ephemeral: public content is reseeded from `src/content/seed.ts` on every cold start, so the site always renders correctly, but **edits made in `/admin` and newsletter subscribers will not survive**. For durable writes, provision Turso and set `DATABASE_PROVIDER=turso`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` and `PORTFOLIO_REQUIRE_DURABLE_DB=true`. Until then, treat `src/content/seed.ts` as the source of truth and commit content changes there.

The Cloudflare Workers/D1 migration remains planned rather than implemented — see `docs/adr/0001-cloudflare-native-platform.md` and the tickets under `.scratch/cloudflare-migration/`.

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
