# Security & Bug Review — vinicius.dev — 2026-05-03

## Summary

- **2 critical, 4 high, 5 medium, 2 low, 2 info** across 10 of 12 categories.
- Top 3 things to fix this week:
  1. Require `AUTH_SESSION_SECRET` and `AUTH_ROOM_PASSWORD_SECRET` in the production environment; fail startup on defaults.
  2. Wire the CORS middleware that is already configured but never applied.
  3. Lock MFA challenges after N failed attempts and implement a real MFA delivery adapter.

## Legend

- **Critical** — Unauthenticated RCE, auth bypass, full DB read/write, secret exfil.
- **High** — Authenticated privilege escalation, stored XSS in admin, path traversal, CSRF on destructive admin action, broken security control.
- **Medium** — Missing rate limit, weak crypto without immediate exploit, info disclosure of non-PII.
- **Low** — Missing security header where Caddy likely covers it, verbose errors in dev path.
- **Info** — Hardening suggestions, defense-in-depth.

---

## Findings by Category

### 1. AuthN / AuthZ

#### [CRITICAL] Hardcoded default secrets ship to production with no enforcement

- **Where**: `backend/src/bootstrap/config/bootstrap-config.ts:19,23` and `infra/caddy/Caddyfile`, `docker-compose.yml`
- **What**: `DEFAULT_SESSION_SECRET = "development-session-secret"` and `DEFAULT_ROOM_PASSWORD_SECRET = "development-room-password-secret"` are used as fallback values when `AUTH_SESSION_SECRET` and `AUTH_ROOM_PASSWORD_SECRET` are not set. The `docker-compose.yml` does not set these variables, and there is no startup assertion that rejects weak defaults in production. An operator who deploys the `docker-compose.yml` without adding these env vars to `.env` will run production with the public default secrets.
- **Impact**: Admin session tokens are HMAC-signed with `sha256("development-session-secret")`. Anyone who knows the secret (it is public in this repo) can forge valid HMAC tokens. The room password AES-256-GCM key is derived from `sha256("development-room-password-secret")`, so the current room plaintext password can be decrypted from any DB backup.
- **Reproduce**:
  ```
  AUTH_SESSION_SECRET not set → loadBootstrapConfig returns sessionSecret: "development-session-secret"
  curl -X POST /api/auth/login … → obtain tokenHash → HMAC-forge any session
  ```
- **Fix**: In `loadBootstrapConfig`, add:
  ```ts
  if (env.NODE_ENV === "production" && config.auth.sessionSecret === DEFAULT_SESSION_SECRET) {
    throw new Error("AUTH_SESSION_SECRET must be set in production");
  }
  // same for roomPasswordSecret
  ```
  Also add `AUTH_SESSION_SECRET` and `AUTH_ROOM_PASSWORD_SECRET` to `docker-compose.yml` as required variables with no default (use `${AUTH_SESSION_SECRET:?must be set}`).
- **Effort**: S

#### [CRITICAL] CORS middleware configured but never applied — any origin gets credentialed access

- **Where**: `backend/src/bootstrap/config/bootstrap-config.ts:225-226` (config parsed), `backend/src/adapters/inbound/http/hono/http-adapter.ts:2621-2642` (no cors middleware wired)
- **What**: `config.cors.allowedOrigins` and `config.cors.allowCredentials` are parsed from env vars and stored in `BootstrapConfig`, but `createHonoHttpAdapter` never imports or registers `hono/cors` or any equivalent middleware. As a result, the Hono app sends no `Access-Control-Allow-Origin` header by default and the browser enforces same-origin policy — but if Caddy or any reverse proxy injects permissive CORS, or if someone calls the API directly, there is no backend enforcement. More importantly, `credentials: 'include'` is used in all frontend fetch calls (shared/api/index.ts:52), which with an absent backend CORS header causes the browser to block responses silently — this is a broken API surface, not a defence.
- **Impact**: In the current state, third-party origins cannot receive credentialed responses (browser enforcement), but the configured allowlist is entirely dead code. If the proxy ever adds `Access-Control-Allow-Origin: *`, all credentialed endpoints become cross-origin accessible. Intended CORS policy is unenforced.
- **Fix**: In `createHonoHttpAdapter`, add:
  ```ts
  import { cors } from "hono/cors";
  app.use("*", cors({
    origin: container.config.cors.allowedOrigins,
    credentials: container.config.cors.allowCredentials,
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "x-chat-room-session-id"],
  }));
  ```
