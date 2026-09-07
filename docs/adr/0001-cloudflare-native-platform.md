---
status: accepted
---

# Use Cloudflare as the target production platform

The portfolio will target Cloudflare Workers for the full-stack Next.js runtime, D1 for structured application data, and R2 for uploaded media and documents. This replaces the planned Turso production path because Cloudflare can provide the runtime, SQLite-family database, object storage, global delivery, and deployment controls in one platform; the migration will remain reversible by keeping Cloudflare bindings behind application seams and by retaining local adapters for development and tests.

## Consequences

- Full-stack Next.js deploys through the Cloudflare OpenNext adapter on Workers, not as a static Pages site.
- D1 and R2 are accessed through Worker bindings; the deployed application will not contain general-purpose D1 passwords or R2 access keys.
- Preview and production use separate Workers, D1 databases, and R2 buckets.
- Existing Node-only behavior must pass a `workerd` preview before production cutover.
- Turso remains unconfigured and no production data is switched until D1 migration, verification, backup, and rollback checks pass.
