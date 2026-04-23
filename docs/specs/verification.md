# Verification

## Purpose
Define cross-layer validation rules so the harness can decide when the site, its structure, and its tasks are ready.

## Scope
Spec verification, implementation verification, release gates, and cross-layer regression coverage.

## Locked Decisions
- Verification applies to both the spec harness and later implementation work.
- No spec is ready for tasking without a clear acceptance source.
- No implementation slice is complete without mapping back to approved specs and branch traceability.
- `SPEC-017 Frontend Structure` is a hard gate for frontend-facing spec and task readiness.
- `SPEC-016 Project Structure` is a hard gate for backend-facing spec and task readiness.
- `SPEC-018 GitHub Actions CI/CD` is the hard gate for release automation and final release-readiness checks.

## Interfaces and Responsibilities
- Validate that all spec files exist and align with the tracker.
- Validate that frontend intake gates are respected.
- Validate that `frontend-structure.md` is referenced by frontend-facing specs and task decomposition.
- Validate that `project-structure.md` is referenced by backend-facing specs and task decomposition.
- Validate that `ci-cd.md` is referenced by release automation and verification work.
- Validate that Bun is explicit in frontend and backend specs.
- Validate that Git workflow constraints are referenced by all task decomposition.
- Validate that GitHub Issue and Project execution rules are present before implementation starts.
- Validate that frontend structure rules cover FSD layer discipline, route tree ownership, and public/admin shell separation.
- Validate that CI/CD rules cover PR validation, branch validation, manual development deployment, and tag-based production deployment.
- Validate FE-010 reconciliation rules for `/api`, public DTOs, upload/media assumptions, analyzer freshness, and static route fallback.
- Define cross-layer scenarios for public browsing, admin, chat, media, auth, and deployment.
- Define frontend structural scenarios for the six route families and the three canonical frontend interaction flows.
- Define backend architectural scenarios for `publish thought`, `post chat message`, and `admin login`.
- Validate that the backend core is described as testable without HTTP or database.
- Validate that frontend migration gates are respected before backend tasking begins.

## Cross-Layer Scenarios
- Public content DTOs: Thoughts, Projects, Photos, and Status Strip APIs return the migrated frontend shapes without leaking Prisma fields.
- Public filters and pagination: Thoughts use server-side filters plus cursor pagination; Projects and Photos use server-side filters plus page pagination.
- Chat join and send: a user enters handle plus room password, receives room-gated access, and can send text-only, image-only, or text-plus-image messages.
- Chat upload: JPEG, PNG, and WebP images up to `5 MB` are accepted one per message; invalid type, oversize, and multiple-image attempts are rejected.
- Chat moderation: admin soft-hides a message and related media metadata, audit record is retained, room responses hide the content, and physical cleanup can be deferred.
- Public photo delivery: published photo DTOs include `/media/photos/:id/original`; unpublished photos are not publicly served.
- Admin auth/MFA: credentials lead either to a ready session or a six-digit email-code challenge before ready session.
- Admin dashboard: draft counts, featured slots, photo records, chat flags, status strip entries, and moderation commands can be loaded through admin APIs.
- RSS and sitemap: published Thoughts feed and public route/content sitemap are generated from backend state in Wave 2.
- Deployment routing: `/api/*` reaches backend, `/media/photos/:id/original` reaches backend media delivery, room-gated chat media requires access checks, and React Router fallback serves public/admin routes.

## Boundary Verification
- `publish thought` can be tested through application ports without Hono or Prisma imports in core code.
- `post chat message` can be tested through chat application ports with mocked storage/repository/clock/id providers.
- `admin login` can be tested through auth application ports with mocked password hashing, session/token, email, MFA, clock, and repository ports.
- HTTP adapter tests verify request validation and presenter DTO mapping for `/api` endpoints.
- Repository adapter tests verify Prisma mapping without exposing Prisma types to domain or application modules.
- Storage adapter tests verify filesystem behavior through outbound storage ports.

## Data/Contracts Touched
- tracker state
- acceptance checklists
- architectural boundary rules
- API and UI integration points
- deployment/runtime expectations
- FE-010 API and upload reconciliation checks
- RSS and sitemap scenarios
- analyzer and backend boundary validation

## Acceptance Checklist
- [ ] Every spec referenced in the tracker exists.
- [ ] `frontend-structure.md` exists and is treated as a hard dependency for frontend-facing specs.
- [ ] `project-structure.md` exists and is treated as a hard dependency for backend-facing specs.
- [ ] `ci-cd.md` exists and is treated as a hard dependency for release automation and final verification.
- [ ] `git-workflow.md` is referenced by the harness and used by task decomposition.
- [ ] `github-project-execution.md` is referenced by the harness and used by task decomposition.
- [ ] Frontend intake is treated as a blocking gate for backend tasking.
- [ ] Frontend-facing specs cannot be task-split without approved structural guidance from `SPEC-017`.
- [ ] Backend-facing specs cannot be task-split without frontend review state.
- [ ] Backend-facing specs cannot be task-split without approved structural guidance from `SPEC-016`.
- [ ] Bun is explicit in both frontend and backend specs.
- [ ] Verification expectations include future frontend structural checks for FSD layers, page public APIs, `app/routes` ownership, shell separation, and the absence of `processes`.
- [ ] Verification expectations include future architectural-boundary checks without selecting the tool yet.
- [ ] Verification expectations include the CI/CD trigger matrix, the manual-development-deploy rule, and the tag-based production release rule.
- [ ] Verification expectations include FE-010 reconciliation for `/api`, public DTOs, upload/media assumptions, analyzer freshness, and frontend static fallback.
- [ ] Cross-layer scenarios cover server-side filters and pagination for Thoughts, Projects, and Photos.
- [ ] Cross-layer scenarios cover chat join, send, upload, moderation, room-gated media, and audit retention.
- [ ] Cross-layer scenarios cover photo original delivery through `/media/photos/:id/original`.
- [ ] Cross-layer scenarios cover admin credentials, optional MFA, dashboard queues, status strip editing, and moderation commands.
- [ ] Cross-layer scenarios cover Thoughts RSS and sitemap generation.
- [ ] Boundary scenarios cover core use cases without HTTP/Postgres and adapter tests for HTTP DTO mapping.
- [ ] Legacy React architecture, missing TypeScript, and missing planned screens are treated as backend blockers until resolved.
- [ ] Branch-per-task rules apply to specs, implementation, and hotfixes.
- [ ] Issue-per-task and Project-item-per-task rules apply to implementation work.
- [ ] Revert path depends on task/merge traceability rather than history rewriting.
- [ ] Cross-layer scenarios cover public pages, admin auth, chat, uploads, deployment readiness, the six frontend route families, the three canonical backend flow examples, and the CI/CD trigger matrix.

## Dependencies
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [github-project-execution.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/github-project-execution.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)
- [media-storage.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/media-storage.md)
- [admin-cms.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/admin-cms.md)
- [infra-deployment.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/infra-deployment.md)
- [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md)

## Open Questions
- Which automated checks will later backstop the architectural boundary rules can be decided during implementation.

## Task-Splitting Notes
- Verification tasks should be the last spec tasks before implementation decomposition.
- When a spec changes acceptance or dependencies, verification must be revisited.
- Split verification implementation by public content, chat/media, admin/auth, infra/routing, and CI/boundary checks after the owning specs are approved.

## Git Branch Implications
- Verification-spec changes belong in dedicated `spec/` branches.
- Release validation tasks must name the milestone branch context and acceptance source explicitly.
