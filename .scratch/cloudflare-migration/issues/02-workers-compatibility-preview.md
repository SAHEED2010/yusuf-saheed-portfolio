# Prove Next.js compatibility on Cloudflare Workers

Type: prototype
Status: ready-for-agent
Blocked by: 01-account-preparation

## Goal

Create a non-production OpenNext/Wrangler branch and prove that the existing full-stack routes can execute under `workerd` before changing the persistence implementation.

## Acceptance criteria

- OpenNext and Wrangler are configured using the official existing-project path.
- Normal Next.js development still works.
- A local Cloudflare preview builds and starts.
- Node compatibility is audited for `node:crypto`, scrypt password verification, cookies, route handlers, AI HTTP calls, MCP, and filesystem assumptions.
- Incompatible behavior is listed with an explicit migration decision instead of silently polyfilled.
- No production resource or domain is changed.
