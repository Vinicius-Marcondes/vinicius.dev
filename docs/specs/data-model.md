# Data Model

## Purpose
Define the Postgres and Prisma data model that supports content, admin, chat, moderation, and operational state while respecting the hexagonal backend boundary.

## Scope
Entity boundaries, key relationships, state fields, module ownership, and data ownership between filesystem assets and database records.

## Locked Decisions
- Postgres is the canonical structured data store.
- Prisma is the schema and migration layer.
- Prisma lives in outbound adapters; core domain and application code do not depend on Prisma types.
- Photos and chat uploads live on the VPS filesystem; Postgres stores metadata and references.
- Content publish state uses `draft` and `published`.
- Thoughts, Projects, Photos, Status Strip, Admin Users, MFA challenges, Chat Handles, Chat Messages, and moderation records are first-class concerns.
- Persistence ownership must align with the one-hexagon, module-first backend structure defined in `project-structure.md`.
- Repository DTO mapping must preserve migrated frontend filter/sort behavior without leaking Prisma types into domain, application, or presenters.

## Interfaces and Responsibilities
- Thoughts: `id`, `title`, `slug`, `type: essay | note`, `status: draft | published`, `publishedAt`, `readingTime`, `tags`, `excerpt`, `bodyPreview`, source/body content, publish timestamps, and featured state.
- Projects: `id`, `channel`, `title`, `slug`, `year`, `status: live | archived | in-progress`, `description`, `tags`, `githubUrl`, `siteUrl`, `thumbnailHue`, `thumbnailKind`, body/source content, publish timestamps, and featured state.
- Photos: `id`, `frame`, `title`, `date`, `location`, `tags`, `tone: amber | cyan | mono | sunset | violet`, caption, camera/film metadata, filesystem original reference, public original URL/reference policy, publish state, and featured state.
- Status Strip: ordered entries with `label`, `value`, optional `accent: amber | cyan | pink`, display order, and timestamps.
- Admin Users and MFA Challenges: email/password credentials, password hash metadata, optional email-code MFA challenge state, session state, timestamps, and audit references.
- Chat Handles, Chat Messages, Chat Uploads, Bans, room password rotation, and moderation audit state.
- Persistence contracts back outbound ports owned by the `content`, `chat`, `auth`, `admin`, and `media` modules.
- Prisma schema design remains a persistence concern; domain entities are not modeled as Prisma-bound types.

## Frontend-Derived Query Contracts
- Thoughts lists filter on publish status, type, tags, and search terms; public queries return only `published` records sorted descending by `publishedAt`; pagination uses cursors.
- Projects lists filter on search across title, description, channel, and tags; public queries support status, tag, and sort modes `recent`, `alpha`, and `channel`; pagination uses page/page-size.
- Photos lists filter on year, location, and search across title, location, frame, and tags; grouping can be derived from `date.slice(0, 7)` and sorted newest first; pagination uses page/page-size.
- Chat messages are cursor-paginated by stable chronological keys and support room/session visibility rules.
- DTO mapping must be explicit at repository or presenter boundaries so frontend fields are stable even if Prisma table/column names change.

## Chat Upload And Audit Fields
- Chat Upload records include stable id, displayed filename, MIME type, byte size, kind `image`, storage key/path, uploader handle/session, related message id, moderation state, created/updated timestamps, and optional hidden/deleted timestamps.
- Chat Message records include stable id, room/session reference, author handle, body, sent timestamp, optional tone, optional upload relation, moderation state, and soft-hidden timestamps.
- Moderation audit records capture delete message, hide media metadata, ban handle, room password rotation, actor/admin id, target ids, reason, timestamp, and previous/next state where relevant.
- Soft-hidden chat messages and media metadata remain available for audit while hidden from public room responses.
- Physical chat upload cleanup is optional later operational work and must not be required for moderation correctness.

## Data/Contracts Touched
- Prisma schema
- repository and storage port contracts
- API payloads for content and chat
- storage reference fields
- auth and moderation fields
- server-side public filter fields
- cursor and page pagination fields
- audit records for moderation and media hiding

## Acceptance Checklist
- [ ] Prisma-backed entities cover all locked product surfaces.
- [ ] Persistence design aligns with the module-first backend core defined in `project-structure.md`.
- [ ] Repository and storage contracts can serve core use cases without leaking Prisma types into `domain` or `application`.
- [ ] Filesystem-backed media is modeled with metadata and path references, not BLOB storage.
- [ ] Publish and feature state is explicit for public content.
- [ ] Thought fields support migrated frontend DTOs, server-side filters, and cursor pagination.
- [ ] Project fields support migrated frontend DTOs, server-side filters, sort modes, and page pagination.
- [ ] Photo fields support migrated frontend DTOs, server-side filters, page pagination, and `/media/photos/:id/original` delivery.
- [ ] Chat persistence, handles, uploads, bans, and room password rotation have defined storage.
- [ ] Chat uploads include MIME, size, storage, relation, moderation, and audit metadata.
- [ ] Status strip content is ordered, editable, timestamped, and compatible with `label`/`value`/`accent` frontend entries.
- [ ] Repository DTO mapping preserves frontend filter/sort behavior without leaking Prisma types.
- [ ] Explicit non-goal: exhaustive schema column names are not required at this spec stage.

## Dependencies
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)

## Open Questions
- Whether tags should be normalized or stored in simpler join patterns can be chosen during implementation as long as filter behavior is preserved.
- Exact table and column names can be selected during Prisma implementation if the DTO/query/audit contracts above remain stable.

## Task-Splitting Notes
- Schema changes should be isolated from unrelated API behavior changes.
- If an imported frontend implies different DTO shapes, update this spec before splitting backend tasks.
- Create persistence foundation before public content, media, admin, and chat tasks rely on repositories.
- Persistence tasks should reference the owning module and outbound ports they satisfy.

## Git Branch Implications
- Data model work uses `data/` or `spec/` branches.
- Schema-affecting tasks must be easy to revert, so do not bundle multiple unrelated entity changes together.
