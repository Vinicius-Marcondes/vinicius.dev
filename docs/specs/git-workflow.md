# Git Workflow

## Purpose
Define the mandatory branching, review, merge, revert, and tracker-based task execution rules for all future spec and implementation work.

## Scope
Applies to spec authoring, harness updates, frontend work, backend work, infrastructure changes, and hotfixes.

## Locked Decisions
- `main` is the stable branch.
- `develop` is the active integration branch.
- Pull requests must pass required validation before merge.
- Every task gets its own branch.
- Every executable task gets its own task ID and tracker entry in `tracker.md`.
- `tracker.md` is the canonical execution record inside the repo.
- GitHub Issues and GitHub Project items are not required for normal task tracking.
- No implementation agent self-merges without review.
- Merge commits are used for branch integration.
- Hotfixes start from `main`.
- Development deployment is manual on the VPS and does not happen from CI.
- Production releases are created by tagging `main` with `v*`.
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

### Tracker linkage rules
- Every executable task maps to one tracker entry in `docs/specs/tracker.md`.
- Every executable task maps to one task ID, one branch, and one primary acceptance source.
- Task ID must appear in the tracker entry, branch name, commit messages, and PR title.
- Tracker entries must include the source spec, acceptance source, base branch, branch name, merge target, and status.
- Agents must update the tracker entry at task start, when blocked, when a PR opens for review, and when the task is merged or handed off.
- Tracker status may use `Spec-ready`, `Todo`, `In Progress`, `Blocked`, `In Review`, and `Done`.

### Review rules
- Every task branch requires review before merge.
- Small tasks may use lightweight review, but still require a reviewer other than the implementer.
- Review must confirm the task ID, branch naming, linked spec, acceptance source, and tracker status.

### Pull request rules
- Every reviewed task branch opens a PR against its merge target.
- PR titles must include the task ID.
- PR descriptions must include the source spec, acceptance source, base branch, merge target, and verification performed.
- `In Review` tracker status means the PR exists and the expected validation state is visible.

### Merge target rules
- Reviewed task branches merge into `develop`.
- Milestone promotions move reviewed batches from `develop` to `main`.
- Hotfix branches merge into both `main` and `develop`.

### CI/CD rules
- Pull requests targeting `develop` or `main` must pass the required GitHub Actions validation checks before merge.
- Pushes to `develop` or `main` may run validation, but do not deploy any environment.
- `develop` is the integration branch and may be deployed manually to `development.viniciuslab.dev` outside CI.
- Production deployment is triggered by pushing a `v*` tag that points to a commit already on `main`.
- Production deployment must not trigger from branch pushes.

## Data/Contracts Touched
- Branch names
- Commit messages
- PR titles/descriptions
- Merge commit history
- Revert traceability
- Tracker task metadata

## Acceptance Checklist
- [ ] Every task brief defines a task ID and branch name.
- [ ] Every task branch has a defined base branch.
- [ ] Every executable task has a tracker entry in `tracker.md`.
- [ ] No implementation work is merged without review.
- [ ] Required CI validation passes before merge.
- [ ] Merge commits are used for integrating task branches.
- [ ] Hotfixes start from `main` and merge back into both `main` and `develop`.
- [ ] `develop` remains manual-deploy only.
- [ ] Production release tags are created from `main` and use the `v*` convention.
- [ ] Reverts target identifiable task or merge commits instead of rewriting shared history.
- [ ] Task branches are deleted after merge.
- [ ] Commit messages and PR titles reference the task ID.
- [ ] Tracker updates are part of execution, not optional follow-up.

## Dependencies
- [README.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/README.md)
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)

## Git Branch Implications
- This file is the enforcement source for branch naming and merge policy.
- A task that does not fit this model should be treated as invalid until the workflow spec is updated and approved first.
