# Photo Catalog And Admin Upload

## Purpose
Define the v1 photo catalog implementation across public gallery browsing, admin original uploads, photo metadata, and public original delivery.

## Scope
This spec covers admin photo original upload, draft-first photo creation, metadata editing, publish/feature controls, public gallery API integration, public pagination/filtering, and real uploaded image rendering.

This spec does not cover thumbnail generation, EXIF extraction, CDN/object storage, bulk upload, drag sorting, analytics, or a dedicated public photo detail route.

## Locked Decisions
- Admin photo uploads accept `image/jpeg`, `image/png`, and `image/webp`.
- Admin photo originals are limited to `25 MB`.
- Uploaded photos are created as `draft` and `featured=false`.
- Public photo cards and lightbox render real original media URLs with lazy loading.
- Public photo originals remain originals-only in v1 and use `/media/photos/:id/original`.
- Public gallery filtering is server-side for year, location, and search.
- Public gallery pagination is page/page-size based.
- Public gallery filter options come from backend-provided photo facets, not from one visible page of results.
- Admin upload writes originals to `MEDIA_PHOTOS_ROOT` through the media storage outbound port.
- Filesystem paths are relative storage keys, sanitized, and safe under the configured root.

## Interfaces And Responsibilities
- Backend admin HTTP exposes `POST /api/admin/photos` as a private multipart endpoint.
- Required upload fields are `file`, `title`, `frame`, `date`, `location`, and `tone`.
- Optional upload fields are `tags`, `caption`, `camera`, and `film`.
- Backend validates MIME type, file signature, byte size, required metadata, and valid ISO-like date input before creating a durable photo record.
- Backend creates the photo id before storage so the original key can be deterministic, such as `YYYY/MM/<photo-id>.<ext>`.
- Backend cleans up a written original if database creation fails.
- Prisma stores nullable original display filename, MIME type, and byte size metadata so existing rows remain valid.
- Public `/api/photos` returns `items`, `pageInfo`, and `facets: { years, locations }`.
- Admin `/admin/photos` loads the private photo list, supports upload, and uses existing metadata and curation endpoints for edits, publish/unpublish, and feature/unfeature.
- Frontend public `/photos` stores filters and page in URL query params and reloads through React Router Data Mode.

## Data/Contracts Touched
- `Photo` Prisma metadata fields
- admin photo create inbound and outbound ports
- media photo storage outbound port
- admin photo multipart request contract
- public photo list DTO and facets
- frontend photo entity DTOs and mappers
- `/admin/photos` route, loader, action, and UI state
- `/photos` route loader, filter params, pagination, cards, and lightbox

## Acceptance Checklist
- [ ] `Photo` supports nullable original filename, MIME type, and byte-size metadata without breaking existing rows.
- [ ] Admin upload creates a draft, unfeatured photo with required metadata and a stored original reference.
- [ ] Admin upload rejects missing file, missing required metadata, unsupported MIME, MIME signature mismatch, invalid date, and files larger than `25 MB`.
- [ ] Admin upload deletes a written file if persistence fails.
- [ ] Public `/api/photos` returns paginated published photos plus stable year and location facets.
- [ ] Public `/photos` uses backend data, URL-backed filters, page pagination, and real image URLs.
- [ ] Public photo images lazy-load and fall back to the existing film-frame styling on image failure.
- [ ] Admin `/admin/photos` is session-protected and available from admin navigation.
- [ ] Admin `/admin/photos` supports upload, paginated listing, metadata edits, publish/unpublish, and feature/unfeature.
- [ ] Published originals are served from `/media/photos/:id/original`; unpublished originals remain denied.
- [ ] Backend tests cover use case, repository, filesystem storage, admin route validation, public facets, and media delivery regressions.
- [ ] Frontend tests cover photo API mapping, public gallery loader/UI behavior, admin route/action behavior, and admin photo UI states.
- [ ] Frontend lint/build and backend typecheck/boundary/media verification pass.

## Dependencies
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)
- [media-storage.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/media-storage.md)
- [admin-cms.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/admin-cms.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)

## Open Questions
- Whether a later version should generate thumbnails or extract EXIF metadata remains outside v1.
- Whether a public photo detail route is needed can be decided after the gallery is live.

## Task-Splitting Notes
- Split schema/storage/API work before frontend public and admin UI tasks.
- Keep public gallery integration separate from admin management UI.
- Keep upload behavior limited to public photo originals; do not mix chat upload behavior into this cluster.
- Use backend route and repository tests as the acceptance source for upload safety.

## Git Branch Implications
- Spec work uses `spec/SPEC-033-photo-catalog-gallery`.
- Schema work uses `data/PHOTO-001-photo-original-metadata`.
- Backend upload API work uses `backend/PHOTO-002-admin-photo-upload-api`.
- Public gallery work uses `frontend/PHOTO-003-public-photo-gallery-api`.
- Admin UI work uses `admin/PHOTO-004-admin-photo-management-screen`.
- All branches base from `develop`, merge to `develop`, include task IDs in commits and PR titles, and require review.
