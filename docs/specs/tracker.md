# Spec Tracker

## Gate Checks
| Gate | Status | Notes |
| --- | --- | --- |
| Frontend structure spec approved | yes | `frontend-structure.md` remains the hard structural gate for frontend-facing work. |
| Frontend architecture spec approved | yes | `frontend-architecture.md` already defines one-app routing, shell ownership, and frontend API boundaries. |
| Admin CMS spec approved | yes | `admin-cms.md` already locks admin route compatibility and auth/MFA expectations. |
| Backend auth/admin HTTP contracts available | yes | Backend already serves `/api/auth/*` and `/api/admin/dashboard/summary`. |
| Frontend admin auth integration spec approved | yes | `SPEC-028` is approved below and ready to drive `FE-011`. |
| Chat room live integration spec approved | yes | `SPEC-030` is merged to `develop` and ready to drive `CHAT-008`, `CHAT-009`, and `CHAT-010`. |
| Testing coverage foundation spec approved | yes | `SPEC-032` defines the first backend/frontend/CI test coverage wave and is ready to drive `QA-009` through `QA-013`. |

## Global Decisions
- Use Bun for both frontend and backend toolchains.
- Treat `develop` as the short-horizon integration branch and `main` as the stable branch.
- Frontend target is one `Vite + React + TypeScript + Bun` app using React Router Data Mode, strict FSD, and separate public/admin shells.
- The backend target is one application hexagon with module-first core organization and adapters at the technology edge.
- All frontend-facing backend APIs are mounted under `/api`; public photo originals use backend media URLs such as `/media/photos/:id/original`.
- Public list filtering is server-side for Thoughts, Projects, and Photos.
- Pagination is required from day one: cursor pagination for Thoughts and Chat, page pagination for Projects and Photos.
- Chat uploads allow `image/jpeg`, `image/png`, and `image/webp`, max `5 MB`, one image per message.
- Chat uploaded images are room-gated, not public.
- Deleted chat messages and media metadata are soft-hidden with audit records; physical file cleanup can be deferred.
- Public chat room sessions persist for up to `24` hours and then require re-entry with the room password.
- Realtime public chat delivery uses a room-scoped native WebSocket after HTTP join/history bootstrap.
- Thoughts RSS and sitemap are included.
- Frontend task execution is tracker-first: one task, one branch, one acceptance source, and one tracker entry.

## Cross-Cutting Risks
- Public photo delivery is intentionally originals-only, which may create performance and bandwidth pressure.
- Chat room image uploads are allowed for anyone with the room password, which increases moderation and storage risk.
- CI/CD workflows are now defined, but production deployment still depends on correct `production` environment secret provisioning and remote deploy command hardening.
- Admin auth now depends on correct cookie handling through the Vite `/api` proxy locally and the future reverse proxy in deployed environments.

