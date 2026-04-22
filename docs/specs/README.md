# Spec Harness

## Purpose
This directory is the canonical planning and execution harness for `vinicius.dev`. Future agents should treat these files as the source of truth before creating tasks, branches, or implementation changes.

## Scope
This harness covers:
- frontend intake and reconciliation when a Claude-generated frontend already exists
- repo structure plus frontend and backend architectural policy
- cross-layer product and technical specs
- validation and release-automation policy
- acceptance criteria and dependency tracking
- mandatory Git branch and review rules
- GitHub Issues and GitHub Project execution governance

This harness does not contain implementation code.

## Locked Decisions
- Frontend stack: `React + Vite + Bun`
- Backend stack: `Bun + Hono + Prisma + Postgres`
- Deployment: Docker on a VPS behind `Caddy`
- Public sections: landing page, Thoughts, Projects, Photos, Chat Room, Admin
- Canonical tracker lives in this repo under `docs/specs`
- Canonical execution board is a dedicated GitHub Project for this repo
- `frontend-structure.md` is the top-priority structural policy for frontend-facing specs and tasks
- `project-structure.md` is the top-priority structural policy for backend-facing specs and tasks
- Development deployment is manual on the VPS at `development.viniciuslab.dev`
- Production deployment is automated from pushed `v*` tags to `viniciuslab.dev`
- `develop` is the active integration branch
- `main` is the stable branch
- Every task, including spec work, must use its own branch
- Implementation branches do not self-merge without review

## Agent Workflow
1. Read [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md).
2. Read [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md).
3. Check [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md) and the latest [frontend-analyzer-report.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer-report.md).
4. Read [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md) before frontend, admin UI, or verification work.
5. Read [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md) before backend, data, media, infra, or verification work.
6. Read [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md) before release automation, deployment automation, or final verification work.
7. Work only from specs that are in `Approved` or explicitly assigned for spec authoring/review.
8. Map each task to one spec, one task ID, one GitHub Issue, one Project item, one branch, and one acceptance source.
9. Refresh the analyzer report with `bun scripts/frontend-analyzer.ts` whenever frontend files are added or materially changed.
10. For execution work, update both the linked GitHub Issue and the linked Project item.

## Spec Lifecycle
- `Draft`: not ready for task splitting
- `Review`: authored and awaiting review
- `Approved`: ready to drive tasks
- `Tasked`: already split into implementation work

No frontend-facing spec may move to `Tasked` until [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md) is approved and frontend intake is complete or explicitly marked not applicable.
No backend-facing spec may move to `Tasked` until [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md) is approved and frontend intake is complete or explicitly marked not applicable.

## Canonical Files
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- [dependency-matrix.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/dependency-matrix.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [github-project-execution.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/github-project-execution.md)
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [frontend-analyzer-report.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer-report.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)
- [media-storage.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/media-storage.md)
- [admin-cms.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/admin-cms.md)
- [infra-deployment.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/infra-deployment.md)
- [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)

## Task Authoring Rules
- Use the spec template sections defined in [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md).
- Reference task IDs in branch names, commits, and PR titles.
- Reference task IDs and source specs in GitHub Issues and Project fields.
- Do not silently override locked product decisions when adapting specs to an existing frontend.
- Update the tracker and analyzer report when spec assumptions change.
