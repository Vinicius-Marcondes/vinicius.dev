# Wave 2 Task Clusters

## Purpose
Define the approved Wave 2 implementation clusters so agents can create issues, branches, and implementation work without reopening product or architecture decisions.

## Scope
Backend foundation, persistence, public content APIs, media, auth/admin, chat, infra, CI/CD, and verification hardening.

## Locked Decisions
- `develop` is the base and merge target for normal Wave 2 tasks.
- Every task maps to one approved spec, one GitHub issue, one Project item, one branch, and one acceptance source.
- Backend implementation follows `SPEC-016 Project Structure` and `SPEC-006 Backend Architecture`.
- Backend-only PRs run the frontend analyzer as a non-mutating validation check.
- No implementation branch self-merges without review.

## Cluster Order
1. Backend foundation.
2. Persistence and Prisma/Postgres data model.
3. Public content APIs, Thoughts RSS, and sitemap.
4. Media storage and delivery.
5. Auth/admin backend.
6. Chat backend and moderation.
7. Infra, CI/CD, and verification hardening.

## Cluster 1: Backend Foundation
### Goal
Create the minimal backend runtime and architectural skeleton needed before any data, public API, admin, media, chat, infra, or CI hardening work starts.

### Status
Complete. `BE-001`, `BE-002`, `BE-003`, `BE-004`, and `BE-005` were implemented, reviewed, merged to `develop`, and verified together.

### Tasks
| Task ID | Title | Layer | Base Branch | Branch Name | Merge Target | Source Specs | Acceptance Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BE-001 | Scaffold Bun Hono TypeScript backend | backend | develop | backend/BE-001-scaffold-bun-hono-backend | develop | SPEC-006, SPEC-016, SPEC-018 | backend-architecture.md, project-structure.md, ci-cd.md |
| BE-002 | Establish hexagonal module skeleton and core contracts | backend | develop | backend/BE-002-hexagonal-module-skeleton | develop | SPEC-006, SPEC-016 | project-structure.md, backend-architecture.md |
| BE-003 | Add Hono `/api` HTTP adapter shell | backend | develop | backend/BE-003-hono-api-adapter-shell | develop | SPEC-006, SPEC-011, SPEC-016 | backend-architecture.md, verification.md |
| BE-004 | Add backend config and bootstrap composition root | backend | develop | backend/BE-004-bootstrap-config-container | develop | SPEC-006, SPEC-010, SPEC-016 | backend-architecture.md, infra-deployment.md, project-structure.md |
| BE-005 | Add backend verification and boundary check scripts | qa | develop | backend/BE-005-backend-verification-boundary-checks | develop | SPEC-011, SPEC-016, SPEC-018 | verification.md, project-structure.md, ci-cd.md |

### Dependency Rules
- `BE-001` runs first.
- `BE-002`, `BE-003`, `BE-004`, and `BE-005` start only after `BE-001` lands on `develop`.
- `BE-003` may depend on folders/types from `BE-002`; if both run concurrently after `BE-001`, agents must coordinate by keeping edits narrow and rebasing before review.
- No Cluster 2 tasks start until Cluster 1 is merged and validated.

### Non-Scope
- Prisma schema and migrations.
- Public content persistence.
- Media storage implementation.
- Admin authentication implementation.
- Chat room persistence or moderation behavior.
- Docker/Caddy deployment descriptors.
- Production GitHub Actions workflow YAML.

## Wave 3 Clusters
- Cluster 5 defines the first executable Wave 3 slice for admin/auth backend behavior.
- Cluster 6 defines the second Wave 3 slice for non-media chat behavior and moderation.
- Cluster 7 defines the final Wave 3 slice for infra, CI/CD, and verification hardening.

## Cluster 2: Persistence Foundation
### Goal
Create the Prisma/Postgres persistence foundation and schema baseline needed before public content, media, admin, or chat behavior can use durable state.

### Status
Complete. `DATA-001`, `DATA-002`, `DATA-003`, `DATA-004`, and `DATA-005` were implemented, reviewed, merged to `develop`, and verified together.

### Tasks
| Task ID | Title | Layer | Base Branch | Branch Name | Merge Target | Source Specs | Acceptance Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| DATA-001 | Add Prisma Postgres tooling baseline | data | develop | data/DATA-001-prisma-postgres-baseline | develop | SPEC-007, SPEC-016, SPEC-018 | data-model.md, project-structure.md, ci-cd.md |
| DATA-002 | Model public content and status strip schema | data | develop | data/DATA-002-public-content-status-schema | develop | SPEC-006, SPEC-007, SPEC-011 | data-model.md, backend-architecture.md, verification.md |
| DATA-003 | Model auth chat media and audit schema | data | develop | data/DATA-003-auth-chat-media-audit-schema | develop | SPEC-007, SPEC-008, SPEC-009, SPEC-011 | data-model.md, media-storage.md, admin-cms.md, verification.md |
| DATA-004 | Add repository port and Prisma adapter patterns | data | develop | data/DATA-004-repository-prisma-adapter-patterns | develop | SPEC-006, SPEC-007, SPEC-016 | backend-architecture.md, data-model.md, project-structure.md |
| DATA-005 | Add seed and migration verification workflow | data | develop | data/DATA-005-seed-migration-verification | develop | SPEC-007, SPEC-011, SPEC-018 | data-model.md, verification.md, ci-cd.md |

