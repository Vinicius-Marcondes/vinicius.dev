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

## Interfaces and Responsibilities
The intake pass must answer:
- Does a frontend exist?
- What runtime/tooling does it use?
- What routes and UI surfaces already exist?
- What API, auth, upload, and data assumptions are embedded in the code?
- Which specs need reconciliation because of the existing frontend?

Required output:
- update [frontend-analyzer-report.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer-report.md)
- update [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md) gate statuses if repo state changed

## Data/Contracts Touched
- route inventory
- component hierarchy
- styling tokens
- frontend-to-backend data contracts
- frontend auth assumptions

## Acceptance Checklist
- [ ] Frontend presence is explicitly checked before backend tasking.
- [ ] If frontend files exist, analyzer report is updated in the same task.
- [ ] If no frontend files exist, tracker states that planned specs remain authoritative.
- [ ] Any spec reconciliation is documented, not implied.
- [ ] Locked product decisions are preserved unless explicitly re-approved.

## Dependencies
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [frontend-analyzer-report.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer-report.md)
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)

## Open Questions
- None for the initial intake process.

## Task-Splitting Notes
- The first implementation-adjacent task in a new milestone should re-run frontend intake.
- If the frontend changes materially, re-open affected backend/data/admin specs before tasking them.

## Git Branch Implications
- Frontend intake runs in its own `spec/` task branch.
- Intake changes that alter task readiness must not be mixed with unrelated implementation changes.

