# Spec Tracker

## Gate Checks
| Gate | Status | Notes |
| --- | --- | --- |
| Frontend structure spec approved | yes | `frontend-structure.md` remains the hard structural gate for frontend-facing work. |
| Frontend architecture spec approved | yes | `frontend-architecture.md` already defines one-app routing, shell ownership, and frontend API boundaries. |
| Admin CMS spec approved | yes | `admin-cms.md` already locks admin route compatibility and auth/MFA expectations. |
| Backend auth/admin HTTP contracts available | yes | Backend already serves `/api/auth/*` and `/api/admin/dashboard/summary`. |
| Frontend admin auth integration spec approved | yes | `SPEC-028` is approved below and ready to drive `FE-011`. |

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
- Thoughts RSS and sitemap are included.
- Frontend task execution is tracker-first: one task, one branch, one acceptance source, and one tracker entry.

## Cross-Cutting Risks
- Public photo delivery is intentionally originals-only, which may create performance and bandwidth pressure.
- Chat room image uploads are allowed for anyone with the room password, which increases moderation and storage risk.
- CI/CD workflows are now defined, but production deployment still depends on correct `production` environment secret provisioning and remote deploy command hardening.
- Admin auth now depends on correct cookie handling through the Vite `/api` proxy locally and the future reverse proxy in deployed environments.

## Next Task Queue
1. Open `QA-008` PR from `infra/QA-008-analyzer-freshness-node24-maintenance` into `develop`.
2. Complete reviewer validation for analyzer-freshness removal and Node.js 24 workflow compatibility updates.
3. Merge via reviewed merge commit (no self-merge).

## Current Executable Cluster
### Frontend Admin API Integration
- Status: ready for execution.
- Primary spec: `SPEC-028`.
- Supporting specs: `SPEC-005`, `SPEC-009`, `SPEC-011`, and `SPEC-017`.
- Scope: Vite `/api` proxy setup, shared auth/admin request plumbing, admin credentials login, optional MFA verification, and protected dashboard summary loading.
- Non-scope: public content API wiring, logout UI, admin CRUD, moderation actions, backend contract changes, and deployment changes.

| Status | Task ID | Spec ID | Layer | Base Branch | Branch Name | Merge Target | Acceptance Source | PR | Blocked Reason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| In Progress | FE-011 | SPEC-028 | frontend | develop | `frontend/FE-011-admin-login-api-integration` | develop | `docs/specs/frontend-admin-auth-integration.md` | — | — |
| In Review | SPEC-029 | SPEC-029 | spec | develop | `spec/SPEC-029-ci-workflow-maintenance` | develop | `docs/specs/ci-workflow-maintenance.md` | — | — |
| In Review | QA-008 | SPEC-029 | infra | develop | `infra/QA-008-analyzer-freshness-node24-maintenance` | develop | `docs/specs/ci-workflow-maintenance.md` | [#116](https://github.com/Vinicius-Marcondes/vinicius.dev/pull/116) | — |

Done criteria for `FE-011`:
- `/api` proxy exists in `frontend/vite.config.ts`
- mocked admin login step progression is replaced by backend auth calls
- `/admin` and `/admin/dashboard` are session-protected through loader-driven summary fetching
- frontend lint and build pass
- manual verification with backend on port `3000` is recorded in the PR

### CI Workflow Maintenance Execution
- Status: in review.
- Primary spec: `SPEC-029`.
- Supporting specs: `ci-cd.md`, `verification.md`, and `git-workflow.md`.
- Scope: implement `QA-008` to remove analyzer freshness automation and complete Node.js 24-compatible workflow action maintenance.
- Non-scope: deployment trigger redesign and unrelated frontend/backend product changes.

Done criteria for `QA-008`:
- `scripts/frontend-analyzer.ts` and tracked analyzer report dependency are removed from CI maintenance scope
- `.github/workflows/analyzer-freshness.yml` no longer runs analyzer freshness checks
- workflow files move from `actions/checkout@v4` to a Node.js 24-compatible checkout release
- workflow trigger scope, permissions, concurrency, and deployment policy remain unchanged unless a minimal fix is required

## Spec Table
| Spec ID | Title | Layer | Status | Depends on | Blocks | Git workflow defined | Ready for task split | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPEC-028 | Frontend Admin Auth Integration | Frontend | Approved | `frontend-structure.md`, `frontend-architecture.md`, `admin-cms.md`, `backend-architecture.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `FE-011` | yes | yes | First live frontend-to-backend integration slice; keeps `/api` as the browser-facing base and replaces mocked admin login state with backend auth plus dashboard loading. |
| SPEC-029 | CI Workflow Maintenance | Infra | Approved | `ci-cd.md`, `verification.md`, `git-workflow.md`, `acceptance-criteria.md` | `QA-008` | yes | yes | Removes analyzer freshness automation and maintains Node.js 24 workflow compatibility without changing deployment policy. |

## Tasking Rule
A spec may only move to `Tasked` when:
- its status is `Approved`
- its dependencies are `Approved`
- frontend intake is satisfied
- branch naming is defined for resulting tasks
- its acceptance checklist is complete