- **Effort**: S

#### [HIGH] MFA challenge has no attempt lockout — unlimited brute force

- **Where**: `backend/src/modules/auth/application/index.ts:381-388`
- **What**: `incrementMfaChallengeAttempts` is called on a wrong code, but the `attempts` counter is never read back to expire or lock the challenge. A 6-digit numeric code has 10^6 = 1,000,000 possible values; with 10-minute expiry and no lockout, an attacker who intercepts the `challengeId` (returned in the `mfa_required` response) can enumerate all codes.
- **Impact**: Authenticated admin takeover if an attacker can obtain a `challengeId`. The `challengeId` is returned in the HTTP response to the login call, so an attacker who can issue a login request and read the response has the ID.
- **Reproduce**:
  ```bash
  # 1. POST /api/auth/login with valid credentials → get challengeId
  # 2. Loop: POST /api/auth/mfa/verify with challengeId and code 000000..999999
  # No lockout; rate limit absent (see finding below)
  ```
- **Fix**: In `createVerifyMfaChallengeUseCase`, after incrementing attempts, check:
  ```ts
  const MAX_MFA_ATTEMPTS = 5;
  const updated = await repository.incrementMfaChallengeAttempts(challengeId);
  if ((updated?.attempts ?? 0) >= MAX_MFA_ATTEMPTS) {
    await repository.markMfaChallengeExpired({ challengeId, expiredAt: now });
    throw new InvalidAuthCredentialsError();
  }
  ```
  The `AdminMfaChallenge.attempts` column already exists (`schema.prisma:155`).
- **Effort**: S

#### [HIGH] MFA delivery is a no-op in production — codes are generated but never sent

- **Where**: `backend/src/bootstrap/container/create-container.ts:218`
- **What**: `createNoopAuthMfaMessagePort()` is always wired for the production container. `createLoginWithCredentialsUseCase` generates a real code, hashes it, stores it in Postgres, then calls `mfaMessage.sendMfaChallenge(...)` — which is the noop. The admin receives no email. Unless `AUTH_MFA_ENABLED=false` (which entirely skips MFA), login is stuck in `mfa_required` state forever with a code the admin can never see.
- **Impact**: Admin login is broken when MFA is enabled. An operator who sets `AUTH_MFA_ENABLED=false` as a workaround disables MFA entirely, leaving the admin panel protected only by password.
- **Fix**: Implement an email delivery adapter (e.g., using Resend, Nodemailer, or SMTP) and wire it in the container. Keep the noop only for `test` env. Alternatively, expose a `LOG_MFA_CODE` debug flag in `development` only that prints the code to stdout.
- **Effort**: M

### 2. Input Validation & Injection

#### [MEDIUM] No message body length limit on `POST /api/chat/rooms/:slug/messages`

- **Where**: `backend/src/adapters/inbound/http/hono/http-adapter.ts:1134` (`readRequiredJsonString`)
- **What**: The `body` field of a chat message is validated only for non-empty. There is no maximum length check. A single message can contain arbitrarily large text that gets stored in `ChatMessage.body TEXT` column and broadcast to all WebSocket clients in the room.
- **Impact**: Storage exhaustion, large WebSocket frames causing client-side memory pressure, potential denial of service.
- **Fix**: Add a max-length guard:
  ```ts
  if (body.value.length > 2000) {
    return c.json({ error: "invalid_request", field: "body" }, 400);
  }
  ```
- **Effort**: S

No `$queryRaw` / `$executeRaw` usage found. All Prisma queries use typed ORM methods with explicit `select` clauses. No injection risk found in persistence adapters.

### 3. File Uploads & Media Serving

#### [MEDIUM] MIME type validation trusts the client-supplied `Content-Type` header, no magic-byte check

