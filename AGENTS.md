# AGENTS.md

This file provides guidance to AI coding agents working in this repository. Read it before tasking, branching, or implementing.

## Hard guardrails

- Never read inside `node_modules`.
- Never run `git push origin master`.
- Before any Git command, read [docs/specs/git-workflow.md](docs/specs/git-workflow.md).
- Do not rewrite shared history or revert user changes unless the user explicitly asks for that operation.

## Repository overview

`vinicius.dev` is a personal site driven by a spec harness in [docs/specs/](docs/specs/). Treat the harness as the source of truth before creating tasks, branches, or implementation changes.

Current repo areas:

- [frontend/](frontend/) - Vite + React 19 + TypeScript + Bun app using strict Feature-Sliced Design, React Router Data Mode, and public/admin shells.
- [backend/](backend/) - Bun + Hono + Prisma + Postgres service using a hexagonal layout with modules at the core and adapters at the edge.
- [infra/](infra/) - Caddy and deployment-facing infrastructure docs/config.
- [.github/workflows/](.github/workflows/) - CI validation and tag-based production deployment workflows.
- [docs/specs/](docs/specs/) - canonical specs, tracker, acceptance rules, Git workflow, and verification policy.
- [.agents/skills/](.agents/skills/) - local agent skills, including the Vinicius.Dev design system skill.
- [scripts/](scripts/) - repo-root GitHub Project/task helper scripts.

## Source of truth: the spec harness

Always start at [docs/specs/README.md](docs/specs/README.md). The order to read is fixed there:

1. [tracker.md](docs/specs/tracker.md) - gate statuses, global decisions, and approved work.
2. [git-workflow.md](docs/specs/git-workflow.md) - mandatory branching/review rules. Read this before any Git command.
3. [frontend-structure.md](docs/specs/frontend-structure.md) before frontend, admin UI, or frontend verification work.
4. [frontend-architecture.md](docs/specs/frontend-architecture.md) before frontend route, loader/action, or shell work.
5. [project-structure.md](docs/specs/project-structure.md) before backend, data, media, infra, or backend verification work.
6. [ci-cd.md](docs/specs/ci-cd.md) before release/deployment automation or final verification.

Only act on specs in `Approved` or specs explicitly assigned for authoring/review. Do not silently override locked product decisions when adapting specs to existing code.

## Locked stack

- **Frontend**: React 19 + Vite + TypeScript + Bun. Strict Feature-Sliced Design with layers `app`, `pages`, `widgets`, `features`, `entities`, `shared` (no `processes`). Routing uses React Router Data Mode (`createBrowserRouter` + `RouterProvider`). One app, two shells under `src/app/{public-shell,admin-shell}`.
- **Backend**: Bun + Hono + Prisma + Postgres. Hexagonal layout: domain/application logic in `src/modules/<domain>`, technology edges in `src/adapters/{inbound,outbound}`.
- **Deploy**: Docker on a VPS behind Caddy. `develop` deploys manually to `development.viniciuslab.dev`; production deploys only from `v*` tags pointing at commits on `main`. CI must not deploy from branch pushes.

## Frontend creation workflow

Before creating or materially changing frontend UI:

1. Read [frontend-structure.md](docs/specs/frontend-structure.md) and [frontend-architecture.md](docs/specs/frontend-architecture.md).
2. Use the `viniciusdev-design` skill at [.agents/skills/vinicius.dev-website-guidelines/SKILL.md](.agents/skills/vinicius-dev-website-guidelines/SKILL.md).
3. Read the skill's [README.md](.agents/skills/vinicius-dev-website-guidelines/README.md), [GUIDELINES.md](.agents/skills/vinicius-dev-website-guidelines/GUIDELINES.md), and [colors_and_type.css](.agents/skills/vinicius-dev-website-guidelines/colors_and_type.css).
4. Check [preview/interactive-components.html](.agents/skills/vinicius-dev-website-guidelines/preview/interactive-components.html) before implementing forms, modals, toasts, feedback, or interactive controls.
5. Check [ui_kits/vinicius-dev/](.agents/skills/vinicius-dev-website-guidelines/ui_kits/vinicius-dev/) before building new pages, and reuse or adapt the existing `Hero`, `Nav`, `ChannelBug`, `StatusStrip`, and `Footer` patterns where they fit.
6. Keep brand rules intact: rectangular geometry, existing tokens only, restrained neon, no emoji, no rounded UI, and reduced-motion support for animation.

## Commands

Run commands from each package directory unless noted.

### Frontend (`cd frontend`)

