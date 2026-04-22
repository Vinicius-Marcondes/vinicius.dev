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

## Interfaces and Responsibilities
- Validate that all spec files exist and align with the tracker.
- Validate that frontend intake gates are respected.
- Validate that `frontend-structure.md` is referenced by frontend-facing specs and task decomposition.
- Validate that `project-structure.md` is referenced by backend-facing specs and task decomposition.
- Validate that Bun is explicit in frontend and backend specs.
- Validate that Git workflow constraints are referenced by all task decomposition.
- Validate that GitHub Issue and Project execution rules are present before implementation starts.
- Validate that frontend structure rules cover FSD layer discipline, route tree ownership, and public/admin shell separation.
- Define cross-layer scenarios for public browsing, admin, chat, media, auth, and deployment.
- Define frontend structural scenarios for the six route families and the three canonical frontend interaction flows.
- Define backend architectural scenarios for `publish thought`, `post chat message`, and `admin login`.
- Validate that the backend core is described as testable without HTTP or database.
- Validate that frontend migration gates are respected before backend tasking begins.

## Data/Contracts Touched
- tracker state
- acceptance checklists
- architectural boundary rules
- API and UI integration points
- deployment/runtime expectations

## Acceptance Checklist
- [ ] Every spec referenced in the tracker exists.
- [ ] `frontend-structure.md` exists and is treated as a hard dependency for frontend-facing specs.
- [ ] `project-structure.md` exists and is treated as a hard dependency for backend-facing specs.
- [ ] `git-workflow.md` is referenced by the harness and used by task decomposition.
- [ ] `github-project-execution.md` is referenced by the harness and used by task decomposition.
- [ ] Frontend intake is treated as a blocking gate for backend tasking.
- [ ] Frontend-facing specs cannot be task-split without approved structural guidance from `SPEC-017`.
- [ ] Backend-facing specs cannot be task-split without frontend review state.
- [ ] Backend-facing specs cannot be task-split without approved structural guidance from `SPEC-016`.
- [ ] Bun is explicit in both frontend and backend specs.
- [ ] Verification expectations include future frontend structural checks for FSD layers, page public APIs, `app/routes` ownership, shell separation, and the absence of `processes`.
- [ ] Verification expectations include future architectural-boundary checks without selecting the tool yet.
- [ ] Legacy React architecture, missing TypeScript, and missing planned screens are treated as backend blockers until resolved.
- [ ] Branch-per-task rules apply to specs, implementation, and hotfixes.
- [ ] Issue-per-task and Project-item-per-task rules apply to implementation work.
- [ ] Revert path depends on task/merge traceability rather than history rewriting.
- [ ] Cross-layer scenarios cover public pages, admin auth, chat, uploads, deployment readiness, the six frontend route families, and the three canonical backend flow examples.

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

## Open Questions
- Which automated checks will later backstop the architectural boundary rules can be decided during implementation.

## Task-Splitting Notes
- Verification tasks should be the last spec tasks before implementation decomposition.
- When a spec changes acceptance or dependencies, verification must be revisited.

## Git Branch Implications
- Verification-spec changes belong in dedicated `spec/` branches.
- Release validation tasks must name the milestone branch context and acceptance source explicitly.
