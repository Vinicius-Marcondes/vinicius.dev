# Implementation Playbook

## Purpose
This playbook explains how to turn the spec harness into real work, in the correct order, with safe task decomposition, tracker-based execution, and branch/PR orchestration.

## Summary
Use this sequence every time:
1. confirm gates in [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
2. confirm the current executable cluster in the harness, not from memory
3. approve the blocking specs for the next phase
4. turn approved specs into task clusters
5. register executable tasks in `tracker.md`
6. run one agent per task branch
7. monitor status in `tracker.md` and open PRs
8. merge reviewed work into `develop`
9. promote milestones from `develop` to `main`

The harness and `develop` must stay aligned. If implementation lands ahead of the harness, close out the completed cluster in docs before starting the next one.

## Phase Order
### Phase 0: Repo and workflow bootstrap
- Confirm `main` exists and contains the latest harness.
- Create `develop` from `main` if it does not exist yet.
- Confirm the PR template is present.
- Confirm `tracker.md` is the active execution record.

### Phase 1: Gate review
- Read [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md).
- Read the latest [frontend-analyzer-report.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer-report.md).
- Approve the specs that block the next layer of work.

### Phase 2: Task clustering
Create clusters from approved specs, not from intuition.

Each cluster should:
- come from one or more approved specs
- have a clear dependency boundary
- contain tasks that can be parallelized without overlapping write scope

### Phase 3: Tracker registration
For each executable task:
- assign a Task ID
- define source spec and acceptance source
- define base branch and merge target
- define branch name
- add one tracker entry in `tracker.md`

Use:
- `Status = Spec-ready` when the task is fully defined and unblocked
- `Status = Todo` when it is ready to be picked up

### Phase 4: Agent execution
- One task = one branch = one agent.
- Agents work from `develop` unless the task is a hotfix.
- Agents must read the tracker entry and source spec before touching code.
- Agents must update the tracker during execution.

### Phase 5: Review and merge
- Implementation agent opens PR against `develop`.
- Task moves to `In Review`.
- Review confirms spec alignment, task ID linkage, and acceptance coverage.
- Merge uses merge commit.
- Task moves to `Done`.

### Phase 6: Milestone promotion
- When a milestone cluster is stable on `develop`, create a milestone promotion task.
- Promote from `develop` to `main`.
- Production releases come from tagged commits on `main`.

## Current Executable Cluster
The current executable cluster must be read from [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md).

Current follow-up rule:
- keep the tracker aligned with branch, PR, and merge state before starting the next cluster

## Cluster-to-Task Rules
### Good task split
- one storage or delivery concern per task
- one infrastructure concern per task
- one data or API concern per task
- one verification concern per task

### Bad task split
- one task touching both public photo delivery and chat upload behavior
- one task spanning multiple independent concerns with different dependencies
- one task that changes structure, data contracts, and deployment at once
- one task with unclear acceptance source

### Parallelization rule
Parallelize only when:
- write scope does not overlap
- dependencies are already satisfied
- one task does not need the result of another task immediately

## Tracker Usage
Read `tracker.md` as the execution board.

### Status meaning
- `Spec-ready`: task is defined and unblocked
- `Todo`: task is approved and queued
- `In Progress`: agent is actively implementing
- `Blocked`: task cannot continue without an explicit unblock decision
- `In Review`: PR exists or review/validation is pending
- `Done`: merged and accepted

### Required fields per task entry
- `Task ID`
- `Spec ID`
- `Layer`
- `Base Branch`
- `Branch Name`
- `Merge Target`
- `Acceptance Source`
- `PR`
- `Blocked Reason`

## Agent Types
### 1. Task-definition agent
Use this agent after the relevant specs are approved.

Responsibilities:
- read approved specs
- respect the dependency matrix
- create tracker entries
- define branch and acceptance metadata
- cut migration-first tasks before backend tasks

Prompt pattern:
```text
Define executable tasks from the vinicius.dev harness.

Read:
- docs/specs/tracker.md
- docs/specs/dependency-matrix.md
- docs/specs/acceptance-criteria.md
- docs/specs/git-workflow.md
- docs/specs/github-project-execution.md
- all approved specs relevant to the next cluster

Then:
1. Identify the next valid cluster.
2. Refuse backend task creation if frontend reconciliation is unresolved.
3. Create one tracker entry per executable task.
4. For each task define: Task ID, Spec ID, Layer, Base Branch, Branch Name, Merge Target, Acceptance Source, dependencies, and done criteria.
5. Record the tasks in `tracker.md`.
```

### 2. Implementation agent
Use one implementation agent per task.

Responsibilities:
- read the tracker entry and source spec
- create or use the assigned branch
- implement only the assigned slice
- update the tracker at start, blocker, review, and completion

Prompt pattern:
```text
Implement task <TASK-ID> for vinicius.dev.

Read:
- the tracker entry for <TASK-ID>
- the source spec named in the tracker
- the acceptance source named in the tracker

Constraints:
- work only within the assigned scope
- do not alter unrelated files or tasks
- keep task ID in branch, commits, and PR title
- update the tracker at start, blocker, review, and completion
```

### 3. Review agent
Use for validation before merge.

Responsibilities:
- check acceptance against the source spec
- check task scope and regressions
- check PR linkage and branch policy
- confirm the tracker and cluster docs still describe the active phase correctly when the task closes a cluster
- confirm `In Review` and `Done` transitions in the tracker

## Commands and Helpers
### Analyzer
```bash
bun scripts/frontend-analyzer.ts
```

## Manual Operator Checklist
Before starting any development session:
- confirm `develop` exists
- open the tracker
- identify the current highest-priority approved cluster
- confirm the analyzer report is current

Before assigning an agent:
- confirm the task exists in `tracker.md`
- confirm `Status` is `Spec-ready` or `Todo`
- confirm source spec and acceptance source are recorded
- confirm branch name and base branch are defined

Before merging:
- confirm the task is in `In Review`
- confirm the PR exists and references the task ID
- confirm acceptance is satisfied
- confirm no open blocker remains in the tracker

## Current Recommendation
Start with:
1. sync the harness to the latest merged cluster state
2. register the current executable tasks in `tracker.md`
3. assign one agent to the shared foundation task first when the cluster has a serial dependency chain
4. parallelize only the tasks explicitly marked parallel-safe by the active cluster definition
