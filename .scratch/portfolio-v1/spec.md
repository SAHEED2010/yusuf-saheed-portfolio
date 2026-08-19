# Portfolio v1: Global, Admin-Managed Signal Lab

Status: active
Recorded: 2026-08-18

## Outcome

Make the Signal Lab portfolio useful to an international visitor without losing Lagos as Yusuf's real context. The homepage is an overview; changing content is managed through the private dashboard, while public activity integrations and newsletter notifications are synchronized through explicit server-side modules.

## User-visible behavior

- Show a live Lagos, Nigeria time display labeled as West Africa Time. It must update in the browser and never be stored as a hardcoded timestamp.
- Keep Buy Me a Coffee visible in the social/contact controls and add one prominent support placement that remains understandable on desktop and mobile.
- Present projects through structured templates rather than a single free-form editor. The same project record can appear as a homepage preview, work index item, or detailed case study.
- Replace generic experience wording with "Selected systems" or "Useful work" when describing shipped products, experiments, and tools.
- Add a newsletter signup for article, research, publication, and selected release notifications. Production signup requires consent, verification, unsubscribe, and delivery status.
- Provide a standard footer with navigation, contact, social links, Lagos context, support action, and current copyright year.
- Keep GitHub and WakaTime values labeled by source and refresh state. No integration failure may create an invented metric.

## Acceptance criteria

- At a supported desktop and mobile viewport, the Lagos clock is readable, timezone-labeled, and does not cause horizontal overflow.
- Buy Me a Coffee is visible without opening a menu; the support route remains editable from the dashboard.
- A project can be created with a selected template and only the fields required by that template; missing evidence is visible as an editorial state, not silently fabricated.
- A published content item can be routed to its canonical public URL and reused in homepage and index previews.
- Newsletter UI clearly states what visitors receive and does not imply subscription until verification succeeds.
- Footer is present on every public route in the production route map.
- Newsletter verification, unsubscribe, and privacy destinations are addressable routes rather than hidden modal-only states.
- Public pages remain useful without depending on client-only state for core content.

## Open production decisions

- Choose the newsletter delivery provider. Recommendation: Resend with double opt-in, signed unsubscribe links, bounce handling, and a server-only key.
- Confirm the exact support CTA wording for the prominent placement: "Support my work" is the current recommendation.
- Confirm the final public term between "Selected systems" and "Useful work" after reviewing the route prototype.
