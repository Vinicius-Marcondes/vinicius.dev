# Supervised Workflow

## Purpose
Define the task-by-task supervised workflow for `vinicius.dev`.

This workflow favors close operator supervision during implementation while keeping a PRD-first process, deterministic task acceptance, signed commits, and mandatory pull requests before merging to `develop`.

## Source Of Truth
- Workflow rules live in `docs/rules/`.
- PRDs live in `docs/prds/<PRD-ID>/`.
- The active execution tracker lives at `docs/TRACKER.md`.
- `docs/TRACKER.md` is replaced for each PRD. Do not archive old trackers unless explicitly requested.
- `docs/TRACKER.md` tracks acceptance state only. It does not track PR review state, merge state, or release state.
- Git rules live in `docs/rules/git-workflow.md`.

## Required Flow
1. Update `develop`.
2. Create the PRD from the current `develop` context.
3. Approve the PRD.
4. Create one implementation branch for the PRD from updated `develop`.
5. Create `docs/TRACKER.md` for that PRD.
6. Execute tasks sequentially from `docs/TRACKER.md`.
7. Commit exactly one accepted task at a time.
8. Mark the PRD `Accepted` only after Vinicius explicitly accepts the full implementation.
9. Open one PR from the PRD branch into `develop`.
10. Merge to `develop` only through a reviewed PR.

## PRD Statuses
Use exactly these PRD statuses:
- `DRAFT`
- `Ready`
- `Active`
- `Accepted`

`Accepted` means Vinicius explicitly accepted the whole PRD implementation. After that, the PR can be created and merged through the normal review process.

## Task Statuses
Use exactly these task statuses:
- `Todo`
- `Active`
- `Needs Review`
- `Accepted`
- `Blocked`
- `Skipped`
- `Reopened`

`Accepted` means the task acceptance criteria were satisfied or Vinicius explicitly accepted a documented exception. It does not mean the task has been merged.

## Review Modes
Use exactly these review modes in task files:
- `Agent`
- `Human`

`Review Mode: Agent` may be used when the task is simple or medium complexity, or when all acceptance criteria can be verified deterministically by the agent. The task file must include a `Review Reason`.

`Review Mode: Human` means the agent must stop before committing and wait for Vinicius to review. Human-review tasks must include `Human Review Needs` so the operator knows exactly what to inspect.

## Starting A Task
When Vinicius says to start a task:
1. Set `Current Task` in `docs/TRACKER.md`.
2. Set that task status to `Active`.
3. Implement only the task scope.
4. Use the task file as the stable requirement source.
5. Use `docs/TRACKER.md` for execution state.

Task order in `docs/TRACKER.md` is the execution plan. `Current Task` is the resume and control pointer.

## Task Boundaries
- Do not change task boundaries without asking Vinicius first.
- Task files are immutable after task creation unless Vinicius approves a boundary change.
- `Files Expected To Change` is advisory. If other files must change, document why in `Decision Log`.
- `Skipped` requires explicit human approval, including for `Review Mode: Agent` tasks.

## Acceptance
For `Review Mode: Agent`:
1. Implement the task.
2. Run the tracker's verification plan and choose any additional reasonable verification.
3. Record exact commands and results in `Evidence` when viable.
4. Mark the task `Accepted`.
5. Commit the task.
6. Continue automatically to the next agent-reviewable task when appropriate.

For `Review Mode: Human`:
1. Implement the task.
2. Run reasonable verification.
3. Record evidence.
4. Set the task to `Needs Review`.
5. Stop with changes uncommitted.
6. After Vinicius accepts, mark the task `Accepted` and commit it.

If Vinicius explicitly accepts a task with unchecked acceptance criteria, the agent must warn that unchecked items remain and document the exception in `Decision Log`.

## Blockers
Stop immediately when blocked.

Global stop conditions:
- Required credentials or access are unavailable.
- Human visual, product, or content judgment is required and the task is not already marked `Review Mode: Human`.
- A test failure cannot be resolved inside the current task scope.
- Completing the work requires changing task boundaries.
- Completing the work requires skipping acceptance criteria.
- Completing the work requires destructive Git or filesystem actions not explicitly requested.

When blocked, update `docs/TRACKER.md` with:
- `Status: Blocked`
- `Blocked Reason`
- `Requested Decision`

Do not commit blocked work unless Vinicius explicitly asks for a checkpoint commit.

## Git Rules
Before any Git command, read `docs/rules/git-workflow.md`.

Final PRD verification is recorded in the last task/tracker commit. Do not create a separate final-verification commit unless verification required file changes.

## Compatibility
This workflow is tool-agnostic. Agents and harnesses must use plain repository files, Git branches, signed commits, and pull requests. Do not require Codex-specific features to execute the workflow.
