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

## Interfaces and Responsibilities
- Admin login, session, and optional MFA flow.
- CRUD screens for Thoughts, Projects, and Photos.
- Publish/unpublish controls.
- Featured content controls for homepage previews.
- Status strip editing surface.
- Chat moderation controls for delete, ban, and password rotation.
- Admin UI routes and screens compose page slices, widgets, features, and entities through the frontend structure policy.
- Backend admin behavior is modeled as use cases and ports first, then exposed through HTTP adapters and admin UI flows.

## Data/Contracts Touched
- admin auth/session contracts
- admin use-case DTOs
- content editing forms
- curation and feature flags
- moderation commands

## Acceptance Checklist
- [ ] Admin auth and optional MFA behavior are defined.
- [ ] Admin UI aligns with the one-app, admin-shell frontend structure.
- [ ] Admin behavior aligns with the module-first backend structure in `project-structure.md`.
- [ ] CRUD surfaces exist for all first-class content types.
- [ ] Manual featured-content curation is explicit.
- [ ] Status strip editing is part of admin scope.
- [ ] Chat moderation includes delete, ban, and room password rotation.
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
- Whether admin needs draft previews or side-by-side preview modes can be decided later if the imported frontend suggests it.

## Task-Splitting Notes
- Split auth and content-management tasks only after shared admin contracts are stable.
- Frontend admin tasks should reference `frontend-architecture.md` and `frontend-structure.md` together.
- Moderation tasks should reference this spec, the backend/data specs, and the owning module ports.

## Git Branch Implications
- Admin work uses `admin/`, `fe/`, `be/`, or `spec/` branches depending on the change surface.
- Do not mix admin auth tasks with unrelated public frontend work in the same branch.
