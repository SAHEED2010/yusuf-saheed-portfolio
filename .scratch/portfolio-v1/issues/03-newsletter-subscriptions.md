# Newsletter Subscriptions

Type: task
Status: needs-info
Blocked by: 01-content-template-model

## Goal

Allow visitors to receive notifications when Yusuf publishes an article, research item, publication, or selected release.

## Acceptance criteria

- Signup collects only the required email and consent state.
- Double opt-in verification is required before a subscriber becomes active.
- Every notification includes a working unsubscribe path.
- Admin can view delivery state and suppress or remove a subscriber without exposing private data.
- Provider credentials remain server-only and test messages require explicit approval.

## Open question

Confirm Resend or choose another provider before implementing external delivery.

## Comments

The public signup, verification, and unsubscribe routes are currently UI boundaries only. External delivery, subscriber persistence, signed tokens, and provider credentials remain intentionally blocked pending an approved provider and sending domain.
