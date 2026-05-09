---
name: task-splitter
description: Split an approved vinicius.dev PRD into supervised task files and docs/TRACKER.md. Use when the user asks to split a PRD, create tasks from a PRD, prepare execution tasks, or build the tracker for a PRD. The skill reads docs/prds/PRD-###/PRD-###.md and docs/rules, creates docs/prds/PRD-###/tasks/*.md, and recreates docs/TRACKER.md without implementing code.
---

# Task Splitter

## Workflow
1. Read `docs/rules/AGENTS.md`, `docs/rules/supervised-workflow.md`, `docs/rules/git-workflow.md`, `docs/rules/prd-and-tracker.md`, `docs/rules/architecture.md`, and `docs/rules/product-and-platform.md`.
2. Read the target PRD file under `docs/prds/PRD-###/PRD-###.md`.
3. Confirm the PRD status is `Ready`, or ask Vinicius whether to split it anyway.
4. Analyze existing repo structure only as needed to produce realistic task scopes. Never read `node_modules`.
5. Ask questions only when task boundaries, review mode, or acceptance would otherwise be ambiguous.
6. Create `docs/prds/PRD-###/tasks/` and one task file per task.
7. Recreate `docs/TRACKER.md` for this PRD using the tracker template.
8. Do not implement code, create branches, commit, or open PRs.

## Task Design Rules
- Keep tasks sequential and commit-sized.
- Use the existing global task ID style, such as `PHOTO-001`, `QA-013`, or `SEC-004`.
- Choose IDs from the PRD domain. If no existing prefix fits, choose a clear short prefix and start at `001`.
- Every task file includes `Goal`, `Scope`, `Non-Scope`, `Implementation Plan`, `Acceptance Criteria`, `Verification Strategy`, `Dependencies`, and `Files Expected To Change`.
- Use `Review Mode: Agent` only when acceptance is deterministic or the task is simple/medium and fully testable by the agent.
- Include `Review Reason` for every agent-review task.
- Use `Review Mode: Human` when visual judgment, login-only workflows, product tone, or manual navigation is required.
- Include `Human Review Needs` for human-review tasks.
- Add task-specific `Stop Conditions` only when global stop conditions are not enough.

## Tracker Rules
- `docs/TRACKER.md` points to task files and stores execution state only.
- Set PRD status to `Active`.
- Set `Current Task` to the first task in execution order.
- Set all task statuses to `Todo`.
- Include a short PRD summary and the PRD file path.
- Include Git branch, base, and merge target using `feature/PRD-###-short-title`, `develop`, and `develop`.
- Initialize each task's `Evidence`, `Decision Log`, and `Commit` as `Pending`.
- Initialize `Blocked Reason` and `Requested Decision` as `None`.

## Stop Conditions
Stop and ask before creating files if:
- splitting would require changing PRD scope
- task boundaries are unclear after one question batch
- a task would need to modify existing task files without explicit approval
- the PRD conflicts with `docs/rules/architecture.md` or `docs/rules/product-and-platform.md`
