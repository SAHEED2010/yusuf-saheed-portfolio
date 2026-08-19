# Content and Project Template Model

Recorded: 2026-08-18

This is the production content contract behind the Signal Lab prototype. The goal is a deep module at the content seam: public routes ask for published records and presentation data, while the implementation hides validation, revision, source provenance, and template-specific rules.

## Shared content record

Every public item has the following shared fields:

- `id`, `slug`, `contentType`, `title`, `summary`, `body`
- `visibility`: private, preview, or public
- `lifecycle`: draft, review, published, or archived
- `featured`, `sortOrder`, `publishedAt`, `updatedAt`
- `role`: Yusuf's exact role, separate from team outcome
- `tags`, `links`, `media`, `collaborators`
- `evidence`: claims, source URL or asset, evidence level, and notes
- `revision`: author, reviewer, change summary, and timestamps

The dashboard is the source of truth for authored content. A source synchronization record is the source of truth for external metrics and never becomes an editable claim field.

## Project templates

Projects share the common record and select one presentation template:

### Product system

For Atlas, Twizrr, and other products with a user problem and shipped or demonstrable system.

Required sections: problem, audience, Yusuf's contribution, system decisions, current status, evidence, links, and next improvement.

### Research experiment

For a scientific or technical investigation where the question and uncertainty matter as much as the result.

Required sections: question, hypothesis or framing, method, sources, observations, result, limitations, and open questions.

### Tool or utility

For a focused developer tool, automation, library, or reusable workflow.

Required sections: repeated pain, interface, usage example, implementation notes, adoption or verification, and repository link.

### Team or startup work

For CodedDevs and collaborative work where Yusuf's contribution must be distinguished from the team result.

Required sections: shared mission, team context, Yusuf's role, contribution evidence, collaborators, outcome, and permission state.

### Achievement or milestone

For certificates, competitions, education milestones, and recognitions.

Required sections: issuing organization, date, achievement type, evidence asset or URL, what is proven, and what remains unproven.

## Presentation interface

The public presentation module should expose a small interface:

- `getPublished(slug)` returns a validated public record.
- `getIndexItems(type, filters)` returns concise cards or rows for a route.
- `getPreview(item, placement)` returns the allowed fields for homepage, index, or related-content placement.
- `getCaseStudy(item)` returns the full template-shaped detail view.

The implementation owns template validation, source labels, fallback states, and revision selection. Callers should not know how drafts, database records, GitHub synchronization, or media storage are organized.

## Placement rules

- Homepage preview: title, summary, template label, role, one evidence signal, and canonical route.
- Work index: title, status, template, role, tags, evidence level, and links.
- Case study: all approved template sections, sources, collaborators, revision date, and related work.
- Assistant context: only published fields and explicitly approved sources.

## External adapters

GitHub and WakaTime are adapters at the developer-activity seam. They return normalized metrics, source URL, synchronization time, and an unavailable state. They do not write authored claims and they never expose their credentials to the browser.
