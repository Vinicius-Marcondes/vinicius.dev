# Spec Tracker

## Gate Checks
| Gate | Status | Notes |
| --- | --- | --- |
| Frontend presence checked | yes | Active frontend now exists under `frontend/` as the Vite React TypeScript Bun app; the imported legacy artifact is preserved under `frontend-legacy/`. |
| Analyzer report current | yes | FE-010 refreshed the analyzer against the migrated frontend and currently reports no migration blockers. |
| Spec reconciliation complete | yes | SPEC-019 accepted decisions have been applied and approved for Wave 2 tasking. |
| Frontend structure spec approved | yes | `SPEC-017 Frontend Structure` is approved for frontend-facing specs and tasks. |
| Project structure spec approved | yes | `SPEC-016 Project Structure` is approved as the hard gate for backend-facing specs and tasks. |
| CI/CD spec approved | yes | `SPEC-018 GitHub Actions CI/CD` is approved as the release-automation and final verification gate. |
| GitHub Project auth available | yes | `gh auth status` now includes the `project` scope for `Vinicius-Marcondes`. |
| Dedicated GitHub Project exists | yes | Project `vinicius.dev` exists as `Vinicius-Marcondes` Project `#2`. |
| GitHub Project id and url documented | yes | See [github-project-execution.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/github-project-execution.md). |
| Branch strategy spec approved | yes | [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md) is approved for task execution. |
| Task naming and branching rules ready | yes | Branch pattern is defined and mandatory. |

## Global Decisions
- Use Bun for both frontend and backend toolchains.
- Treat `develop` as the short-horizon integration branch and `main` as the stable branch.
- Use GitHub Issues as the canonical task record and a dedicated GitHub Project as the execution board.
- Every task gets one issue, one Project item, one branch, one task ID, and one acceptance source.
- `SPEC-017 Frontend Structure` defines the top-priority structural policy for frontend-facing spec and implementation work.
- Frontend target is one `Vite + React + TypeScript + Bun` app using React Router Data Mode, strict FSD, and separate public/admin shells.
- `SPEC-016 Project Structure` defines the top-priority structural policy for backend-facing spec and implementation work.
- The backend target is one application hexagon with module-first core organization and adapters at the technology edge.
- `SPEC-018 GitHub Actions CI/CD` defines the validation and release-automation policy, with manual VPS development deployment and tag-based production deployment.
- Frontend intake rules are now satisfied for the migrated app: Vite, Bun, TypeScript, module-based React, and all planned top-level screens are present.
- The imported legacy frontend is preserved under `frontend-legacy/` as migration reference material, not active runtime code.
- All frontend-facing backend APIs are mounted under `/api`; public photo originals use backend media URLs such as `/media/photos/:id/original`.
- Public list filtering is server-side for Thoughts, Projects, and Photos.
- Pagination is required from day one: cursor pagination for Thoughts and Chat, page pagination for Projects and Photos.
- Chat uploads allow `image/jpeg`, `image/png`, and `image/webp`, max `5 MB`, one image per message.
- Chat uploaded images are room-gated, not public.
- Deleted chat messages and media metadata are soft-hidden with audit records; physical file cleanup can be deferred.
- Admin draft preview is deferred beyond Wave 2.
- Thoughts RSS and sitemap are included in Wave 2.
- Frontend analyzer freshness is required for spec/frontend-impacting PRs; backend-only PRs run the analyzer as a non-mutating validation check.
- Backend, data, media, admin backend, CI/CD, verification, and deployment task creation may now use the FE-010 analyzer report and SPEC-019 reconciliation as approved Wave 2 input.

## Cross-Cutting Risks
- Public photo delivery is intentionally originals-only, which may create performance and bandwidth pressure.
- Chat room image uploads are allowed for anyone with the room password, which increases moderation and storage risk.
- CI/CD workflows are not defined yet, so merge validation and release automation are still policy-only at the harness level.
- The FE-010 analyzer `adapt-spec` findings have been reconciled into backend-facing specs and approved for Wave 2 task decomposition.
- The frontend migration wave cleared the previous browser Babel, CDN React, global `window.*`, missing TypeScript, and missing screen blockers.

## Next Task Queue
1. Run the cluster-level backend verification pass on `develop` after the `BE-017` merge.
2. Confirm the Wave 2 Cluster 4 execution artifacts stay synced across specs, issues, PRs, and the GitHub Project.
3. Cut the next planning/status update before defining any new executable cluster.
4. Run frontend analyzer as non-mutating validation for backend-only PRs.
5. Keep one issue, one Project item, one branch, and one acceptance source per implementation task.

## Current Executable Cluster
### SPEC-019 Backend Spec Reconciliation
- Status: approved for Wave 2 tasking.
- Scope: apply accepted backend reconciliation decisions to backend-facing specs.
- Branch: `spec/SPEC-019-backend-spec-validation`.
- GitHub issue: `#14`.
- Backend implementation task creation is unblocked for approved Wave 2 Cluster 1 tasks.

