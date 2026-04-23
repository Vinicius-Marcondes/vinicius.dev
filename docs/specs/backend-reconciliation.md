# Backend Reconciliation

## Purpose
Validate backend-facing specs against the migrated frontend and record the durable reconciliation needed before Wave 2 backend task decomposition.

## Inputs
- `docs/specs/frontend-analyzer-report.md`
- `docs/specs/tracker.md`
- `docs/specs/project-structure.md`
- `docs/specs/backend-architecture.md`
- `docs/specs/data-model.md`
- `docs/specs/media-storage.md`
- `docs/specs/admin-cms.md`
- `docs/specs/infra-deployment.md`
- `docs/specs/ci-cd.md`
- `docs/specs/verification.md`
- `frontend/src/entities/**`
- `frontend/src/features/**`
- `frontend/src/pages/**`

## Summary Status
No backend task decomposition should start yet.

The migrated frontend is stable enough to approve backend-facing specs after targeted edits, but the current drafts do not yet pin the frontend-derived API, DTO, upload, and admin/chat contracts tightly enough. The FE-010 analyzer reports no frontend migration blockers, but its `adapt-spec` API and upload/media findings remain unresolved inputs for backend, data, media, admin, infra, CI/CD, and verification specs.

## Spec Classification
| Spec | Classification | Rationale |
| --- | --- | --- |
| `project-structure.md` | ready-for-task-decomposition | Structurally aligned with the migrated frontend/backend split and one-hexagon backend policy. It still needs formal approval in the tracker, but no frontend-derived contract edit is required. |
| `backend-architecture.md` | needs-edit-before-approval | It names public, auth, admin, chat, and media responsibilities, but does not explicitly anchor HTTP APIs under `/api` or define frontend DTO compatibility for content, chat, admin auth, uploads, status strip, RSS, and sitemap. |
| `data-model.md` | needs-edit-before-approval | It covers the right entities, but several field-level contracts differ from or underspecify the migrated frontend DTOs. Projects, photos, thoughts, chat messages, uploads, and status strip need explicit API-facing fields. |
| `media-storage.md` | blocked-by-decision | It aligns on filesystem media and image uploads, but upload limits, accepted image types, public URL/reference shape, derivative policy, and moderation retention behavior need owner decisions before approval. |
| `admin-cms.md` | needs-edit-before-approval | It aligns with the admin shell and admin dashboard, but should explicitly include the migrated frontend's login/MFA states, dashboard queues, status strip fields, chat moderation commands, and curation controls. |
| `infra-deployment.md` | needs-edit-before-approval | Runtime topology is aligned, but Caddy/backend routing must explicitly reserve `/api`, static frontend fallback behavior, media serving paths, and environment-specific media volumes. |
| `ci-cd.md` | blocked-by-decision | Policy is aligned, but concrete validation commands cannot be approved until backend command names, boundary checks, and frontend analyzer invocation policy are selected. |
| `verification.md` | needs-edit-before-approval | It includes the right gate categories, but must add explicit FE-010 reconciliation checks for `/api`, content DTOs, chat image uploads, media storage, admin auth/MFA, and status strip contracts. |

## Frontend-Derived Contracts Backend Specs Must Honor
### API Base
- `frontend/src/shared/api/index.ts` exports `apiBaseUrl = '/api'`.
- Backend HTTP routes intended for the frontend must be reachable below `/api`.
- Caddy must route `/api/*` to the backend service for both `development.viniciuslab.dev` and `viniciuslab.dev`.
- Frontend static routing must continue to serve React Router pages for `/`, `/thoughts`, `/projects`, `/photos`, `/chat`, `/admin`, `/admin/login`, and `/admin/dashboard`.

