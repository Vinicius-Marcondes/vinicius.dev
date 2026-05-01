# Frontend Admin Auth Integration

## Purpose
Define the first live frontend-to-backend integration slice for the migrated frontend so local development and production-shaped routing use `/api` consistently and the admin login/dashboard flow stops relying on mocked local state.

## Scope
- frontend dev proxy configuration for `/api`
- shared frontend HTTP request conventions for backend DTO consumption
- admin credentials login and optional MFA verification flow
- admin dashboard summary loading and route protection
- frontend-only integration of existing backend auth/admin endpoints
- local verification expectations for frontend and backend running together

## Locked Decisions
- Frontend keeps `apiBaseUrl = '/api'` as the browser-facing base URL.
- Local development uses the Vite dev server to proxy `/api` to `http://localhost:3000`.
- This slice does not change backend route families or the `/api` prefix.
- Admin auth remains cookie-based; the frontend does not persist session tokens in `localStorage`, `sessionStorage`, or URL params.
- React Router Data Mode loaders and actions remain the default data and mutation boundary for this slice.
- Frontend request code is extracted into slice public APIs or `shared/api`; raw `fetch` calls do not live inline in route definitions.
- `/admin/login` remains public; `/admin` and `/admin/dashboard` require a valid backend admin session.
- Existing backend auth responses are treated as the source-of-truth contracts for this slice.
- This slice is limited to admin login and dashboard summary integration; it does not cover logout UI, public content API consumption, or admin CRUD.

## Interfaces and Responsibilities
- `frontend/vite.config.ts`
  - defines the local-development proxy rule for `/api`
  - forwards `/api/*` requests to backend port `3000`
  - does not define production reverse-proxy behavior
- `frontend/src/shared/api`
  - owns request primitives, JSON parsing, auth/admin error shaping, and credentialed requests
  - keeps `apiBaseUrl = '/api'` as the stable request base
- `frontend/src/features/login-admin`
  - owns workflow-specific auth mutations for `POST /api/auth/login` and `POST /api/auth/mfa/verify`
  - exposes typed functions or route-action helpers through a public API
- `frontend/src/pages/admin/login`
  - owns the login route-facing UI, route action orchestration, and credentials/MFA step transitions
  - submits email and password to backend instead of mutating mock-only local ready state
  - stores only the MFA challenge data needed to complete verification
  - surfaces generic auth errors without revealing whether an admin email exists
- `frontend/src/pages/admin/dashboard`
  - owns the protected page loader and summary mapping for `GET /api/admin/dashboard/summary`
  - redirects unauthenticated requests to `/admin/login`
- `frontend/src/app/routes/admin.tsx`
  - keeps route ownership in `app/routes`
  - wires login actions and dashboard loaders through page public APIs
  - keeps `/admin/login` public and `/admin` index aligned with dashboard protection
- `frontend/src/entities/admin-session`
  - may be introduced for shared auth/session DTO types if reuse appears during `FE-011`
  - is not required if page-local types are sufficient for this first integration slice

## Backend Contracts Consumed
### `POST /api/auth/login`
Request:
```json
{ "email": "admin@example.com", "password": "secret" }
```

Response when MFA is required:
```json
{
  "state": "mfa_required",
  "challenge": {
    "id": "challenge_1",
    "delivery": "email",
    "maskedEmail": "ad***@example.com",
    "expiresAt": "2026-04-28T12:10:00.000Z"
  }
}
```

Response when session is ready:
```json
{
  "state": "ready",
  "admin": {
    "id": "admin_1",
    "email": "admin@example.com"
  },
  "session": {
    "id": "session_1",
    "expiresAt": "2026-04-28T12:10:00.000Z"
  }
}
```

- Ready responses rely on `Set-Cookie`; the frontend does not receive or store a session token.

### `POST /api/auth/mfa/verify`
Request:
```json
{ "challengeId": "challenge_1", "code": "123456" }
```

Response:
```json
{
  "state": "ready",
  "admin": {
    "id": "admin_1",
    "email": "admin@example.com"
  },
  "session": {
    "id": "session_1",
    "expiresAt": "2026-04-28T12:10:00.000Z"
  }
}
```

### `GET /api/admin/dashboard/summary`
- requires the admin session cookie
- returns `401 { "error": "denied", "resource": "auth" }` when unauthenticated
- returns `200` with dashboard panels, queues, and moderation command DTOs when authenticated

### Error handling contract
- `400 { "error": "invalid_request", "field": "<name>" }`
- `401 { "error": "denied", "resource": "auth" }`
- `409 { "error": "challenge_not_pending", "resource": "mfa_challenge" }`