### Wave 2 Cluster 1 Backend Foundation
- Status: complete.
- Primary specs: `SPEC-006`, `SPEC-011`, `SPEC-016`, `SPEC-018`.
- Scope: create the backend Bun/Hono/TypeScript scaffold, hexagonal module skeleton, `/api` HTTP shell, bootstrap/config container, and initial verification/boundary checks.
- Non-scope: Prisma schema, public content APIs, media storage, admin auth, chat persistence, infra deployment, and production CI workflows.
- Completed tasks: `BE-001`, `BE-002`, `BE-003`, `BE-004`, and `BE-005`.
- Merged PRs: `#20`, `#22`, `#21`, `#24`, and `#23`.
- Integrated verification: backend typecheck, tests, build, and `bun run verify` passed on `develop`.

### Wave 2 Cluster 2 Persistence Foundation
- Status: complete.
- Primary specs: `SPEC-007`, `SPEC-006`, `SPEC-011`, `SPEC-016`, `SPEC-018`.
- Scope: Prisma/Postgres setup, migration baseline, repository adapter patterns, schema for approved first-class entities, and seed strategy.
- Non-scope: public endpoint behavior, media binary storage, admin auth flows, chat room behavior, Docker/Caddy deployment, and production CI workflows.
- Tasks: `DATA-001`, `DATA-002`, `DATA-003`, `DATA-004`, and `DATA-005`.
- Required ordering: `DATA-001` first; `DATA-002` after `DATA-001`; `DATA-003` after `DATA-002`; `DATA-004` after `DATA-002`; `DATA-005` after `DATA-002` and `DATA-003`.
- Merged PRs: `#32`, `#33`, `#34`, `#35`, and `#36`.
- Integrated verification: Prisma validate/generate, seed, persistence check, backend typecheck, tests, build, and `bun run verify` passed on `develop`.

### Wave 2 Cluster 3 Public Content APIs
- Status: complete.
- Primary specs: `SPEC-006`, `SPEC-007`, `SPEC-011`, `SPEC-016`, `SPEC-018`.
- Scope: shared public content HTTP contracts plus public Thoughts, Projects, Photos, Status Strip, RSS, and sitemap endpoints under `/api`.
- Non-scope: binary photo delivery, chat uploads/media access, admin auth/session behavior, admin CRUD flows, Docker/Caddy deployment descriptors, and production CI workflows.
- Tasks: `BE-006`, `BE-007`, `BE-008`, `BE-009`, `BE-010`, and `BE-011`.
- Required ordering: `BE-006` first; `BE-007`, `BE-008`, `BE-009`, and `BE-010` after `BE-006`; `BE-011` after `BE-007`, `BE-008`, and `BE-009`.
- Merged PRs: `#45`, `#46`, `#47`, `#49`, `#48`, and `#50`.
- Integrated verification: backend typecheck, tests, build, and `bun run verify` passed on `develop`.

### Wave 2 Cluster 4 Media Storage And Delivery
- Status: complete.
- Primary specs: `SPEC-006`, `SPEC-008`, `SPEC-010`, `SPEC-011`, `SPEC-016`, `SPEC-018`.
- Scope: filesystem-backed media foundation, public photo original delivery, chat upload validation/storage, room-gated chat media access, moderation-aligned retention behavior, and media-specific verification.
- Non-scope: admin auth/session behavior, admin dashboard CRUD flows, non-media chat room lifecycle behavior, Docker/Caddy implementation files, and production CI workflow YAML.
- Tasks: `BE-012`, `BE-013`, `BE-014`, `BE-015`, `BE-016`, and `BE-017`.
- Required ordering: `BE-012` first; `BE-013` and `BE-014` after `BE-012`; `BE-015` and `BE-016` after `BE-014`; `BE-017` after `BE-013`, `BE-014`, `BE-015`, and `BE-016`.
- Merged PRs: `#59`, `#61`, `#60`, `#62`, `#63`, and `#64`.
- Integrated verification: `bun run verify:media`, `bun run verify`, `bun test`, `bun run typecheck`, and `bun run build` passed for the merged Cluster 4 task set.

### Frontend Migration Wave 1
- Status: complete after FE-010 analyzer reconciliation.
- FE-001 `Archive legacy frontend snapshot`
- FE-002 `Scaffold Vite React TypeScript Bun frontend`
- FE-003 `Establish FSD route tree public shell and admin shell`
- FE-004 `Migrate landing page into typed home route`
- FE-005 `Migrate projects catalog into typed projects route`
- FE-006 `Migrate photos gallery into typed photos route`
- FE-007 `Build thoughts public route surface`
- FE-008 `Build chat room public route surface`
- FE-009 `Build admin route surface`
- FE-010 `Re-run frontend analyzer and close migration blockers`

Cluster rules:
- FE-001 -> FE-002 -> FE-003 are sequential.
- FE-004 through FE-009 start only after FE-003.
- FE-010 starts only after FE-004 through FE-009.
- FE-010 cleared the frontend migration gate; backend, data, storage, admin backend, and deployment tasks now depend on their own spec approval gates plus FE-010 `adapt-spec` reconciliation.

