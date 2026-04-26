# Implementation Playbook

## Purpose
This playbook explains how to turn the spec harness into real work, in the correct order, with safe task decomposition, GitHub Project tracking, and agent orchestration.

## Summary
Use this sequence every time:
1. confirm gates in [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
2. confirm the current executable cluster in the harness, not from memory
3. approve the blocking specs for the next phase
4. turn approved specs into task clusters
5. split clusters into GitHub Issues
6. run one agent per task branch
7. monitor status in GitHub Project `vinicius.dev`
8. merge reviewed work into `develop`
9. promote milestones from `develop` to `main`

The harness, GitHub Project, and `develop` must stay aligned. If implementation lands ahead of the harness, close out the completed cluster in docs before starting the next one.

## Phase Order
### Phase 0: Repo and workflow bootstrap
- Confirm `main` exists and contains the latest harness.
- Create `develop` from `main` if it does not exist yet.
- Confirm GitHub Project `vinicius.dev` exists and is linked to the repo.
- Confirm the issue/PR templates and helper scripts are present.

### Phase 1: Gate review
- Read [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md).
- Read the latest [frontend-analyzer-report.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer-report.md).
- Approve the specs that block the next layer of work.

Current required approvals before real task cutting:
- the current executable cluster in [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- the owning source specs named by that cluster in [wave-2-task-clusters.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/wave-2-task-clusters.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md) for backend-facing work
- [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md) for validation and release-readiness tasks

Do not cut backend tasks while the analyzer still reports:
- legacy React architecture
- missing TypeScript
- missing `/thoughts`, `/chat`, or `/admin`
- no Vite/Bun runtime

### Phase 2: Task clustering
Create clusters from approved specs, not from intuition.

Each cluster should:
- come from one or more approved specs
- have a clear dependency boundary
- contain tasks that can be parallelized without overlapping write scope

Current Wave 2 cluster order:
1. `Backend foundation`
2. `Persistence foundation`
3. `Public content APIs`
4. `Media storage and delivery`
5. `Admin/auth backend`
6. `Chat backend and moderation`
7. `Infra, CI/CD, and verification hardening`

### Phase 3: Issue creation
For each executable task:
- assign a Task ID
- define source spec and acceptance source
- define base branch and merge target
- create one GitHub Issue
- add it to GitHub Project `#2`
- populate Project fields

Use:
- `Status = Spec-ready` when the task is fully defined and unblocked
- `Status = Todo` when it is ready to be picked up

### Phase 4: Agent execution
- One task = one branch = one agent.
- Agents work from `develop` unless the task is a hotfix.
- Agents must read the issue and source spec before touching code.
- Agents must update the GitHub Issue and Project item during execution.

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
The current executable cluster is `Wave 2 Cluster 4: Media storage and delivery`.

Current follow-up actions:
1. Run the cluster-level backend verification pass on `develop` for the merged Cluster 4 task set.
2. Confirm the Wave 2 Cluster 4 execution artifacts stay synced across specs, issues, PRs, and the GitHub Project.
3. Cut the next planning/status update before defining any new executable cluster.

Parallelization rule for the current state:
- do not cut a new cluster from this playbook until the harness is explicitly advanced
- backend-only PRs still run the frontend analyzer as a non-mutating validation check
- Cluster 4 is complete; the next action is harness/planning advancement rather than another Cluster 4 implementation task

## Cluster-to-Task Rules
### Good task split
- one storage or delivery concern per task
- one infrastructure concern per task
- one data or API concern per task
- one verification concern per task

### Bad task split
- one task touching both public photo delivery and chat upload behavior
- one task spanning multiple independent media concerns with different dependencies
- one task that changes structure, data contracts, and deployment at once
- one task with unclear acceptance source

### Parallelization rule
Parallelize only when:
- write scope does not overlap
- dependencies are already satisfied
- one task does not need the result of another task immediately

For example, after the shared media foundation exists:
- public photo delivery
- chat upload/storage
can run in parallel if they do not overlap on the same adapter or route files.

## GitHub Project Usage
Read the Project as the execution board.

### Status meaning
- `Spec-ready`: task is defined and unblocked
- `Todo`: task is approved and queued
- `In Progress`: agent is actively implementing
- `In Review`: PR exists or review/validation is pending
- `Done`: merged and accepted

### Required fields per issue
- `Task ID`
- `Spec ID`
- `Layer`
- `Base Branch`
- `Branch Name`
- `Merge Target`
- `PR`
- `Blocked Reason`
- `Owner`

### Monitoring views
Use these views in GitHub Project:
- Board grouped by `Status`
- Table sorted by `Layer`, then `Task ID`
- Filtered view for `Blocked Reason is not empty`
- Filtered view for `Layer = backend`
- Filtered view for `Status = Spec-ready`

## Agent Types
### 1. Frontend validator agent
Use this agent when frontend files are added or changed materially.

Responsibilities:
- inspect imported or migrated frontend
- run `bun scripts/frontend-analyzer.ts`
- update the analyzer report
- identify blockers and affected specs
- refuse to bless backend tasking while frontend blockers remain

Prompt pattern:
```text
Validate the frontend against the vinicius.dev spec harness.

Read:
- docs/specs/tracker.md
- docs/specs/frontend-intake.md
- docs/specs/frontend-analyzer.md
- docs/specs/frontend-analyzer-report.md
- docs/specs/frontend-structure.md
- docs/specs/frontend-architecture.md
- docs/specs/design-system.md
- docs/specs/product-scope.md

Then:
1. Inspect the current frontend and any legacy snapshot.
2. Run `bun scripts/frontend-analyzer.ts`.
3. Classify findings only as `matches-spec`, `adapt-spec`, `blocks-backend`, or `missing-surface`.
4. Identify exact spec files that need updates.
5. Confirm whether backend tasking remains blocked.
```

### 2. Task-definition agent
Use this agent after the relevant specs are approved.

Responsibilities:
- read approved specs
- respect the dependency matrix
- create GitHub Issues
- add them to Project `#2`
- populate fields
- cut migration-first issues before backend issues

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
2. Refuse backend issue creation if frontend reconciliation is unresolved.
3. Create one issue per executable task.
4. For each task define: Task ID, Spec ID, Layer, Base Branch, Branch Name, Merge Target, Acceptance Source, dependencies, and done criteria.
5. Add each issue to Project `#2` and set fields.
```

### 3. Implementation agent
Use one implementation agent per task.

Responsibilities:
- read issue and source spec
- create or use the assigned branch
- implement only the assigned slice
- comment on the issue at start, blocker, and completion
- move Project status during execution

Prompt pattern:
```text
Implement task <TASK-ID> for vinicius.dev.

Read:
- the linked GitHub Issue
- the source spec named in the issue
- the acceptance source named in the issue

Constraints:
- work only within the assigned scope
- do not alter unrelated files or tasks
- keep task ID in branch, commits, and PR title
- update the issue at start, blocker, and completion
- set Project status correctly
```

### 4. Review agent
Use for validation before merge.

Responsibilities:
- check acceptance against the source spec
- check task scope and regressions
- check issue/PR linkage and branch policy
- confirm the tracker and cluster docs still describe the active phase correctly when the task closes a cluster
- move or confirm `In Review`/`Done` states

## Commands and Helpers
### Analyzer
```bash
bun scripts/frontend-analyzer.ts
```

### Project bootstrap
```bash
bun scripts/gh-project-bootstrap.ts --owner=Vinicius-Marcondes --repo=Vinicius-Marcondes/vinicius.dev --title=vinicius.dev
```

### Create a task issue from prepared JSON
```bash
bun scripts/gh-task-create.ts --input=/absolute/path/to/task.json
```

### Post progress and optionally move status
```bash
bun scripts/gh-task-progress.ts \
  --repo=Vinicius-Marcondes/vinicius.dev \
  --issue=<issue-number-or-url> \
  --body="Started work on <TASK-ID>" \
  --project-owner=Vinicius-Marcondes \
  --project-number=2 \
  --status="In Progress"
```

## Manual Operator Checklist
Before starting any development session:
- confirm `develop` exists
- open the tracker
- open the GitHub Project board
- identify the current highest-priority approved cluster
- confirm the analyzer report is current

Before assigning an agent:
- confirm the task exists as a GitHub Issue
- confirm `Status` is `Spec-ready` or `Todo`
- confirm source spec and acceptance source are in the issue
- confirm branch name and base branch are defined

Before merging:
- confirm the task is in `In Review`
- confirm the PR exists and references the task ID
- confirm acceptance is satisfied
- confirm no open blocker remains on the issue

## Current Recommendation
Start with:
1. sync the harness to the latest merged cluster state
2. create the current executable cluster as GitHub Issues from `wave-2-task-clusters.md`
3. assign one agent to the shared foundation task first
4. parallelize only the tasks explicitly marked parallel-safe by the active cluster definition
