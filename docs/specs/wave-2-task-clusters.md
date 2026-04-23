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
- Cluster 3 public content splits by Thoughts, Projects, Photos, Status Strip, RSS, and sitemap.
- Cluster 4 media splits by public photo delivery, filesystem storage adapter, chat upload validation/storage, and moderation retention.
- Cluster 5 admin splits by auth/MFA/session, admin dashboard contracts, content CRUD, curation, and status strip editing.
- Cluster 6 chat splits by room gate, handle/session state, message archive, participant state, image attachment flow, moderation commands, and audit records.
- Cluster 7 infra/CI/verification splits by Docker service layout, Caddy routing, env/volume policy, GitHub Actions validation, deploy workflow, and cross-layer tests.

## Cluster 2: Persistence Foundation
### Goal
Create the Prisma/Postgres persistence foundation and schema baseline needed before public content, media, admin, or chat behavior can use durable state.

### Status
Ready for issue creation and implementation.

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

## Acceptance Checklist
- [ ] Cluster order follows the approved Wave 2 dependency sequence.
- [ ] Cluster 1 tasks each have one task ID, branch, issue, Project item, and acceptance source.
- [ ] Cluster 1 does not include persistence, media, admin, chat, infra deployment, or production CI implementation.
- [ ] Backend foundation tasks cite approved specs and branch rules.
- [ ] Cluster 2 tasks each have one task ID, branch, issue, Project item, and acceptance source.
- [ ] Cluster 2 keeps Prisma schema edits sequential to avoid merge conflicts.
- [ ] Future clusters remain blocked until their dependencies land.

## Git Branch Implications
- Cluster definition changes use `spec/` branches.
- Cluster 1 implementation uses `backend/` branches.
- Cluster 2 implementation uses `data/` branches.
- Future infra-only work uses `infra/` branches and future verification-only work may use `qa/` branches if the harness adopts that prefix; until then, use the closest approved prefix from `git-workflow.md`.
