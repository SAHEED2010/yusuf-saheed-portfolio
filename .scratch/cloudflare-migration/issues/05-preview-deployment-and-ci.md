# Deploy and verify the Cloudflare preview

Type: task
Status: ready-for-agent
Blocked by: 03-d1-persistence-adapter, 04-r2-media-adapter

## Goal

Deploy an isolated preview Worker through controlled CI and validate the complete portfolio against preview-only resources.

## Acceptance criteria

- GitHub uses protected preview and production environments.
- The Cloudflare token is narrowly scoped to the target account and stored only as a GitHub secret.
- Preview deploys to the preview Worker and cannot access production D1/R2 resources.
- Required CI, CodeQL, and repository protections remain intact.
- Browser smoke checks cover desktop/mobile public routes and authenticated admin workflows.
- Cloudflare logs expose failures without logging secrets, passwords, subscriber tokens, or private content.