- **Where**: `backend/src/adapters/inbound/http/hono/http-adapter.ts:1336-1357`
- **What**: `uploadFile.type` is the browser-provided MIME type from the `File` object. The allowlist check (`isSupportedChatUploadMimeType`) and the config check (`chatUploadAllowedMimeTypes.includes(mimeType)`) both rely on this client-controlled value. A malicious client can set `.type = "image/jpeg"` on any file (e.g., an HTML file, an SVG with embedded JS, or a ZIP). The file is stored and served back as `Content-Type: image/jpeg` based on the database-stored MIME type.
- **Impact**: Stored XSS via SVG (`Content-Type: image/jpeg` + magic bytes of an SVG can confuse some clients); polyglot file attacks. The `chat/uploads/:id/media` route serves with the stored MIME type, so a stored `image/svg+xml` would execute scripts in some browsers.
- **Fix**: After `arrayBuffer()`, check the first few magic bytes before persisting. For JPEG: `[0xFF, 0xD8, 0xFF]`; PNG: `[0x89, 0x50, 0x4E, 0x47]`; WebP: bytes 8–11 = `57 45 42 50`. Reject if they don't match. Also add `X-Content-Type-Options: nosniff` on the upload media route (currently absent at app layer).
- **Effort**: M

Path traversal: The filesystem adapter's `createSafeStoragePathResolver` correctly rejects absolute paths, `..` segments, and symlinks. No finding.

Photo originals: Served only after `getPublishedPhotoById.execute()` confirms the photo is published — draft photos are blocked. Auth check is present and correct.

### 4. WebSocket / Live Chat

#### [MEDIUM] Chat session ID exposed in WebSocket URL query parameter — logged by proxies and servers

- **Where**: `frontend/src/entities/chat/api/room-runtime.ts:198` and `backend/src/adapters/inbound/http/hono/http-adapter.ts:889`
- **What**: The WebSocket is opened as `wss://…/chat/rooms/night-shift/live?sessionId=<id>`. The session ID appears in the URL, which is recorded in Caddy/Nginx access logs, browser history, and can appear in `Referer` headers if the page navigates. The same session ID is also stored in `localStorage`.
- **Impact**: Any party with access to server logs can extract active session IDs. Combined with the localStorage storage (below), it is a secondary exposure channel.
- **Fix**: Pass the session ID as the WebSocket sub-protocol header (`Sec-WebSocket-Protocol`) or verify the first message the client sends after upgrade. Alternatively, issue a short-lived single-use WS token from a dedicated HTTP endpoint, scoped to one upgrade, that is not logged.
- **Effort**: M

No cross-room broadcast leakage found: `createChatLiveManager` scopes by `roomSlug` and `roomSessionId`. No message-size cap on incoming WS messages is configured in the `Bun.serve({ websocket })` block — Bun default is 16 MB; worth capping to 4 KB for chat.

### 5. Transport & Headers

#### [LOW] No application-layer security headers — Caddyfile also does not set them

- **Where**: `infra/caddy/Caddyfile` (entire file), `backend/src/adapters/inbound/http/hono/http-adapter.ts` (entire file)
- **What**: Neither the Hono app nor the Caddyfile sets `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy`. HSTS is handled by Caddy's automatic HTTPS, but the explicit `header` directive is absent.
- **Impact**: Clickjacking risk; content sniffing by older browsers; weaker Referer control. Chat image uploads served without `nosniff` can be sniffed as HTML.
- **Fix**: Add to the Caddyfile:
  ```
  header {
    X-Content-Type-Options "nosniff"
    X-Frame-Options "SAMEORIGIN"
    Referrer-Policy "strict-origin-when-cross-origin"
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Content-Security-Policy "default-src 'self'; connect-src 'self' wss:; img-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self'"
  }
  ```
  Adjust CSP after auditing inline styles.
- **Effort**: S

### 6. Rate Limiting & Abuse

#### [HIGH] No rate limiting on any endpoint

- **Where**: `backend/src/adapters/inbound/http/hono/http-adapter.ts` (entire file), `backend/src/bootstrap/server.ts`
- **What**: None of the following endpoints have any rate limiting: `POST /api/auth/login`, `POST /api/auth/mfa/verify`, `POST /api/chat/rooms/:slug/join`, `POST /api/chat/rooms/:slug/messages`, `POST /api/chat/messages/upload`.
- **Impact**: Credential stuffing on admin login; MFA brute force (see separate finding); password brute force on room join; message flood DoS; upload spam filling storage.
- **Fix**: Add `hono-rate-limiter` or a lightweight in-process token bucket. Recommended limits: login 5/min, MFA 10/min, room join 10/min, message send 30/min per IP. Use `container.config.server.nodeEnv` to skip in test.
- **Effort**: M

