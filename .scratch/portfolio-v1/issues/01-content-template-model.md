# Content and Project Template Model

Type: task
Status: ready-for-human
Blocked by: none

## Goal

Define the structured records that let the admin dashboard create and improve projects, Library entries, achievements, profile blocks, footer content, and newsletter settings without hardcoding public pages.

## Acceptance criteria

- A shared content record has identity, visibility, publication state, source, media, links, evidence, and revision metadata.
- Projects select a presentation template and validate the template-specific fields.
- Homepage, index, and detail views consume the same published record rather than separate copies.
- Draft, review, published, and archived states are distinct.
- External GitHub and WakaTime values remain synchronized facts, not editable project claims.

## Notes

See `docs/research/content-template-model.md`.

## Comments

The first tracer bullet is the prototype and schema contract; production implementation waits for the approved Next.js scaffold.

The production tracer bullet now includes a typed content union, project-template validation, a development content adapter, and public route consumers. Database persistence and authenticated editing remain in issue 04.
