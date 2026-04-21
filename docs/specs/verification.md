# Verification

## Purpose
Define cross-layer validation rules so the harness can decide when the site and its tasks are ready.

## Scope
Spec verification, implementation verification, release gates, and cross-layer regression coverage.

## Locked Decisions
- Verification applies to both the spec harness and later implementation work.
- No spec is ready for tasking without a clear acceptance source.
- No implementation slice is complete without mapping back to approved specs and branch traceability.

## Interfaces and Responsibilities
- Validate that all spec files exist and align with the tracker.
- Validate that frontend intake gates are respected.
- Validate that Bun is explicit in frontend and backend specs.
- Validate that Git workflow constraints are referenced by all task decomposition.
- Define cross-layer scenarios for public browsing, admin, chat, media, auth, and deployment.

## Data/Contracts Touched
- tracker state
- acceptance checklists
- API and UI integration points
- deployment/runtime expectations

## Acceptance Checklist
- [ ] Every spec referenced in the tracker exists.
- [ ] `git-workflow.md` is referenced by the harness and used by task decomposition.
- [ ] Frontend intake is treated as a blocking gate for backend tasking.
- [ ] Backend-facing specs cannot be task-split without frontend review state.
- [ ] Bun is explicit in both frontend and backend specs.
- [ ] Branch-per-task rules apply to specs, implementation, and hotfixes.
- [ ] Revert path depends on task/merge traceability rather than history rewriting.
- [ ] Cross-layer scenarios cover public pages, admin auth, chat, uploads, and deployment readiness.

## Dependencies
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)
- [media-storage.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/media-storage.md)
- [admin-cms.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/admin-cms.md)
- [infra-deployment.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/infra-deployment.md)

## Open Questions
- Which automated checks will later backstop this verification spec can be decided during implementation.

## Task-Splitting Notes
- Verification tasks should be the last spec tasks before implementation decomposition.
- When a spec changes acceptance or dependencies, verification must be revisited.

## Git Branch Implications
- Verification-spec changes belong in dedicated `spec/` branches.
- Release validation tasks must name the milestone branch context and acceptance source explicitly.
