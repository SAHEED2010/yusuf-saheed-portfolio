# AI Assistant Scope

Recorded: 2026-08-18

This note captures the confirmed product direction for Yusuf Saheed's portfolio assistants before provider and implementation decisions are made.

## Two assistants, two permission boundaries

### Visitor assistant

- Public and read-only.
- Clearly identifies itself as Yusuf's AI portfolio assistant rather than pretending to be Yusuf.
- Answers from published portfolio content and approved public sources.
- Shows five curated suggested questions that do not consume the custom-question allowance.
- Allows each visitor up to five custom questions in a rolling 24-hour period.
- Links answers to relevant projects, case studies, research, publications, or contact actions when possible.
- Refuses requests for private information, unsupported claims, content changes, account access, or actions outside the portfolio.

The custom-question limit should be enforced server-side using privacy-conscious rate limiting. The public interface should explain when the allowance resets without exposing internal identifiers.

### Admin assistant

- Available only inside the authenticated admin dashboard.
- Can search both published content and Yusuf-approved private portfolio materials.
- Can create drafts, update fields, reorganize sections, generate summaries, prepare image metadata, and propose related-content links.
- Must display a structured change summary and preview before publication.
- Publishes only after Yusuf explicitly confirms the exact pending change.
- Archives instead of permanently deleting content by default.
- Records an audit history and supports rollback.

## Confirmed knowledge sources

- Published portfolio content.
- Portfolio drafts and structured admin content.
- Yusuf's CV and uploaded materials.
- Approved project documentation and repositories.
- Research papers, publications, mathematics questions, science notes, and other materials Yusuf uploads.
- Approved public social profiles: GitHub (`https://github.com/SAHEED2010`), LinkedIn (`https://www.linkedin.com/in/yusuf-saheed123/`), and X (`https://x.com/yusufsaheed01`). Public portfolio answers may also point visitors to the approved email, WhatsApp contact, and support link.

GitHub activity is synchronized server-side from GitHub APIs and labeled with its refresh time. WakaTime activity remains unavailable until Yusuf signs into or creates the correct account and configures a server-only API token. Neither integration may expose credentials to the visitor assistant or treat activity volume as evidence of engineering quality.

Approved social access is read-only. It does not include private messages, unpublished drafts, account credentials, autonomous posting, commenting, liking, following, or sending messages.

## Content administration direction

Use a custom authenticated `/admin` dashboard rather than relying only on an embedded third-party studio. Store content as structured records so both manual forms and the admin assistant operate on the same validation rules.

The initial editable areas should cover:

- Profile, biography, positioning, contact details, availability, and calls to action.
- Projects, products, case studies, roles, evidence, links, media, and statuses.
- Experience, education, skills, startup work, and affiliations.
- Research, publications, mathematics questions, scientific explorations, and technical writing.
- CV, images, downloadable files, social profiles, support links, navigation, and homepage sections.
- Assistant suggested questions, public knowledge visibility, and source approval.

## Security direction

- Restrict admin authentication to Yusuf's approved account using private environment configuration, not a committed email allowlist.
- Keep public and administrator assistant tools separate at the server boundary.
- Validate AI-proposed changes using the same schemas as manual dashboard edits.
- Require confirmation for publication, archival, source synchronization, or any action with an external side effect.
- Never expose model credentials, authentication secrets, private source material, or administrator instructions to visitors.