## Next Task Queue
1. Complete reviewer validation for `QA-008` follow-up PR [#117](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/117).
2. Complete reviewer validation for `CHAT-010` PR [#122](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/122).
3. Execute `SPEC-032` testing coverage foundation tasks `QA-009` through `QA-013`.
4. Execute `SPEC-033` photo catalog and admin upload tasks `PHOTO-001` through `PHOTO-004`.

## Current Executable Cluster
### Frontend Admin API Integration
- Status: complete.
- Primary spec: `SPEC-028`.
- Supporting specs: `SPEC-005`, `SPEC-009`, `SPEC-011`, and `SPEC-017`.
- Scope: Vite `/api` proxy setup, shared auth/admin request plumbing, admin credentials login, optional MFA verification, and protected dashboard summary loading.
- Non-scope: public content API wiring, logout UI, admin CRUD, moderation actions, backend contract changes, and deployment changes.

| Status | Task ID | Spec ID | Layer | Base Branch | Branch Name | Merge Target | Acceptance Source | PR | Blocked Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Done | FE-011 | SPEC-028 | frontend | develop | `frontend/FE-011-admin-login-api-integration` | develop | `docs/specs/frontend-admin-auth-integration.md` | [#113](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/113), [#114](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/114) | — |
| Done | SPEC-029 | SPEC-029 | spec | develop | `spec/SPEC-029-ci-workflow-maintenance` | develop | `docs/specs/ci-workflow-maintenance.md` | [#115](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/115) | — |
| In Review | QA-008 | SPEC-029 | infra | develop | `infra/QA-008-analyzer-freshness-node24-maintenance` | develop | `docs/specs/ci-workflow-maintenance.md` | [#116](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/116) merged, [#117](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/117) open | — |

Done criteria for `FE-011`:
- `/api` proxy exists in `frontend/vite.config.ts`
- mocked admin login step progression is replaced by backend auth calls
- `/admin` and `/admin/dashboard` are session-protected through loader-driven summary fetching
- frontend lint and build pass
- manual verification with backend on port `3000` is recorded in the PR

### CI Workflow Maintenance Execution
- Status: in review for final follow-up merge.
- Primary spec: `SPEC-029`.
- Supporting specs: `ci-cd.md`, `verification.md`, and `git-workflow.md`.
- Scope: implement `QA-008` to remove analyzer freshness automation and complete Node.js 24-compatible workflow action maintenance.
- Non-scope: deployment trigger redesign and unrelated frontend/backend product changes.

Done criteria for `QA-008`:
- `scripts/frontend-analyzer.ts` and tracked analyzer report dependency are removed from CI maintenance scope
- `.github/workflows/analyzer-freshness.yml` no longer runs analyzer freshness checks
- workflow files move from `actions/checkout@v4` to a Node.js 24-compatible checkout release
- workflow trigger scope, permissions, concurrency, and deployment policy remain unchanged unless a minimal fix is required

### Chat Room Live Integration
- Status: in progress for `CHAT-008`; follow-up implementation queued.
- Primary spec: `SPEC-030`.
- Supporting specs: `frontend-structure.md`, `frontend-architecture.md`, `frontend-admin-auth-integration.md`, `backend-architecture.md`, `data-model.md`, `media-storage.md`, `admin-cms.md`, and `verification.md`.
- Scope: backend-generated chat room password visibility/rotation on the admin dashboard, `24` hour persisted room sessions, HTTP join/session validation, realtime messages and participants, infinite-scroll history, and protected image upload/viewer support.
- Non-scope: multi-room support, unauthenticated chat media URLs, Socket.IO adoption, and non-image attachments.

| Status | Task ID | Spec ID | Layer | Base Branch | Branch Name | Merge Target | Acceptance Source | PR | Blocked Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Done | CHAT-008 | SPEC-030 | admin | develop | `admin/CHAT-008-chat-password-rotation-and-room-gate` | develop | `docs/specs/chat-room-live-integration.md` | [#120](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/120) | — |
| Done | CHAT-009 | SPEC-030 | frontend | develop | `frontend/CHAT-009-chat-realtime-messages` | develop | `docs/specs/chat-room-live-integration.md` | [#121](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/121) | — |
| In Review | CHAT-010 | SPEC-030 | frontend | develop | `frontend/CHAT-010-chat-image-uploads-and-viewer` | develop | `docs/specs/chat-room-live-integration.md` | [#122](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/122) | — |

Done criteria for `CHAT-008`:
- backend-generated password rotation exists for `night-shift`
- the admin dashboard shows the current room password and rotation metadata from backend data
- chat join and refresh-time session rehydration use backend room/session contracts
- chat sessions expire after `24` hours and require re-entry
- successful join transitions into an empty/loading real room state instead of the local mock timeline

Done criteria for `CHAT-009`:
- chat participants and message history load from backend APIs
- message history supports infinite scroll through cursor pagination
- text messages send through backend contracts
- native WebSocket live updates keep messages and participants fresh without polling
- expired or revoked live sessions return the user to a restartable join state

Done criteria for `CHAT-010`:
- image uploads support local preview before send
- image uploads show visible progress during transfer
- protected chat images render through backend-gated media fetches
- clicking a chat image opens a fullscreen viewer
- upload validation remains aligned with MIME, size, and one-file-per-message rules

### Security Hardening Execution
- Status: complete; `SEC-001` through `SEC-009` have landed on `develop`.
- Primary spec: `SPEC-031`.
- Supporting specs: `frontend-structure.md`, `frontend-architecture.md`, `project-structure.md`, `backend-architecture.md`, `chat-room-live-integration.md`, `frontend-admin-auth-integration.md`, `media-storage.md`, `admin-cms.md`, `infra-deployment.md`, `verification.md`, and `git-workflow.md`.
- Scope: execute the approved remediation wave from the 2026-05-03 security review with one task branch per finding cluster.
- Non-scope: bundling unrelated product, CMS, or design changes into the security remediation branches.
- SEC-001 status log:
  - Start: branch `infra/SEC-001-production-secret-enforcement` moved to `In Progress`.
  - Blocker: none.
  - PR/Open review: PR [#124](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/124) opened against `develop`.
  - Completion: production secret enforcement, compose env contract, and operator env docs landed via merged PR [#124](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/124).
- SEC-002 status log:
  - Start: branch `backend/SEC-002-cors-and-rate-limits` moved to `In Progress`.
  - Blocker: none.
  - Local verification: adapter coverage for CORS and targeted auth/chat rate-limits plus `backend` boundary verification passed on 2026-05-04.
  - PR/Open review: PR [#125](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/125) opened against `develop`.
  - Completion: CORS/rate-limit hardening landed via merged PR [#125](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/125).
- SEC-003 status log:
  - Start: branch `backend/SEC-003-mfa-lockout-and-delivery` moved to `In Progress`.
  - Local execution: MFA challenge attempt ceiling + expiry enforcement and non-test delivery wiring were implemented with focused auth and delivery tests.
  - Blocker: none.
  - Local verification: auth use-case, delivery adapter, container/config, Hono adapter, typecheck, and boundary verification passed on 2026-05-04.
  - PR/Open review: PR [#126](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/126) opened against `develop`.
  - Completion: MFA lockout/delivery hardening landed via merged PR [#126](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/126).
- SEC-004 status log:
  - Start: branch `backend/SEC-004-chat-request-validation-hardening` moved to `In Progress` after `SEC-001`, `SEC-002`, and `SEC-003` merged to `develop`.
  - Blocker: none.
  - Local verification: chat adapter/use-case tests, backend typecheck, and boundary verification passed on 2026-05-05.
  - PR/Open review: PR [#127](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/127) opened against `develop`.
  - Completion: chat request-validation hardening landed via merged PR [#127](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/127).
- SEC-005 status log:
  - Start: branch `backend/SEC-005-upload-media-signature-hardening` moved to `In Progress` after PR [#127](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/127) merged to `develop`.
  - Blocker: none.
  - Local execution: upload signature validation for JPEG/PNG/WebP plus protected chat media `nosniff` response headers were implemented in the Hono chat adapter.
  - Local verification: chat upload/media adapter tests, backend typecheck, and boundary verification passed on 2026-05-05.
  - PR/Open review: PR [#128](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/128) opened against `develop`.
  - Completion: upload signature and protected-media hardening landed via merged PR [#128](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/128).
- SEC-006 status log:
  - Start: branch `backend/SEC-006-websocket-auth-transport-hardening` moved to `In Progress` after PR [#128](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/128) merged to `develop`.
  - Blocker: none.
  - Local execution: the WebSocket room-session auth transport moved from query-string `sessionId` to the approved `Sec-WebSocket-Protocol` handshake contract.
  - Local verification: websocket live contract tests, media verification, backend typecheck, and boundary verification passed on 2026-05-05.
  - PR/Open review: PR [#129](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/129) opened against `develop`.
  - Completion: WebSocket auth transport hardening landed via merged PR [#129](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/129).
- SEC-007 status log:
  - Start: branch `frontend/SEC-007-chat-session-storage-hardening` moved to `In Progress` after PR [#129](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/129) merged to `develop`.
  - Blocker: none.
  - Local execution: migrate active room-session persistence from `localStorage` to `sessionStorage` and align frontend WebSocket handshake with the SEC-006 subprotocol contract.
  - Local verification: frontend lint/build plus static checks for no `localStorage` or WebSocket `sessionId` query usage passed on 2026-05-05.
  - PR/Open review: PR [#130](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/130) opened against `develop`.
  - Completion: chat session-storage hardening landed via merged PR [#130](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/130).
- SEC-008 status log:
  - Start: branch `backend/SEC-008-chat-crypto-and-audit-hardening` moved to `In Progress` after PR [#130](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/130) merged to `develop`.
  - Blocker: none.
  - Local execution: replace `Math.random()` room-password generation with a CSPRNG, replace raw SHA-256 readable-password key derivation with HKDF (with legacy decrypt compatibility), and map moderation audit API states through explicit typed/redacted DTOs.
  - Local verification: chat use-case, admin-route, and Prisma repository tests plus backend typecheck and boundary verification passed on 2026-05-05.
  - PR/Open review: PR [#131](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/131) opened against `develop`.
  - Completion: chat crypto and moderation-audit hardening landed via merged PR [#131](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/131).
  - Follow-up start: branch `backend/SEC-008-room-password-decrypt-recovery` opened to keep admin room-access reads recoverable when existing development data contains plaintext or differently keyed readable-password ciphertext.
  - Follow-up local verification: Prisma chat repository/admin route tests, backend typecheck, and boundary verification passed on 2026-05-05.
  - Follow-up PR/Open review: PR [#135](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/135) opened against `develop`.
- SEC-009 status log:
  - Start: branch `infra/SEC-009-edge-headers-and-production-compose` moved to `In Progress` after PR [#131](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/131) merged to `develop`.
  - Blocker: none.
  - Local execution: add the Caddy edge security-header baseline, move production compose frontend/backend to Dockerfile builds with frozen-lock installs, and serve frontend runtime from built `dist` artifacts.
  - Local verification: production/dev compose config rendering (`--env-file`), Caddy config validation, frontend build/lint + static-route fallback smoke checks (`/`, `/admin`, `/chat`), and `backend` verify/deploy-readiness checks passed on 2026-05-05.
  - PR/Open review: PR [#132](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/132) opened against `develop`.
  - Completion: edge security headers and production compose/runtime hardening landed via merged PR [#132](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/132).
  - Follow-up start: branch `infra/SEC-009-development-csp-vite-fix` opened to fix the development host CSP regression where Vite's React-refresh preamble was blocked.
  - Follow-up local verification: production/dev compose config rendering and Caddy config validation passed on 2026-05-05.
  - Follow-up PR/Open review: PR [#134](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/134) opened against `develop`.

| Status | Task ID | Spec ID | Layer | Base Branch | Branch Name | Merge Target | Acceptance Source | PR | Blocked Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Done | SPEC-031 | SPEC-031 | spec | develop | `spec/SPEC-031-security-hardening-production-readiness` | develop | `docs/specs/security-hardening-production-readiness.md` | [#123](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/123) merged | — |
| Done | SEC-001 | SPEC-031 | infra | develop | `infra/SEC-001-production-secret-enforcement` | develop | `docs/specs/security-hardening-production-readiness.md` | [#124](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/124) merged | — |
| Done | SEC-002 | SPEC-031 | backend | develop | `backend/SEC-002-cors-and-rate-limits` | develop | `docs/specs/security-hardening-production-readiness.md` | [#125](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/125) merged | — |
| Done | SEC-003 | SPEC-031 | backend | develop | `backend/SEC-003-mfa-lockout-and-delivery` | develop | `docs/specs/security-hardening-production-readiness.md` | [#126](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/126) merged | — |
| Done | SEC-004 | SPEC-031 | backend | develop | `backend/SEC-004-chat-request-validation-hardening` | develop | `docs/specs/security-hardening-production-readiness.md` | [#127](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/127) merged | — |
| Done | SEC-005 | SPEC-031 | backend | develop | `backend/SEC-005-upload-media-signature-hardening` | develop | `docs/specs/security-hardening-production-readiness.md` | [#128](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/128) merged | — |
| Done | SEC-006 | SPEC-031 | backend | develop | `backend/SEC-006-websocket-auth-transport-hardening` | develop | `docs/specs/security-hardening-production-readiness.md` | [#129](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/129) merged | — |
| Done | SEC-007 | SPEC-031 | frontend | develop | `frontend/SEC-007-chat-session-storage-hardening` | develop | `docs/specs/security-hardening-production-readiness.md` | [#130](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/130) merged | — |
| Done | SEC-008 | SPEC-031 | backend | develop | `backend/SEC-008-chat-crypto-and-audit-hardening` | develop | `docs/specs/security-hardening-production-readiness.md` | [#131](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/131) merged | — |
| Done | SEC-009 | SPEC-031 | infra | develop | `infra/SEC-009-edge-headers-and-production-compose` | develop | `docs/specs/security-hardening-production-readiness.md` | [#132](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/132) merged | — |

Done criteria for `SPEC-031`:
- `docs/specs/security-hardening-production-readiness.md` exists and follows the harness section template
- all actionable findings from `docs/security-review-2026-05-03.md` are mapped into explicit remediation tasks or explicitly closed as non-actionable
- task IDs, branch names, dependencies, and verification methods are defined for the remediation wave
- `docs/specs/tracker.md` and `docs/specs/README.md` are updated to register the spec and implementation task queue
- implementation tasks are registered in the tracker with branch metadata, acceptance source, and execution order

### Testing Coverage Foundation
- Status: tasked locally; implementation branches are being split for separate review.
- Primary spec: `SPEC-032`.
- Supporting specs: `verification.md`, `ci-cd.md`, `project-structure.md`, `backend-architecture.md`, `frontend-structure.md`, `frontend-architecture.md`, `git-workflow.md`, and `acceptance-criteria.md`.
- Scope: improve backend application/repository coverage, add frontend Vitest and React Testing Library coverage, introduce focused Prisma/Postgres contract tests in CI, and keep coverage report-only.
- Non-scope: Playwright/browser E2E, coverage thresholds, broad test relocation, deployment policy changes, and unrelated product changes.

| Status | Task ID | Spec ID | Layer | Base Branch | Branch Name | Merge Target | Acceptance Source | PR | Blocked Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| In Progress | SPEC-032 | SPEC-032 | spec | develop | `spec/SPEC-032-testing-coverage-foundation` | develop | `docs/specs/testing-coverage-foundation.md` | not opened | — |
| In Progress | QA-009 | SPEC-032 | backend | develop | `backend/QA-009-backend-application-coverage` | develop | `docs/specs/testing-coverage-foundation.md` | not opened | — |
| In Progress | QA-010 | SPEC-032 | backend | develop | `backend/QA-010-prisma-db-contract-tests` | develop | `docs/specs/testing-coverage-foundation.md` | not opened | — |
| In Progress | QA-011 | SPEC-032 | frontend | develop | `frontend/QA-011-frontend-vitest-foundation` | develop | `docs/specs/testing-coverage-foundation.md` | not opened | — |
| In Progress | QA-012 | SPEC-032 | frontend | develop | `frontend/QA-012-frontend-chat-admin-tests` | develop | `docs/specs/testing-coverage-foundation.md` | not opened | — |
| In Progress | QA-013 | SPEC-032 | infra | develop | `infra/QA-013-concise-testing-ci` | develop | `docs/specs/testing-coverage-foundation.md` | not opened | — |

Done criteria for `QA-009`:
- backend content application tests cover cursor handling, pagination normalization, filters, detail nulls, DTO mapping, photo URLs, and status strip mapping
- backend admin application tests cover list normalization, curation mappings, update null returns, metadata date handling, and status-strip replacement mapping
- backend `bun run test`, `bun run test:coverage`, and `bun run typecheck` pass

Done criteria for `QA-010`:
- DB-backed Prisma contract tests cover high-risk admin, content, and chat repository paths
- DB tests isolate deterministic data and clean up after themselves
- backend `bun run test:db` passes with `DATABASE_URL`

Done criteria for `QA-011`:
- frontend Vitest, React Testing Library, DOM setup, `test`, and `test:coverage` scripts exist
- low-level frontend tests cover shared API, mappers/filters, dashboard mapper, chat API helpers, auth parsing, and route loader/action behavior
- frontend `bun run test`, `bun run test:coverage`, `bun run lint`, and `bun run build` pass

Done criteria for `QA-012`:
- frontend component tests cover admin login states, admin dashboard rendering, chat gate/session bootstrap, message state, upload validation/progress UI, and image viewer behavior
- browser primitives are mocked locally in tests without adding Playwright or E2E tooling
- frontend `bun run test` passes

Done criteria for `QA-013`:
- PR validation runs frontend lint/build/test, backend typecheck/test/verify, and focused backend DB contract tests with Postgres
- coverage commands are available but report-only
- CI YAML stays concise and does not add E2E or deployment changes

### Photo Catalog And Admin Upload
- Status: tasked locally; implementation branches are being split for separate review.
- Primary spec: `SPEC-033`.
- Supporting specs: `product-scope.md`, `frontend-structure.md`, `frontend-architecture.md`, `project-structure.md`, `backend-architecture.md`, `data-model.md`, `media-storage.md`, `admin-cms.md`, `verification.md`, `git-workflow.md`, and `acceptance-criteria.md`.
- Scope: draft-first admin original uploads, photo original metadata, public photo list facets, public real-image gallery integration, and admin photo management UI.
- Non-scope: thumbnail generation, EXIF extraction, CDN/object storage, bulk upload, drag sorting, analytics, and a dedicated public photo detail route.

| Status | Task ID | Spec ID | Layer | Base Branch | Branch Name | Merge Target | Acceptance Source | PR | Blocked Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| In Progress | SPEC-033 | SPEC-033 | spec | develop | `spec/SPEC-033-photo-catalog-gallery` | develop | `docs/specs/photo-catalog-gallery.md` | not opened | — |
| In Progress | PHOTO-001 | SPEC-033 | data | develop | `data/PHOTO-001-photo-original-metadata` | develop | `docs/specs/photo-catalog-gallery.md` | not opened | — |
| In Progress | PHOTO-002 | SPEC-033 | backend | develop | `backend/PHOTO-002-admin-photo-upload-api` | develop | `docs/specs/photo-catalog-gallery.md` | not opened | — |
| In Progress | PHOTO-003 | SPEC-033 | frontend | develop | `frontend/PHOTO-003-public-photo-gallery-api` | develop | `docs/specs/photo-catalog-gallery.md` | not opened | — |
| In Progress | PHOTO-004 | SPEC-033 | admin | develop | `admin/PHOTO-004-admin-photo-management-screen` | develop | `docs/specs/photo-catalog-gallery.md` | not opened | — |

Done criteria for `SPEC-033`:
- `docs/specs/photo-catalog-gallery.md` exists and follows the harness section template.
- task IDs, branch names, dependencies, acceptance source, and verification methods are defined.
- `docs/specs/tracker.md` and `docs/specs/README.md` register the spec and implementation queue.

Done criteria for `PHOTO-001`:
- `Photo` has nullable original display filename, MIME type, and byte-size metadata.
- existing photo rows and public media delivery remain compatible.
- Prisma schema, migration, generated client, and repository tests cover metadata mapping.

Done criteria for `PHOTO-002`:
- `POST /api/admin/photos` creates draft, unfeatured photo records with stored originals.
- upload validation covers required fields, MIME type, magic bytes, date parsing, max `25 MB`, and safe storage paths.
- written originals are cleaned up when persistence fails.
- backend route, use-case, repository, storage, typecheck, boundary, and media verification pass.

Done criteria for `PHOTO-003`:
- public `/photos` loads from `/api/photos` via React Router loader.
- URL-backed filters and page pagination drive server-side queries.
- cards and lightbox render real original URLs with lazy loading and film-frame fallback.
- frontend tests, lint, and build pass.

Done criteria for `PHOTO-004`:
- `/admin/photos` is session-protected and linked from admin navigation.
- admin can upload a draft photo, inspect paginated records, edit metadata, publish/unpublish, and feature/unfeature.
- admin route/action/component tests, frontend lint, and frontend build pass.

## Spec Table
| Spec ID | Title | Layer | Status | Depends on | Blocks | Git workflow defined | Ready for task split | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPEC-028 | Frontend Admin Auth Integration | Frontend | Approved | `frontend-structure.md`, `frontend-architecture.md`, `admin-cms.md`, `backend-architecture.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `FE-011` | yes | yes | First live frontend-to-backend integration slice; keeps `/api` as the browser-facing base and replaces mocked admin login state with backend auth plus dashboard loading. |
| SPEC-029 | CI Workflow Maintenance | Infra | Approved | `ci-cd.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `QA-008` | yes | yes | Removes analyzer freshness automation and maintains Node.js 24 workflow compatibility without changing deployment policy. |
| SPEC-030 | Chat Room Live Integration | Cross-layer | Tasked | `frontend-structure.md`, `frontend-architecture.md`, `frontend-admin-auth-integration.md`, `project-structure.md`, `backend-architecture.md`, `data-model.md`, `media-storage.md`, `admin-cms.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `CHAT-008`, `CHAT-009`, `CHAT-010` | yes | yes | Replaces the mock chat room with backend join/session contracts, realtime delivery, and protected upload/viewer behavior while adding backend-generated room password management to the admin dashboard. |
| SPEC-031 | Security Hardening and Production Readiness | Cross-layer | Tasked | `frontend-structure.md`, `frontend-architecture.md`, `project-structure.md`, `backend-architecture.md`, `chat-room-live-integration.md`, `frontend-admin-auth-integration.md`, `media-storage.md`, `admin-cms.md`, `infra-deployment.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `SEC-001`, `SEC-002`, `SEC-003`, `SEC-004`, `SEC-005`, `SEC-006`, `SEC-007`, `SEC-008`, `SEC-009` | yes | yes | Approved remediation spec from the 2026-05-03 security/bug review; implementation queue is registered with first-wave critical tasks unblocked first. |
| SPEC-032 | Testing Coverage Foundation | Cross-layer | Tasked | `verification.md`, `ci-cd.md`, `project-structure.md`, `backend-architecture.md`, `frontend-structure.md`, `frontend-architecture.md`, `git-workflow.md`, `acceptance-criteria.md` | `QA-009`, `QA-010`, `QA-011`, `QA-012`, `QA-013` | yes | yes | Adds the first cross-layer coverage baseline: backend coverage improvements, frontend Vitest coverage, focused Prisma/Postgres CI contracts, and report-only coverage commands. |
| SPEC-033 | Photo Catalog And Admin Upload | Cross-layer | Tasked | `product-scope.md`, `frontend-structure.md`, `frontend-architecture.md`, `project-structure.md`, `backend-architecture.md`, `data-model.md`, `media-storage.md`, `admin-cms.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `PHOTO-001`, `PHOTO-002`, `PHOTO-003`, `PHOTO-004` | yes | yes | Adds draft-first admin photo original uploads, public gallery API integration with real images and facets, and admin photo management. |

## Tasking Rule
A spec may only move to `Tasked` when:
- its status is `Approved`
- its dependencies are `Approved`
- frontend intake is satisfied
- branch naming is defined for resulting tasks
- its acceptance checklist is complete
