# Backend Architecture

## Purpose
Define the backend service boundary, module-first hexagonal structure, API surface, auth model, and moderation responsibilities.

## Scope
Backend runtime, one application hexagon, module-first core structure, Hono integration, outbound adapter boundaries, auth, admin, public APIs, chat APIs, and moderation endpoints.

## Locked Decisions
- Backend uses `Bun + Hono + Prisma + Postgres`.
- Backend is a separate service behind `Caddy`.
- All frontend-facing backend HTTP routes are mounted under `/api` because the migrated frontend exports `apiBaseUrl = '/api'`.
- Backend follows pure Hexagonal Architecture with one application hexagon.
- Backend core is organized module-first under `content`, `chat`, `auth`, `admin`, `media`, and `shared`.
- `Hono` is an inbound adapter; Prisma, filesystem storage, email, hashing, session/token, time, and id providers are outbound adapters.
- `bootstrap` is the only backend composition root and wiring layer for runtime and tests.
- Core behavior must remain framework-agnostic and testable without HTTP or Postgres.
- Backend must preserve the migrated frontend contracts captured by FE-010 unless a later frontend-impacting spec change is approved.
- Public list filtering is server-side for Thoughts, Projects, and Photos.
- Pagination is included from day one: cursor pagination for Thoughts and Chat, page pagination for Projects and Photos.
- Admin auth uses email/password with optional MFA via emailed code.
- Chat room is password-gated and moderation supports delete, ban, and password rotation.
- Thoughts RSS and sitemap are included in Wave 2 backend scope.

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
- Upload handling is split across chat application use cases, media outbound storage ports, and Hono request/multipart mapping adapters.

## Frontend HTTP Surface
- `/api/thoughts`: published Thought lists/details with server-side type/tag/search filtering and cursor pagination.
- `/api/projects`: Project lists/details with server-side search/status/tag/sort filtering and page pagination.
- `/api/photos`: Photo lists/details with server-side year/location/search filtering and page pagination.
- `/api/status-strip`: ordered status strip entries for the landing page ticker.
- `/api/chat/*`: room join, room session validation, participant state, cursor-paginated messages, send message, image upload, and room-gated media access coordination.
- `/api/admin/*`: private admin content, curation, status strip, and moderation APIs after admin auth.
- `/api/auth/*`: admin email/password login, optional email-code MFA challenge/verification, session refresh, and logout.
- `/api/rss`: Thoughts RSS feed generated from published Thoughts.
- `/api/sitemap`: sitemap data generated from published public content and stable public routes.
- `/media/photos/:id/original`: backend media route for public photo originals. This route is intentionally outside `/api` so media delivery can evolve independently from DTO endpoints.

## Frontend DTO Compatibility
- Thought DTOs expose `id`, `title`, `slug`, `type`, `status`, `publishedAt`, `readingTime`, `tags`, `excerpt`, and `bodyPreview`.
- Project DTOs expose `id`, `channel`, `title`, `slug`, `year`, `status`, `description`, `tags`, `links.github`, `links.site`, and `thumbnail.hue`/`thumbnail.kind`.
- Photo DTOs expose `id`, `frame`, `title`, `date`, `location`, `tags`, `tone`, and a public original media URL using `/media/photos/:id/original`.
- Status strip DTOs expose ordered entries with `label`, `value`, and optional `accent`.
- Chat DTOs expose room-gated messages with `id`, `author`, `body`, `sentAt`, optional `tone`, and optional image attachment metadata.
- Chat participant DTOs expose `handle` and `status`.
- Admin auth DTOs support credentials, optional six-digit email-code MFA, and ready session states.
- Backend presenters must map domain/application DTOs to these shapes without leaking Prisma models or storage internals.

## Data/Contracts Touched
- inbound port contracts
- outbound port contracts
- use-case DTOs
- auth/session DTOs
- MFA challenge DTOs
- chat message and handle DTOs
- moderation actions
- feed and sitemap contracts
- public content filter and pagination contracts
- photo media delivery route contract
- adapter wiring boundaries

## Acceptance Checklist
- [ ] Backend runtime explicitly uses Bun.
- [ ] Backend is defined as one application hexagon with module-first core organization.
- [ ] `Hono` responsibilities are split across public, auth, admin, chat, and metadata concerns as inbound adapters.
- [ ] All frontend-facing API endpoints are mounted under `/api`.
- [ ] Endpoint families are defined for public content, status strip, chat, admin, auth, RSS, sitemap, and public photo media delivery.
- [ ] Public Thoughts and Chat use cursor pagination.
- [ ] Public Projects and Photos use page pagination.
- [ ] Public Thoughts, Projects, and Photos use server-side filtering.
- [ ] Prisma and other provider integrations are treated as outbound adapters behind ports.
- [ ] `domain` and `application` responsibilities are explicit and framework-free.
- [ ] `bootstrap` is the only backend wiring layer for runtime and tests.
- [ ] `publish thought`, `post chat message`, and `admin login` can all be described as adapter -> port/use case -> domain -> outbound port -> adapter flows.
- [ ] Core behavior can be tested without HTTP or Postgres.
- [ ] Contracts explicitly satisfy FE-010 API assumptions and upload/media assumptions.
- [ ] Frontend DTO compatibility is documented for Thoughts, Projects, Photos, status strip, chat, admin auth/MFA, and uploads.
- [ ] Admin auth flow includes optional MFA by emailed code.
- [ ] Chat supports password gate, persistent handles, uploads, and moderation actions.
- [ ] Thoughts RSS and sitemap are included in Wave 2 scope.
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
- Backend foundation tasks must create `/api` route grouping before public/admin/chat endpoint tasks are split.
- Public content tasking should split Thoughts, Projects, Photos, Status Strip, RSS, and sitemap as separate implementation issues after shared pagination/filter contracts are in place.
- Group backend tasks by module and use case after shared auth, persistence, and storage contracts are stable.
- Backend task briefs should name the core use case and required ports before naming concrete adapters.

## Git Branch Implications
- Backend spec or implementation work uses `be/` or `spec/` branches with explicit task IDs.
- Backend tasks must cite both the analyzer report revision and `project-structure.md` when frontend intake is applicable.
