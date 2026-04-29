# Wave 3 Task Clusters

## Purpose
Define the approved Wave 3 implementation clusters so agents can create issues, branches, and implementation work without reopening product or architecture decisions.

## Scope
Admin/auth backend, non-media chat backend and moderation, infra, CI/CD, and verification hardening.

## Locked Decisions
- `develop` is the base and merge target for normal Wave 3 tasks.
- Every task maps to one approved spec, one GitHub issue, one Project item, one branch, and one acceptance source.
- Backend implementation follows `SPEC-016 Project Structure` and `SPEC-006 Backend Architecture`.
- Backend-only PRs run the frontend analyzer as a non-mutating validation check.
- No implementation branch self-merges without review.

## Cluster Order
1. Auth/admin backend.
2. Chat backend and moderation.
3. Infra, CI/CD, and verification hardening.

## Cluster 5: Admin/Auth Backend
### Goal
Implement admin authentication, session lifecycle, dashboard read models, content curation, and status strip management so admin surfaces can operate against approved backend contracts.

### Status
Complete.

### Tasks
| Task ID | Title | Layer | Base Branch | Branch Name | Merge Target | Source Specs | Acceptance Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ADMIN-001 | Implement admin login credential and MFA challenge flow | admin | develop | admin/ADMIN-001-login-mfa-challenge-flow | develop | SPEC-006, SPEC-009, SPEC-016 | admin-cms.md, backend-architecture.md, project-structure.md |
| ADMIN-002 | Implement admin session issuance refresh and revoke flow | admin | develop | admin/ADMIN-002-session-lifecycle-flow | develop | SPEC-006, SPEC-009, SPEC-011, SPEC-016 | admin-cms.md, backend-architecture.md, verification.md |
| ADMIN-003 | Implement admin dashboard summary API contracts | admin | develop | admin/ADMIN-003-dashboard-summary-contracts | develop | SPEC-006, SPEC-007, SPEC-009, SPEC-016 | admin-cms.md, data-model.md, backend-architecture.md |
| ADMIN-004 | Implement admin thoughts and projects curation APIs | admin | develop | admin/ADMIN-004-thoughts-projects-curation | develop | SPEC-006, SPEC-007, SPEC-009, SPEC-011, SPEC-016 | admin-cms.md, data-model.md, verification.md |
| ADMIN-005 | Implement admin photos curation APIs with media metadata controls | admin | develop | admin/ADMIN-005-photos-curation-media-metadata | develop | SPEC-006, SPEC-007, SPEC-008, SPEC-009, SPEC-011, SPEC-016 | admin-cms.md, media-storage.md, verification.md |
| ADMIN-006 | Implement admin status strip management APIs | admin | develop | admin/ADMIN-006-status-strip-management | develop | SPEC-006, SPEC-007, SPEC-009, SPEC-011, SPEC-016 | admin-cms.md, data-model.md, verification.md |
| ADMIN-007 | Add admin auth and curation verification hardening | qa | develop | admin/ADMIN-007-auth-curation-verification-hardening | develop | SPEC-009, SPEC-011, SPEC-018 | verification.md, ci-cd.md |

### Dependency Rules
- `ADMIN-001` runs first because all admin contracts are gated by authenticated admin identity and MFA challenge completion.
- `ADMIN-002` starts only after `ADMIN-001` lands on `develop` because refresh and revoke depend on the issued admin session model.
- `ADMIN-003` starts only after `ADMIN-002` lands on `develop` because dashboard contracts are admin-session gated and depend on settled auth middleware behavior.
- `ADMIN-004`, `ADMIN-005`, and `ADMIN-006` start only after `ADMIN-003` lands on `develop`; they may run in parallel because each owns a separate admin content surface.
- `ADMIN-007` starts only after `ADMIN-004`, `ADMIN-005`, and `ADMIN-006` land on `develop`.
- Cluster 6 remains blocked until Cluster 5 is merged and validated.

### Completion Record
- Merged PRs: `#70`.
- Task issues for Cluster 5 scope are complete and set to `Done` in Project `#2`.

### Non-Scope
- Chat room join lifecycle, participant state, or moderation commands.
- Docker Compose service wiring and Caddy runtime configuration.
- GitHub Actions workflow YAML for CI or deploy automation.
- Production deployment execution and VPS rollout playbooks.

### Acceptance Sources
- `admin-cms.md`
- `backend-architecture.md`
- `data-model.md`
- `media-storage.md`
- `verification.md`
- `ci-cd.md`

## Cluster 6: Chat Backend And Moderation
### Goal
Implement the non-media chat room lifecycle, message flow, moderation, and audit behavior required by approved chat and admin moderation contracts.

### Status
Complete.

