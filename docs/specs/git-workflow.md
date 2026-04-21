# Git Workflow

## Purpose
Define the mandatory branching, review, merge, revert, and hotfix rules for all future spec and implementation work.

## Scope
Applies to spec authoring, harness updates, frontend work, backend work, infrastructure changes, and hotfixes.

## Locked Decisions
- `main` is the stable branch.
- `develop` is the active integration branch.
- Every task gets its own branch.
- No implementation agent self-merges without review.
- Merge commits are used for branch integration.
- Hotfixes start from `main`.
- Reverts happen by reverting commits or merge commits, not by rewriting shared history.

## Interfaces and Responsibilities
### Long-lived branches
- `main`: milestone-ready, stable history only
- `develop`: reviewed task branches land here first

### Task branches
Use the pattern `type/TASK-ID-short-slug`.

Approved prefixes:
- `spec/`
- `frontend/`
- `backend/`
- `data/`
- `admin/`
- `infra/`
- `hotfix/`

Examples:
- `spec/SPEC-001-tracker-bootstrap`
- `frontend/FE-004-homepage-shell`
- `backend/BE-003-chat-auth`
- `infra/INFRA-002-caddy-routing`
- `hotfix/HF-001-login-regression`

### Base branch rules
- Spec and implementation tasks branch from `develop` by default.
- Hotfix tasks branch from `main`.
- If the repo has no commits yet, create the first commit on `main`, then create `develop` immediately after that bootstrap commit.

### Review rules
- Every task branch requires review before merge.
- Small tasks may use lightweight review, but still require a reviewer other than the implementer.
- Review must confirm the task ID, branch naming, linked spec, and acceptance source.

### Merge target rules
- Reviewed task branches merge into `develop`.
- Milestone promotions move reviewed batches from `develop` to `main`.
- Hotfix branches merge into both `main` and `develop`.

## Data/Contracts Touched
- Branch names
- Commit messages
- PR titles/descriptions
- Merge commit history
- Revert traceability

## Acceptance Checklist
- [ ] Every task brief defines a task ID and branch name.
- [ ] Every task branch has a defined base branch.
- [ ] No implementation work is merged without review.
- [ ] Merge commits are used for integrating task branches.
- [ ] Hotfixes start from `main` and merge back into both `main` and `develop`.
- [ ] Reverts target identifiable task or merge commits instead of rewriting shared history.
- [ ] Task branches are deleted after merge.
- [ ] Commit messages and PR titles reference the task ID.

## Dependencies
- [README.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/README.md)
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)

## Open Questions
- Whether GitHub protections and PR templates should later automate parts of this policy.

## Task-Splitting Notes
- Every task must state its base branch and merge target.
- If a task needs to alter the workflow itself, do that in a dedicated `spec/` branch before splitting implementation work that depends on it.
- When batching a milestone from `develop` to `main`, use an explicit milestone task ID so the promotion itself is traceable.

## Git Branch Implications
- This file is the enforcement source for branch naming and merge policy.
- A task that does not fit this model should be treated as invalid until the workflow spec is updated and approved first.

