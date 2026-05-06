# Spec Harness

## Purpose
This directory is the canonical planning and execution harness for `vinicius.dev`. Future agents should treat these files as the source of truth before creating tasks, branches, or implementation changes.

## Scope
This harness covers:
- repo structure plus frontend and backend architectural policy
- cross-layer product and technical specs
- validation and release-automation policy
- acceptance criteria and dependency tracking
- mandatory Git branch and review rules
- tracker-based execution governance inside the repo

This harness does not contain implementation code.

## Locked Decisions
- Frontend stack: `React + Vite + Bun`
- Backend stack: `Bun + Hono + Prisma + Postgres`
- Deployment: Docker on a VPS behind `Caddy`
- Public sections: landing page, Thoughts, Projects, Photos, Chat Room
- Canonical tracker lives in this repo under `docs/specs`
- Task execution is tracked in `tracker.md`, not in external issue/project boards by default
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
1. Read [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md).
1. Read [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md) before frontend, admin UI, or verification work.
1. Read [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md) before backend, data, media, infra, or verification work.
1. Read [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md) before release automation, deployment automation, or final verification work.
1. Work only from specs that are in `Approved` or explicitly assigned for spec authoring/review.
1. Map each task to one spec, one task ID, one branch, one tracker entry, and one acceptance source.
1. For execution work, keep `tracker.md` aligned with branch, PR, and merge state.

## Spec Lifecycle
- `Draft`: not ready for task splitting
- `Review`: authored and awaiting review
- `Approved`: ready to drive tasks
- `Tasked`: already split into implementation work

No frontend-facing spec may move to `Tasked` until [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md) is approved and any required frontend reconciliation is complete or explicitly marked not applicable.
No backend-facing spec may move to `Tasked` until [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md) is approved and any required frontend contract review is complete or explicitly marked not applicable.

## Canonical Files
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- [implementation-playbook.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/implementation-playbook.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [github-project-execution.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/github-project-execution.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [agent-onboarding-refresh.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/agent-onboarding-refresh.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [frontend-admin-auth-integration.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-admin-auth-integration.md)
- [chat-room-live-integration.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/chat-room-live-integration.md)
- [security-hardening-production-readiness.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/security-hardening-production-readiness.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)
- [media-storage.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/media-storage.md)
- [admin-cms.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/admin-cms.md)
- [infra-deployment.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/infra-deployment.md)
- [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md)
- [ci-workflow-maintenance.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-workflow-maintenance.md)
- [testing-coverage-foundation.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/testing-coverage-foundation.md)
- [photo-catalog-gallery.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/photo-catalog-gallery.md)
- [admin-photo-form-feedback.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/admin-photo-form-feedback.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)

## Task Authoring Rules
- Use the spec template sections defined in [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md).
- Reference task IDs in branch names, commits, and PR titles.
- Reference task IDs, source specs, and status updates in `tracker.md`.
- Do not silently override locked product decisions when adapting specs to an existing frontend.
- Update the tracker when spec assumptions change.
