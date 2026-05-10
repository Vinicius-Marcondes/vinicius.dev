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
CI-001

## Task Index
1. CI-001 - Repair chat media test fixture
   - Task File: docs/prds/PRD-003/tasks/CI-001.md
   - Status: Accepted
2. CI-002 - Pin branch validation Bun version
   - Task File: docs/prds/PRD-003/tasks/CI-002.md
   - Status: Todo
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
Status: Todo
Evidence:
- Pending
Decision Log:
- Pending
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
