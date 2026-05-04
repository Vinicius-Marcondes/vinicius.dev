# Security Hardening and Production Readiness

## Purpose
Define the first remediation wave for the findings documented in [docs/security-review-2026-05-03.md](/Users/vinicius/Projects/vinicius.dev/docs/security-review-2026-05-03.md) so production auth, chat, media, and deployment paths are hardened without changing the locked product scope.

## Scope
- production secret and runtime-config enforcement
- backend CORS, rate-limit, and MFA hardening
- chat request, upload, WebSocket, and session-storage hardening
- room-password crypto and moderation-audit DTO hardening
- edge-header, frontend-serving, and compose/runtime hardening
- task decomposition for the full set of actionable review findings

## Locked Decisions
- The 2026-05-03 review document is the intake source for this remediation wave; implementation may refine exact fixes, but it must not silently drop a recorded finding.
- Critical findings must be scheduled before the next production deploy and before lower-priority polish work.
- `AUTH_SESSION_SECRET` and `AUTH_ROOM_PASSWORD_SECRET` must be required in production and must not fall back to repo-public defaults.
- Backend CORS policy must be enforced in the Hono adapter; reverse-proxy behavior is not the source of truth for allowed origins.
- Admin MFA remains email-code based when enabled, but enabled MFA must enforce a failed-attempt ceiling and use a real non-test delivery adapter.
- Login, MFA verification, room join, message send, and chat upload routes must have explicit abuse-control limits.
- Chat text messages keep the existing single-message product model, but the backend must enforce a maximum body length of `2000` characters.
- Chat uploads keep the existing `image/jpeg`, `image/png`, and `image/webp` allowlist, `5 MB` size limit, and one-file-per-message rule; server-side validation must verify file signatures, not only client-declared MIME types.
- WebSocket auth must not place the active room session identifier in the URL query string.
- Browser persistence for chat room rehydration must not keep the active room session bearer in `localStorage`; acceptable replacements are `sessionStorage` or an opaque rejoin reference with equivalent refresh-time UX.
- Room-password generation must use a cryptographically secure RNG, and readable-password encryption keys must use a proper KDF.
- Generic response-security headers belong at the Caddy edge; protected media routes must still set route-appropriate headers such as `X-Content-Type-Options: nosniff` when the backend serves the file.
- The production compose path must serve a built frontend artifact and must not run the Vite dev server.
- Findings that may already be partially outdated in the repo state, such as dependency-lockfile handling, must be revalidated during implementation and then either fixed or explicitly closed as no longer applicable in the task PR.

## Interfaces and Responsibilities
### Source review intake
- [docs/security-review-2026-05-03.md](/Users/vinicius/Projects/vinicius.dev/docs/security-review-2026-05-03.md)
  - remains the finding-by-finding intake artifact for this wave
  - supplies the severity ordering and reproduction context that task PRs should reference

### Backend config and runtime hardening
- `backend/src/bootstrap/config/*`
  - enforces required production secrets
  - owns parsed CORS, auth, mail, and rate-limit config inputs
- `backend/src/bootstrap/container/*`
  - wires the real MFA delivery adapter outside `test`
  - keeps no-op or debug-only MFA behavior constrained to non-production environments
- `backend/src/bootstrap/server.ts`
  - applies global server/runtime hardening needed by the approved tasks

### Backend auth and chat boundary hardening
- `backend/src/adapters/inbound/http/hono/*`
  - owns CORS middleware registration, rate limiting, request validation, upload validation, media response headers, and WebSocket handshake changes
- `backend/src/modules/auth/*`
  - owns MFA challenge attempt policy and expiration behavior
- `backend/src/modules/chat/*`
  - owns chat message limits, session-bound upload resolution, room-password generation, moderation-audit output mapping, and room-session validation rules
- `backend/src/adapters/outbound/*`
  - owns provider-backed MFA delivery, key derivation, and persistence/storage mappings needed by the hardening tasks