- `bun install`
- `bun run dev` - Vite dev server.
- `bun run build` - `tsc -b && vite build`.
- `bun run lint` - ESLint over the package.
- `bun run test` - Vitest test suite.
- `bun run test:coverage` - report-only Vitest coverage.
- `bun run preview` - preview the production build.

### Backend (`cd backend`)

- `bun install`
- `bun run dev` - `bun --watch src/bootstrap/server.ts`.
- `bun run start` / `bun run build`
- `bun run typecheck` - `tsc --noEmit`.
- `bun test` or `bun run test` - Bun test runner. Single test: `bun test <path>`.
- `bun run test:coverage` - report-only Bun coverage.
- `bun run test:db` - focused Prisma/Postgres contract tests; requires `DATABASE_URL`.
- `bun run seed` - deterministic seed baseline.
- `bun run verify` - boundary, persistence, media, selected route/integration, and deploy-readiness checks.
- `bun run verify:boundary` - enforces hexagonal layering.
- `bun run verify:media` - focused media/chat/photo regression checks.
- `bun run prisma:format`, `bun run prisma:validate`, `bun run prisma:generate`, `bun run prisma:migrate:status`, `bun run prisma:check`
- Local DB work requires `.env` with `DATABASE_URL` pointing at Postgres.

### Repo-root scripts

- `bun scripts/gh-project-bootstrap.ts` - bootstrap GitHub Project fields/options.
- `bun scripts/gh-task-create.ts` - create the linked Issue + Project item from a task brief.
- `bun scripts/gh-task-progress.ts` - update Project status or post issue comments as work moves.

### CI

Workflow files live under [.github/workflows/](.github/workflows/). For CI policy and intended behavior, read [docs/specs/ci-cd.md](docs/specs/ci-cd.md) and [docs/specs/ci-workflow-maintenance.md](docs/specs/ci-workflow-maintenance.md).

## Architecture notes

### Frontend FSD discipline

- The route tree is owned only by `src/app/routes`. Other layers do not declare routes.
- Public and admin shells live under `src/app/{public-shell,admin-shell}` and are the only places that compose route-level layout.
- Every slice/segment must expose a public API, and external code may import only that public API.
- Segments are purpose-driven: `ui`, `api`, `model`, `lib`, `config`. Avoid catch-all `components/`, `hooks`, and `types`.
- Server data and mutations default to React Router loaders/actions. Local component state is the default client model; no global store by default.
- FSD is enforced by spec and review, not a dedicated lint rule yet.

### Backend hexagonal layout

- `src/modules/<domain>` (admin, auth, chat, content, media, shared) holds domain/application logic and must not import from `src/adapters`.
- `src/adapters/inbound/http/...` mounts Hono routes.
- `src/adapters/outbound/{persistence,storage,...}` holds Prisma, filesystem, mail, and provider implementations.
- `src/bootstrap/` wires configuration, dependency construction, and server startup.
- Public API surface is mounted under `/api`; public photo originals use `/media/photos/:id/original`.
- Pagination is required from day one: cursor for Thoughts and Chat; page-based for Projects and Photos.

### Data model and media

Read [docs/specs/data-model.md](docs/specs/data-model.md) and [docs/specs/media-storage.md](docs/specs/media-storage.md) before adding Prisma models, upload paths, media delivery, or moderation logic. Schema lives at [backend/prisma/schema.prisma](backend/prisma/schema.prisma); generated client lives at [backend/generated/prisma/](backend/generated/prisma/).

## Git and GitHub workflow

Full rules live in [docs/specs/git-workflow.md](docs/specs/git-workflow.md). Summary:

- `main` is stable; `develop` is the integration branch. Every task gets its own branch.
- Branch pattern: `type/TASK-ID-short-slug`. Approved prefixes: `spec/`, `frontend/`, `backend/`, `data/`, `admin/`, `infra/`, `hotfix/`.
- Spec and implementation branches base off `develop`; hotfixes branch off `main` and merge back into both.
- No self-merge. Every branch needs review. Use merge commits for integration, not squash/rebase.
- Reverts revert commits or merge commits; never rewrite shared history.
- Commit messages and PR titles must include the task ID. Commits must be signed off with `git commit -s -m "..."`.
- Every executable task maps to one spec, one task ID, one branch, one tracker entry, and one acceptance source.
- GitHub Issues and Project items are optional for normal task tracking unless the active task/spec explicitly requires them.
- PR descriptions must include the source spec, acceptance source, base branch, merge target, and verification performed.

## Authoring conventions

- Spec docs follow the section template in [docs/specs/acceptance-criteria.md](docs/specs/acceptance-criteria.md).
- When spec assumptions change, update [docs/specs/tracker.md](docs/specs/tracker.md) in the same task.
- Keep doc-only changes separate from runtime code changes unless a spec explicitly ties them together.