### Public Content Routes And DTOs
- Public routes are `/`, `/thoughts`, `/projects`, `/photos`, and `/chat`; admin routes are `/admin`, `/admin/login`, and `/admin/dashboard`.
- Thoughts require `id`, `title`, `type: 'essay' | 'note'`, `status: 'draft' | 'published'`, `publishedAt`, `readingTime`, `tags`, `excerpt`, and `bodyPreview`.
- Public thought feeds only render `published` records and sort descending by `publishedAt`.
- Project cards require `id`, `channel`, `title`, `year`, `status: 'live' | 'archived' | 'in-progress'`, `description`, `tags`, `links.github`, `links.site`, and `thumbnail.hue/kind`.
- Project filters depend on search across `title`, `description`, `channel`, and `tags`, plus status, tag, and sort modes `recent`, `alpha`, and `channel`.
- Photo cards and lightbox require `id`, `frame`, `title`, `date`, `location`, `tags`, and `tone: 'amber' | 'cyan' | 'mono' | 'sunset' | 'violet'`.
- Photo filters depend on `year`, `location`, and search across title, location, frame, and tags; groups are derived from `date.slice(0, 7)` and sorted newest first.
- Status strip entries require `label`, `value`, and optional `accent: 'amber' | 'cyan' | 'pink'`.

### Admin CMS
- Admin login is modeled as credentials first, then optional email-code MFA, then a ready session.
- Credentials use email and password; MFA code is a six-digit email code in the frontend mock.
- Admin dashboard surfaces counts/queues for draft thoughts, featured slots, photo records, chat flags, content queue actions, status strip editing, and chat moderation.
- Chat moderation actions surfaced in the frontend are delete message, ban handle, and rotate room password.
- Admin CMS must preserve manual homepage curation and status strip editing.

### Chat
- Chat route is public in navigation but password-gated at the room door.
- Join requires a handle and room password.
- The frontend persists handle locally under `vinicius-dev-chat-handle`; backend should treat handle persistence as server-side room identity after auth lands.
- Chat messages require `id`, `author`, `body`, `sentAt`, optional `tone: 'cyan' | 'pink' | 'system'`, and optional image attachment.
- Chat participants require `handle` and `status: 'idle' | 'online'`.
- Chat message send allows text-only, image-only with fallback caption, or text plus image.

### Upload And Media
- Chat composer accepts only `image/*` from the browser.
- Frontend attachment shape is currently `{ fileName, kind: 'image' }`; backend specs must define whether API DTOs add URL, dimensions, mime type, byte size, checksum, id, moderation state, or storage key.
- Chat uploads are available to anyone who passes the shared room password.
- Media storage must separately cover public photo originals and chat image uploads.
- Public photos are currently represented by styled film frames, but specs already require originals-only public delivery in v1; API DTOs need a public original URL or a stable media reference before implementation.

## Spec Mismatches Or Missing Details By File
### `project-structure.md`
- No frontend-derived mismatch found.
- The spec remains a prerequisite gate because the tracker says project structure approval is still required before backend tasking.

### `backend-architecture.md`
- Missing explicit `/api` base route contract from `frontend/src/shared/api/index.ts`.
- Missing endpoint-family language for public content DTOs, admin auth/MFA, chat room session, chat messages, image upload, RSS, sitemap, and status strip.
- Chat upload support is listed but not reconciled with browser `image/*` and image-only attachment contracts.
- The "adapt to imported frontend assumptions" decision is too broad to serve as acceptance criteria.

### `data-model.md`
- Thoughts do not explicitly include `bodyPreview`, `readingTime`, `type: essay | note`, and API-facing `publishedAt`.
- Projects use generic `type`, `summary`, `body`, `stack`, and media refs, but the frontend needs `channel`, `year`, `status`, `description`, `tags`, `links`, and `thumbnail` fields.
- Photos include camera/film and filesystem path, but the frontend needs `frame`, `date`, `location`, `tags`, `tone`, and a future public media reference.
- Status strip fields are generic and should map to repeated `{ label, value, accent? }` entries rather than only current focus/location/build note.
- Chat attachment data is underspecified relative to image-only uploads, filename display, moderation, and future media references.

### `media-storage.md`
- Missing accepted image type policy beyond the browser's broad `image/*`.
- Missing max file size, per-message upload count, storage naming, URL/reference DTO shape, and metadata fields.
- Missing clear retention behavior for deleted chat messages versus disabled/deleted uploaded media.
- Missing explicit mapping from public photo filesystem originals to API fields.