### Dependency Rules
- `DATA-001` runs first.
- `DATA-002` starts only after `DATA-001` lands on `develop`.
- `DATA-003` starts only after `DATA-002` lands on `develop` because both own the Prisma schema.
- `DATA-004` starts only after `DATA-002` and may be finalized after `DATA-003` if adapter tests need auth/chat/media models.
- `DATA-005` starts only after `DATA-002` and `DATA-003` land on `develop`.
- No Cluster 3 public content API tasks start until Cluster 2 is merged and validated.

### Non-Scope
- Public HTTP endpoint behavior.
- Content CRUD use cases.
- Media binary storage and file serving.
- Admin authentication/session behavior.
- Chat room join/send/moderation behavior.
- Docker/Caddy deployment descriptors.
- Production GitHub Actions workflow YAML.

## Cluster 3: Public Content APIs
### Goal
Implement the public read APIs and metadata endpoints that feed the migrated frontend, using the persistence foundation from Cluster 2 and the DTO/filter/pagination contracts from the approved specs.

### Status
Complete. `BE-006`, `BE-007`, `BE-008`, `BE-009`, `BE-010`, and `BE-011` were implemented, reviewed, merged to `develop`, and verified together.

### Tasks
| Task ID | Title | Layer | Base Branch | Branch Name | Merge Target | Source Specs | Acceptance Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BE-006 | Implement Thoughts public list detail API | backend | develop | backend/BE-006-thoughts-public-api | develop | SPEC-006, SPEC-007, SPEC-011, SPEC-016 | backend-architecture.md |
| BE-007 | Implement Projects public list detail API | backend | develop | backend/BE-007-projects-public-api | develop | SPEC-006, SPEC-007, SPEC-011, SPEC-016 | backend-architecture.md |
| BE-008 | Implement Photos public list detail API | backend | develop | backend/BE-008-photos-public-api | develop | SPEC-006, SPEC-007, SPEC-011, SPEC-016 | backend-architecture.md |
| BE-009 | Implement Status Strip public API | backend | develop | backend/BE-009-status-strip-public-api | develop | SPEC-006, SPEC-007, SPEC-011, SPEC-016 | backend-architecture.md |
| BE-010 | Implement Thoughts RSS feed | backend | develop | backend/BE-010-thoughts-rss-feed | develop | SPEC-006, SPEC-011, SPEC-018 | verification.md |
| BE-011 | Implement public sitemap generation API | backend | develop | backend/BE-011-public-sitemap-api | develop | SPEC-006, SPEC-011, SPEC-018 | verification.md |

### Dependency Rules
- `BE-006` runs first because the Thoughts API establishes the first public list/detail flow and the RSS input contract.
- `BE-007`, `BE-008`, `BE-009`, and `BE-010` start only after `BE-006` lands on `develop`.
- `BE-011` starts only after `BE-007`, `BE-008`, and `BE-009` land on `develop` because sitemap generation depends on the final public route and content endpoint contracts.
- Cluster 4 media storage and delivery tasks remain blocked until Cluster 3 is merged and validated.

### Non-Scope
- `/media/photos/:id/original` binary delivery.
- Chat room APIs, uploads, or moderation.
- Admin authentication, sessions, or dashboard CRUD.
- Docker/Caddy deployment descriptors.
- Production GitHub Actions workflow YAML.

### Merged PRs
- `BE-006`: `#45`
- `BE-007`: `#46`
- `BE-008`: `#47`
- `BE-009`: `#49`
- `BE-010`: `#48`
- `BE-011`: `#50`

## Cluster 4: Media Storage And Delivery
### Goal
Implement the shared media foundation and delivery behavior needed for filesystem-backed photo and chat media, while keeping storage behind outbound adapters and preserving the approved public and room-gated access contracts.

### Status
Complete. `BE-012`, `BE-013`, `BE-014`, `BE-015`, `BE-016`, and `BE-017` are implemented, merged to `develop`, and tracked as done.

