# Media Storage

## Purpose
Define how photos and chat uploads are stored, referenced, and operated on within the VPS deployment and the backend hexagonal boundary.

## Scope
Filesystem layout, path conventions, upload ownership, retention assumptions, and operational guardrails.

## Locked Decisions
- Originals are stored on the VPS filesystem.
- Postgres stores metadata and filesystem references, not the media binaries.
- Public photo delivery remains originals-only in v1.
- Chat image uploads are enabled in v1.
- Filesystem access occurs only through outbound storage ports implemented by outbound adapters.

## Interfaces and Responsibilities
- Define separate storage roots for public photos and chat uploads.
- Define naming or path rules that avoid collisions and preserve traceability.
- Define which backend outbound ports own file writes and which service serves the files.
- Define the filesystem adapter boundary under `adapters/outbound/storage/filesystem`.
- Define deletion and moderation expectations for chat uploads.
- Define backup expectations for filesystem data alongside Postgres.

## Data/Contracts Touched
- filesystem paths
- media metadata references
- outbound storage port contracts
- upload request and moderation semantics
- backup and retention expectations

## Acceptance Checklist
- [ ] Photo originals and chat uploads have separate storage roots.
- [ ] Database records reference filesystem paths rather than binary blobs.
- [ ] Storage behavior is expressed through outbound ports rather than direct filesystem calls from the core.
- [ ] Filesystem storage is treated as an outbound adapter aligned to `project-structure.md`.
- [ ] Originals-only delivery tradeoff is explicit.
- [ ] Chat moderation can remove or disable uploaded media.
- [ ] Backup responsibility for filesystem media is documented.
- [ ] Explicit non-goal: CDN or object storage support is not required in v1.

## Dependencies
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)

## Open Questions
- Final folder naming scheme can be selected during implementation if the separation and traceability rules hold.

## Task-Splitting Notes
- Keep storage-path decisions and backup policy in the same task if they directly depend on one another.
- Do not split upload behavior tasks before moderation expectations and outbound storage port ownership are approved.

## Git Branch Implications
- Storage changes use `infra/`, `be/`, or `data/` branches depending on the layer being changed.
- Because storage decisions are hard to reverse operationally, keep each storage task narrowly scoped.
