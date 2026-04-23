# Spec Tracker

## Gate Checks
| Gate | Status | Notes |
| --- | --- | --- |
| Frontend presence checked | yes | Active frontend now exists under `frontend/` as the Vite React TypeScript Bun app; the imported legacy artifact is preserved under `frontend-legacy/`. |
| Analyzer report current | yes | FE-010 refreshed the analyzer against the migrated frontend and currently reports no migration blockers. |
| Spec reconciliation complete | yes | Frontend migration reconciliation is complete; analyzer `adapt-spec` notes for API and upload assumptions remain inputs for backend/media/admin planning. |
| Frontend structure spec approved | yes | `SPEC-017 Frontend Structure` is approved for frontend-facing specs and tasks. |
| Project structure spec approved | no | `SPEC-016 Project Structure` is the new hard gate for backend-facing specs and tasks. |
| CI/CD spec approved | no | `SPEC-018 GitHub Actions CI/CD` is the release-automation and final verification gate. |
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
- Backend, data, media, admin backend, and deployment task creation may now use the FE-010 analyzer report as frontend input, subject to their own spec approval gates.

## Cross-Cutting Risks
- Public photo delivery is intentionally originals-only, which may create performance and bandwidth pressure.
- Chat room image uploads are allowed for anyone with the room password, which increases moderation and storage risk.
- CI/CD workflows are not defined yet, so merge validation and release automation are still policy-only at the harness level.
- The FE-010 analyzer reports `adapt-spec` findings for future API and upload assumptions; backend, media-storage, data-model, and admin-cms specs should reconcile those before backend tasking.
- The frontend migration wave cleared the previous browser Babel, CDN React, global `window.*`, missing TypeScript, and missing screen blockers.

## Next Spec Queue
1. Review FE-010 analyzer `adapt-spec` findings and feed them into `backend-architecture.md`, `data-model.md`, `media-storage.md`, and `admin-cms.md`.
2. Review and approve `project-structure.md` as the structural hard gate for backend-facing work.
3. Review and approve `backend-architecture.md`, `data-model.md`, `media-storage.md`, `admin-cms.md`, and `infra-deployment.md` against `SPEC-016` and the stabilized frontend.
4. Review and approve `ci-cd.md` so branch policy, review flow, and release automation stay aligned.
5. Review and approve `verification.md` against `SPEC-016`, `SPEC-017`, `SPEC-018`, and the FE-010 analyzer report.
6. Cut the next implementation cluster only from approved backend/data/media/admin/infra specs.

## Current Executable Cluster
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
| SPEC-006 | Backend Architecture | Backend | Draft | unassigned | SPEC-001, SPEC-002, SPEC-003, SPEC-005, SPEC-012, SPEC-016 | SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-011, SPEC-018 | no | yes | no | Cannot be tasked until frontend migration gate, workflow, and project structure are approved. |
| SPEC-007 | Data Model | Data | Draft | unassigned | SPEC-001, SPEC-002, SPEC-003, SPEC-005, SPEC-006, SPEC-016 | SPEC-008, SPEC-009, SPEC-011 | no | yes | no | Prisma and persistence contracts aligned to the hexagonal backend core. |
| SPEC-008 | Media Storage | Storage | Draft | unassigned | SPEC-006, SPEC-007, SPEC-016 | SPEC-010, SPEC-011 | yes | yes | no | Covers filesystem uploads and retention through outbound storage adapters. |
| SPEC-009 | Admin CMS | Admin | Draft | unassigned | SPEC-003, SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-016, SPEC-017 | SPEC-011 | yes | yes | no | Admin UI plus curation surface aligned to frontend shells and backend ports. |
| SPEC-010 | Infra Deployment | Infra | Draft | unassigned | SPEC-006, SPEC-008, SPEC-012, SPEC-016 | SPEC-011, SPEC-018 | n/a | yes | no | Docker, Caddy, volumes, envs, and backend composition-root runtime. |
| SPEC-011 | Verification | QA | Draft | unassigned | SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-016, SPEC-017, SPEC-018 | none | yes | yes | no | Release gates, frontend structure checks, backend boundary checks, CI/CD rules, and cross-layer coverage. |
| SPEC-012 | Git Workflow | Process | Approved | unassigned | README | all specs | n/a | yes | yes | Mandatory for every task branch. |
| SPEC-013 | Acceptance Criteria | Process | Review | unassigned | README | all specs | n/a | yes | yes | Shared checklist format. |
| SPEC-014 | Dependency Matrix | Process | Review | unassigned | README | all specs | n/a | yes | yes | Central dependency map. |
| SPEC-015 | GitHub Project Execution | Process | Approved | unassigned | README, SPEC-012 | all implementation tasks, SPEC-018 | n/a | yes | yes | Defines issue + project execution workflow. |
| SPEC-016 | Project Structure | Architecture | Review | unassigned | README | SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-011, SPEC-018 | n/a | yes | yes | Defines repo topology and the backend hexagonal boundary policy. |
| SPEC-017 | Frontend Structure | Frontend | Approved | unassigned | SPEC-002, SPEC-003, SPEC-004 | SPEC-005, SPEC-009, SPEC-011, SPEC-018 | yes | yes | yes | Defines strict FSD, Data Router placement, and public/admin shell structure. |
| SPEC-018 | GitHub Actions CI/CD | Process | Review | unassigned | SPEC-005, SPEC-006, SPEC-010, SPEC-012, SPEC-015, SPEC-016, SPEC-017 | SPEC-011 | n/a | yes | no | Defines simple CI, manual VPS development deployment, and tag-based production release automation. |

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