### 7. Crypto

#### [MEDIUM] Room password generator uses `Math.random()` — non-cryptographic RNG

- **Where**: `backend/src/modules/chat/application/index.ts:837-842`
- **What**: `createReadableRoomPassword` uses `Math.floor(Math.random() * alphabet.length)` to pick characters. `Math.random()` is not a CSPRNG; V8's implementation is Xorshift128+, which is seedable and has been attacked to predict future values from observed output.
- **Impact**: An attacker who can observe a sequence of generated passwords (e.g., from leaked audit logs) may be able to predict future passwords.
- **Fix**: Replace with:
  ```ts
  const idx = new Uint32Array(1);
  crypto.getRandomValues(idx);
  return alphabet[idx[0] % alphabet.length];
  ```
  Or use `randomInt` from `node:crypto` which is already imported in auth.
- **Effort**: S

#### [INFO] AES-256-GCM key derived from raw SHA-256 of secret — no KDF

- **Where**: `backend/src/adapters/outbound/persistence/prisma/chat-repository.ts:37-38`
- **What**: `createReadablePasswordKey` calls `createHash("sha256").update(secret).digest()`. A single SHA-256 pass with no salt and no iteration count is not a proper KDF. If the secret is high-entropy (32+ random bytes), this is not a practical weakness. If the secret defaults to the `"development-room-password-secret"` string (see Critical finding above), the key is trivially recoverable.
- **Impact**: Low, assuming production uses a strong secret. Negligible additional attack surface beyond the default-secret finding.
- **Fix**: Replace with HKDF: `crypto.hkdfSync("sha256", secret, salt, "room-password-aes-key", 32)`. The cost is negligible for a per-rotation call.
- **Effort**: S

### 8. Data Exposure

#### [MEDIUM] Moderation audit records expose `previousState` and `nextState` JSON blobs to admin without field-level redaction

- **Where**: `backend/src/modules/chat/application/index.ts:393-423` (`mapChatModerationAuditOutput`)
- **What**: The audit output passes `previousState` and `nextState` verbatim to the API response. These JSON blobs contain message body snapshots at moderation time, upload file metadata, and internal DB state. The admin panel receives them, and they will eventually be displayed in the admin UI. While this is admin-only, the fields currently have no typing or sanitization — if the schema adds PII fields later, they would silently appear.
- **Impact**: Low risk today (admin-only endpoint), but worth flagging before the admin UI displays audit details.
- **Fix**: Define typed shapes for `previousState`/`nextState` per action and use explicit mappers rather than passing raw JSON.
- **Effort**: M

No stack traces in production 500s found. Hono's default error handler returns an empty 500 without details. No PII leakage in list endpoint responses found (email is masked in MFA response, IPs are not stored).

### 9. Dependency & Supply Chain

#### [INFO] No lockfile pinning of transitive dependencies in Docker

- **Where**: `docker-compose.yml:22` (`image: oven/bun:1.3.11-alpine`)
- **What**: The Bun runtime version is pinned by tag, but `bun.lockb` is not committed to the repository (`.gitignore` may exclude it). Without the lockfile, `bun install` in the Docker build can pull updated transitive dependencies.
- **Impact**: Supply chain drift; reproducibility failure.
- **Fix**: Commit `bun.lockb` and run `bun install --frozen-lockfile` in the Dockerfile.
- **Effort**: S

No known-CVE packages found in the dependency list. `react@19.2.5`, `hono@4.6.17`, `prisma@7.8.0`, `pg@8.20.0` are all current.

### 10. Frontend

#### [HIGH] Chat session token stored in `localStorage` — accessible to any XSS

- **Where**: `frontend/src/pages/chat/room/ui/ChatRoomPage.tsx:44-46,65-68`
- **What**: `window.localStorage.setItem(storageKey, JSON.stringify({ session, room, handle }))` persists the chat `session.id` (which is the HMAC-protected session token hash used to authenticate all chat API calls) in `localStorage`. Any JavaScript running in the page origin (injected by XSS, a compromised npm package, or a browser extension) can read and exfiltrate this token.
- **Impact**: Full chat session hijacking for any user who has an active session. The attacker can read all room messages, send messages, and access room uploads. In contrast, the admin session token is `HttpOnly` cookie and cannot be read by JS.
- **Note**: The spec mandates localStorage persistence for chat session rehydration. This is a design trade-off, not an accidental bug. Recommend documenting and considering a `sessionStorage` alternative (loses persistence on tab close, which may be acceptable given 24h TTL and re-join flow).
- **Fix** (partial): Shorten the stored token to a PKCE-style verifier; store only an opaque reference in localStorage and keep the actual token in `sessionStorage`. Or, if persistence across tabs/close is required, accept the risk and add a strict CSP to reduce XSS surface.
- **Effort**: M

