# Migrate data and perform the production cutover

Type: task
Status: ready-for-human
Blocked by: 05-preview-deployment-and-ci

## Goal

Move approved portfolio data to production D1 and publish the Cloudflare production Worker only after verification and explicit approval.

## Acceptance criteria

- The source SQLite database is exported and retained before migration.
- D1 production migrations run once through an environment-targeted command.
- Record counts, settings, newsletter states, audits, and representative records are verified after import.
- Production Worker secrets and bindings are complete before traffic is switched.
- The production deploy is confirmed manually.
- A post-deploy smoke test passes before any custom-domain cutover.
- Rollback instructions and database recovery artifacts are available.
- Any DNS/custom-domain change is a separate confirmed action.
