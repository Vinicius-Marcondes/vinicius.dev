# Acceptance Criteria Standard

## Purpose
Define the checklist format every spec must use so later agents can implement and verify work without guessing.

## Scope
Applies to all spec files in this directory and to all implementation tasks derived from them.

## Locked Decisions
- Acceptance criteria must be structured checklists, not prose-only descriptions.
- Each task must map to one primary acceptance checklist source.
- A spec is not ready for `Tasked` status without complete acceptance criteria.

## Interfaces and Responsibilities
Every spec must include these sections:
- Purpose
- Scope
- Locked decisions
- Interfaces and responsibilities
- Data/contracts touched
- Acceptance checklist
- Dependencies
- Open questions
- Task-splitting notes
- Git branch implications

## Data/Contracts Touched
- Acceptance contracts for UI behavior
- Acceptance contracts for APIs and data models
- Acceptance contracts for operational behavior and deployment

## Acceptance Checklist
Every implementation-facing spec must include, where relevant:
- [ ] Functional acceptance
- [ ] UX/design acceptance
- [ ] Data/integration acceptance
- [ ] Operational acceptance
- [ ] Explicit non-goals or exclusions

Task-level acceptance should additionally include:
- [ ] Branch name and task ID are defined
- [ ] Base branch is defined
- [ ] GitHub Issue title and body are defined
- [ ] GitHub Project item fields are defined
- [ ] Review requirement is stated
- [ ] Verification method is stated

## Dependencies
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)

## Open Questions
- None for the current standard.

## Task-Splitting Notes
- When creating a task, copy the relevant checklist items into the task brief rather than paraphrasing them.
- If a task spans multiple specs, choose one primary acceptance source and list the secondary specs explicitly.

## Git Branch Implications
- Checklist updates that change task readiness require their own task branch.
- Acceptance changes must be traceable to a task ID because they can affect revert scope.
