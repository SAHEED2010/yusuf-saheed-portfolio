# Newsletter and Release Notifications

Recorded: 2026-08-18

## Intent

Visitors may subscribe to notifications for new articles, research, publications, tutorials, and selected releases. This is an opt-in notification channel, not an account requirement for reading the portfolio.

## Subscriber lifecycle

1. Visitor submits an email and explicitly agrees to receive the selected release notifications.
2. The server stores a pending subscription with a signed, expiring verification token.
3. The visitor verifies the address through the email link.
4. The subscriber becomes active and receives future eligible release messages.
5. Every message contains a signed unsubscribe link. Unsubscribe and bounce events immediately suppress future delivery.

## Subscriber record

- email (normalized and encrypted or protected at rest)
- status: pending, active, unsubscribed, bounced, or suppressed
- consent timestamp and consent text version
- verification timestamp, unsubscribe timestamp, and provider identifiers
- source route and selected notification categories
- created and updated timestamps

Do not store passwords for newsletter subscribers. Do not expose the subscriber list to the visitor assistant. Admin access should show delivery state, not unnecessary personal data.

## Release rules

Only a published content item with an eligible notification category can create a release event. Drafts, private items, and unverified achievements never trigger notifications. The admin dashboard must show a preview and recipient category before sending.

## Provider recommendation

Use Resend with a server-only key and a verified sending domain. Keep provider operations behind a notification module so the provider can be changed without changing content publishing or the signup UI. React Email can provide consistent release templates later.

This recommendation is not an authorization to create an account, send mail, or add credentials. Those actions require Yusuf's explicit approval and domain choice.
