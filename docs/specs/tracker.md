# Spec Tracker

## Gate Checks
| Gate | Status | Notes |
| --- | --- | --- |
| Frontend presence checked | yes | Initial repo scan found no frontend files yet. |
| Analyzer report current | yes | See [frontend-analyzer-report.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer-report.md). |
| Spec reconciliation complete | yes | No frontend exists, so planned frontend specs remain the source of truth. |
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
- Backend specs cannot move to `Tasked` until frontend intake rules are satisfied.

## Cross-Cutting Risks
- Public photo delivery is intentionally originals-only, which may create performance and bandwidth pressure.
- Chat room image uploads are allowed for anyone with the room password, which increases moderation and storage risk.
- The repo currently has no commits, so the `develop` branch policy becomes operational after the first repository commit.
- The dedicated GitHub Project now exists, but implementation-task creation still waits on spec approval and frontend reconciliation gates.

## Next Spec Queue
1. Review and approve `github-project-execution.md` and `git-workflow.md`.
2. Review and approve `product-scope.md` and `design-system.md`.
3. Review and approve `frontend-architecture.md`.
4. Re-check frontend intake whenever UI files arrive.
5. Approve backend, data, media, admin, infra, and verification specs.
6. Create implementation issues in GitHub Project `#2` only after the relevant specs are `Approved`.

## Spec Table
| Spec ID | Title | Layer | Status | Owner | Depends on | Blocks | Frontend-reviewed | Git workflow defined | Ready for task split | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SPEC-001 | Frontend Intake | Process | Review | unassigned | README | SPEC-005, SPEC-006, SPEC-007, SPEC-009 | yes | yes | yes | Mandatory first gate. |
| SPEC-002 | Frontend Analyzer | Process | Review | unassigned | SPEC-001 | SPEC-005, SPEC-006, SPEC-007 | yes | yes | yes | Defines analyzer scan/report rules. |
| SPEC-003 | Product Scope | Product | Review | unassigned | README | SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-009 | yes | yes | yes | Locked user-facing scope. |
| SPEC-004 | Design System | Design | Review | unassigned | SPEC-003 | SPEC-005, SPEC-009, SPEC-011 | yes | yes | yes | Retro CRT/VHS visual rules. |
| SPEC-005 | Frontend Architecture | Frontend | Review | unassigned | SPEC-002, SPEC-003, SPEC-004 | SPEC-006, SPEC-007, SPEC-009, SPEC-011 | yes | yes | yes | Bun-based frontend spec. |
| SPEC-006 | Backend Architecture | Backend | Draft | unassigned | SPEC-001, SPEC-002, SPEC-003, SPEC-005, SPEC-007, SPEC-012 | SPEC-009, SPEC-010, SPEC-011 | yes | yes | no | Cannot be tasked until workflow and data model are approved. |
| SPEC-007 | Data Model | Data | Draft | unassigned | SPEC-001, SPEC-002, SPEC-003, SPEC-005 | SPEC-006, SPEC-008, SPEC-009, SPEC-011 | yes | yes | no | Prisma and contract source. |
| SPEC-008 | Media Storage | Storage | Draft | unassigned | SPEC-007, SPEC-010 | SPEC-006, SPEC-011 | yes | yes | no | Covers filesystem uploads and retention. |
| SPEC-009 | Admin CMS | Admin | Draft | unassigned | SPEC-003, SPEC-004, SPEC-005, SPEC-006, SPEC-007 | SPEC-011 | yes | yes | no | Admin UI plus curation surface. |
| SPEC-010 | Infra Deployment | Infra | Draft | unassigned | SPEC-006, SPEC-008, SPEC-012 | SPEC-011 | n/a | yes | no | Docker, Caddy, volumes, envs. |
| SPEC-011 | Verification | QA | Draft | unassigned | SPEC-004, SPEC-005, SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-010 | none | yes | yes | no | Release gates and test coverage. |
| SPEC-012 | Git Workflow | Process | Review | unassigned | README | all specs | n/a | yes | yes | Mandatory for every task branch. |
| SPEC-013 | Acceptance Criteria | Process | Review | unassigned | README | all specs | n/a | yes | yes | Shared checklist format. |
| SPEC-014 | Dependency Matrix | Process | Review | unassigned | README | all specs | n/a | yes | yes | Central dependency map. |
| SPEC-015 | GitHub Project Execution | Process | Review | unassigned | README, SPEC-012 | all implementation tasks | n/a | yes | yes | Defines issue + project execution workflow. |

## Tasking Rule
A spec may only move to `Tasked` when:
- its status is `Approved`
- its dependencies are `Approved`
- frontend intake is satisfied
- GitHub Project auth is available
- the dedicated GitHub Project exists and is documented
- branch naming is defined for resulting tasks
- issue and Project item creation rules are defined for resulting tasks
- its acceptance checklist is complete