### Tasks
| Task ID | Title | Layer | Base Branch | Branch Name | Merge Target | Source Specs | Acceptance Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| BE-012 | Implement media repository and filesystem storage foundation | backend | develop | backend/BE-012-media-storage-foundation | develop | SPEC-006, SPEC-008, SPEC-010, SPEC-016 | media-storage.md, project-structure.md, infra-deployment.md |
| BE-013 | Implement public photo original media delivery | backend | develop | backend/BE-013-photo-original-media-delivery | develop | SPEC-006, SPEC-008, SPEC-010, SPEC-011, SPEC-016 | media-storage.md, backend-architecture.md, verification.md |
| BE-014 | Implement chat upload validation and storage flow | backend | develop | backend/BE-014-chat-upload-validation-storage | develop | SPEC-006, SPEC-008, SPEC-011, SPEC-016 | media-storage.md, backend-architecture.md, verification.md |
| BE-015 | Implement room-gated chat media access | backend | develop | backend/BE-015-room-gated-chat-media-access | develop | SPEC-006, SPEC-008, SPEC-010, SPEC-011, SPEC-016 | media-storage.md, infra-deployment.md, verification.md |
| BE-016 | Implement chat media hide-delete retention behavior | backend | develop | backend/BE-016-chat-media-retention-moderation | develop | SPEC-008, SPEC-009, SPEC-011, SPEC-016 | media-storage.md, admin-cms.md, data-model.md, verification.md |
| BE-017 | Add media delivery and upload verification hardening | backend | develop | backend/BE-017-media-verification-hardening | develop | SPEC-008, SPEC-011, SPEC-018 | verification.md, ci-cd.md |

### Dependency Rules
- `BE-012` runs first because Cluster 4 depends on shared media repository reads, storage ports, filesystem adapter behavior, and bootstrap wiring.
- `BE-013` and `BE-014` start only after `BE-012` lands on `develop`; they may run in parallel because one owns public photo delivery and the other owns chat upload write flow.
- `BE-015` starts only after `BE-014` lands on `develop` because room-gated media access depends on persisted upload metadata and room/session-aware media lookups.
- `BE-016` starts only after `BE-014` lands on `develop` because hide/delete retention behavior depends on the chat upload/media persistence flow.
- `BE-017` starts only after `BE-013`, `BE-014`, `BE-015`, and `BE-016` land on `develop`.
- Cluster 5 admin/auth and Cluster 6 non-media chat behavior remain blocked until Cluster 4 is merged and validated.

### Execution Checkpoint
- `BE-012` complete and merged via PR `#59`.
- `BE-013` complete and merged via PR `#61`.
- `BE-014` complete and merged via PR `#60`.
- `BE-015` complete and merged via PR `#62`.
- `BE-016` complete and merged via PR `#63`.
- `BE-017` complete and merged via PR `#64`.
- Cluster 4 verification passed via `bun run verify:media`, `bun run verify`, `bun test`, `bun run typecheck`, and `bun run build` for the merged Cluster 4 task set.

### Non-Scope
- Admin login, MFA, and session lifecycle.
- Admin dashboard CRUD and curation flows.
- Non-media chat message archive, participant presence, and moderation commands outside media hide/delete behavior.
- Docker/Caddy implementation files.
- Production GitHub Actions workflow YAML.

## Cluster 5: Admin/Auth Backend
### Goal
Implement admin authentication, session lifecycle, dashboard read models, content curation, and status strip management so admin surfaces can operate against approved backend contracts.

### Status
Planned as the first Wave 3 executable cluster.

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
Planned as the second Wave 3 executable cluster.

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
- Cluster 7 remains blocked until Cluster 6 is merged and validated.

### Non-Scope
- Chat media upload and room-gated media file delivery behavior from Cluster 4.
- Admin content curation and status strip authoring behavior from Cluster 5.
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
Planned as the third Wave 3 executable cluster.

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
- [ ] Cluster order follows the approved Wave 2 and Wave 3 dependency sequence.
- [ ] Cluster 1 tasks each have one task ID, branch, issue, Project item, and acceptance source.
- [ ] Cluster 1 does not include persistence, media, admin, chat, infra deployment, or production CI implementation.
- [ ] Backend foundation tasks cite approved specs and branch rules.
- [ ] Cluster 2 tasks each have one task ID, branch, issue, Project item, and acceptance source.
- [ ] Cluster 2 keeps Prisma schema edits sequential to avoid merge conflicts.
- [ ] Cluster 3 tasks each have one task ID, branch, issue, Project item, and acceptance source.
- [ ] Cluster 3 keeps the Thoughts API ahead of the other public content endpoints.
- [ ] RSS remains coupled to Thoughts and sitemap remains coupled to the finalized public content contracts.
- [ ] Cluster 4 tasks each have one task ID, branch, issue, Project item, and acceptance source.
- [ ] Cluster 4 starts with shared media storage foundation before photo or chat media behavior.
- [ ] Cluster 4 allows photo delivery and chat upload implementation to run in parallel only after the shared storage foundation lands.
- [ ] Cluster 4 keeps room-gated chat media access and retention behavior behind upload/storage readiness.
- [ ] Cluster 4 moderation-aligned media retention work cites the admin moderation spec directly.
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
- Cluster 1 implementation uses `backend/` branches.
- Cluster 2 implementation uses `data/` branches.
- Cluster 3 implementation uses `backend/` branches.
- Cluster 4 implementation uses `backend/` branches.
- Cluster 5 implementation uses `admin/` branches.
- Cluster 6 implementation uses `backend/` branches.
- Cluster 7 implementation uses `infra/` branches.
