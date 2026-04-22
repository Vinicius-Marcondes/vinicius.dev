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

## Data/Contracts Touched
- service boundaries
- port and routing expectations
- persistent volume requirements
- secret/env inventory
- adapter runtime configuration
- deployment promotion flow

## Acceptance Checklist
- [ ] Docker service layout is explicit for proxy, frontend, backend, and database.
- [ ] Caddy routing responsibilities are documented.
- [ ] The same-VPS, two-hostname topology is documented for development and production.
- [ ] Backend runtime ownership of `bootstrap` and adapter wiring is documented.
- [ ] Persistent storage requirements cover both database and media.
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

## Task-Splitting Notes
- Infra tasks should be delayed until backend and storage assumptions are stable.
- Deployment-promotion tasks should reference this spec, [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md), the Git workflow spec, and the relevant adapter/runtime assumptions.

## Git Branch Implications
- Infra work uses `infra/` or `spec/` branches.
- Promotion or deployment workflow changes should be isolated so rollbacks are straightforward.
