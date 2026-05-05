# Chat Room Live Integration

## Purpose
Define the first real chat integration wave so the frontend chat room stops relying on local mock state and instead uses backend room access, persistent sessions, live message delivery, and protected image uploads.

## Scope
- admin-facing chat room access management on `/admin/dashboard`
- backend-generated room password visibility and rotation
- chat room join, session persistence, and refresh-time rehydration
- real participant and message loading
- near-real-time room updates
- chat image upload, protected image rendering, and fullscreen viewing
- task decomposition for three implementation slices

## Locked Decisions
- The v1 site continues to expose exactly one public chat room.
- The chat room slug is hardcoded as `night-shift`.
- The frontend chat page must switch from the gate to an empty/loading real room immediately after a successful backend join; it must not keep the local mock timeline.
- Chat room sessions persist across refresh for up to `24` hours and then require re-entry with the room password.
- Session expiry must be enforced both server-side and client-side.
- Admin rotates the room password from the dashboard, but the backend generates the next password.
- The currently active room password remains visible to authenticated admins on the dashboard.
- To support dashboard visibility after refresh, backend persistence keeps both a verification hash and an admin-readable encrypted display value for the active room password.
- Join failures caused by bans must surface explicit banned-state UI rather than generic denied messaging.
- Near-real-time chat delivery uses a room-scoped native WebSocket connection, not polling and not Socket.IO.
- Initial room bootstrap remains HTTP-first: join, session validation, participant list, paginated history, text send, upload, and protected media fetch stay under `/api/chat/*`.
- Infinite scroll is the required message history UX.
- Chat uploads continue to allow only `image/jpeg`, `image/png`, and `image/webp`, max `5 MB`, one image per message.
- Chat uploads must support local preview before send and visible upload progress during transfer.
- Clicking a chat image opens a fullscreen viewer in the frontend.
- Protected chat images continue to require room-gated backend access and must not be exposed as a public static directory.
- Frontend route ownership stays in `app/routes`; request logic stays in page, feature, entity, or shared public APIs rather than inline route definitions.

## Interfaces and Responsibilities
### Frontend structure targets
- `frontend/src/pages/chat/room`
  - owns the route-facing chat room shell, refresh-time session rehydration, empty/loading state, error state, and fullscreen image viewer composition
- `frontend/src/features/enter-chat-room`
  - owns join-room submission, banned/denied error mapping, and persisted session bootstrap helpers
- `frontend/src/features/send-chat-message`
  - owns text-message send mutations and optimistic-disabled composer behavior
- `frontend/src/features/upload-chat-image`
  - owns local preview, upload progress tracking, protected image fetch helpers, and fullscreen-viewer image lifecycle helpers
- `frontend/src/entities/chat`
  - owns room session, participant, message, attachment, and live-event DTO/view-model types
- `frontend/src/pages/admin/dashboard`
  - extends the existing loader/UI to show the current room password, password rotation metadata, and the rotate action for `night-shift`

### Backend HTTP contracts
#### `POST /api/chat/rooms/:slug/join`
- request remains `{ "handle": string, "password": string }`
- successful response continues to include `room`, `participant`, and `session`
- `session` must additionally include `expiresAt`
- `403 { "error": "denied", "resource": "chat", "reason": "handle_banned" }` is the banned response contract

#### `GET /api/chat/rooms/:slug/session`
- requires `x-chat-room-session-id`
- validates a persisted chat session during page refresh/bootstrap
- returns the current `room`, `participant`, and `session` payload when the session is still active
- returns denied/not-found style auth failure when the session is missing, expired, revoked, or bound to another room

#### `GET /api/chat/rooms/:slug/participants`
- remains the HTTP source for the current participant snapshot

#### `GET /api/chat/rooms/:slug/messages`
- remains the HTTP source for cursor-paginated history
- powers infinite scroll in the frontend

#### `POST /api/chat/rooms/:slug/messages`
- remains the HTTP endpoint for text-only sends

#### `POST /api/chat/messages/upload`
- remains the HTTP endpoint for one-image message sends
- frontend upload progress is required, so the frontend upload feature may use `XMLHttpRequest` behind its public API instead of `fetch`

