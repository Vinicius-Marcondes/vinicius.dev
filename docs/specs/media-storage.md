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
- Chat uploads allow `image/jpeg`, `image/png`, and `image/webp`.
- Chat uploads are limited to `5 MB`.
- Chat allows one image per message.
- Chat uploaded images are room-gated, not public.
- Deleted chat messages and media metadata are soft-hidden with audit records; physical file cleanup may be implemented later.
- Public photo originals are served through backend media URLs such as `/media/photos/:id/original`.
- Filesystem access occurs only through outbound storage ports implemented by outbound adapters.

## Interfaces and Responsibilities
- Define separate storage roots for public photo originals and chat uploads per environment.
- Define naming or path rules that avoid collisions, sanitize filenames, and preserve traceability.
- Define which backend outbound ports own file writes and which service serves the files.
- Define the filesystem adapter boundary under `adapters/outbound/storage/filesystem`.
- Define deletion and moderation expectations for chat uploads.
- Define backup expectations for filesystem data alongside Postgres.

## Storage Roots And Access
- Public photo originals use an environment-specific root such as `${MEDIA_PHOTOS_ROOT}` and are exposed through backend-controlled routes like `/media/photos/:id/original`.
- Chat uploads use an environment-specific root such as `${MEDIA_CHAT_ROOT}` and are not directly exposed as public static files.
- Development and production media roots must be separate even when running on the same VPS.
- Postgres stores stable media ids, storage keys/paths, display filenames, MIME types, byte sizes, and moderation/audit state.
- Storage adapters own physical file writes, reads, and optional cleanup; core services call storage ports, not filesystem APIs.

## Upload Contracts
- Hono inbound adapters validate multipart/request data before calling chat/media use cases.
- Accepted chat image MIME types are `image/jpeg`, `image/png`, and `image/webp`.
- Maximum chat upload size is `5 MB`.
- Each chat message may reference at most one image upload.
- Image-only messages are allowed if the backend creates or accepts a fallback caption/body compatible with the chat DTO.
- Rejected uploads must not create durable message or media records unless an explicit audit/error record is later specified.

## Moderation And Retention
- Chat moderation soft-hides messages from room responses and soft-hides related media metadata.
- Audit records keep actor, action, target ids, reason, timestamp, and relevant previous/next state.
- Physical chat files may remain on disk after soft-hide until a later cleanup job removes them.
- Public photo originals are not governed by chat room access; publish/unpublish state controls whether their media route is reachable.

## Data/Contracts Touched
- filesystem paths
- media metadata references
- outbound storage port contracts
- upload request and moderation semantics
- backup and retention expectations
- chat upload MIME, size, and count constraints
- public photo media URL contract
- room-gated chat media access contract

## Acceptance Checklist
- [ ] Photo originals and chat uploads have separate storage roots.
- [ ] Development and production media roots are separate.
- [ ] Database records reference filesystem paths rather than binary blobs.
- [ ] Storage behavior is expressed through outbound ports rather than direct filesystem calls from the core.
- [ ] Filesystem storage is treated as an outbound adapter aligned to `project-structure.md`.
- [ ] Originals-only delivery tradeoff is explicit.
- [ ] Public photo originals are served through backend routes such as `/media/photos/:id/original`.
- [ ] Chat uploads accept only `image/jpeg`, `image/png`, and `image/webp`.
- [ ] Chat uploads are limited to `5 MB`.
- [ ] Chat messages allow at most one image upload.
- [ ] Chat upload access is room-gated.
- [ ] Chat moderation soft-hides messages and media metadata while preserving audit records.
- [ ] Backup responsibility for filesystem media is documented.
- [ ] Explicit non-goal: CDN or object storage support is not required in v1.

## Dependencies
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)

## Open Questions
- Final folder naming scheme can be selected during implementation if the separation and traceability rules hold.
- Physical cleanup timing for soft-hidden chat files is deferred beyond Wave 2 unless implemented as a simple maintenance task.

## Task-Splitting Notes
- Keep storage-path decisions and backup policy in the same task if they directly depend on one another.
- Split public photo delivery, chat upload validation/storage, and moderation retention into separate tasks after shared storage ports exist.
- Do not split upload behavior tasks before moderation expectations and outbound storage port ownership are approved.

## Git Branch Implications
- Storage changes use `infra/`, `be/`, or `data/` branches depending on the layer being changed.
- Because storage decisions are hard to reverse operationally, keep each storage task narrowly scoped.