### Tasks
| Task ID | Title | Layer | Base Branch | Branch Name | Merge Target | Source Specs | Acceptance Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CHAT-001 | Implement chat room password gate and room session join flow | backend | develop | backend/CHAT-001-room-password-session-join | develop | SPEC-006, SPEC-007, SPEC-009, SPEC-011, SPEC-016 | backend-architecture.md, data-model.md, admin-cms.md, verification.md |
| CHAT-002 | Implement chat participant handle registration and presence state | backend | develop | backend/CHAT-002-handle-presence-state | develop | SPEC-006, SPEC-007, SPEC-011, SPEC-016 | backend-architecture.md, data-model.md, verification.md |
| CHAT-003 | Implement chat message archive list and pagination contracts | backend | develop | backend/CHAT-003-message-archive-pagination | develop | SPEC-006, SPEC-007, SPEC-011, SPEC-016 | backend-architecture.md, data-model.md, verification.md |
| CHAT-004 | Implement chat text message send flow | backend | develop | backend/CHAT-004-text-message-send-flow | develop | SPEC-006, SPEC-007, SPEC-011, SPEC-016 | backend-architecture.md, data-model.md, verification.md |
| CHAT-005 | Implement chat moderation commands for hide delete and access control | backend | develop | backend/CHAT-005-moderation-hide-delete-access | develop | SPEC-006, SPEC-007, SPEC-009, SPEC-011, SPEC-016 | backend-architecture.md, admin-cms.md, data-model.md, verification.md |
| CHAT-006 | Implement chat moderation audit trail query API | backend | develop | backend/CHAT-006-moderation-audit-query | develop | SPEC-006, SPEC-007, SPEC-009, SPEC-011, SPEC-016 | backend-architecture.md, admin-cms.md, data-model.md, verification.md |
| CHAT-007 | Add chat lifecycle moderation and audit verification hardening | qa | develop | backend/CHAT-007-chat-moderation-verification-hardening | develop | SPEC-009, SPEC-011, SPEC-018 | verification.md, ci-cd.md |

### Dependency Rules
- `CHAT-001` runs first because chat participation depends on room-gated session entry.
- `CHAT-002` starts only after `CHAT-001` lands on `develop` because participant presence depends on a valid room session.
- `CHAT-003` starts only after `CHAT-002` lands on `develop` because archive contracts require stable participant and room identity context.
- `CHAT-004` starts only after `CHAT-003` lands on `develop` because send flow and read flow must share cursor and ordering contracts.
- `CHAT-005` starts only after `CHAT-004` lands on `develop` because moderation commands apply to persisted chat message records.
- `CHAT-006` starts only after `CHAT-005` lands on `develop` because audit query contracts depend on emitted moderation events.
- `CHAT-007` starts only after `CHAT-003`, `CHAT-004`, `CHAT-005`, and `CHAT-006` land on `develop`.
- Cluster 7 is now the current executable cluster after Cluster 6 merged and validated.

### Non-Scope
- Chat media upload and room-gated media file delivery behavior from Wave 2 Cluster 4.
- Admin content curation and status strip authoring behavior from Wave 3 Cluster 5.
- Docker Compose service topology and Caddy runtime routing implementation.
- Production release tagging and deploy workflow execution.

### Acceptance Sources
- `backend-architecture.md`
- `data-model.md`
- `admin-cms.md`
- `verification.md`
- `ci-cd.md`

## Cluster 7: Infra CI/CD And Verification Hardening
### Goal
Finalize deployment topology, route/runtime configuration, CI validation workflows, and cross-layer verification so the Wave 2 and Wave 3 backend stack is release-ready under approved infrastructure and CI/CD policy.

### Status
Complete.