No `dangerouslySetInnerHTML` usage found. No `javascript:` URLs found. All user-visible strings are rendered as React text nodes. No open redirects found in router.

All `VITE_*` env vars: none defined in the codebase — no frontend env secret leakage.

### 11. Logic / Correctness Bugs

#### [LOW] `POST /api/chat/messages/upload` accepts `roomId`, `authorHandleId` from untrusted form body — design diverges from other chat routes

- **Where**: `backend/src/adapters/inbound/http/hono/http-adapter.ts:1271-1287`
- **What**: All other chat routes authenticate via `x-chat-room-session-id` header + `slug` path param; the backend then resolves `roomId` and `handleId` from the session. The upload route takes `roomId`, `roomSessionId`, and `authorHandleId` all from the request body. While the use case does validate that the session owns the handle and room, this pattern is fragile: a future refactor could accidentally skip the backend check while trusting the body field. It also exposes internal IDs unnecessarily.
- **Fix**: Accept only `roomSessionId` from the body (or a header) and resolve `roomId`/`authorHandleId` from the session inside the use case, matching the pattern of all other routes.
- **Effort**: M

#### [INFO] `createOpenChatUploadMediaUseCase` properly scopes upload access to session room — confirmed clean

- **Where**: `backend/src/modules/chat/application/index.ts:976-982`
- **What**: `isRoomSessionActive(session, new Date(), upload.roomId)` checks that the session's `roomId` matches the upload's `roomId`. Confirmed correct.

### 12. Operational

#### [LOW] `docker-compose.yml` runs `vite dev` for frontend in production container

- **Where**: `docker-compose.yml:44`
- **What**: `command: sh -c "bun run dev --host 0.0.0.0 --port 5173"` runs the Vite development server in the production `docker-compose.yml`. This exposes HMR WebSocket, serves unminified source maps, and has higher memory usage than a static build served through Caddy.
- **Fix**: Add a `vite build` step and serve the `dist/` directory as static files via Caddy or a separate `caddy file-server` block.
- **Effort**: M

No missing indexes identified beyond what is already defined in `schema.prisma`. All FK columns on hot join paths have explicit `@@index` directives. No N+1 queries found in list endpoints (all use direct Prisma queries with explicit `select`).

---

## Categories with no findings

- **Prisma raw queries**: No `$queryRaw` / `$executeRaw` with interpolation found anywhere in the codebase.
- **Path traversal**: `createSafeStoragePathResolver` correctly handles `..`, absolute paths, and symlinks.
- **Session fixation**: Session token is regenerated on every login/MFA success; old tokens are revoked.
- **Cookie flags**: Admin session cookie sets `HttpOnly`, `SameSite=Lax`, and `Secure` (when `NODE_ENV=production`).
- **CSRF on admin mutations**: All state-changing admin routes are authenticated via `HttpOnly` cookie; `SameSite=Lax` blocks cross-origin POSTs. No additional CSRF token needed under this model.
- **Cross-room WebSocket leakage**: `chatLiveManager` scopes by `roomSlug`; broadcasts are room-local.
- **PII in API responses**: Email is masked in MFA challenge response. No IP or full email leaks found.
- **SVG upload stored XSS**: SVG is not in the allowed MIME type list (`image/jpeg`, `image/png`, `image/webp` only).

## Out of scope / deferred

- Physical file deletion for moderated uploads is deferred by the media policy in `docs/rules/product-and-platform.md`.
- Admin CRUD endpoints (create/update thoughts, projects, photos) — spec deferred, not yet implemented; no review scope.
- MFA email delivery implementation — acknowledged as a platform/security concern in `docs/rules/product-and-platform.md`.
- CI/CD pipeline hardening — out of scope for this review and governed by `docs/rules/product-and-platform.md`.

---

**Finding counts: 2 critical, 4 high, 5 medium, 2 low, 2 info**
