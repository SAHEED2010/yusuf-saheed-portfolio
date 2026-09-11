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

A release notification system now exists: `src/newsletter/release.ts` composes and sends a notification to every active subscriber when a published, public, standalone entry is released, gated behind a distinct admin preview step (`ReleasePanel` on Admin / Content) that shows the subject and live recipient count before a separate confirmation actually sends anything. Collections, drafts, and private records are never eligible.

This also fixed a real bug found while building it: the unsubscribe link could never work for any subscriber who successfully verified, because the only token ever issued was the signup-verification token, and verifying a subscription destroys that exact token. Unsubscribe now uses a stateless signed link (`unsubscribeToken()` in `src/newsletter/store.ts`) instead of a stored one-time token, so it keeps working for every release sent, indefinitely, with no extra schema.

Remaining after this slice: delivery through Resend is configured but was returning a 502 in production as of this session, unresolved — the send path itself is now correct and tested, but the actual provider connection needs checking. No admin UI exists yet to suppress or remove a subscriber, or to view delivery state beyond the immediate send result. Sending is one-by-one rather than batched, which is fine at current subscriber volume but would need revisiting at scale.