#### `GET /api/chat/uploads/:id/media`
- remains protected by room session access
- frontend fetches media with `x-chat-room-session-id`, converts it to object URLs, and renders those object URLs in both message cards and fullscreen viewer states

### Backend live-update contract
#### `GET /api/chat/rooms/:slug/live?sessionId=<roomSessionId>`
- upgrades to a native WebSocket connection after the frontend has already joined or revalidated the room over HTTP
- validates that `sessionId` is active and bound to the room slug before completing the upgrade
- closes the socket when the room session expires, is revoked, or becomes invalid after password rotation

Live event families:
- `message.created`
  - emitted after successful text sends or upload-backed sends
  - payload shape matches the chat message DTO used by HTTP history responses
- `participant.snapshot`
  - emitted on connect and when participant presence materially changes
- `session.revoked`
  - emitted when the active room session is no longer valid, including room password rotation fallout
- `room.password_rotated`
  - optional server event if implementation benefits from distinguishing rotation-caused disconnects from generic revocation

### Admin room access contracts
#### `GET /api/admin/chat/rooms/:slug/access`
- requires authenticated admin session cookie
- returns the current room access details for dashboard display
- response includes:
  - `room.id`
  - `room.slug`
  - `currentPassword`
  - `passwordVersion`
  - `passwordRotatedAt`
  - `sessionTtlHours`

#### `POST /api/admin/chat/rooms/:slug/password-rotation`
- requires authenticated admin session cookie
- backend generates the next password; the request body carries only optional operator metadata such as `reason`
- response includes:
  - `auditId`
  - `generatedPassword`
  - `revokedSessionCount`
  - `room.id`
  - `room.slug`
  - `room.passwordVersion`
  - `room.passwordRotatedAt`
  - `rotation.id`
  - `rotation.rotatedAt`
- the generated password becomes the dashboard-visible current password value for subsequent admin reads

### Persistence and security responsibilities
- `ChatRoom` persistence must support:
  - password verification hash
  - encrypted admin-readable current password display value
  - password version and rotation timestamp
- `ChatRoomSession` persistence must support a hard `24` hour expiry window
- rotation revokes active room sessions so previously joined users must re-enter with the new password
- chat core use cases must stay hexagonal and not depend directly on WebSocket, Hono, Prisma, filesystem, or browser APIs

## Data/Contracts Touched
- chat room join/session DTOs
- chat session persistence and expiry fields
- admin chat room access DTOs
- chat room password rotation DTOs
- encrypted current-password persistence contract
- WebSocket event envelopes and room-session validation rules
- infinite-scroll message history contract
- protected media fetch and object-URL lifecycle rules
- upload progress and preview view-model contracts
- fullscreen image viewer state

## Acceptance Checklist
### Functional acceptance
- [ ] The public `/chat` route uses backend join and session validation instead of local mock gating.
- [ ] A successful join transitions into an empty/loading real room state immediately.
- [ ] Chat room sessions survive refresh for up to `24` hours and then require the user to re-enter the room password.
- [ ] Explicit banned-handle responses render explicit banned-state UI.
- [ ] The admin dashboard shows the currently active `night-shift` room password and rotation metadata.
- [ ] Admin password rotation generates the next password on the backend and updates the dashboard-visible current password value.
- [ ] Real chat messages load from the backend and support infinite-scroll history.
- [ ] Near-real-time message and participant updates arrive through a native WebSocket connection.
- [ ] Chat image sends support local preview, upload progress, protected rendering, and fullscreen viewing.

### UX/design acceptance
- [ ] The current chat route visual design remains compatible with the migrated public shell and CRT styling.
- [ ] Empty/loading/error states are intentional and replace mock-only messaging.
- [ ] Join denial copy distinguishes banned handles from generic wrong-password or expired-session failures.
- [ ] Upload preview, progress, and fullscreen states feel integrated with the existing chat composer and timeline design.
- [ ] Admin dashboard access controls remain compatible with the current migrated admin surface.

