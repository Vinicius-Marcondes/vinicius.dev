# Testing Coverage Foundation

## Purpose
Establish the first cross-layer testing coverage baseline for `vinicius.dev`, improving backend confidence, adding frontend tests, and keeping CI concise enough for routine PR validation.

## Scope
Backend application and repository tests, frontend Vitest setup and tests, report-only coverage commands, and GitHub Actions validation updates for frontend, backend, and focused Prisma/Postgres contract coverage.

## Locked Decisions
- Backend tests continue to use Bun's test runner.
- Frontend tests use Vitest with React Testing Library and a DOM test environment.
- Coverage is report-only in this wave; no coverage thresholds fail CI yet.
- Backend DB-backed repository contract tests run in CI with a Postgres service.
- Existing backend colocated tests stay in place.
- New frontend tests should be colocated with FSD slices unless a shared test setup file is needed.
- No Playwright, browser E2E, visual regression, or broad test relocation is included in this wave.

## Interfaces and Responsibilities
- `backend` owns application/use-case tests, adapter tests, DB-backed repository contract tests, and backend coverage reporting scripts.
- `frontend` owns Vitest configuration, React Testing Library setup, API/helper tests, route loader/action tests, and component integration tests.
- CI owns concise PR validation that runs backend policy checks, frontend checks, and the focused DB-backed repository suite without introducing E2E jobs.
- Test tasks must preserve the existing architecture rules: backend core remains framework-free, frontend tests respect FSD public APIs where practical, and DB contract tests isolate their own data.

## Data/Contracts Touched
- backend package test scripts
- frontend package test scripts and test dependencies
- Vitest configuration and shared test setup
- backend Prisma/Postgres repository contract test data
- GitHub Actions PR validation jobs
- tracker task metadata for `QA-009` through `QA-013`

## Acceptance Checklist
- [ ] Backend application coverage includes content cursor handling, pagination normalization, filters, DTO mapping, null detail paths, photo media URLs, and status strip mapping.
- [ ] Backend admin application tests cover list normalization, curation mappings, update null returns, metadata date handling, and status-strip replacement mapping.
- [ ] Backend DB-backed repository contract tests cover high-risk admin, content, and chat persistence paths using isolated deterministic data.
- [ ] Frontend has Vitest, React Testing Library, DOM setup, `test`, and `test:coverage` scripts.
- [ ] Frontend tests cover the shared API client, entity mappers/filters, dashboard mapper, chat API helpers, auth parsing, route loaders/actions, and core admin/chat component states.
- [ ] PR validation runs frontend lint/build/test, backend typecheck/test/verify, and focused backend DB contract tests against Postgres.
- [ ] Coverage commands exist for backend and frontend but do not enforce thresholds.
- [ ] No Playwright, browser E2E, visual regression, or broad test relocation is introduced.
- [ ] Task IDs, branch names, base branch, merge target, acceptance source, and verification method are defined in `tracker.md`.

## Dependencies
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)
- [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)

## Open Questions
- Coverage thresholds can be introduced in a later QA spec after frontend coverage has a stable baseline.
- Browser E2E coverage can be introduced later after unit and component coverage are established.

## Task-Splitting Notes
- Split the work into `SPEC-032`, `QA-009`, `QA-010`, `QA-011`, `QA-012`, and `QA-013`.
- `QA-009`, `QA-010`, and `QA-011` can run in parallel after `SPEC-032` is approved.
- `QA-012` depends on `QA-011` because it needs the frontend Vitest setup.
- `QA-013` should land after test scripts exist so CI can call stable commands.

## Git Branch Implications
- Spec authoring uses `spec/SPEC-032-testing-coverage-foundation`.
- Backend test work uses `backend/QA-009-backend-application-coverage` and `backend/QA-010-prisma-db-contract-tests`.
- Frontend test work uses `frontend/QA-011-frontend-vitest-foundation` and `frontend/QA-012-frontend-chat-admin-tests`.
- CI workflow work uses `infra/QA-013-concise-testing-ci`.
