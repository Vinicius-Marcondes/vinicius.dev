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
- ID: PRD-003
- Title: CI Validation Reliability
- Status: Active
- PRD File: docs/prds/PRD-003/PRD-003.md
- Summary: Fix recurring GitHub Actions validation failures by stabilizing the frontend chat media test fixture, aligning branch validation with the pinned Bun runtime, and preserving the existing PR, branch, and tag-only production validation contract.

## Git
- Branch: feature/PRD-003-ci-validation-reliability
- Base: develop
- Merge Target: develop

## Current Task
CI-002

## Task Index
1. CI-001 - Repair chat media test fixture
   - Task File: docs/prds/PRD-003/tasks/CI-001.md
   - Status: Accepted
2. CI-002 - Pin branch validation Bun version
   - Task File: docs/prds/PRD-003/tasks/CI-002.md
   - Status: Accepted
3. CI-003 - Run full local validation sweep
   - Task File: docs/prds/PRD-003/tasks/CI-003.md
   - Status: Todo
4. CI-004 - Confirm remote CI acceptance
   - Task File: docs/prds/PRD-003/tasks/CI-004.md
   - Status: Todo

## Tasks

### CI-001 - Repair chat media test fixture
Task File: docs/prds/PRD-003/tasks/CI-001.md
Status: Accepted
Evidence:
- Started CI-001 only; inspected `frontend/src/entities/chat/api/room-runtime.ts` and `frontend/src/entities/chat/api/room-runtime.test.ts`.
- `cd frontend && bun run test -- room-runtime.test.ts` - failed once after adding a media-session-header assertion because the media request uses a plain header record instead of a `Headers` instance; adjusted the test assertion without changing runtime code.
- `cd frontend && bun run test -- room-runtime.test.ts` - passed: 1 test file, 2 tests.
- `cd frontend && bun run lint` - passed.
- `cd frontend && bun run build` - passed: `tsc -b && vite build`.
- `cd frontend && bun run test` - passed: 22 test files, 44 tests.
Decision Log:
- Keep the change scoped to the chat runtime test fixture because `getChatAttachmentObjectUrl` already consumes `response.blob()` and does not require a real `Response` instance for the success path.
- Replaced the protected-media `new Response(new Blob(...))` fixture with a runner-stable object exposing `blob()`, `headers`, `ok`, and `status`.
- Preserved protected media URL coverage, verified the chat room session header on the media request, and verified `URL.createObjectURL` receives the returned blob while `getChatAttachmentObjectUrl` surfaces the object URL.
Commit: Pending
Blocked Reason: None
Requested Decision: None

### CI-002 - Pin branch validation Bun version
Task File: docs/prds/PRD-003/tasks/CI-002.md
Status: Accepted
Evidence:
- Started CI-002 only; confirmed `.github/workflows/pr-validation.yml` declares `BUN_VERSION: 1.3.11` and `frontend/package.json` declares `packageManager: bun@1.3.11`.
- Inspected `.github/workflows/branch-validation.yml`: trigger remains `push` to `develop` and `main`; workflow now declares `BUN_VERSION: 1.3.11`; both frontend and backend `oven-sh/setup-bun@v2` steps use `bun-version: ${{ env.BUN_VERSION }}`.
- Inspected `.github/workflows/branch-validation.yml`: frontend command coverage remains `bun install --frozen-lockfile`, `bun run lint`, `bun run build`, and `bun run test`.
- Inspected `.github/workflows/branch-validation.yml`: backend command coverage remains `bun install --frozen-lockfile`, `bun run prisma:generate`, `bun run typecheck`, `bun run test`, and `bun run verify`.
- `cd frontend && bun run lint` - passed.
- `cd frontend && bun run build` - passed: `tsc -b && vite build`.
- `cd frontend && bun run test` - passed: 22 test files, 44 tests.
- `cd backend && bun run typecheck` - passed.
- `cd backend && bun run test` - sandbox run failed on two WebSocket route tests with `EADDRINUSE` while `Bun.serve` tried to bind local test ports 38711 and 38712.
- `cd backend && bun run test` - unsandboxed rerun passed: 225 tests, 0 failed.
- `cd backend && bun run verify` - sandbox run reached media verification but failed on the same WebSocket local-port binding issue.
- `cd backend && bun run verify` - unsandboxed rerun passed, including persistence, media, public route/content, admin/auth/chat/media integration, and deploy/readiness checks.
Decision Log:
- Added workflow-level `BUN_VERSION: 1.3.11` to `.github/workflows/branch-validation.yml` to match PR validation style and frontend package metadata.
- Applied the pin to both branch-validation `oven-sh/setup-bun@v2` steps without changing branch triggers or validation commands.
- Treated the backend sandbox `EADDRINUSE` failures as environment-specific local server binding failures because the same required commands passed outside the sandbox and PRD-003 already documents this backend test behavior.
Commit: Pending
Blocked Reason: None
Requested Decision: None

### CI-003 - Run full local validation sweep
Task File: docs/prds/PRD-003/tasks/CI-003.md
Status: Todo
Evidence:
- Pending
Decision Log:
- Pending
Commit: Pending
Blocked Reason: None
Requested Decision: None

### CI-004 - Confirm remote CI acceptance
Task File: docs/prds/PRD-003/tasks/CI-004.md
Status: Todo
Evidence:
- Pending
Decision Log:
- Pending
Commit: Pending
Blocked Reason: None
Requested Decision: None
