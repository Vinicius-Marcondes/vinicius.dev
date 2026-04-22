# Spec Tracker

## Gate Checks
| Gate | Status | Notes |
| --- | --- | --- |
| Frontend presence checked | yes | Imported frontend exists under `frontend/` and is legacy React. |
| Analyzer report current | yes | The analyzer has been refreshed against the imported `frontend/` folder and currently reports migration blockers. |
| Spec reconciliation complete | no | Frontend reconciliation is incomplete because the imported frontend is legacy React and missing planned screens. |
| Frontend structure spec approved | no | `SPEC-017 Frontend Structure` is the new hard gate for frontend-facing specs and tasks. |
| Project structure spec approved | no | `SPEC-016 Project Structure` is the new hard gate for backend-facing specs and tasks. |
| GitHub Project auth available | yes | `gh auth status` now includes the `project` scope for `Vinicius-Marcondes`. |
| Dedicated GitHub Project exists | yes | Project `vinicius.dev` exists as `Vinicius-Marcondes` Project `#2`. |
| GitHub Project id and url documented | yes | See [github-project-execution.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/github-project-execution.md). |
| Branch strategy spec approved | no | [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md) exists but still needs review/approval. |
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
- Backend specs cannot move to `Tasked` until frontend intake rules are satisfied.
- The imported frontend is currently a legacy React artifact, not a task-ready Vite React TypeScript app.
- Frontend migration tasks must precede backend, data, and admin task creation.

## Cross-Cutting Risks
- Public photo delivery is intentionally originals-only, which may create performance and bandwidth pressure.
- Chat room image uploads are allowed for anyone with the room password, which increases moderation and storage risk.
- The repo currently has no commits, so the `develop` branch policy becomes operational after the first repository commit.
- The dedicated GitHub Project now exists, but implementation-task creation still waits on spec approval and frontend reconciliation gates.
- The imported frontend currently depends on browser Babel, CDN React, and global `window.*` component composition.
- Thoughts, Chat Room, and Admin are missing from the imported frontend and are treated as migration blockers until fully designed screens exist.

## Next Spec Queue
1. Review and approve `frontend-structure.md` as the structural hard gate for frontend-facing work.
2. Review and approve `frontend-analyzer.md`, `frontend-intake.md`, and `frontend-architecture.md` against `SPEC-017`.
3. Create frontend migration issues first: archive legacy frontend, scaffold a clean Vite React TypeScript app, establish the FSD/Data Router skeleton, migrate landing/projects/photos, implement Thoughts/Chat/Admin, rerun analyzer.
4. Review and approve `project-structure.md` as the structural hard gate for backend-facing work.
5. Review and approve `backend-architecture.md`, `data-model.md`, `media-storage.md`, `admin-cms.md`, `infra-deployment.md`, and `verification.md` against `SPEC-016` and the stabilized frontend specs.
6. Review and approve `github-project-execution.md` and `git-workflow.md`.

## Spec Table
| Spec ID | Title | Layer | Status | Owner | Depends on | Blocks | Frontend-reviewed | Git workflow defined | Ready for task split | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPEC-001 | Frontend Intake | Process | Review | unassigned | README | SPEC-005, SPEC-006, SPEC-007, SPEC-009 | yes | yes | yes | Mandatory first gate. |
| SPEC-002 | Frontend Analyzer | Process | Review | unassigned | SPEC-001 | SPEC-005, SPEC-006, SPEC-007 | yes | yes | yes | Defines analyzer scan/report rules. |
| SPEC-003 | Product Scope | Product | Review | unassigned | README | SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-009 | yes | yes | yes | Locked user-facing scope. |
| SPEC-004 | Design System | Design | Review | unassigned | SPEC-003 | SPEC-005, SPEC-009, SPEC-011 | yes | yes | yes | Retro CRT/VHS visual rules. |
| SPEC-005 | Frontend Architecture | Frontend | Review | unassigned | SPEC-002, SPEC-003, SPEC-004, SPEC-017 | SPEC-006, SPEC-007, SPEC-009, SPEC-011 | no | yes | no | Applies the frontend structure policy to runtime, routes, and migration gates. |
| SPEC-006 | Backend Architecture | Backend | Draft | unassigned | SPEC-001, SPEC-002, SPEC-003, SPEC-005, SPEC-012, SPEC-016 | SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-011 | no | yes | no | Cannot be tasked until frontend migration gate, workflow, and project structure are approved. |
| SPEC-007 | Data Model | Data | Draft | unassigned | SPEC-001, SPEC-002, SPEC-003, SPEC-005, SPEC-006, SPEC-016 | SPEC-008, SPEC-009, SPEC-011 | no | yes | no | Prisma and persistence contracts aligned to the hexagonal backend core. |
| SPEC-008 | Media Storage | Storage | Draft | unassigned | SPEC-006, SPEC-007, SPEC-016 | SPEC-010, SPEC-011 | yes | yes | no | Covers filesystem uploads and retention through outbound storage adapters. |
| SPEC-009 | Admin CMS | Admin | Draft | unassigned | SPEC-003, SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-016, SPEC-017 | SPEC-011 | yes | yes | no | Admin UI plus curation surface aligned to frontend shells and backend ports. |
| SPEC-010 | Infra Deployment | Infra | Draft | unassigned | SPEC-006, SPEC-008, SPEC-012, SPEC-016 | SPEC-011 | n/a | yes | no | Docker, Caddy, volumes, envs, and backend composition-root runtime. |
| SPEC-011 | Verification | QA | Draft | unassigned | SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-016, SPEC-017 | none | yes | yes | no | Release gates, frontend structure checks, backend boundary checks, and cross-layer coverage. |
| SPEC-012 | Git Workflow | Process | Review | unassigned | README | all specs | n/a | yes | yes | Mandatory for every task branch. |
| SPEC-013 | Acceptance Criteria | Process | Review | unassigned | README | all specs | n/a | yes | yes | Shared checklist format. |
| SPEC-014 | Dependency Matrix | Process | Review | unassigned | README | all specs | n/a | yes | yes | Central dependency map. |
| SPEC-015 | GitHub Project Execution | Process | Review | unassigned | README, SPEC-012 | all implementation tasks | n/a | yes | yes | Defines issue + project execution workflow. |
| SPEC-016 | Project Structure | Architecture | Review | unassigned | README | SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010, SPEC-011 | n/a | yes | yes | Defines repo topology and the backend hexagonal boundary policy. |
| SPEC-017 | Frontend Structure | Frontend | Review | unassigned | SPEC-002, SPEC-003, SPEC-004 | SPEC-005, SPEC-009, SPEC-011 | yes | yes | yes | Defines strict FSD, Data Router placement, and public/admin shell structure. |

## Tasking Rule
A spec may only move to `Tasked` when:
- its status is `Approved`
- its dependencies are `Approved`
- frontend intake is satisfied
- for frontend-facing work, `SPEC-017 Frontend Structure` is `Approved`
- for backend-facing work, `SPEC-016 Project Structure` is `Approved`
- analyzer report is current for the imported frontend, if any
- no legacy React architecture blocker remains
- TypeScript migration is complete
- all planned screens exist in the frontend as fully designed screens
- GitHub Project auth is available
- the dedicated GitHub Project exists and is documented
- branch naming is defined for resulting tasks
- issue and Project item creation rules are defined for resulting tasks
- its acceptance checklist is complete