## Spec Table
| Spec ID | Title | Layer | Status | Owner | Depends on | Blocks | Frontend-reviewed | Git workflow defined | Ready for task split | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPEC-001 | Frontend Intake | Process | Approved | unassigned | README | SPEC-005, SPEC-006, SPEC-007, SPEC-009 | yes | yes | yes | Mandatory first gate. |
| SPEC-002 | Frontend Analyzer | Process | Approved | unassigned | SPEC-001 | SPEC-005, SPEC-006, SPEC-007 | yes | yes | yes | Defines analyzer scan/report rules. |
| SPEC-003 | Product Scope | Product | Approved | unassigned | README | SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-009 | yes | yes | yes | Locked user-facing scope. |
| SPEC-004 | Design System | Design | Approved | unassigned | SPEC-003 | SPEC-005, SPEC-009, SPEC-011 | yes | yes | yes | Retro CRT/VHS visual rules. |
| SPEC-005 | Frontend Architecture | Frontend | Approved | unassigned | SPEC-002, SPEC-003, SPEC-004, SPEC-017 | SPEC-006, SPEC-007, SPEC-009, SPEC-011, SPEC-018 | yes | yes | yes | Applies the frontend structure policy to runtime, routes, and migration gates. |
| SPEC-006 | Backend Architecture | Backend | Approved | unassigned | SPEC-001, SPEC-002, SPEC-003, SPEC-005, SPEC-012, SPEC-016 | SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-011, SPEC-018 | yes | yes | yes | Approved for Wave 2 after SPEC-019 reconciliation. |
| SPEC-007 | Data Model | Data | Approved | unassigned | SPEC-001, SPEC-002, SPEC-003, SPEC-005, SPEC-006, SPEC-016 | SPEC-008, SPEC-009, SPEC-011 | yes | yes | yes | Approved for Wave 2 after frontend DTO/filter/pagination reconciliation. |
| SPEC-008 | Media Storage | Storage | Approved | unassigned | SPEC-006, SPEC-007, SPEC-016 | SPEC-010, SPEC-011 | yes | yes | yes | Approved for Wave 2 after accepted upload, access, URL, and soft-hide decisions. |
| SPEC-009 | Admin CMS | Admin | Approved | unassigned | SPEC-003, SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-016, SPEC-017 | SPEC-011 | yes | yes | yes | Approved for Wave 2 after admin auth/MFA, dashboard, curation, and draft-preview deferral decisions. |
| SPEC-010 | Infra Deployment | Infra | Approved | unassigned | SPEC-006, SPEC-008, SPEC-012, SPEC-016 | SPEC-011, SPEC-018 | yes | yes | yes | Approved for Wave 2 after `/api`, static fallback, media routing, and dev/prod volume reconciliation. |
| SPEC-011 | Verification | QA | Approved | unassigned | SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-016, SPEC-017, SPEC-018 | none | yes | yes | yes | Approved for Wave 2 after FE-010, backend boundary, media/upload, RSS, sitemap, and deployment scenario reconciliation. |
| SPEC-012 | Git Workflow | Process | Approved | unassigned | README | all specs | n/a | yes | yes | Mandatory for every task branch. |
| SPEC-013 | Acceptance Criteria | Process | Approved | unassigned | README | all specs | n/a | yes | yes | Shared checklist format. |
| SPEC-014 | Dependency Matrix | Process | Approved | unassigned | README | all specs | n/a | yes | yes | Central dependency map. |
| SPEC-015 | GitHub Project Execution | Process | Approved | unassigned | README, SPEC-012 | all implementation tasks, SPEC-018 | n/a | yes | yes | Defines issue + project execution workflow. |
| SPEC-016 | Project Structure | Architecture | Approved | unassigned | README | SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-011, SPEC-018 | n/a | yes | yes | Approved structural hard gate for backend-facing specs and tasks. |
| SPEC-017 | Frontend Structure | Frontend | Approved | unassigned | SPEC-002, SPEC-003, SPEC-004 | SPEC-005, SPEC-009, SPEC-011, SPEC-018 | yes | yes | yes | Defines strict FSD, Data Router placement, and public/admin shell structure. |
| SPEC-018 | GitHub Actions CI/CD | Process | Approved | unassigned | SPEC-005, SPEC-006, SPEC-010, SPEC-012, SPEC-015, SPEC-016, SPEC-017 | SPEC-011 | yes | yes | yes | Approved after Bun checks, analyzer freshness, backend non-mutating analyzer validation, and tag-based production release automation reconciliation. |

## Tasking Rule
A spec may only move to `Tasked` when:
- its status is `Approved`
- its dependencies are `Approved`
- frontend intake is satisfied
- for frontend-facing work, `SPEC-017 Frontend Structure` is `Approved`
- for backend-facing work, `SPEC-016 Project Structure` is `Approved`
- for release automation or final release readiness, `SPEC-018 GitHub Actions CI/CD` is `Approved`
- analyzer report is current for the imported frontend, if any
- no legacy React architecture blocker remains
- TypeScript migration is complete
- all planned screens exist in the frontend as fully designed screens
- GitHub Project auth is available
- the dedicated GitHub Project exists and is documented
- branch naming is defined for resulting tasks
- issue and Project item creation rules are defined for resulting tasks
- its acceptance checklist is complete
