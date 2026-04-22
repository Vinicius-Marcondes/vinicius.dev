# Frontend Intake

## Purpose
Define the mandatory first check before any backend-facing task is planned or started.

## Scope
Applies whenever frontend files may already exist, especially when UI work was generated outside the normal workflow.

## Locked Decisions
- Frontend intake is always checked before backend tasking.
- If a frontend exists, a fresh analyzer report is required.
- If no frontend exists, planned frontend specs remain the source of truth until files appear.
- A frontend analyzer may adapt technical specs, but it must not silently override locked product decisions.
- Legacy React intake is treated as a migration gate, not just an informational note.
- The default reconciliation path is archive-first: preserve the imported frontend in a tracked legacy snapshot, then migrate into a clean `Vite + React + TypeScript + Bun` app.
- The frontend migration target must align with [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md).
- Backend-facing tasking stays blocked while the frontend is legacy-shaped, not TypeScript, or missing planned screens.

## Interfaces and Responsibilities
The intake pass must answer:
- Does a frontend exist?
- What runtime/tooling does it use?
- Is it already a `Vite + React + TypeScript + Bun` app, or a legacy artifact that requires migration?
- What routes and UI surfaces already exist?
- What API, auth, upload, and data assumptions are embedded in the code?
- Does the frontend use React in the target architecture, or through browser Babel / global `window.*` composition that must be removed?
- How far is the current frontend from the FSD, Data Router, and shell model defined in `frontend-structure.md`?
- Which specs need reconciliation because of the existing frontend?

Required output:
- update [frontend-analyzer-report.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer-report.md)
- update [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md) gate statuses if repo state changed
- if tasking assumptions change, update or block the related GitHub Issues before backend work starts
- if frontend structure assumptions change, reconcile [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md) and [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md) before tasking migration work
- if legacy React is detected, identify the migration path: archive current frontend into a tracked legacy folder, scaffold a clean typed frontend, migrate/adapt the UI, then re-run intake

## Data/Contracts Touched
- route inventory
- component hierarchy
- styling tokens
- frontend-to-backend data contracts
- frontend auth assumptions
- runtime/tooling migration state
- TypeScript readiness
- route and screen completeness against planned IA

## Acceptance Checklist
- [ ] Frontend presence is explicitly checked before backend tasking.
- [ ] If frontend files exist, analyzer report is updated in the same task.
- [ ] If no frontend files exist, tracker states that planned specs remain authoritative.
- [ ] If legacy React architecture is detected, the report marks it as a backend blocker.
- [ ] If TypeScript migration is incomplete, the report marks it as a backend blocker.
- [ ] If planned screens are missing, the report marks them as backend blockers until fully designed screens exist.
- [ ] Structural gaps relative to `frontend-structure.md` are documented when they affect migration or tasking.
- [ ] Any spec reconciliation is documented, not implied.
- [ ] Locked product decisions are preserved unless explicitly re-approved.

## Dependencies
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [frontend-analyzer-report.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer-report.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)

## Open Questions
- None for the initial intake process.

## Task-Splitting Notes
- The first implementation-adjacent task in a new milestone should re-run frontend intake.
- If the frontend changes materially, re-open affected backend/data/admin specs before tasking them.
- Frontend intake should create migration-first tasks before any backend task decomposition when the imported frontend is legacy-shaped.
- Frontend migration tasks should establish the structure required by `frontend-structure.md` before page-by-page migration begins.

## Git Branch Implications
- Frontend intake runs in its own `spec/` task branch.
- Intake changes that alter task readiness must not be mixed with unrelated implementation changes.
