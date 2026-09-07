# Cloudflare account and credential checklist

Do not paste secret values into chat or commit them to the repository.

## Get now

1. Create or sign in to a Cloudflare account at `https://dash.cloudflare.com/sign-up/workers-and-pages`.
2. Use Yusuf's portfolio account identity, recommended email: `yusufsaheed2012@gmail.com`.
3. Select the Free plan. Do not upgrade or approve a paid add-on during this preparation phase.
4. Verify the email address.
5. Enable two-factor authentication and save recovery codes in Yusuf's password manager or another private recovery location.
6. Open Workers & Pages once and choose/confirm the account's `workers.dev` subdomain.
7. Copy the Cloudflare Account ID. This is an identifier, not an API secret, but keep it out of public screenshots.

## Do not create yet

- Do not create a general/global API key.
- Do not create R2 S3 access keys; the application will use an R2 Worker binding.
- Do not put any Cloudflare token in `.env.local` or send it in chat.
- Do not connect the production domain.
- Do not create production D1/R2 resources until the repository's Wrangler configuration names and environments are reviewed.
- Do not enter billing details merely to continue past an optional paid-service prompt. Stop and report the screen first.

## We will create together after the compatibility branch exists

- Preview Worker: `yusuf-saheed-portfolio-preview`.
- Preview D1 database: `yusuf-portfolio-preview`.
- Preview R2 bucket: `yusuf-portfolio-media-preview`.
- Production Worker: `yusuf-saheed-portfolio`.
- Production D1 database: `yusuf-portfolio-prod`.
- Production R2 bucket: `yusuf-portfolio-media-prod`.
- A narrowly scoped Cloudflare API token for GitHub Actions.

## Values used later

| Value | Secret? | Destination |
| --- | --- | --- |
| Cloudflare Account ID | Treat as private configuration | GitHub preview/production environment secret `CLOUDFLARE_ACCOUNT_ID` |
| Scoped Cloudflare API token | Yes | GitHub preview/production environment secret `CLOUDFLARE_API_TOKEN` |
| D1 database IDs | No, but do not advertise | `wrangler.jsonc` environment bindings |
| R2 bucket names | No | `wrangler.jsonc` environment bindings |
| Worker runtime secrets | Yes | `wrangler secret put` or Cloudflare dashboard secrets |
| workers.dev hostname | No | Preview URL and `NEXT_PUBLIC_SITE_URL` |

## What to report back

Only report:

- `Account created and verified`.
- `2FA enabled`.
- The chosen `workers.dev` subdomain.
- Whether you found the Account ID. You do not need to paste it into chat; we can capture it privately during the setup step.
- Whether Cloudflare requested billing or a payment method at any point, and on which service screen.
