# Prepare the Cloudflare account

Type: task
Status: ready-for-human

## Goal

Create and secure the Free Cloudflare account without creating broad credentials or production resources.

## Acceptance criteria

- Account email is verified.
- Two-factor authentication is enabled and recovery codes are stored privately.
- A workers.dev subdomain is confirmed.
- The Account ID can be located.
- No global API key, R2 S3 key, paid-plan upgrade, production database, production bucket, or domain cutover has been performed.

## Instructions

Follow `../credentials-checklist.md` and report only the non-secret completion state.
