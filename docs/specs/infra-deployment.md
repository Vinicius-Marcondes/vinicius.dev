# Infra Deployment

## Purpose
Define the runtime topology and operational model for deploying the site on a VPS, including how the backend composition root and adapters run in production and how the development and production environments coexist on the same host.

## Scope
Docker services, reverse proxying, persistent volumes, secrets, and promotion expectations.

## Locked Decisions
- Deployment uses Docker on a VPS.
- `Caddy` is the reverse proxy and TLS terminator.
- `development.viniciuslab.dev` and `viniciuslab.dev` run on the same VPS.
- Frontend and backend are separate services.
- Postgres is persistent and stateful.
- Filesystem media must survive container restarts and redeploys.
- The backend service runs the composition root in `bootstrap` that wires one application hexagon to its adapters at startup.
- Development deployment is manual and outside CI/CD scope.

## Interfaces and Responsibilities
- `caddy` handles TLS on `80/443` and routes `development.viniciuslab.dev` and `viniciuslab.dev` to the correct environment-specific services.
- `frontend` serves the React + Vite + Bun application for each environment.
- `backend` runs the Bun + Hono API for each environment, loads config, wires adapters in `bootstrap`, and serves the one-hexagon core.
- `postgres` stores structured data.
- Persistent volumes back Postgres and media storage.
- Environment variables and secrets configure auth, email, database access, room password management, and adapter-specific runtime config.
- Environment separation happens through hostname routing plus separate internal ports, containers, or compose projects rather than public alternate ports.
- Deployment automation policy belongs to [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md); this spec owns runtime topology only.
- `Caddy` proxies `/api/*` to the backend service for both development and production.
- `Caddy` or the frontend service serves the React app with static fallback for React Router routes, including `/admin/*`.
- Public photo originals are reachable through backend media routes such as `/media/photos/:id/original`.
- Chat uploaded media remains room-gated and must not be exposed as an unauthenticated static directory.

## Routing Contract
- Requests to `/api/*` route to the backend service.
- Requests to `/media/photos/:id/original` route to the backend or a backend-authorized media handler that checks photo publish state.
- Requests for room-gated chat media route through backend access checks rather than direct static serving.
- Non-API, non-media requests fall back to the frontend app so React Router can serve `/`, `/thoughts`, `/projects`, `/photos`, `/chat`, `/admin`, `/admin/login`, and `/admin/dashboard`.
- `development.viniciuslab.dev` and `viniciuslab.dev` use the same route semantics with separate services, ports, compose projects, or environment names.

## Environment And Volume Contract
- Development and production have separate Postgres volumes.
- Development and production have separate public photo media roots.
- Development and production have separate chat upload media roots.
- Required backend env categories include database URL, session secrets, password hash parameters, email/MFA provider settings, room password settings, upload MIME/size limits, public photo media root, chat media root, media public URL base, and CORS/origin policy.
- Frontend env/config must continue to resolve the API base as `/api` for deployed environments.

## Data/Contracts Touched
- service boundaries
- port and routing expectations
- persistent volume requirements
- secret/env inventory
- adapter runtime configuration
- deployment promotion flow
- `/api` reverse proxy contract
- React Router static fallback contract
- public and room-gated media routing
- dev/prod volume separation

## Acceptance Checklist
- [ ] Docker service layout is explicit for proxy, frontend, backend, and database.
- [ ] Caddy routing responsibilities are documented.
- [ ] `/api/*` proxies to the backend service.
- [ ] React Router static fallback is documented for public and admin frontend routes.
- [ ] `/media/photos/:id/original` routing is documented for public photo originals.
- [ ] Room-gated chat media is not served from an unauthenticated static directory.
- [ ] The same-VPS, two-hostname topology is documented for development and production.
- [ ] Backend runtime ownership of `bootstrap` and adapter wiring is documented.
- [ ] Persistent storage requirements cover database, public photo media, and chat upload media.
- [ ] Development and production volumes or compose projects are separate.
- [ ] Secrets and env categories are identified.
- [ ] Deployment assumptions preserve the outbound adapter requirements for database, filesystem, mail, and security integrations.
- [ ] Environment separation is described in terms of internal services or ports behind `Caddy`, not public alternate ports.
- [ ] Promotion expectations align with the Git workflow.
- [ ] Explicit non-goal: production IaC beyond Docker/VPS is not required in v1.

## Dependencies
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [media-storage.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/media-storage.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)

## Open Questions
- Whether Docker Compose or another lightweight orchestration layer will be used can be decided later if the topology stays the same.
- Exact health-check and restart commands can be chosen during infra implementation.

## Task-Splitting Notes
- Infra tasks should be delayed until backend and storage assumptions are stable.
- Deployment-promotion tasks should reference this spec, [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md), the Git workflow spec, and the relevant adapter/runtime assumptions.
- Split Caddy routing, Docker service layout, volume/secrets, and production tag deploy wiring into separate tasks unless a small implementation slice requires them together.

## Git Branch Implications
- Infra work uses `infra/` or `spec/` branches.
- Promotion or deployment workflow changes should be isolated so rollbacks are straightforward.
