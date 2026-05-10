# DASH-002 - Map reference structure into dashboard components

## Metadata
- PRD: PRD-002
- Review Mode: Agent
- Review Reason: The route boundaries, data flow, component structure, and accessible content can be verified through deterministic tests.
- Dependencies: DASH-001
- Files Expected To Change:
  - `frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.tsx`
  - `frontend/src/pages/admin/dashboard/model/types.ts`
  - `frontend/src/pages/admin/dashboard/model/mappers.ts`
  - `frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.test.tsx`
  - `frontend/src/app/admin-shell/ui/AdminShell.tsx`
  - `frontend/src/app/styles/global.css`

## Goal
Rework the dashboard React structure so it matches the reference control-deck composition while preserving existing loader data, route ownership, and mutation behavior.

## Scope
- Express the reference layout in production React: page meta/header, stat grid, content queue panel, now-playing panel, and chat room access panel.
- Keep `/admin/dashboard` on the existing React Router loader and existing `AdminDashboardViewModel`.
- Preserve the existing fallback queue behavior without replacing backend-provided queue data.
- Add semantic hooks/classes needed for the visual pass.
- Make only tightly scoped admin shell/shared style or markup adjustments needed for this dashboard structure.

## Non-Scope
- Final visual parity, animation polish, or responsive styling beyond structural support.
- Changing backend DTOs, API client paths, room password rotation semantics, or auth redirects.
- Redesigning admin photo pages.

## Implementation Plan
1. Translate the reference dashboard sections into `AdminDashboardPage.tsx` using existing loader data and local rotation state.
2. Preserve the existing stat panel order and queue fallback behavior unless the loader provides real rows.
3. Keep the room password rotation handler on the same chat entity API call.
4. Update dashboard tests from DASH-001 to target stable accessible labels and content after the markup shift.
5. Add only the minimal CSS scaffolding needed to avoid broken layout before the full visual task.

## Acceptance Criteria
- [ ] `/admin/dashboard` still uses the existing loader/view model and does not move route ownership out of `src/app/routes`.
- [ ] The page renders a control-deck structure with stat cards, content queue, now-playing details, and chat room access details.
- [ ] Backend-provided panel values and queue items remain the displayed source of truth.
- [ ] Password rotation behavior from DASH-001 still passes after the structural rewrite.
- [ ] Admin shell changes, if any, are scoped to admin chrome and do not alter public route structure.

## Verification Strategy
- `cd frontend && bun run test -- AdminDashboardPage.test.tsx route.test.ts` should pass.
