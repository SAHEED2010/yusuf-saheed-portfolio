# CI/CD Direction

Recorded: 2026-08-18

This note records the required delivery and review baseline for the production portfolio. It does not apply to the throwaway HTML prototype.

## Pull request checks

- Install dependencies with a frozen pnpm lockfile.
- Verify formatting, linting, TypeScript, unit tests, and integration tests.
- Validate the database schema and migration history.
- Build the production Next.js application.
- Run Playwright smoke and accessibility checks against the built application.
- Run CodeQL, dependency review, secret scanning, and automated dependency updates.

## Delivery flow

- Open pull requests receive an isolated preview deployment.
- Production deployment runs only from the protected production branch after required checks and review approval.
- Database migrations use an explicit controlled step rather than running from an untrusted preview.
- Environments keep separate secrets and deployment protections.

## Review controls

- Add CODEOWNERS, a pull request template, protected branches, and required status checks.
- Configure CodeRabbit to focus on authentication, administrator authorization, assistant tool permissions, source grounding, personal information, publishing confirmation, rate limiting, migrations, accessibility, SEO, and test coverage.
- Require review for workflows, authentication, database migrations, assistant permissions, and deployment configuration.

## Production acceptance

The delivery baseline is complete only when a deliberately failing change is blocked, a valid pull request receives a working preview, and an approved merge can deploy with an auditable result.
