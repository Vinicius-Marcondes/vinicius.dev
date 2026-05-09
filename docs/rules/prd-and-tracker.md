# PRD And Tracker

## Purpose
Define PRD folders, task files, and the live tracker format.

## Directory Layout
PRDs live under `docs/prds/` using the PRD ID as the directory name.

```text
docs/prds/
  PRD-001/
    PRD-001.md
    tasks/
      PHOTO-001.md
      PHOTO-002.md
```

Optional folders such as `assets/` or `references/` may be added only when a PRD needs them.

## PRD IDs
Agents may choose the next PRD ID by scanning `docs/prds/` and selecting the next available numeric ID.

Use zero-padded IDs:
```text
PRD-001
PRD-002
PRD-003
```

## PRD Rules
- Create the PRD before task execution.
- The PRD contains product requirements and a brief implementation overview.
- After task creation, do not edit the PRD unless Vinicius explicitly approves a PRD change.
- Do not use the PRD file for task discovery during execution. Use `docs/TRACKER.md`.

## Task File Rules
- Task files live under `docs/prds/<PRD-ID>/tasks/`.
- Task IDs keep the global project style, such as `PHOTO-001`, `QA-013`, or `SEC-004`.
- Task files contain stable requirements.
- Task execution state lives only in `docs/TRACKER.md`.
- Do not edit task files after creation unless Vinicius approves a boundary change.
- `Files Expected To Change` is advisory. If other files must change, document why in `Decision Log`.

## PRD Template
```md
# PRD-001 - Title

## Status
DRAFT

## Summary
<short product summary>

## Goals
- <goal>

## Non-Goals
- <non-goal>

## Context
<background and constraints>

## Requirements
- <requirement>

## Implementation Overview
<brief implementation direction. Keep detailed plans in task files.>

## Acceptance Criteria
- [ ] <PRD-level acceptance criterion>

## Open Questions
- <question or None>
```

## Task Template
```md
# TASK-ID - Title

## Metadata
- PRD: PRD-001
- Review Mode: Agent
- Review Reason: Covered by deterministic tests.
- Dependencies: None
- Files Expected To Change:
  - `path/to/file`

## Goal
<what this task must accomplish>

## Scope
- <in scope>

## Non-Scope
- <out of scope>

## Implementation Plan
1. <explicit step>
2. <explicit step>
3. <explicit step>

## Acceptance Criteria
- [ ] <criterion>

## Verification Strategy
- `<command>` should pass
```

For human-review tasks, include:

```md
## Human Review Needs
- <specific thing Vinicius must inspect>
```

For task-specific stop conditions, include:

```md
## Stop Conditions
- <condition that should stop this task>
```

Omit `Human Review Needs` and `Stop Conditions` when they are not useful.

## Tracker Template
The live tracker is `docs/TRACKER.md`. It is recreated for each PRD.

```md
# TRACKER

## Agent Instructions
- Execute only the `Current Task`.
- Use task files as stable requirements.
- Use this tracker for execution state only.
- Do not change task boundaries without asking Vinicius first.
- Stop immediately on blockers.
- Do not commit blocked work unless Vinicius explicitly asks for a checkpoint commit.
- Commit exactly one accepted task at a time.
- Use signed commits with `git commit -s`.
- For `Review Mode: Human`, stop before committing and wait for Vinicius to accept.
- For `Review Mode: Agent`, verify, accept, commit, and continue when appropriate.

## PRD
- ID: PRD-001
- Title: <title>
- Status: Active
- PRD File: docs/prds/PRD-001/PRD-001.md
- Summary: <short PRD summary for agent orientation>

## Git
- Branch: feature/PRD-001-short-title
- Base: develop
- Merge Target: develop

## Current Task
TASK-ID

## Task Index
1. TASK-ID - Title
   - Task File: docs/prds/PRD-001/tasks/TASK-ID.md
   - Status: Todo
2. TASK-ID - Title
   - Task File: docs/prds/PRD-001/tasks/TASK-ID.md
   - Status: Todo

## Tasks

### TASK-ID - Title
Task File: docs/prds/PRD-001/tasks/TASK-ID.md
Status: Todo
Evidence:
- Pending
Decision Log:
- Pending
Commit: Pending
Blocked Reason: None
Requested Decision: None
```

## Tracker Field Rules
- `Current Task` points to the task Vinicius asked to start.
- Task order in `Task Index` is the planned execution order.
- Task statuses are exactly: `Todo`, `Active`, `Needs Review`, `Accepted`, `Blocked`, `Skipped`, `Reopened`.
- PRD statuses are exactly: `DRAFT`, `Ready`, `Active`, `Accepted`.
- `Evidence` should prefer exact commands and results. Use short prose only when exact commands are not viable.
- `Decision Log` records meaningful execution decisions, accepted limitations, human approvals, and scope exceptions.
- `Commit` uses this format after commit: `abc1234 PRD-001 TASK-ID: short commit subject`.
- `Blocked Reason` and `Requested Decision` are required when status is `Blocked`.
- `Blocked Reason` and `Requested Decision` should be `None` when the task is not blocked.
