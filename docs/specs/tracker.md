# Spec Tracker

## Gate Checks

## Global Decisions
- Use Bun for both frontend and backend toolchains.
- Treat `develop` as the short-horizon integration branch and `main` as the stable branch.
- Frontend target is one `Vite + React + TypeScript + Bun` app using React Router Data Mode, strict FSD, and separate public/admin shells.
- The backend target is one application hexagon with module-first core organization and adapters at the technology edge.
- All frontend-facing backend APIs are mounted under `/api`; public photo originals use backend media URLs such as `/media/photos/:id/original`.
- Public list filtering is server-side for Thoughts, Projects, and Photos.
- Pagination is required from day one: cursor pagination for Thoughts and Chat, page pagination for Projects and Photos.
- Chat uploads allow `image/jpeg`, `image/png`, and `image/webp`, max `5 MB`, one image per message.
- Chat uploaded images are room-gated, not public.
- Deleted chat messages and media metadata are soft-hidden with audit records; physical file cleanup can be deferred.
- Thoughts RSS and sitemap are included.

## Cross-Cutting Risks
- Public photo delivery is intentionally originals-only, which may create performance and bandwidth pressure.
- Chat room image uploads are allowed for anyone with the room password, which increases moderation and storage risk.
- CI/CD workflows are now defined, but production deployment still depends on correct `production` environment secret provisioning and remote deploy command hardening.

## Next Task Queue

## Current Executable Cluster

## Spec Table

## Tasking Rule
A spec may only move to `Tasked` when:
- its status is `Approved`
- its dependencies are `Approved`
- frontend intake is satisfied
- branch naming is defined for resulting tasks
- its acceptance checklist is complete
