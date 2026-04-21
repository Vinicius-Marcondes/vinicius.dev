# Frontend Architecture

## Purpose
Define the planned frontend structure and the reconciliation target for any imported UI.

## Scope
Frontend runtime, folder boundaries, route model, data-fetching expectations, and integration points with the backend.

## Locked Decisions
- Frontend uses `React + Vite + Bun`.
- Frontend may arrive partially or mostly prebuilt from Claude design tooling.
- The frontend remains a separate app that consumes backend APIs.
- Public and admin experiences share the same runtime but may use separate route groups or app shells.
- Filters, curation surfaces, and chat UI must align with product scope and design system specs.

## Interfaces and Responsibilities
- Define routes for `/`, `/thoughts`, `/projects`, `/photos`, `/chat`, and `/admin`.
- Define shared layout and token usage patterns.
- Define API consumption boundaries for content, auth, chat, uploads, and status strip data.
- Define how the frontend represents filters, featured content, and moderation/admin actions.
- Reconcile existing frontend assumptions via the analyzer before backend tasking.

## Data/Contracts Touched
- route paths
- view models for content cards and detail pages
- auth/session expectations
- chat message and upload payload expectations
- admin CRUD form shapes

## Acceptance Checklist
- [ ] Frontend runtime explicitly uses Bun.
- [ ] Route inventory covers all locked product sections.
- [ ] API boundaries are documented for public content, admin, auth, chat, and uploads.
- [ ] Frontend assumptions can be reconciled to analyzer findings.
- [ ] Shared tokens and layout rules align with the design system.
- [ ] Explicit non-goal: no frontend implementation is defined here beyond architecture and contracts.

## Dependencies
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)

## Open Questions
- Whether public and admin routes should live in one deployed frontend artifact or separate apps can remain flexible if contracts stay stable.

## Task-Splitting Notes
- Reconcile imported frontend structure before splitting feature work.
- Page-level frontend tasks should depend on this spec plus the relevant product or design spec.

## Git Branch Implications
- Frontend architecture changes require `fe/` or `spec/` branches depending on whether the change is code or spec.
- Imported frontend reconciliation should be isolated from unrelated backend tasks.

