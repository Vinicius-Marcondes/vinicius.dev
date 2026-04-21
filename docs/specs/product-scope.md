# Product Scope

## Purpose
Define the locked product surface and content model boundaries for the first version of `vinicius.dev`.

## Scope
Public and private site behavior, section inventory, editorial model, and explicit v1 boundaries.

## Locked Decisions
- The site is a retro-futuristic personal website with VHS, arcade, CRT, and cyberpunk cues.
- Public top-level sections: landing page, Thoughts, Projects, Photos, Chat Room.
- Private top-level section: Admin.
- Landing page is minimal, atmospheric, and not feature-dense.
- The landing page includes a manual “Now Playing” strip and manually featured previews.
- Thoughts use one feed with filters for `note` and `essay`.
- Projects mix polished showcase work and rougher lab/experimental entries.
- Photos use a mixed catalog with filtering and medium metadata depth.
- Chat Room is visible in nav, password-gated, uses persistent handles, keeps message history, and supports image uploads.
- No analytics in v1.
- Public discovery includes SEO metadata, sitemap, and RSS for Thoughts.

## Interfaces and Responsibilities
- Landing page surfaces identity, tagline, manual status strip, and selected previews.
- Thoughts support list and detail views.
- Projects support catalog and detail views.
- Photos support gallery browsing, filtering, and detail/set views as needed.
- Chat Room handles password entry, persistent handles, text messages, emoji, links, and image uploads.
- Admin handles content CRUD, curation, status strip updates, and moderation.

## Data/Contracts Touched
- content entry types and statuses
- featured content selection
- status strip payload
- chat room behavior contracts
- SEO and feed exposure

## Acceptance Checklist
- [ ] Public IA includes landing page, Thoughts, Projects, Photos, and Chat Room.
- [ ] Admin remains private and separate from public navigation.
- [ ] Landing page remains minimal and manually curated.
- [ ] Thoughts, Projects, Photos, and Chat Room reflect the locked editorial model.
- [ ] No analytics are introduced in v1.
- [ ] RSS is defined for Thoughts and SEO metadata is included for public sections.
- [ ] V1 non-goals remain outside scope unless explicitly re-approved.

## Dependencies
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)

## Open Questions
- Whether later versions should add search or analytics remains out of scope for v1.

## Task-Splitting Notes
- Product-scope changes should be rare and isolated.
- Downstream feature tasks must cite which locked decision they implement.

## Git Branch Implications
- Any task that changes locked product behavior must use a dedicated branch and reference this spec.
- Product scope changes should not be mixed with low-level implementation refactors.

