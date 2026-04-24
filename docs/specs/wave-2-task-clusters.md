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

## Future Clusters
- Cluster 5 admin/auth splits by login, MFA, session lifecycle, dashboard contracts, content curation, and status strip editing.
- Cluster 6 chat splits by room gate, handle/session state, message archive, participant state, non-media message flow, moderation commands, and audit records.
- Cluster 7 infra/CI/verification splits by Docker service layout, Caddy routing, env/volume policy, GitHub Actions validation, deploy workflow, and cross-layer tests.

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
Ready for issue creation and implementation.

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

### Non-Scope
- Admin login, MFA, and session lifecycle.
- Admin dashboard CRUD and curation flows.
- Non-media chat message archive, participant presence, and moderation commands outside media hide/delete behavior.
- Docker/Caddy implementation files.
- Production GitHub Actions workflow YAML.

## Acceptance Checklist
- [ ] Cluster order follows the approved Wave 2 dependency sequence.
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
- [ ] Future clusters remain blocked until their dependencies land.

## Git Branch Implications
- Cluster definition changes use `spec/` branches.
- Cluster 1 implementation uses `backend/` branches.
- Cluster 2 implementation uses `data/` branches.
- Cluster 3 implementation uses `backend/` branches.
- Cluster 4 implementation uses `backend/` branches.
- Future infra-only work uses `infra/` branches and future verification-only work may use `qa/` branches if the harness adopts that prefix; until then, use the closest approved prefix from `git-workflow.md`.