### Frontend chat runtime hardening
- `frontend/src/pages/chat/room/*`
  - owns room-session rehydration behavior and UX after storage changes
- `frontend/src/entities/chat/*`
  - owns chat runtime DTOs and WebSocket client contract changes
- `frontend/src/features/enter-chat-room/*`
  - owns persisted re-entry helpers and denied/expired recovery behavior

### Infra and deployment hardening
- `docker-compose.yml`
  - owns the production runtime contract for required secrets and frontend serving mode
- `docker-compose.dev.yml`
  - remains the development override and should keep development-only install/runtime behavior separate from production
- `infra/caddy/Caddyfile`
  - owns edge security headers and the production routing contract for `/api`, public media, protected chat media denial, and frontend static fallback

## Data/Contracts Touched
- production env contract for `AUTH_SESSION_SECRET` and `AUTH_ROOM_PASSWORD_SECRET`
- CORS allowlist and credentials policy
- route-level rate-limit thresholds and failure responses
- MFA challenge attempt ceiling and delivery-adapter config
- chat message body max-length contract
- chat upload request shape and server-side MIME/signature validation contract
- protected media response headers
- WebSocket auth handshake contract
- frontend chat-session persistence contract
- room-password generation and encryption-key derivation contract
- moderation audit DTO shapes
- production compose/frontend serving contract
- dependency-install reproducibility contract where still applicable

## Acceptance Checklist
### Functional acceptance
- [ ] Production startup rejects missing or default `AUTH_SESSION_SECRET` and `AUTH_ROOM_PASSWORD_SECRET` values.
- [ ] Backend CORS middleware is applied to the intended HTTP surface and enforces the configured allowlist and credentials policy.
- [ ] Login, MFA verify, room join, chat send, and chat upload routes have explicit rate limits aligned with this spec.
- [ ] MFA challenges expire or lock after the configured failed-attempt ceiling.
- [ ] Enabled MFA delivers a real code outside `test`, and development-only fallback/debug behavior is explicit and non-production.
- [ ] Chat message sends reject bodies longer than `2000` characters.
- [ ] Chat upload handling resolves room and author context from the validated session rather than trusting client-supplied internal IDs.
- [ ] Chat upload handling rejects MIME/signature mismatches for JPEG, PNG, and WebP.
- [ ] Protected chat media responses include `X-Content-Type-Options: nosniff`.
- [ ] WebSocket chat auth no longer depends on a URL query-string session identifier.
- [ ] The active chat room session bearer is no longer stored in `localStorage`.
- [ ] Room-password generation uses a CSPRNG and readable-password encryption uses a KDF-based derived key.
- [ ] Moderation audit APIs stop returning raw untyped state blobs.
- [ ] Production compose serves a built frontend artifact instead of `vite dev`.
- [ ] Caddy applies the approved security-header baseline without breaking existing `/api` or React Router routing.

### UX/design acceptance
- [ ] Admin login failure UX remains compatible with the current login + optional MFA flow after lockout handling is added.
- [ ] Chat refresh-time rehydration still works without re-entering the room password on every page refresh.
- [ ] Expired, revoked, or non-restorable chat sessions return the user to a clear restartable join state.

### Data/integration acceptance
- [ ] All browser-facing API routes remain under `/api` and keep the existing product DTO families unless a task explicitly narrows a security-sensitive field.
- [ ] Chat upload rules remain aligned with `media-storage.md` and `chat-room-live-integration.md` while tightening server validation.
- [ ] Chat live updates remain room-gated and keep the `24` hour room-session model.
- [ ] Security-header changes preserve protected media behavior, public photo delivery, and React Router fallback behind Caddy.
- [ ] Any lockfile/reproducibility change preserves Bun as the frontend and backend package/runtime toolchain.

