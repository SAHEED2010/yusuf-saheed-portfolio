# Add the D1 persistence adapter

Type: task
Status: ready-for-agent
Blocked by: 02-workers-compatibility-preview

## Goal

Preserve existing portfolio behavior while allowing local persistence and Cloudflare D1 to satisfy the same application seam.

## Acceptance criteria

- Cloudflare runtime bindings are resolved in one module.
- Existing callers do not import D1 types or Cloudflare runtime objects.
- Content, settings, audit, integration snapshots, newsletter subscribers, and rate-limit records work through D1.
- Local tests use a local adapter or local D1 without contacting production.
- Migrations are explicit files/commands and cannot accidentally target production.
- Backend smoke tests cover both persistence adapters where behavior can differ.
