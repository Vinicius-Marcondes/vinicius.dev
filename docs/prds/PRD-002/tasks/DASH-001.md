# DASH-001 - Lock dashboard behavior tests

## Metadata
- PRD: PRD-002
- Review Mode: Agent
- Review Reason: Loader, render, and mutation behavior can be verified deterministically with frontend tests.
- Dependencies: None
- Files Expected To Change:
  - `frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.test.tsx`
  - `frontend/src/pages/admin/dashboard/route.test.ts`

## Goal
Strengthen the existing admin dashboard tests before the visual rewrite so current backend-connected behavior is protected.

## Scope
- Add or update dashboard page tests for backend-provided panel values, backend-provided queue rows, room access display, empty/generated-password state, successful rotation, pending rotation state, and rotation error feedback.
- Preserve route loader tests that prove unauthorized sessions redirect to `/admin/login` and missing room access is tolerated.
- Keep tests focused on behavior and accessible output, not pixel-level visual details.

## Non-Scope
- Changing dashboard production markup beyond small testability fixes if required.
- Changing API clients, backend routes, auth behavior, chat room semantics, or photo admin screens.
- Implementing the control-deck visual restyle.

## Implementation Plan
1. Expand `AdminDashboardPage.test.tsx` to cover current dashboard data rendering and chat room rotation states.
2. Confirm `route.test.ts` still covers loader mapping, unauthorized redirect, and missing room access.
3. Make only minimal production adjustments if a behavior is already present but inaccessible to reliable tests.
4. Run focused dashboard tests.

## Acceptance Criteria
- [ ] Tests prove dashboard stat values and content queue rows are rendered from loader data.
- [ ] Tests prove room slug, current password or generated-empty state, rotation status, and revoked-session count behavior remain visible.
- [ ] Tests prove password rotation calls `rotateChatRoomPassword('night-shift', {})`, disables or indicates pending state while in flight, updates displayed password after success, and surfaces an error after failure.
- [ ] Tests prove unauthorized dashboard loader requests redirect to `/admin/login`.
- [ ] Tests pass before the visual restyle task begins.

## Verification Strategy
- `cd frontend && bun run test -- AdminDashboardPage.test.tsx route.test.ts` should pass.
