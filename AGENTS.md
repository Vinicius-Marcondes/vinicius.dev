# AGENTS.md

This file provides guidance to AI coding agents working in this repository. Read it before tasking, branching, or implementing.

## Hard guardrails

- Never read inside `node_modules`.
- Never run `git push origin master`.
- Before any Git command, read [docs/rules/git-workflow.md](docs/rules/git-workflow.md).
- Do not rewrite shared history or revert user changes unless the user explicitly asks for that operation.

## Repository overview

`vinicius.dev` is a personal site driven by a supervised PRD workflow in [docs/rules/](docs/rules/). Treat those rules plus the active [docs/TRACKER.md](docs/TRACKER.md) file as the source of truth before creating tasks, branches, or implementation changes.

Current repo areas:

- [frontend/](frontend/) - Vite + React 19 + TypeScript + Bun app using strict Feature-Sliced Design, React Router Data Mode, and public/admin shells.
- [backend/](backend/) - Bun + Hono + Prisma + Postgres service using a hexagonal layout with modules at the core and adapters at the edge.
- [infra/](infra/) - Caddy and deployment-facing infrastructure docs/config.
- [.github/workflows/](.github/workflows/) - CI validation and tag-based production deployment workflows.
- [docs/rules/](docs/rules/) - canonical workflow, Git, PRD/tracker, architecture, product, and platform rules.
- [docs/prds/](docs/prds/) - PRD folders and task files.
- [.agents/skills/](.agents/skills/) - local agent skills, including PRD writing, task splitting, and the Vinicius.Dev design system skill.
- [scripts/](scripts/) - repo-root GitHub Project/task helper scripts.

## Source of truth: supervised PRD workflow

Always start with [docs/rules/AGENTS.md](docs/rules/AGENTS.md). The normal reading order is:

1. [supervised-workflow.md](docs/rules/supervised-workflow.md) - PRD execution, task statuses, review modes, blockers, and acceptance.
2. [git-workflow.md](docs/rules/git-workflow.md) - required before any Git command.
3. [prd-and-tracker.md](docs/rules/prd-and-tracker.md) - PRD folders, task files, and `docs/TRACKER.md`.
4. [architecture.md](docs/rules/architecture.md) - frontend, backend, API, and repository structure rules.
5. [product-and-platform.md](docs/rules/product-and-platform.md) - product, data, media, admin, infra, CI, deployment, security, and testing rules.
6. [docs/TRACKER.md](docs/TRACKER.md) - active PRD execution tracker, when present.

Only execute tasks listed by the active `docs/TRACKER.md`. Do not change task boundaries without asking Vinicius first. Do not silently override locked product decisions when adapting PRDs to existing code.

## Planning skills

- Use `prd-writter` when the user asks to create or plan a PRD.
- Use `task-splitter` when the user asks to split an approved PRD into task files and `docs/TRACKER.md`.

## Locked stack

- **Frontend**: React 19 + Vite + TypeScript + Bun. Strict Feature-Sliced Design with layers `app`, `pages`, `widgets`, `features`, `entities`, `shared` (no `processes`). Routing uses React Router Data Mode (`createBrowserRouter` + `RouterProvider`). One app, two shells under `src/app/{public-shell,admin-shell}`.
- **Backend**: Bun + Hono + Prisma + Postgres. Hexagonal layout: domain/application logic in `src/modules/<domain>`, technology edges in `src/adapters/{inbound,outbound}`.
- **Deploy**: Docker on a VPS behind Caddy. `develop` deploys manually to `development.viniciuslab.dev`; production deploys only from `v*` tags pointing at commits on `main`. CI must not deploy from branch pushes.

## Frontend creation workflow

Before creating or materially changing frontend UI:

1. Read [architecture.md](docs/rules/architecture.md) and [product-and-platform.md](docs/rules/product-and-platform.md).
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

Workflow files live under [.github/workflows/](.github/workflows/). For CI policy and intended behavior, read [docs/rules/product-and-platform.md](docs/rules/product-and-platform.md).

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

Read [product-and-platform.md](docs/rules/product-and-platform.md) before adding Prisma models, upload paths, media delivery, or moderation logic. Schema lives at [backend/prisma/schema.prisma](backend/prisma/schema.prisma); generated client lives at [backend/generated/prisma/](backend/generated/prisma/).

## Git and GitHub workflow

Full rules live in [docs/rules/git-workflow.md](docs/rules/git-workflow.md). Summary:

- `main` is stable; `develop` is the integration branch.
- Use one implementation branch per PRD, such as `feature/PRD-004-photo-catalog-admin-upload`.
- PRD implementation branches base off `develop`; hotfixes branch off `main`.
- No self-merge. Every branch needs review. Use merge commits for integration, not squash/rebase.
- Reverts revert commits or merge commits; never rewrite shared history.
- Every accepted task gets its own signed commit with `git commit -s`.
- Commit subjects include both PRD ID and task ID, such as `PRD-004 PHOTO-001: implement public photo catalog list`.
- `docs/TRACKER.md` tracks task acceptance only, not PR or merge state.
- GitHub Issues and Project items are optional for normal task tracking unless the active PRD or task explicitly requires them.
- PR descriptions should be generated from `docs/TRACKER.md` and include accepted tasks, commits, evidence, and known limitations.

## Authoring conventions

- PRDs, task files, and the live tracker follow [docs/rules/prd-and-tracker.md](docs/rules/prd-and-tracker.md).
- When implementation assumptions change, update `docs/TRACKER.md` in the same accepted task commit.
- Keep doc-only changes separate from runtime code changes unless a PRD explicitly ties them together.
