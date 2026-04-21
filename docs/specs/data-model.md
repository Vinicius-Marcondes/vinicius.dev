# Data Model

## Purpose
Define the Postgres and Prisma data model that supports content, admin, chat, moderation, and operational state.

## Scope
Entity boundaries, key relationships, state fields, and data ownership between filesystem assets and database records.

## Locked Decisions
- Postgres is the canonical structured data store.
- Prisma is the schema and migration layer.
- Photos and chat uploads live on the VPS filesystem; Postgres stores metadata and references.
- Content publish state uses `draft` and `published`.
- Thoughts, Projects, Photos, Status Strip, Admin Users, MFA challenges, Chat Handles, Chat Messages, and moderation records are first-class concerns.

## Interfaces and Responsibilities
- Thoughts: title, slug, type, excerpt, body, tags, publish timestamps, featured state.
- Projects: title, slug, type, summary, body, stack, links, media refs, publish timestamps, featured state.
- Photos: title, caption, capture date, camera/film, location, tags, filesystem path, publish state, featured state.
- Status Strip: current focus, location, current build note, timestamps.
- Admin Users and MFA Challenges: credential and optional second-factor state.
- Chat Handles, Chat Messages, Chat Uploads, Bans, and room password rotation audit state.

## Data/Contracts Touched
- Prisma schema
- API payloads for content and chat
- storage reference fields
- auth and moderation fields

## Acceptance Checklist
- [ ] Prisma-backed entities cover all locked product surfaces.
- [ ] Filesystem-backed media is modeled with metadata and path references, not BLOB storage.
- [ ] Publish and feature state is explicit for public content.
- [ ] Chat persistence, handles, uploads, bans, and room password rotation have defined storage.
- [ ] Status strip content is editable and timestamped.
- [ ] Explicit non-goal: exhaustive schema column names are not required at this spec stage.

## Dependencies
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [media-storage.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/media-storage.md)

## Open Questions
- Whether tags should be normalized or stored in simpler join patterns can be chosen during implementation as long as filter behavior is preserved.

## Task-Splitting Notes
- Schema changes should be isolated from unrelated API behavior changes.
- If an imported frontend implies different DTO shapes, update this spec before splitting backend tasks.

## Git Branch Implications
- Data model work uses `data/` or `spec/` branches.
- Schema-affecting tasks must be easy to revert, so do not bundle multiple unrelated entity changes together.

