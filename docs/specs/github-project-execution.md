# Execution Tracking

## Purpose
Define how `vinicius.dev` tasks are created, tracked, and updated inside the repository once specs are approved.

## Scope
Applies to task decomposition, tracker entry setup, tracker status updates, PR linkage, and agent progress reporting.

## Locked Decisions
- `docs/specs/tracker.md` is the canonical execution record for this repo.
- GitHub Issues and GitHub Project items are not required for normal implementation work.
- Every implementation task maps to one task ID, one tracker entry, one branch, and one acceptance source.
- Agents must report progress by updating `tracker.md` and keeping the related PR state accurate.
- The current executable cluster must be readable from the tracker without consulting an external board.
- Frontend migration tasks must still be defined before backend tasks when the imported frontend is legacy-shaped or incomplete.

## Interfaces and Responsibilities
### Required tracker fields per executable task
- `Status`: `Spec-ready`, `Todo`, `In Progress`, `Blocked`, `In Review`, `Done`
- `Task ID`
- `Spec ID`
- `Layer`
- `Base Branch`
- `Branch Name`
- `Merge Target`
- `Acceptance Source`
- `PR` (when opened)
- `Blocked Reason` (when applicable)

### Task-definition behavior
- Read `tracker.md`, `dependency-matrix.md`, `acceptance-criteria.md`, `git-workflow.md`, and all approved specs.
- Refuse to create backend-facing tasks while frontend reconciliation is unresolved.
- Create one tracker entry per approved implementation task.
- Place each task under the relevant cluster or execution section in `tracker.md`.
- Use `Spec-ready` only for tasks that are fully specified and unblocked.
- Move tasks to `Todo` when they are ready to be picked up.

### Implementation-agent behavior
- Read the linked source spec and tracker entry before starting work.
- Use the task ID in branch name, commit messages, and PR title.
- Update the tracker entry at task start.
- Update the tracker entry immediately when blocked, with blocker details.
- Update the tracker entry when the PR is opened for review.
- Update the tracker entry at completion or handoff.
- Treat `In Review` as requiring the PR's expected CI validation status to be visible and up to date once workflows exist.
- Frontend validator agents must read both the imported legacy frontend and the migrated frontend target when both exist.
- Frontend migration agents must report against the migration gate, not only visual parity.

### Setup behavior
- Keep `tracker.md` current as the single execution board.
- Keep merged PR references and cluster closeout notes inside the tracker.
- Keep task definitions in the repo rather than in external project fields.

## Data/Contracts Touched
- Tracker task metadata
- Task IDs
- Branch names
- PR linkage
- Blocker and completion notes

## Acceptance Checklist
- [ ] `tracker.md` is the canonical execution record for `vinicius.dev` tasks.
- [ ] Task-definition flow creates tracker entries instead of relying on GitHub Issues or Project items.
- [ ] Frontend migration tasks are still defined before backend tasks when frontend contract review still reports blockers.
- [ ] Implementation agents are required to update the tracker at start, blocker, review, and completion or handoff.
- [ ] Tracker status flow is defined as `Spec-ready -> Todo -> In Progress -> Blocked/In Review -> Done`.
- [ ] `In Review` includes CI validation status awareness once GitHub Actions workflows exist.
- [ ] Explicit non-goal: no external Project automation is required for normal task execution.

## Dependencies
- [README.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/README.md)
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)

## Open Questions
- Whether tracker task formatting should later be standardized further with a dedicated template section.

## Task-Splitting Notes
- Do not split implementation tasks until this spec is `Approved`.
- Use tracker-first task definitions instead of external issue/project setup.
- Use migration-first tasks when the imported frontend is legacy React: archive legacy frontend, scaffold clean typed app, migrate landing/projects/photos, implement Thoughts/Chat/Admin, then rerun structural review.
- Changes to tracker status semantics should happen in dedicated `spec/` branches.

## Git Branch Implications
- Execution-tracking changes should use `spec/` branches.
- Task-definition changes that affect tracker semantics must not be bundled with unrelated feature work.

## Live Tracker Record
- Canonical tracker: [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- Execution source of truth: in-repo only
- External board requirement: none
