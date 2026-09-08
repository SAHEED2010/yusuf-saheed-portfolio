# Add the R2 media adapter

Type: task
Status: ready-for-agent
Blocked by: 02-workers-compatibility-preview

## Goal

Provide secure media persistence for future administrator uploads without coupling content records to R2 implementation details.

## Acceptance criteria

- A media module owns object keys, allowed content types, maximum size, metadata, retrieval, and deletion.
- Preview and production buckets are separate bindings.
- Upload authorization requires an authenticated administrator session.
- Browser code receives no R2 credentials.
- Content records store stable media references and metadata, not binary payloads.
- Static bundled assets continue working while admin upload UI is implemented separately.