### `admin-cms.md`
- Needs explicit compatibility with the migrated admin routes: `/admin`, `/admin/login`, and `/admin/dashboard`.
- Needs explicit login state machine: credentials, email-code MFA, ready session.
- Needs dashboard contract for content queue, featured slots, photo records, status strip fields, chat flags, delete, ban, and password rotation.
- Needs a decision on whether admin preview/draft preview is part of Wave 2 or remains deferred.

### `infra-deployment.md`
- Missing `/api/*` reverse-proxy routing contract.
- Missing static frontend fallback rule for React Router routes, especially `/admin/*`.
- Missing media serving route/path policy for public photo originals and chat upload access control.
- Missing environment-specific media volume separation for development and production.

### `ci-cd.md`
- Correctly avoids inventing commands, but approval depends on deciding the canonical frontend/backend validation commands.
- Missing explicit requirement to keep FE analyzer current or rerun it when frontend contracts are changed before backend tasking.
- Missing backend architecture-boundary check policy once backend code exists.

### `verification.md`
- Needs explicit contract checks for `/api` base routing.
- Needs public DTO checks for thoughts, projects, photos, status strip, chat messages, participants, and attachments.
- Needs upload verification scenarios for image accept policy, storage reference persistence, moderation deletion/disable behavior, and media backup.
- Needs admin auth/MFA and moderation scenario details tied to the migrated admin shell.

## Exact Proposed Spec Edits
### `project-structure.md`
- Add no frontend-driven edits.
- Approval action only: mark as approved once Vinicius accepts the structural gate.

### `backend-architecture.md`
- Add a locked decision: "All frontend-facing backend HTTP routes are mounted under `/api` because the migrated frontend exports `apiBaseUrl = '/api'`."
- Add endpoint-family responsibilities for `/api/thoughts`, `/api/projects`, `/api/photos`, `/api/status-strip`, `/api/chat/*`, `/api/admin/*`, `/api/auth/*`, `/api/rss`, and `/api/sitemap`.
- Add a frontend contract subsection listing the DTO compatibility requirements for public content, status strip, chat messages, participants, attachments, admin auth/MFA, and uploads.
- Replace the broad "adapt to imported frontend assumptions" acceptance item with checks for FE-010 API assumptions and upload/media assumptions.
- Clarify that upload handling is split between chat application use cases, media outbound storage ports, and HTTP multipart/request mapping adapters.

### `data-model.md`
- Add frontend-facing field requirements for `Thought`: `type`, `status`, `publishedAt`, `readingTime`, `excerpt`, `bodyPreview`, `tags`, and body/source content.
- Replace or augment the `Project` field list with `channel`, `year`, `status`, `description`, `tags`, `githubUrl`, `siteUrl`, `thumbnailHue`, and `thumbnailKind`.
- Add `Photo` frontend fields: `frame`, `date`, `location`, `tags`, `tone`, filesystem original reference, and public original URL/reference policy.
- Change status strip modeling to an ordered list of entries with `label`, `value`, optional `accent`, and timestamps.
- Add chat upload metadata fields: displayed filename, mime type, size, storage key/path, uploader handle, message relation, moderation state, and timestamps.
- Add an acceptance item requiring repository DTO mapping to preserve frontend filter/sort behavior without leaking Prisma types.

### `media-storage.md`
- Add a decision placeholder for accepted image MIME types and max file size before approval.
- Add explicit storage roots for public photo originals and chat uploads per environment.
- Add required metadata/reference shape for API responses: at minimum stable id or storage key, displayed filename, kind `image`, and public/private access URL policy.
- Add moderation semantics for chat upload removal: hard delete, soft disable, or hidden-with-retention must be selected before approval.
- Add a note that public photo originals require stable public delivery paths while chat uploads may require room/session-gated access.

### `admin-cms.md`
- Add route compatibility language for `/admin`, `/admin/login`, and `/admin/dashboard`.
- Add admin auth state machine: credentials, email-code MFA challenge, verified session.
- Add dashboard contract for content queues, draft thought counts, featured slots, photo records, chat flags, status strip editing, and moderation commands.
- Add curation contract for manually pinned homepage previews and ordered status strip entries.
- Add an open decision on draft preview scope for Wave 2.

