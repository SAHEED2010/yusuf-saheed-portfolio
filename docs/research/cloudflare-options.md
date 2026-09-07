# Cloudflare options for Yusuf Saheed's portfolio

Research date: 2026-08-21

## Executive conclusion

Cloudflare can host and support this portfolio, but it is a platform stack rather than a one-for-one replacement for Turso:

- Workers: application/server runtime and APIs.
- D1: SQLite-compatible relational database, closest to the current Turso/libSQL design.
- R2: object storage for images, PDFs, certificates, and other media.
- Workers KV: useful for small read-heavy configuration/cache values, not the primary content database.
- Pages: suitable for static Next.js output; Cloudflare directs full-stack SSR Next.js applications to the Workers deployment path.

For the current codebase, Cloudflare is feasible but requires an adapter/deployment migration. The app currently relies on Node.js runtime APIs, `@libsql/client`, local filesystem SQLite for development, and Next.js Node runtime routes. No Cloudflare migration should be made until the deployment target is chosen.

## Official limits relevant to this project

Cloudflare's D1 limits page states that the Free plan provides 10 databases, 500 MB maximum per database, 5 GB total account storage, seven-day Time Travel, and 50 queries per Worker invocation. A D1 database is single-threaded and processes queries one at a time; concurrent requests may queue and eventually return an overloaded error. Sources: [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [D1 best practices](https://developers.cloudflare.com/d1/best-practices/).

Cloudflare's R2 pricing page states that the free Standard storage allowance is 10 GB-month per month, with 1 million Class A operations and 10 million Class B operations per month. Internet egress is free. Source: [R2 pricing](https://developers.cloudflare.com/r2/pricing/).

Cloudflare's Workers limits page states that Workers Free includes 100,000 requests per day, 50 subrequests per invocation, 128 MB isolate memory, and a 30-second default CPU limit. Source: [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).

Cloudflare's Next.js documentation distinguishes static Next.js deployment on Pages from full-stack server-rendered Next.js deployment on Workers. Source: [Cloudflare Next.js guidance](https://developers.cloudflare.com/pages/framework-guides/nextjs/), [Next.js on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/).

## Mapping Cloudflare to the portfolio

| Portfolio requirement | Cloudflare service | Assessment |
| --- | --- | --- |
| Public pages and APIs | Workers | Good fit, but Node-runtime assumptions must be checked or isolated. |
| Admin-managed content | D1 | Good fit for current volume; preserve the existing database adapter boundary. |
| Images, PDFs, certificates, research files | R2 | Strong fit; files should not be stored inside D1. |
| Newsletter subscriber records | D1 | Good fit; email delivery still needs Resend, SES, or another provider. |
| GitHub/WakaTime snapshots | D1 or KV | D1 for durable snapshots; KV only for cache-like values. |
| Rate limiting | Durable Objects, KV, or Cloudflare rules | Needs a deliberate design; D1 alone is not an ideal high-frequency rate limiter. |
| AI providers and MCP | Workers server routes | Independent of the database; secrets remain server-side. |
| Static site only | Pages | Not enough for this application's admin/API requirements unless the backend is hosted elsewhere. |

## Benefits for Yusuf's roadmap

- One provider can cover hosting, database, media storage, caching, DNS, and edge delivery.
- R2 is particularly useful for the planned portfolio media, publications, certificates, and documents.
- D1's SQLite lineage is closer to the current schema than a PostgreSQL migration would be.
- Workers can place public pages and API endpoints close to visitors globally.
- Free-tier capacity is likely ample for an early personal portfolio, provided usage remains modest and limits are monitored.

## Risks and disadvantages

- Cloudflare Workers is not the same runtime as a normal Next.js Node server. Node-only APIs such as `node:crypto`, filesystem access, and some package behavior need compatibility review.
- D1 is SQLite-like and single-threaded per database; it is not a PostgreSQL replacement for complex relational growth.
- Cloudflare does not automatically provide the complete auth, newsletter, AI, or admin workflow that Supabase does.
- R2 is object storage, not a content management system; upload authorization, metadata, cleanup, and image transformations remain application responsibilities.
- Free limits are quotas, not a guarantee of zero billing in every configuration. Billing, account verification, and service-specific terms should be reviewed before production use.
- Moving from Turso to D1 still requires migration work even though both are SQLite-family systems; the client and deployment bindings differ.

## Recommended path

Do not migrate the database just because Cloudflare has a free tier. First create a Cloudflare account and use it for a non-production evaluation project or preview deployment. Then choose one of these paths:

1. **Least-risk launch:** keep the current Next.js deployment and Turso, add Cloudflare DNS/CDN and R2 later for media.
2. **Cloudflare-native stack:** adapt the app to Workers, replace the Turso client with a D1 binding, and add R2 for media. This is a deliberate engineering migration.
3. **Cloudflare frontend plus separate backend:** host the public frontend on Cloudflare while keeping the Node-compatible API/database deployment elsewhere. This reduces runtime migration risk but creates two deployment systems.

For Yusuf's current one-admin portfolio, the best immediate experiment is Cloudflare account signup plus a preview/hello deployment. Do not enter production secrets or switch `master` until a Workers compatibility pass and a D1/R2 proof of concept succeed.
