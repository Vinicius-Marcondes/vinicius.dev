# DASH-004 - Verify admin photo regressions and final rollout

## Metadata
- PRD: PRD-002
- Review Mode: Agent
- Review Reason: The required regression checks are covered by deterministic frontend tests, lint, and build commands.
- Dependencies: DASH-003
- Files Expected To Change:
  - `frontend/src/pages/admin/photos/ui/AdminPhotosGalleryPage.test.tsx`
  - `frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.test.tsx`
  - `frontend/src/app/styles/global.css`
  - `docs/TRACKER.md`

## Goal
Confirm the dashboard restyle did not break admin photo listing/editing workflows and complete the PRD's frontend verification.

## Scope
- Run and update focused admin photo tests only if shared styling or markup changes require test maintenance.
- Verify `/admin/photos`, `/admin/photos/upload`, and `/admin/photos/:id` still expose the expected backend-connected gallery, upload, original image, metadata edit, curation edit, filter, and pagination behavior.
- Run lint and production build for the frontend.
- Fix final regressions that fall inside PRD-002 scope.
- Record final verification evidence in `docs/TRACKER.md` during task execution.

## Non-Scope
- Redesigning admin photo screens.
- Adding new photo admin functionality or backend behavior.
- Creating visual-regression infrastructure beyond the focused checks required by this PRD.

## Implementation Plan
1. Run dashboard and admin photo test coverage after DASH-003.
2. Update tests or small style regressions only where shared dashboard/admin shell changes affected current behavior.
3. Run frontend lint and build.
4. Record exact verification commands and results in `docs/TRACKER.md` before accepting the task.

## Acceptance Criteria
- [ ] Admin photo gallery still renders private photo cards, upload navigation, protected originals, filters, and pagination expectations.
- [ ] Admin photo upload still accepts `image/jpeg,image/png,image/webp` and exposes the upload draft action.
- [ ] Admin photo detail still renders the protected original, metadata editor, publish/draft controls, and feature/unfeature controls.
- [ ] Dashboard behavior tests still pass.
- [ ] Frontend lint and production build pass.
- [ ] No backend, schema, media storage, auth, or deployment changes were introduced.

## Verification Strategy
- `cd frontend && bun run test -- AdminDashboardPage.test.tsx route.test.ts AdminPhotosGalleryPage.test.tsx` should pass.
- `cd frontend && bun run lint` should pass.
- `cd frontend && bun run build` should pass.
