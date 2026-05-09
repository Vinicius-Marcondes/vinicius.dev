# Architecture

## Purpose
Capture the durable frontend, backend, API, and repository structure rules for `vinicius.dev`.

## Repository Layout
- Keep `frontend/`, `backend/`, `docs/`, `infra/`, and `scripts/` as top-level areas.
- Frontend and backend are separate applications.
- Architecture decisions belong in rules or PRDs, not in implementation-only notes.

## Frontend Stack
- Frontend uses `Vite + React + TypeScript + Bun`.
- Frontend stays as one top-level app under `frontend/`.
- Routing uses React Router Data Mode with `createBrowserRouter` and `RouterProvider`.
- Server data and mutations default to React Router loaders and actions.
- Local component state is the default client-state model. Do not introduce a global store by default.

## Frontend Structure
- Use strict Feature-Sliced Design.
- Allowed FSD layers: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Do not use the deprecated `processes` layer.
- `app` and `shared` do not contain slices.
- The route tree is owned only by `src/app/routes`.
- Public and admin experiences share one runtime and are separated through public and admin shells under `src/app`.
- Every slice or segment exposes a public API. External code imports only from that public API.
- Segments are purpose-driven: `ui`, `api`, `model`, `lib`, or `config`.
- Avoid catch-all segment names such as `components`, `hooks`, and `types` unless a PRD explicitly justifies the exception.
- Frontend request code lives in slice public APIs or `shared/api`, not inline in route definitions.

## Design Source
- The canonical visual source is `.agents/skills/vinicius-dev-website-guidelines/`.
- Before materially changing frontend UI, read the skill `SKILL.md`, `README.md`, `GUIDELINES.md`, and `colors_and_type.css`.
- Check `preview/interactive-components.html` before implementing forms, modals, toasts, feedback, or interactive controls.
- Check `ui_kits/vinicius-dev/` before building new pages or page-level visual patterns.

## Backend Stack
- Backend uses `Bun + Hono + Prisma + Postgres`.
- Backend is a separate service behind Caddy.
- Backend follows pure Hexagonal Architecture with one application hexagon.
- Core code is organized module-first under `content`, `chat`, `auth`, `admin`, `media`, and `shared`.
- `domain`, `application`, and `ports` stay inside the hexagon.
- Adapters and framework code stay outside the hexagon.
- `Hono` is an inbound adapter.
- Prisma, filesystem storage, email, hashing, session/token, time, and id providers are outbound adapters.
- `bootstrap` is the only composition root and wiring layer for runtime and tests.
- Core behavior must remain framework-agnostic and testable without HTTP or Postgres.

## API Boundaries
- All frontend-facing backend HTTP routes are mounted under `/api`.
- The frontend browser-facing API base is `/api`.
- Public photo originals use backend media URLs such as `/media/photos/:id/original`.
- Public list filtering is server-side for Thoughts, Projects, and Photos.
- Pagination is required from day one: cursor pagination for Thoughts and Chat, page pagination for Projects and Photos.
- Backend DTO mapping must preserve frontend filter and sort behavior without leaking Prisma types into domain, application, or presenters.
