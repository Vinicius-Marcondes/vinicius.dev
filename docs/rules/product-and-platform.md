# Product And Platform

## Purpose
Capture durable product, data, media, admin, infra, CI, security, and testing rules.

## Product Scope
- The site is a retro-futuristic personal website with VHS, arcade, CRT, and cyberpunk cues.
- Public top-level sections: landing page, Thoughts, Projects, Photos, Chat Room.
- Private top-level section: Admin.
- Landing page is minimal, atmospheric, and not feature-dense.
- Landing page includes a manual "Now Playing" strip and manually featured previews.
- Thoughts use one feed with filters for `note` and `essay`.
- Projects mix polished showcase work and rougher lab or experimental entries.
- Photos use a mixed catalog with filtering and medium metadata depth.
- Public discovery includes SEO metadata, sitemap, and RSS for Thoughts.
- No analytics in v1.

## Chat
- The v1 site exposes exactly one public chat room.
- The chat room slug is `night-shift`.
- Chat Room is visible in public navigation.
- Chat Room is password-gated.
- Chat uses persistent handles.
- Chat keeps message history.
- Chat sessions persist across refresh for up to `24` hours, then require re-entry with the room password.
- Session expiry must be enforced server-side and client-side.
- Near-real-time delivery uses a room-scoped native WebSocket, not polling and not Socket.IO.
- Initial room bootstrap remains HTTP-first.
- Infinite scroll is required for message history.
- Admins can rotate the room password.
- The backend generates the next password.
- The active room password remains visible to authenticated admins.
- Join failures caused by bans must surface explicit banned-state UI rather than generic denied messaging.

## Admin
- Admin is private and not part of public navigation.
- Admin auth uses email/password with optional email-code MFA.
- Admin manages Thoughts, Projects, Photos, status strip content, and chat moderation.
- Homepage previews and status strip are manually curated.
- Admin UI lives inside the frontend admin shell.
- Admin routes must remain compatible with `/admin`, `/admin/login`, and `/admin/dashboard`.
- Admin draft preview is deferred beyond v1 unless a PRD explicitly pulls it forward.

## Data
- Postgres is the canonical structured data store.
- Prisma is the schema and migration layer.
- Prisma lives in outbound adapters. Core domain and application code do not depend on Prisma types.
- Content publish state uses `draft` and `published`.
- Thoughts, Projects, Photos, Status Strip, Admin Users, MFA challenges, Chat Handles, Chat Messages, and moderation records are first-class concerns.

## Media
- Originals are stored on the VPS filesystem.
- Postgres stores media metadata and filesystem references, not media binaries.
- Public photo delivery remains originals-only in v1.
- Public photo originals are served through backend media URLs such as `/media/photos/:id/original`.
- Admin photo uploads accept `image/jpeg`, `image/png`, and `image/webp`.
- Admin photo originals are limited to `25 MB`.
- Uploaded photos are created as `draft` and `featured=false`.
- Chat image uploads are enabled in v1.
- Chat uploads allow `image/jpeg`, `image/png`, and `image/webp`.
- Chat uploads are limited to `5 MB`.
- Chat allows one image per message.
- Chat uploaded images are room-gated, not public.
- Protected chat images require room-gated backend access and must not be exposed as a public static directory.
- Deleted chat messages and media metadata are soft-hidden with audit records. Physical file cleanup may be implemented later.
- Filesystem access occurs only through outbound storage ports implemented by outbound adapters.
- Filesystem paths are relative storage keys, sanitized, and safe under the configured root.

## Infra And Deployment
- Deployment uses Docker on a VPS.
- Caddy is the reverse proxy and TLS terminator.
- `development.viniciuslab.dev` and `viniciuslab.dev` run on the same VPS.
- Frontend and backend are separate services.
- Postgres is persistent and stateful.
- Filesystem media must survive container restarts and redeploys.
- Development deployment is manual and outside CI/CD scope.
- Production deployment is automated only from pushed `v*` release tags that point to commits already on `main`.
- Production deployment must not trigger from branch pushes.

## CI
- CI uses GitHub Actions.
- Pull requests targeting `develop` or `main` must run validation in GitHub Actions.
- Pushes to `develop` or `main` may run validation, but do not deploy any environment.
- Frontend validation uses Bun and covers install, lint/typecheck where configured, tests where configured, and build.
- Backend validation uses Bun and covers install, lint/typecheck where configured, tests, Prisma checks, and backend boundary checks.
- Coverage is report-only unless a PRD explicitly introduces thresholds.
- No Playwright, browser E2E, visual regression, or broad test relocation is required by default.

## Security Baseline
- `AUTH_SESSION_SECRET` and `AUTH_ROOM_PASSWORD_SECRET` are required in production and must not fall back to repo-public defaults.
- Backend CORS policy is enforced in the Hono adapter.
- Admin MFA must enforce a failed-attempt ceiling when enabled.
- Production MFA delivery must use a real non-test delivery adapter.
- Login, MFA verification, room join, message send, and chat upload routes must have explicit abuse-control limits.
- Chat text messages keep the single-message product model, but backend must enforce a maximum body length of `2000` characters.
- Chat upload server-side validation must verify file signatures, not only client-declared MIME types.
- WebSocket auth must not place the active room session identifier in the URL query string.
- Browser persistence for chat room rehydration must not keep the active room session bearer in `localStorage`.
- Room-password generation must use a cryptographically secure RNG.
- Readable-password encryption keys must use a proper KDF.
- Generic response-security headers belong at the Caddy edge.
- Protected media routes must still set route-appropriate headers such as `X-Content-Type-Options: nosniff`.
- The production compose path must serve a built frontend artifact and must not run the Vite dev server.

## Testing Baseline
- Backend tests use Bun's test runner.
- Frontend tests use Vitest with React Testing Library and a DOM test environment.
- Existing backend colocated tests stay in place.
- New frontend tests should be colocated with FSD slices unless a shared test setup file is needed.
- DB-backed repository contract tests may run in CI with a Postgres service when the active PRD requires database coverage.
