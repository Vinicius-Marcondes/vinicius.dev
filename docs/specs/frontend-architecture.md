# Frontend Architecture

## Purpose
Define the frontend runtime, route inventory, migration target, and how the runtime applies the frontend structure policy.

## Scope
Frontend runtime, route model, migration gates, data-fetching expectations, shell layout, and integration points with the backend.

## Locked Decisions
- Frontend uses `React + Vite + Bun`.
- Frontend codebase target is TypeScript.
- Frontend may arrive partially or mostly prebuilt from Claude design tooling.
- Imported frontend may arrive as a legacy React artifact rather than a Vite app.
- The frontend remains a separate app that consumes backend APIs.
- Frontend internal structure is defined in [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md) using strict FSD.
- Routing uses React Router Data Mode through `createBrowserRouter` and `RouterProvider`.
- Public and admin experiences share one runtime and are separated through public and admin shells.
- Filters, curation surfaces, and chat UI must align with product scope and design system specs.
- The canonical migration path is archive-first: preserve imported frontend in a tracked legacy snapshot, scaffold a clean Vite React TypeScript app, then migrate/adapt the legacy UI into it.
- Backend tasking remains blocked while the frontend still depends on browser Babel, CDN React, global `window.*` exports, missing TypeScript, or missing planned screens.
- Missing planned sections must exist as fully designed screens before backend tasking is unlocked.

## Interfaces and Responsibilities
- Define routes for `/`, `/thoughts`, `/projects`, `/photos`, `/chat`, and `/admin`.
- Define the legacy snapshot contract for imported frontend artifacts under a tracked location such as `frontend-legacy/`.
- Define the target contract as a routed `Vite + React + TypeScript + Bun` app rather than static HTML entrypoints with inline Babel.
- Define the route tree ownership under `app/routes` and map route families onto the page slices defined by `frontend-structure.md`.
- Define the public shell for `/`, `/thoughts`, `/projects`, `/photos`, and `/chat`.
- Define the admin shell for `/admin/**`.
- Define route-facing page public APIs, loader/action ownership, and error/loading-state expectations.
- Define frontend API consumption boundaries without importing backend adapter concerns into the frontend runtime.
- Define shared layout and token usage patterns.
- Define API consumption boundaries for content, auth, chat, uploads, and status strip data.
- Define how the frontend represents filters, featured content, and moderation/admin actions.
- Reconcile existing frontend assumptions via the analyzer before backend tasking.

## Data/Contracts Touched
- route paths
- route module contracts
- view models for content cards and detail pages
- auth/session expectations
- chat message and upload payload expectations
- admin CRUD form shapes
- legacy snapshot location
- frontend migration gate status

## Acceptance Checklist
- [ ] Frontend runtime explicitly uses Bun.
- [ ] Frontend source is TypeScript.
- [ ] React Router Data Mode is explicit.
- [ ] Route inventory covers all locked product sections.
- [ ] Imported legacy frontend, if any, is treated as a tracked migration source rather than the final app structure.
- [ ] Static HTML entrypoints and browser-Babel delivery are replaced by typed routed screens.
- [ ] Route tree ownership is documented under `app/routes`.
- [ ] Public and admin shells are defined inside one frontend app.
- [ ] `frontend-structure.md` is referenced as the structural source of truth for folders, slices, and layer rules.
- [ ] API boundaries are documented for public content, admin, auth, chat, and uploads.
- [ ] Frontend assumptions can be reconciled to analyzer findings.
- [ ] Shared tokens and layout rules align with the design system.
- [ ] Thoughts, Chat Room, and Admin exist as fully designed screens before backend tasking is considered unblocked.
- [ ] Explicit non-goal: no frontend implementation is defined here beyond architecture and contracts.

## Dependencies
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)

## Open Questions
- Whether a later move to React Router Framework Mode is worthwhile can be decided later if runtime needs change.

## Task-Splitting Notes
- Reconcile imported frontend structure before splitting feature work.
- If the imported frontend is legacy-shaped, the first frontend tasks are: archive current frontend, scaffold a clean Vite React TypeScript app, establish the `app/routes` tree and shell structure, migrate landing, migrate projects, migrate photos, implement Thoughts, implement Chat Room, implement Admin, then re-run analyzer.
- Page-level frontend tasks should depend on this spec, [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md), and the relevant product or design spec.

## Git Branch Implications
- Frontend architecture changes require `fe/` or `spec/` branches depending on whether the change is code or spec.
- Imported frontend reconciliation should be isolated from unrelated backend tasks.