### `infra-deployment.md`
- Add Caddy routing rule: `/api/*` proxies to backend; non-API routes fall back to the frontend app.
- Add media route policy for public photo originals and chat upload retrieval.
- Add separate development and production Postgres/media volumes or compose project names.
- Add environment variables for API base/routing, upload limits, media roots, media public URL base, and room password/auth secrets.

### `ci-cd.md`
- Add a pre-approval decision list for canonical commands: frontend typecheck/lint/build, frontend analyzer, backend test/lint/typecheck, backend boundary check, and migration check.
- Add acceptance language that CI must fail on stale analyzer report or contract drift once analyzer automation exists.
- Add a note that deployment workflow tasks remain blocked until runtime commands and deploy descriptors are defined.

### `verification.md`
- Add FE-010 reconciliation checks for `/api` base route, upload/media assumptions, and frontend DTO compatibility.
- Add cross-layer scenarios for public content lists, admin login/MFA, chat join/send/upload, chat moderation, photo original delivery, status strip editing, RSS, sitemap, and static route fallback.
- Add boundary verification for core use cases without HTTP/Postgres and adapter contract tests for HTTP DTO mapping.
- Add release-readiness checks tying CI/CD, infra routing, media backup, and environment separation together.

## Decisions Required From Vinicius
- Approve `project-structure.md` as the backend structural hard gate, or request structural changes before any backend tasking.
- Decide API DTO naming and endpoint style under `/api`: resource names, pagination strategy, and whether filters are server-side in Wave 2 or initially client-side.
- Decide chat upload policy: allowed MIME types, max file size, one-or-many attachments per message, filename sanitization, and whether uploads are public, signed, or room-gated.
- Decide chat moderation retention: hard-delete uploads/messages, soft-hide with audit trail, or mixed policy.
- Decide public photo delivery field: direct public original URL, backend media route, or opaque media reference resolved by frontend.
- Decide whether admin draft preview is in Wave 2 or explicitly deferred.
- Decide CI command names and whether frontend analyzer freshness becomes a required PR gate immediately after spec approval.
- Decide whether RSS and sitemap are included in Wave 2 backend decomposition or deferred until public content persistence lands.

## Recommended Wave 2 Task Clusters And Dependency Order
These are planning clusters only, not implementation tasks.

1. Spec approval cluster: approve `project-structure.md`, apply reconciliation edits to backend-facing specs, resolve Vinicius decisions, then approve backend/data/media/admin/infra/CI/verification specs.
2. Backend foundation cluster: backend scaffold, module-first hexagon skeleton, Hono inbound adapter shell, config/bootstrap, shared ports, and test harness.
3. Persistence foundation cluster: Prisma/Postgres setup, migrations, repository adapter patterns, and domain-to-DTO mapping rules.
4. Public content cluster: thoughts, projects, photos metadata, status strip, frontend DTO compatibility, RSS, and sitemap if approved.
5. Media cluster: filesystem storage adapter, public photo original delivery, chat image upload storage, metadata persistence, backup rules, and moderation media behavior.
6. Auth/admin cluster: admin credentials, optional email-code MFA, sessions, admin dashboard contracts, content CRUD, curation, and status strip editing.
7. Chat cluster: room password gate, handle persistence, message archive, participant state, image attachments, moderation delete/ban/password rotation.
8. Infra/CI/verification cluster: Caddy `/api` and static fallback routing, Docker/VPS topology, environment media volumes, GitHub Actions validation, production tag deploy, and cross-layer verification.

## Go/No-Go For Backend Task Decomposition
Status: no-go.

Backend task decomposition should wait until:
- `project-structure.md` is approved as the structural gate.
- The proposed reconciliation edits are applied to backend-facing specs.
- Vinicius resolves the media/upload, DTO/API, admin preview, CI command, and RSS/sitemap decisions listed above.
- Backend-facing specs are reclassified from `needs-edit-before-approval` or `blocked-by-decision` to `ready-for-task-decomposition`.

Once those conditions are met, Wave 2 can start from the task clusters above without reopening the completed frontend migration wave.
