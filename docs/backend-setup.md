# Backend Setup

The portfolio backend is a Next.js App Router server with SQLite persistence, signed admin sessions, server-side source synchronization, and a read-only visitor assistant.

## Local environment

Copy `.env.example` to `.env.local` and fill these values:

- `PORTFOLIO_ADMIN_EMAIL`: `yusufsaheed2012@gmail.com`
- `PORTFOLIO_ADMIN_PASSWORD_SHA256`: SHA-256 digest of the admin password
- `PORTFOLIO_SESSION_SECRET`: long random secret used to sign the session cookie
- `GITHUB_USERNAME`: `SAHEED2010` unless the public profile changes
- `GITHUB_TOKEN`: optional server-only token; required for contribution calendar data
- `WAKATIME_API_KEY`: optional server-only key; never expose it to client code
- `DATABASE_PROVIDER`: `sqlite` for local development; use `turso` only after a hosted libSQL adapter is provisioned
- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`: hosted libSQL connection values when Turso is selected
- `AI_PROVIDER`: `none` until an approved provider is configured; use `openai` with `OPENAI_API_KEY` and `OPENAI_MODEL` after approval
- `NEWSLETTER_PROVIDER`: `none` until a provider is approved; use `resend` with `RESEND_API_KEY` and `RESEND_FROM` after domain setup

Generate a password digest with PowerShell:

```powershell
"your-password" | node -e "let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>console.log(require('node:crypto').createHash('sha256').update(s.trim()).digest('hex')))"
```

Generate a session secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

The admin dashboard is available at `/admin` after the environment is configured.

The included SQLite adapter is appropriate for local development and a persistent single-server deployment. Vercel's ephemeral filesystem must not be used as the production content database; choose a hosted SQLite-compatible provider or PostgreSQL before deployment, then point `PORTFOLIO_DATABASE_PATH` or the database adapter at that durable service.

## GitHub delivery setup

The repository contains CI, CodeQL, dependency review, Dependabot, CODEOWNERS, and CodeRabbit configuration. A GitHub remote and branch protection are intentionally not guessed or created by the application. Create the repository under the approved Yusuf account, then add its exact remote locally and push only after reviewing the first commit.

GitHub Actions should receive only deployment and integration secrets through repository or environment secrets. Do not commit `.env.local`, tokens, SQLite data, or generated build output.

## Runtime behavior

GitHub snapshots are cached in SQLite for one hour and fall back to the last verified snapshot when the API is unavailable. WakaTime remains unavailable until its server-only key is supplied. Visitor custom assistant questions are limited server-side to five per rolling 24-hour window per anonymized client key; suggested questions do not consume the allowance.

## Not yet production-enabled

- Newsletter signup is still a UI boundary. Resend (or another provider), a verified sending domain, subscriber storage, signed verification links, and unsubscribe delivery handling require an approved provider decision and credentials.
- The admin assistant is intentionally a permission-boundary placeholder until an approved model/provider and private knowledge-source policy are configured. It must create reviewable drafts and never publish directly.
- SQLite is local/single-server storage. Use a durable hosted database before deploying to an ephemeral serverless filesystem.
