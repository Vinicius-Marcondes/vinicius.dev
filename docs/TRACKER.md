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
- Title: Homepage V2 Reference Parity Refresh
- Status: Active
- PRD File: docs/prds/PRD-001/PRD-001.md
- Summary: Refresh the public homepage to match the V2 reference look and feel inside the current React 19 + Vite + Bun app while preserving repo architecture, adapting to real routes/content, and allowing shared public chrome refactors.

## Git
- Branch: feature/PRD-001-homepage-v2-reference-refresh
- Base: develop
- Merge Target: develop

## Current Task
HOME-002

## Task Index
1. HOME-001 - Wire homepage data loader and status-strip API
   - Task File: docs/prds/PRD-001/tasks/HOME-001.md
   - Status: Accepted
2. HOME-002 - Refactor shared public chrome to the V2 direction
   - Task File: docs/prds/PRD-001/tasks/HOME-002.md
   - Status: Accepted
3. HOME-003 - Rebuild the homepage route for reference parity
   - Task File: docs/prds/PRD-001/tasks/HOME-003.md
   - Status: Todo
4. HOME-004 - Polish responsive behavior and verify homepage rollout
   - Task File: docs/prds/PRD-001/tasks/HOME-004.md
   - Status: Todo

## Tasks

### HOME-001 - Wire homepage data loader and status-strip API
Task File: docs/prds/PRD-001/tasks/HOME-001.md
Status: Accepted
Evidence:
- `cd frontend && bun run test` -> passed (21 files, 38 tests).
- `cd frontend && bun run build` -> passed (`tsc -b && vite build`).
Decision Log:
- Started implementation on 2026-05-09.
- Added `pages/home/route.ts` loader and wired `/` index route loader ownership in `src/app/routes/public.tsx`.
- Added `entities/status-strip` API mapper/client for `/api/status-strip` and deterministic tests for API mapping + home loader behavior.
- Updated `widgets/status-strip` prop typing to accept readonly arrays so loader data can flow without mutation.
Commit: c81effa PRD-001 HOME-001: wire homepage loader to status-strip API
Blocked Reason: None
Requested Decision: None

### HOME-002 - Refactor shared public chrome to the V2 direction
Task File: docs/prds/PRD-001/tasks/HOME-002.md
Status: Accepted
Evidence:
- `cd frontend && bun run test` -> passed (21 files, 38 tests).
- `cd frontend && bun run build` -> passed (`tsc -b && vite build`).
Decision Log:
- Started implementation on 2026-05-09.
- Refactored shared public-shell chrome to reusable widgets: fixed top navigation, fixed channel bug, and fixed now-playing marquee in shell/footer/header composition.
- Updated shared navigation/social/marquee config in `shared/config` to map current public routes (`/photos`, `/projects`, `/thoughts`, `/chat`) and shared footer channels.
- Removed one-off homepage channel-bug wiring so fixed chrome behavior is shell-owned; homepage keeps only route-local hero/channel-change behavior.
- Aligned shared tokens/motion/effects with vinicius-dev guidelines (Fira Mono body font, CRT glitch timing, and global reduced-motion collapse rule).
Commit: Pending
Blocked Reason: None
Requested Decision: None

### HOME-003 - Rebuild the homepage route for reference parity
Task File: docs/prds/PRD-001/tasks/HOME-003.md
Status: Todo
Evidence:
- Pending
Decision Log:
- Pending
Commit: Pending
Blocked Reason: None
Requested Decision: None

### HOME-004 - Polish responsive behavior and verify homepage rollout
Task File: docs/prds/PRD-001/tasks/HOME-004.md
Status: Todo
Evidence:
- Pending
Decision Log:
- Pending
Commit: Pending
Blocked Reason: None
Requested Decision: None
