# Backend Architecture

## Purpose
Define the backend service boundaries, API surface, auth model, and moderation responsibilities.

## Scope
Backend runtime, Hono application structure, Prisma integration, auth, admin, public APIs, chat APIs, and moderation endpoints.

## Locked Decisions
- Backend uses `Bun + Hono + Prisma + Postgres`.
- Backend is a separate service behind `Caddy`.
- Backend must adapt to imported frontend assumptions after analyzer review when a frontend exists.
- Admin auth uses email/password with optional MFA via emailed code.
- Chat room is password-gated and moderation supports delete, ban, and password rotation.

## Interfaces and Responsibilities
- Public content APIs for Thoughts, Projects, Photos, and status strip data.
- Auth APIs for admin session creation, session validation, logout, and optional email-code MFA.
- Chat APIs for room access, persistent handles, message history, posting, image uploads, and moderation.
- Admin APIs for CRUD, publish state changes, feature selection, and curation.
- Feed and metadata endpoints for RSS and sitemap generation.

## Data/Contracts Touched
- content DTOs
- auth/session DTOs
- MFA challenge DTOs
- chat message and handle DTOs
- moderation actions
- feed and sitemap contracts

## Acceptance Checklist
- [ ] Backend runtime explicitly uses Bun.
- [ ] Hono responsibilities are split across public, auth, admin, chat, and metadata concerns.
- [ ] Contracts align with frontend assumptions or documented analyzer reconciliation.
- [ ] Admin auth flow includes optional MFA by emailed code.
- [ ] Chat supports password gate, persistent handles, uploads, and moderation actions.
- [ ] Explicit non-goal: implementation details such as exact route files may vary as long as contracts stay intact.

## Dependencies
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)

## Open Questions
- Whether email delivery should be a dedicated internal service or a provider-backed integration can be decided later.

## Task-Splitting Notes
- Do not split backend implementation before data model review and frontend reconciliation are stable.
- Backend tasks should be grouped by API domain only after shared auth and data contracts are approved.

## Git Branch Implications
- Backend spec or implementation work uses `be/` or `spec/` branches with explicit task IDs.
- Backend tasks must cite the analyzer report revision when frontend intake is applicable.

