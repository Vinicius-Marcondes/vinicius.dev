# Admin CMS

## Purpose
Define the private administrative surface for content management, curation, moderation, and status updates.

## Scope
Admin authentication, CRUD operations, publication controls, featured content selection, status strip editing, and chat moderation.

## Locked Decisions
- Admin is private and not part of the public navigation surface.
- Admin auth uses email/password with optional email-code MFA.
- Admin manages Thoughts, Projects, Photos, status strip content, and chat moderation.
- Homepage previews and status strip are manually curated.
- Admin UI lives inside the frontend admin shell defined by `frontend-architecture.md` and `frontend-structure.md`.
- Admin behavior is implemented through backend `auth`, `admin`, `content`, `chat`, and `media` core modules behind ports.
- Admin routes must remain compatible with `/admin`, `/admin/login`, and `/admin/dashboard` in the migrated frontend.
- Admin draft preview is deferred beyond Wave 2.

## Interfaces and Responsibilities
- Admin login, session, and optional MFA flow.
- CRUD screens for Thoughts, Projects, and Photos.
- Publish/unpublish controls.
- Featured content controls for homepage previews.
- Status strip editing surface.
- Chat moderation controls for delete, ban, and password rotation.
- Admin UI routes and screens compose page slices, widgets, features, and entities through the frontend structure policy.
- Backend admin behavior is modeled as use cases and ports first, then exposed through HTTP adapters and admin UI flows.

## Admin Auth State Machine
- Credentials state: admin submits email and password.
- MFA challenge state: when enabled, backend issues a six-digit email-code challenge and waits for verification.
- Ready session state: backend returns or refreshes an authenticated admin session after credentials and any required MFA are valid.
- Failed, expired, and rate-limited auth attempts must be represented as explicit errors without leaking whether an admin email exists.

## Dashboard And Curation Contracts
- Dashboard exposes counts/queues for draft Thoughts, featured slots, photo records, chat flags, and content queue actions.
- Manual homepage curation controls select featured Thoughts, Projects, and Photos.
- Status strip editing controls ordered entries with `label`, `value`, and optional `accent`.
- Chat moderation commands include soft-delete/hide message, ban handle, and rotate room password.
- Admin APIs must allow backend implementation without requiring draft preview in Wave 2.

## Data/Contracts Touched
- admin auth/session contracts
- admin use-case DTOs
- content editing forms
- curation and feature flags
- moderation commands
- admin login/MFA state DTOs
- dashboard queue/count DTOs
- status strip entry DTOs

## Acceptance Checklist
- [ ] Admin auth and optional MFA behavior are defined.
- [ ] Admin auth defines credentials, email-code MFA challenge, and ready session states.
- [ ] Admin route compatibility is explicit for `/admin`, `/admin/login`, and `/admin/dashboard`.
- [ ] Admin UI aligns with the one-app, admin-shell frontend structure.
- [ ] Admin behavior aligns with the module-first backend structure in `project-structure.md`.
- [ ] CRUD surfaces exist for all first-class content types.
- [ ] Manual featured-content curation is explicit.
- [ ] Status strip editing is part of admin scope.
- [ ] Dashboard queues cover draft Thoughts, featured slots, photo records, chat flags, content queue actions, status strip editing, and moderation.
- [ ] Chat moderation includes soft-hide/delete, ban, and room password rotation.
- [ ] Draft preview is explicitly deferred beyond Wave 2.
- [ ] Explicit non-goal: multi-user editorial workflows beyond the private site owner/admin model.

## Dependencies
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)

## Open Questions
- Draft preview and side-by-side preview modes are deferred beyond Wave 2.

## Task-Splitting Notes
- Split auth and content-management tasks only after shared admin contracts are stable.
- Frontend admin tasks should reference `frontend-architecture.md` and `frontend-structure.md` together.
- Moderation tasks should reference this spec, the backend/data specs, and the owning module ports.
- Keep admin draft preview out of Wave 2 task definitions.

## Git Branch Implications
- Admin work uses `admin/`, `fe/`, `be/`, or `spec/` branches depending on the change surface.
- Do not mix admin auth tasks with unrelated public frontend work in the same branch.
