# GitHub Project Execution

## Purpose
Define how `vinicius.dev` tasks are created, tracked, and updated in GitHub once specs are approved.

## Scope
Applies to task decomposition, GitHub Issue creation, GitHub Project setup, Project field updates, and agent progress reporting.

## Locked Decisions
- GitHub Issues are the canonical execution records for tasks in `Vinicius-Marcondes/vinicius.dev`.
- A dedicated GitHub Project is the execution board for this repo.
- Project draft items are not used for implementation work.
- Every implementation task maps to one issue, one Project item, one task ID, one branch, and one acceptance source.
- Agents must report progress in both the issue thread and the Project board.
- Project automation is blocked until local `gh` auth has the `project` scope.

## Interfaces and Responsibilities
### Required GitHub Project fields
- `Status`: `Spec-ready`, `Todo`, `In Progress`, `In Review`, `Done`
- `Task ID`
- `Spec ID`
- `Layer`
- `Base Branch`
- `Branch Name`
- `Merge Target`
- `PR`
- `Blocked Reason`
- `Owner` (recommended)

### Task-definition agent behavior
- Read `tracker.md`, `dependency-matrix.md`, `acceptance-criteria.md`, `git-workflow.md`, and all approved specs.
- Refuse to create backend-facing tasks while frontend reconciliation is unresolved.
- Create one GitHub Issue per approved implementation task.
- Add each issue to the dedicated GitHub Project.
- Set required Project fields when the item is created.
- Use `Spec-ready` only for issues that are fully specified and unblocked.

### Implementation-agent behavior
- Read the linked source spec and GitHub Issue before starting work.
- Use the issue Task ID in branch name, commit messages, and PR title.
- Comment on the issue at task start.
- Comment on the issue immediately when blocked, with blocker details.
- Treat `In Review` as requiring the PR's expected CI validation status to be visible and up to date once workflows exist.
- Comment on the issue at completion or handoff.
- Update Project status during execution.

### Setup behavior
- Create the dedicated GitHub Project for `vinicius.dev`.
- Link the repository to the Project.
- Record the Project number and URL in this spec once available.
- Treat missing `project` scope as a hard blocker for live Project automation.

## Data/Contracts Touched
- GitHub Issue titles and bodies
- GitHub Project field values
- Task IDs
- branch names
- PR linkage

## Acceptance Checklist
- [ ] Dedicated GitHub Project exists for `vinicius.dev`.
- [ ] Project fields match the required list in this spec.
- [ ] Project number and URL are documented below.
- [ ] Task-definition flow creates issues instead of draft project items.
- [ ] Implementation agents are required to comment at start, blocker, and completion or handoff.
- [ ] Project status flow is defined as `Spec-ready -> Todo -> In Progress -> In Review -> Done`.
- [ ] `In Review` includes CI validation status awareness once GitHub Actions workflows exist.
- [ ] Explicit non-goal: GitHub Project automation is not considered active until `gh` has `project` scope.

## Dependencies
- [README.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/README.md)
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)

## Open Questions
- None at the workflow level. The only live blocker is GitHub auth scope.

## Task-Splitting Notes
- Do not split implementation tasks until this spec is `Approved`.
- Use a setup task to create the Project and fields before creating normal implementation issues.
- Changes to Project fields or status semantics should happen in dedicated `spec/` branches.

## Git Branch Implications
- The Project-setup task should use a `spec/` branch.
- Task-definition changes that affect GitHub execution must not be bundled with unrelated feature work.

## Live Project Record
- Project owner: `Vinicius-Marcondes`
- Project title: `vinicius.dev`
- Project number: `2`
- Project URL: `https://github.com/users/Vinicius-Marcondes/projects/2`
- Repo linked: `yes`
- Auth gate: `satisfied`
