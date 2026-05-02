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
2. Merge the Prisma client generation fix into `develop` via reviewed merge commit (no self-merge).
3. Start `CHAT-008` on `admin/CHAT-008-chat-password-rotation-and-room-gate`.
4. Queue `CHAT-009` after `CHAT-008` lands.
5. Queue `CHAT-010` after `CHAT-009` lands.

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
| In Review | CHAT-008 | SPEC-030 | admin | develop | `admin/CHAT-008-chat-password-rotation-and-room-gate` | develop | `docs/specs/chat-room-live-integration.md` | [#120](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/120) | — |
| Spec-ready | CHAT-009 | SPEC-030 | frontend | develop | `frontend/CHAT-009-chat-realtime-messages` | develop | `docs/specs/chat-room-live-integration.md` | — | Depends on `CHAT-008`. |
| Spec-ready | CHAT-010 | SPEC-030 | frontend | develop | `frontend/CHAT-010-chat-image-uploads-and-viewer` | develop | `docs/specs/chat-room-live-integration.md` | — | Depends on `CHAT-009`. |

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

## Spec Table
| Spec ID | Title | Layer | Status | Depends on | Blocks | Git workflow defined | Ready for task split | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPEC-028 | Frontend Admin Auth Integration | Frontend | Approved | `frontend-structure.md`, `frontend-architecture.md`, `admin-cms.md`, `backend-architecture.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `FE-011` | yes | yes | First live frontend-to-backend integration slice; keeps `/api` as the browser-facing base and replaces mocked admin login state with backend auth plus dashboard loading. |
| SPEC-029 | CI Workflow Maintenance | Infra | Approved | `ci-cd.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `QA-008` | yes | yes | Removes analyzer freshness automation and maintains Node.js 24 workflow compatibility without changing deployment policy. |
| SPEC-030 | Chat Room Live Integration | Cross-layer | Tasked | `frontend-structure.md`, `frontend-architecture.md`, `frontend-admin-auth-integration.md`, `project-structure.md`, `backend-architecture.md`, `data-model.md`, `media-storage.md`, `admin-cms.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `CHAT-008`, `CHAT-009`, `CHAT-010` | yes | yes | Replaces the mock chat room with backend join/session contracts, realtime delivery, and protected upload/viewer behavior while adding backend-generated room password management to the admin dashboard. |

## Tasking Rule
A spec may only move to `Tasked` when:
- its status is `Approved`
- its dependencies are `Approved`
- frontend intake is satisfied
- branch naming is defined for resulting tasks
- its acceptance checklist is complete