### Data/integration acceptance
- [ ] All browser-facing chat APIs continue to use `/api` as the base path.
- [ ] Chat session validation and room history remain compatible with the one-room `night-shift` contract.
- [ ] WebSocket authentication relies on a validated room session id and does not introduce public unauthenticated room subscriptions.
- [ ] Backend persistence supports both password verification and admin-readable current-password recovery for the single room.
- [ ] Protected media rendering does not require unauthenticated static access and does not leak raw storage paths to the frontend.
- [ ] Upload validation continues to enforce allowed MIME types, one-file-per-message, and the `5 MB` limit.

### Operational acceptance
- [ ] Frontend verification covers chat join, refresh-time session rehydration, infinite history loading, live updates, image upload progress, and fullscreen image viewing against a running backend.
- [ ] Backend verification covers chat session expiry, room password rotation, revocation fallout, WebSocket authorization, and protected media access.
- [ ] Backend boundary verification still passes after adding live-update and password-display support.
- [ ] No deployment contract breaks `/api/*`, React Router fallback, or room-gated media routing behind Caddy.

### Explicit non-goals or exclusions
- [ ] No multi-room chat support is introduced.
- [ ] No public anonymous media URLs are introduced for chat uploads.
- [ ] No drag-and-drop, multi-file upload, audio/video upload, or message edit feature is included.
- [ ] No Socket.IO dependency is introduced.
- [ ] No admin multi-user workflow change is included beyond the existing private single-admin model.

## Dependencies
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [frontend-admin-auth-integration.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-admin-auth-integration.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [data-model.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/data-model.md)
- [media-storage.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/media-storage.md)
- [admin-cms.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/admin-cms.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)

## Open Questions
- Whether the admin-readable current password should live in the existing `ChatRoom` record or in a dedicated chat-settings persistence record can be finalized during implementation as long as the retrieval and boundary contracts stay intact.
- Whether the protected fullscreen viewer prefetches adjacent room images or stays single-image-only can be finalized in `CHAT-010`.

## Task-Splitting Notes
- Primary spec ID: `SPEC-030`.
- Keep the work in three serial tasks because each step depends on the previous backend/frontend contract becoming stable.

### Task 1
- Task ID: `CHAT-008`
- Title: `Chat room password rotation and persisted join flow`
- Layer: `admin`
- Base branch: `develop`
- Branch name: `admin/CHAT-008-chat-password-rotation-and-room-gate`
- Merge target: `develop`
- Primary acceptance source: this spec
- Scope:
  - backend-generated room password contract
  - admin dashboard room access panel
  - `24` hour chat session expiry and persistence
  - chat join + session validation integration
  - empty/loading real room bootstrap state
- Non-scope:
  - live WebSocket delivery
  - real message history rendering beyond room bootstrap placeholders
  - file uploads

### Task 2
- Task ID: `CHAT-009`
- Title: `Realtime chat messages and participant stream`
- Layer: `frontend`
- Base branch: `develop`
- Branch name: `frontend/CHAT-009-chat-realtime-messages`
- Merge target: `develop`
- Primary acceptance source: this spec
- Depends on: `CHAT-008`
- Scope:
  - real participant snapshot loading
  - cursor-paginated infinite history
  - text message send
  - room-scoped WebSocket live updates
  - revoked/expired live-session handling
- Non-scope:
  - image upload UX
  - fullscreen media viewer

### Task 3
- Task ID: `CHAT-010`
- Title: `Chat image uploads and protected fullscreen viewer`
- Layer: `frontend`
- Base branch: `develop`
- Branch name: `frontend/CHAT-010-chat-image-uploads-and-viewer`
- Merge target: `develop`
- Primary acceptance source: this spec
- Depends on: `CHAT-009`
- Scope:
  - local preview before send
  - upload progress UI
  - protected image fetch/object URL lifecycle
  - in-message image rendering
  - fullscreen viewer
- Non-scope:
  - drag-and-drop or multi-file upload
  - non-image attachments

## Git Branch Implications
- This spec must be authored on `spec/SPEC-030-chat-room-live-integration` from `develop`.
- Implementation must not start until `SPEC-030` is reviewed and merged into `develop`.
- `CHAT-008`, `CHAT-009`, and `CHAT-010` must each use their own task branch and reviewed merge commit.
- Do not bundle unrelated public content, admin CRUD, or deployment work into these chat tasks.