### Tasks
| Task ID | Title | Layer | Base Branch | Branch Name | Merge Target | Source Specs | Acceptance Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| INFRA-001 | Implement Docker Compose service topology for frontend backend caddy and postgres | infra | develop | infra/INFRA-001-docker-compose-service-topology | develop | SPEC-006, SPEC-010, SPEC-016 | infra-deployment.md, backend-architecture.md, project-structure.md |
| INFRA-002 | Implement Caddy routing for public app api and media paths | infra | develop | infra/INFRA-002-caddy-public-api-media-routing | develop | SPEC-006, SPEC-008, SPEC-010, SPEC-016 | infra-deployment.md, media-storage.md, backend-architecture.md |
| INFRA-003 | Implement environment and volume policy for development and production | infra | develop | infra/INFRA-003-env-volume-policy | develop | SPEC-008, SPEC-010, SPEC-016, SPEC-018 | infra-deployment.md, media-storage.md, ci-cd.md |
| QA-001 | Implement GitHub Actions pull request validation workflow | qa | develop | infra/QA-001-pr-validation-workflow | develop | SPEC-011, SPEC-018 | ci-cd.md, verification.md |
| QA-002 | Implement GitHub Actions develop and main branch validation workflow | qa | develop | infra/QA-002-branch-validation-workflow | develop | SPEC-011, SPEC-018 | ci-cd.md, verification.md |
| QA-003 | Implement frontend analyzer freshness enforcement in CI | qa | develop | infra/QA-003-analyzer-freshness-enforcement | develop | SPEC-002, SPEC-005, SPEC-011, SPEC-018 | frontend-analyzer.md, frontend-architecture.md, verification.md, ci-cd.md |
| QA-004 | Implement backend boundary and architecture checks in CI | qa | develop | infra/QA-004-backend-boundary-ci-checks | develop | SPEC-006, SPEC-011, SPEC-016, SPEC-018 | verification.md, backend-architecture.md, project-structure.md, ci-cd.md |
| QA-005 | Implement persistence and migration validation checks in CI | qa | develop | infra/QA-005-persistence-migration-ci-checks | develop | SPEC-007, SPEC-011, SPEC-018 | data-model.md, verification.md, ci-cd.md |
| QA-006 | Implement tag-gated production deploy workflow | qa | develop | infra/QA-006-tag-gated-production-deploy | develop | SPEC-010, SPEC-011, SPEC-018 | ci-cd.md, infra-deployment.md, verification.md |
| QA-007 | Add cross-layer verification hardening for public admin chat media and deploy scenarios | qa | develop | infra/QA-007-cross-layer-verification-hardening | develop | SPEC-006, SPEC-008, SPEC-009, SPEC-010, SPEC-011, SPEC-018 | verification.md, backend-architecture.md, media-storage.md, admin-cms.md, infra-deployment.md, ci-cd.md |

### Dependency Rules
- `INFRA-001` runs first because all infra and CI tasks depend on a stable runtime topology.
- `INFRA-002` starts only after `INFRA-001` lands on `develop` because route wiring depends on settled service names and network contracts.
- `INFRA-003` starts only after `INFRA-001` and may be finalized after `INFRA-002` if environment contracts require route-aware values.
- `QA-001`, `QA-002`, and `QA-003` start only after `INFRA-003` lands on `develop` because CI contracts depend on finalized environment and service policy.
- `QA-004` and `QA-005` start only after `QA-001` and `QA-002` land on `develop` because they extend the core validation workflow.
- `QA-006` starts only after `QA-002` and `INFRA-002` land on `develop` because production deploy must consume approved branch validation and runtime routing contracts.
- `QA-007` starts only after `INFRA-002`, `INFRA-003`, `QA-003`, `QA-004`, and `QA-005` land on `develop`.

### Completion Record
- Merged PRs: `#98`, `#99`, `#100`, `#101`, `#102`, `#103`, `#105`, `#104`, `#106`, and `#107`.
- Task issues: `#87` through `#96` are complete and set to `Done` in Project `#2`.

### Non-Scope
- New product features or API contract changes outside approved specs.
- Frontend route redesign or admin UI implementation details.
- Retroactive refactoring of completed Cluster 1 through Cluster 6 task boundaries.
- Operational runbook authoring outside spec harness updates.

### Acceptance Sources
- `infra-deployment.md`
- `ci-cd.md`
- `verification.md`
- `backend-architecture.md`
- `project-structure.md`
- `data-model.md`
- `media-storage.md`
- `admin-cms.md`
- `frontend-analyzer.md`
- `frontend-architecture.md`

## Acceptance Checklist
- [ ] Cluster order follows the approved Wave 3 dependency sequence.
- [ ] Cluster 5 tasks each have one task ID, branch, issue, Project item, and acceptance source.
- [ ] Cluster 5 starts with login and MFA before session lifecycle, dashboard, and curation tasks.
- [ ] Cluster 5 keeps thoughts/projects/photos/status-strip curation in separate tasks to avoid mixed concerns.
- [ ] Cluster 6 tasks each have one task ID, branch, issue, Project item, and acceptance source.
- [ ] Cluster 6 starts with room gate before participant, archive, send, moderation, and audit behavior.
- [ ] Cluster 6 keeps moderation command execution and audit query concerns in separate tasks.
- [ ] Cluster 7 tasks each have one task ID, branch, issue, Project item, and acceptance source.
- [ ] Cluster 7 starts with infra topology before CI and deploy automation tasks.
- [ ] Cluster 7 keeps CI validation concerns split by workflow scope and cross-layer verification hardening.
- [ ] No Wave 3 implementation issue is created before the harness is explicitly advanced to that executable cluster.

## Git Branch Implications
- Cluster definition changes use `spec/` branches.
- Cluster 5 implementation uses `admin/` branches.
- Cluster 6 implementation uses `backend/` branches.
- Cluster 7 implementation uses `infra/` branches.