## Frontend Flow Contract
- Credentials step submits email and password through the login feature API.
- `mfa_required` responses move the UI into the MFA step using the returned challenge metadata.
- `ready` responses navigate to `/admin/dashboard` and rely on the backend session cookie.
- MFA verification submits `challengeId` plus `code`; successful responses also navigate to `/admin/dashboard`.
- `409 challenge_not_pending` resets the user into a restartable auth state with generic expired-challenge messaging.
- Dashboard loading doubles as the initial auth gate for `/admin` and `/admin/dashboard` by redirecting `401` responses to `/admin/login`.
- No route may advance from credentials to MFA or ready without a backend response.

## Data/Contracts Touched
- `frontend/vite.config.ts` dev proxy configuration
- shared request helper contract under `frontend/src/shared/api`
- admin login action input and output types
- MFA challenge view-model contract
- admin dashboard summary loader DTO mapping
- route redirect contract for protected admin pages
- cookie-auth browser behavior for `/api`

## Acceptance Checklist
### Functional acceptance
- [ ] `frontend/vite.config.ts` proxies `/api` requests to `http://localhost:3000` in local development.
- [ ] The admin login page no longer advances from credentials to MFA or ready using mock-only local state.
- [ ] Submitting valid credentials calls `POST /api/auth/login`.
- [ ] `mfa_required` responses transition the login UI into MFA verification state using the returned challenge.
- [ ] `ready` responses transition the user to `/admin/dashboard`.
- [ ] Submitting an MFA code calls `POST /api/auth/mfa/verify`.
- [ ] `/admin` and `/admin/dashboard` load dashboard data through `GET /api/admin/dashboard/summary`.
- [ ] Unauthenticated dashboard requests redirect to `/admin/login`.
- [ ] Route definitions continue to delegate network work to page, feature, or shared APIs rather than inline `fetch`.

### UX/design acceptance
- [ ] Existing admin login copy and shell styling remain compatible with the current migrated admin surface.
- [ ] Auth failures are presented with generic denied or expired messaging that does not reveal whether an admin email exists.
- [ ] The MFA step shows masked-email context when provided by the backend challenge.
- [ ] The dashboard can render backend summary data without losing the current panels and queue intent.

### Data/integration acceptance
- [ ] `apiBaseUrl` remains `/api`.
- [ ] Auth and admin requests send and receive cookies correctly without storing session tokens in browser storage.
- [ ] Login and MFA handlers map backend `400`, `401`, and `409` responses into deterministic UI states.
- [ ] Dashboard DTO mapping does not leak transport details outside the page slice public API.
- [ ] `FE-011` uses React Router Data Mode loaders and actions as the server data and mutation boundary.

### Operational acceptance
- [ ] Local verification covers the frontend on Vite and the backend on port `3000` running together.
- [ ] `cd frontend && bun run lint` passes after the implementation.
- [ ] `cd frontend && bun run build` passes after the implementation.
- [ ] No backend code changes are required to satisfy `FE-011`.

### Explicit non-goals or exclusions
- [ ] No public Thoughts, Projects, Photos, Chat, or status-strip API integration is included.
- [ ] No logout UI is included.
- [ ] No admin CRUD, moderation command execution, or status-strip editing UI wiring is included.
- [ ] No deployment, Caddy, or CI/CD routing change is included.
- [ ] No backend auth contract redesign is included.

## Dependencies
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [admin-cms.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/admin-cms.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)

## Open Questions
- Should authenticated visits to `/admin/login` redirect immediately to `/admin/dashboard` in `FE-011`, or wait for a later admin session polish task?
- Should the shared request helper define a reusable typed error envelope now, or stay page and feature-local until more frontend API slices land?

## Task-Splitting Notes
- First implementation task: `FE-011`.
- Task title: `Admin login API integration`.
- Base branch: `develop`.
- Branch name: `frontend/FE-011-admin-login-api-integration`.
- Merge target: `develop`.
- Primary acceptance source: this spec.
- Review requirement: yes; `FE-011` may not self-merge.
- Verification method: `cd frontend && bun run lint`, `cd frontend && bun run build`, and manual login/dashboard verification with the backend running on port `3000`.
- Keep `FE-011` limited to proxy setup, shared auth/admin request plumbing, login/MFA flow, and dashboard protection/loading.
- Split later admin session polish, logout, and broader admin data integrations into separate tasks if needed.

## Git Branch Implications
- Spec authoring uses `spec/` branches; implementation uses `frontend/` branches.
- `FE-011` must branch from `develop` as `frontend/FE-011-admin-login-api-integration`.
- Do not mix `FE-011` with public content API integration, backend auth changes, or deployment work in the same branch.