### Operational acceptance
- [ ] Verification covers production-startup rejection for missing/default auth secrets.
- [ ] Verification covers CORS behavior, rate-limit responses, and MFA lockout behavior.
- [ ] Verification covers real or provider-stubbed MFA delivery outside `test`.
- [ ] Verification covers upload signature rejection, protected media `nosniff`, and WebSocket auth changes.
- [ ] Verification covers chat session rehydration after the browser-storage change.
- [ ] Verification covers Caddy header behavior and the production frontend serving path.
- [ ] Backend boundary verification still passes after auth/chat hardening changes.

### Explicit non-goals or exclusions
- [ ] No new public product surface is introduced.
- [ ] No multi-room chat redesign is introduced.
- [ ] No change from Bun, Hono, Prisma, Postgres, React, or Vite is introduced.
- [ ] No admin multi-user auth redesign is introduced beyond the existing email/password + optional MFA model.
- [ ] No unrelated content, CMS, or visual redesign work is bundled into these tasks.

## Dependencies
- [docs/security-review-2026-05-03.md](/Users/vinicius/Projects/vinicius.dev/docs/security-review-2026-05-03.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [chat-room-live-integration.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/chat-room-live-integration.md)
- [frontend-admin-auth-integration.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-admin-auth-integration.md)
- [media-storage.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/media-storage.md)
- [admin-cms.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/admin-cms.md)
- [infra-deployment.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/infra-deployment.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)

## Open Questions
- Which provider should back MFA delivery first: SMTP, Resend, or another lightweight transactional email adapter?
- Should WebSocket auth move to `Sec-WebSocket-Protocol` or a first-message authentication envelope, given Bun and reverse-proxy behavior?
- Is refresh-only persistence enough for chat rehydration, allowing `sessionStorage`, or is there still a product need for browser-restart persistence that requires an opaque rejoin reference?
- Should full moderation audit snapshots remain persistence-only and expose a narrower admin DTO, or should the admin API keep an explicit typed subset of the state?

## Task-Splitting Notes
- Primary spec ID: `SPEC-031`.
- Start with the critical/high tasks and keep the tracker on `Spec-ready` or `Todo` only after this spec is approved.
- Do not parallelize tasks that rewrite the same chat adapter/module files unless one lands first.

### Review finding to task map
| Review finding | Priority | Planned task | Notes |
| --- | --- | --- | --- |
| Hardcoded default auth secrets in production | Critical | `SEC-001` | Must block production startup and require compose env wiring. |
| Configured CORS never applied | Critical | `SEC-002` | Pair with abuse-control middleware in the same adapter slice. |
| MFA brute force via unlimited attempts | High | `SEC-003` | Lock/expire after the approved attempt ceiling. |
| MFA delivery wired to noop in production | High | `SEC-003` | Same auth slice; keep noop limited to `test`. |
| No rate limiting on auth/chat endpoints | High | `SEC-002` | Same HTTP adapter surface as CORS. |
| Chat session id exposed in WebSocket query param | Medium | `SEC-006` | Backend-led contract change. |
| Chat session bearer stored in `localStorage` | High | `SEC-007` | Frontend follow-up after the handshake/storage decision. |
| No chat message body length limit | Medium | `SEC-004` | Same request-validation slice as upload request cleanup. |
| Upload route trusts internal IDs from form body | Low | `SEC-004` | Resolve room/author from validated session. |
| Upload MIME validation trusts client `Content-Type` | Medium | `SEC-005` | Add signature checks. |
| Protected media missing `nosniff` | Low | `SEC-005` | Route-level response header. |
| Room password uses `Math.random()` | Medium | `SEC-008` | Replace with CSPRNG. |
| Readable room-password key uses raw SHA-256 | Info | `SEC-008` | Replace with HKDF while touching the same crypto path. |
| Moderation audit API exposes raw JSON blobs | Medium | `SEC-008` | Narrow to typed/redacted DTOs. |
| No generic security headers in app/Caddy | Low | `SEC-009` | Caddy-owned baseline plus route compatibility checks. |
| Production compose runs `vite dev` | Low | `SEC-009` | Replace with built frontend serving path. |
| Dependency lockfile/runtime reproducibility drift | Info | `SEC-009` | Revalidate current repo state and tighten runtime install/build path if still applicable. |

### Phase order
- Phase 1: `SEC-001`, `SEC-002`, `SEC-003`
- Phase 2: `SEC-004`, `SEC-005`, `SEC-006`, `SEC-007`, `SEC-008`
- Phase 3: `SEC-009`

### Task 1
- Task ID: `SEC-001`
- Title: `Production secret enforcement and env contract`
- Layer: `infra`
- Base branch: `develop`
- Branch name: `infra/SEC-001-production-secret-enforcement`
- Merge target: `develop`
- Primary acceptance source: this spec
- Review requirement: yes; `SEC-001` may not self-merge
- Verification method: backend startup checks in production-mode config tests plus compose/env contract review
- Scope:
  - reject default or missing auth secrets in production config loading
  - require `AUTH_SESSION_SECRET` and `AUTH_ROOM_PASSWORD_SECRET` in the production compose contract
  - align any env examples or operator-facing runtime notes needed by the code change
- Non-scope:
  - CORS or rate limiting
  - MFA delivery
  - Caddy header changes

### Task 2
- Task ID: `SEC-002`
- Title: `Apply backend CORS policy and abuse-rate limits`
- Layer: `backend`
- Base branch: `develop`
- Branch name: `backend/SEC-002-cors-and-rate-limits`
- Merge target: `develop`
- Primary acceptance source: this spec
- Review requirement: yes; `SEC-002` may not self-merge
- Verification method: adapter tests for CORS headers plus route-level rate-limit verification for login, MFA, join, send, and upload
- Scope:
  - wire Hono CORS middleware from existing bootstrap config
  - enforce the approved methods, headers, and credentials policy
  - add explicit rate limits for admin auth and chat abuse entry points
- Non-scope:
  - MFA challenge state logic
  - WebSocket auth transport
  - edge security headers

### Task 3
- Task ID: `SEC-003`
- Title: `MFA challenge lockout and production delivery`
- Layer: `backend`
- Base branch: `develop`
- Branch name: `backend/SEC-003-mfa-lockout-and-delivery`
- Merge target: `develop`
- Primary acceptance source: this spec
- Review requirement: yes; `SEC-003` may not self-merge
- Verification method: auth use-case tests for attempt ceiling/expiry plus provider-backed or provider-stubbed delivery verification outside `test`
- Scope:
  - enforce a failed-attempt ceiling for MFA challenges
  - expire or revoke challenges once the ceiling is reached
  - wire a real non-test MFA delivery adapter
  - keep any debug-only code-delivery fallback constrained to development only
- Non-scope:
  - primary password-login UX redesign
  - rate limiting outside the auth slice

### Task 4
- Task ID: `SEC-004`
- Title: `Chat request validation hardening`
- Layer: `backend`
- Base branch: `develop`
- Branch name: `backend/SEC-004-chat-request-validation-hardening`
- Merge target: `develop`
- Primary acceptance source: this spec
- Review requirement: yes; `SEC-004` may not self-merge
- Verification method: HTTP adapter tests for overlong message rejection and upload request contract validation
- Scope:
  - cap chat message bodies at `2000` characters
  - stop trusting `roomId` and `authorHandleId` from the upload form body
  - resolve room and author context from the validated room session before entering the use case
- Non-scope:
  - file-signature validation
  - browser storage changes

### Task 5
- Task ID: `SEC-005`
- Title: `Upload signature and protected media hardening`
- Layer: `backend`
- Base branch: `develop`
- Branch name: `backend/SEC-005-upload-media-signature-hardening`
- Merge target: `develop`
- Primary acceptance source: this spec
- Review requirement: yes; `SEC-005` may not self-merge
- Verification method: upload/media adapter tests for JPEG, PNG, WebP signature acceptance and mismatch rejection plus response-header checks
- Scope:
  - validate uploaded file signatures after reading the bytes
  - reject declared MIME types that do not match JPEG, PNG, or WebP signatures
  - add `X-Content-Type-Options: nosniff` on protected chat media responses
- Non-scope:
  - generic Caddy headers
  - chat-session storage

### Task 6
- Task ID: `SEC-006`
- Title: `WebSocket chat auth transport hardening`
- Layer: `backend`
- Base branch: `develop`
- Branch name: `backend/SEC-006-websocket-auth-transport-hardening`
- Merge target: `develop`
- Primary acceptance source: this spec
- Depends on: `SEC-002`
- Review requirement: yes; `SEC-006` may not self-merge
- Verification method: live-chat contract verification showing successful connect without query-string session auth plus revoked/expired-session handling
- Scope:
  - remove room-session auth from the WebSocket query string
  - introduce the approved replacement handshake contract
  - keep room/session validation and disconnect behavior aligned with `chat-room-live-integration.md`
- Non-scope:
  - browser storage migration
  - room-password crypto changes

### Task 7
- Task ID: `SEC-007`
- Title: `Chat client session storage hardening`
- Layer: `frontend`
- Base branch: `develop`
- Branch name: `frontend/SEC-007-chat-session-storage-hardening`
- Merge target: `develop`
- Primary acceptance source: this spec
- Depends on: `SEC-006`
- Review requirement: yes; `SEC-007` may not self-merge
- Verification method: frontend/manual verification for refresh-time rehydration, expired-session fallback, and absence of active session bearer data in `localStorage`
- Scope:
  - replace `localStorage` persistence of the active room-session bearer
  - align the chat page runtime with the approved rehydration/storage model
  - keep refresh-time room re-entry UX compatible with the existing `/chat` flow
- Non-scope:
  - backend rate limiting
  - upload signature checks

### Task 8
- Task ID: `SEC-008`
- Title: `Chat crypto and moderation audit hardening`
- Layer: `backend`
- Base branch: `develop`
- Branch name: `backend/SEC-008-chat-crypto-and-audit-hardening`
- Merge target: `develop`
- Primary acceptance source: this spec
- Review requirement: yes; `SEC-008` may not self-merge
- Verification method: unit/repository tests for password generation and key derivation plus admin DTO verification for narrowed audit payloads
- Scope:
  - replace `Math.random()` room-password generation with a CSPRNG
  - replace raw-SHA-256 key derivation with HKDF for readable room-password encryption
  - map moderation audit responses through explicit typed/redacted DTOs
- Non-scope:
  - MFA delivery
  - Caddy/static frontend serving

### Task 9
- Task ID: `SEC-009`
- Title: `Edge headers and production compose hardening`
- Layer: `infra`
- Base branch: `develop`
- Branch name: `infra/SEC-009-edge-headers-and-production-compose`
- Merge target: `develop`
- Primary acceptance source: this spec
- Depends on: `SEC-001`
- Review requirement: yes; `SEC-009` may not self-merge
- Verification method: Caddy/compose diff review plus production-path smoke verification for `/`, `/admin`, `/api`, and media routing
- Scope:
  - add the approved edge security-header baseline in `infra/caddy/Caddyfile`
  - replace production `vite dev` serving with a built frontend artifact/static serving path
  - revalidate the dependency-lockfile/runtime-install finding and tighten the production build/runtime path if it still applies
- Non-scope:
  - auth-domain logic
  - chat message/request validation

## Git Branch Implications
- This spec must be authored on `spec/SPEC-031-security-hardening-production-readiness` from `develop`.
- Implementation must not start until `SPEC-031` is reviewed and merged into `develop`.
- `SEC-001` through `SEC-009` each require their own task branch, tracker entry, and reviewed merge commit.
- Because several tasks touch chat adapter files, only parallelize the pairs explicitly marked dependency-safe by the approved execution plan.
- Do not bundle unrelated public content, CMS, design, or deployment-policy changes into these security tasks.
