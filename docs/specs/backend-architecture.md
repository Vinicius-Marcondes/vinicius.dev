# Backend Architecture

## Purpose
Define the backend service boundary, module-first hexagonal structure, API surface, auth model, and moderation responsibilities.

## Scope
Backend runtime, one application hexagon, module-first core structure, Hono integration, outbound adapter boundaries, auth, admin, public APIs, chat APIs, and moderation endpoints.

## Locked Decisions
- Backend uses `Bun + Hono + Prisma + Postgres`.
- Backend is a separate service behind `Caddy`.
- Backend follows pure Hexagonal Architecture with one application hexagon.
- Backend core is organized module-first under `content`, `chat`, `auth`, `admin`, `media`, and `shared`.
- `Hono` is an inbound adapter; Prisma, filesystem storage, email, hashing, session/token, time, and id providers are outbound adapters.
- `bootstrap` is the only backend composition root and wiring layer for runtime and tests.
- Core behavior must remain framework-agnostic and testable without HTTP or Postgres.
- Backend must adapt to imported frontend assumptions after analyzer review when a frontend exists.
- Admin auth uses email/password with optional MFA via emailed code.
- Chat room is password-gated and moderation supports delete, ban, and password rotation.

## Interfaces and Responsibilities
- `modules/*/domain` owns entities, value objects, domain services, invariants, and domain rules.
- `modules/*/application` owns use cases, orchestration, transaction boundaries, and use-case DTOs.
- `modules/*/ports/inbound` defines how drivers call into the core.
- `modules/*/ports/outbound` defines repository, storage, email, clock, id, and security contracts needed by the core.
- `adapters/inbound/http/hono` owns routes, controllers, presenters, and request mapping for public, auth, admin, chat, and metadata traffic.
- `adapters/outbound` owns Prisma repositories, filesystem storage, email delivery, password hashing, session/token implementations, and other provider integrations.
- `bootstrap` owns the backend composition root for configuration loading, dependency wiring, and server startup.
- Public content APIs still cover Thoughts, Projects, Photos, status strip data, RSS, and sitemap behavior through the adapter boundary.
- Auth, chat, moderation, and admin behavior are expressed as use cases and ports first, then exposed through HTTP adapters.

## Data/Contracts Touched
- inbound port contracts
- outbound port contracts
- use-case DTOs
- auth/session DTOs
- MFA challenge DTOs
- chat message and handle DTOs
- moderation actions
- feed and sitemap contracts
- adapter wiring boundaries

## Acceptance Checklist
- [ ] Backend runtime explicitly uses Bun.
- [ ] Backend is defined as one application hexagon with module-first core organization.
- [ ] `Hono` responsibilities are split across public, auth, admin, chat, and metadata concerns as inbound adapters.
- [ ] Prisma and other provider integrations are treated as outbound adapters behind ports.
- [ ] `domain` and `application` responsibilities are explicit and framework-free.
- [ ] `bootstrap` is the only backend wiring layer for runtime and tests.
- [ ] `publish thought`, `post chat message`, and `admin login` can all be described as adapter -> port/use case -> domain -> outbound port -> adapter flows.
- [ ] Core behavior can be tested without HTTP or Postgres.
- [ ] Contracts align with frontend assumptions or documented analyzer reconciliation.
- [ ] Admin auth flow includes optional MFA by emailed code.
- [ ] Chat supports password gate, persistent handles, uploads, and moderation actions.
- [ ] Explicit non-goal: exact file names inside each module may vary as long as the boundary rules and contracts stay intact.

## Dependencies
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)

## Open Questions
- Whether email delivery should be a dedicated internal service or a provider-backed integration can be decided later.

## Task-Splitting Notes
- Do not split backend implementation before `project-structure.md` approval and frontend reconciliation are stable.
- Group backend tasks by module and use case after shared auth, persistence, and storage contracts are stable.
- Backend task briefs should name the core use case and required ports before naming concrete adapters.

## Git Branch Implications
- Backend spec or implementation work uses `be/` or `spec/` branches with explicit task IDs.
- Backend tasks must cite both the analyzer report revision and `project-structure.md` when frontend intake is applicable.
