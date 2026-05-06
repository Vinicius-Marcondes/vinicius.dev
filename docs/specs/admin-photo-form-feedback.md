# Admin Photo Form Feedback

## Purpose
Define the admin photo form UX follow-up for branded file selection and toast-based save feedback on the photo upload and detail screens.

## Scope
This spec covers frontend-only changes for:
- `/admin/photos/upload`
- `/admin/photos/:id`
- a reusable shared toast UI/provider wired through the frontend app providers
- the upload screen's original image file chooser
- success feedback for photo upload, metadata save, publish/unpublish, and feature/unfeature actions

This spec does not cover `/admin/photos` gallery/list UI changes, public photo gallery behavior, backend API contracts, media storage behavior, schema changes, thumbnail generation, EXIF extraction, object storage, or deployment changes.

## Locked Decisions
- The visual acceptance source is the `vinicius-dev-website-guidelines` skill, especially `.agents/skills/vinicius-dev-website-guidelines/preview/interactive-components.html` for toasts and feedback.
- Toasts appear in the bottom-right corner of the viewport.
- Toasts auto-dismiss after `4000ms` and include a visible timer/progress bar.
- Toasts use the design-system glyph vocabulary and semantic colors; no emoji, no rounded corners, no glassmorphism, and no new colors.
- Toasts expose an accessible live region with `aria-live="polite"`.
- Toast motion follows the UI kit entrance timing and respects reduced-motion preferences.
- The shared toast implementation lives under `frontend/src/shared/ui` and is wired through `frontend/src/app/providers`.
- The file chooser on `/admin/photos/upload` keeps the native file input accessible while replacing the visible browser-default control with a branded rectangular control.
- The file chooser visible label is `choose file` before selection and `change file` after selection.
- The selected file name and formatted byte size are visible after selection.
- The upload form keeps the current accepted types: `image/jpeg`, `image/png`, and `image/webp`.
- The upload form keeps the current required file validation and local image preview behavior.
- A successful new photo upload keeps the current redirect behavior to `/admin/photos/:id`.
- A successful new photo upload shows the toast on the destination detail screen after redirect.
- Successful metadata save, publish/unpublish, and feature/unfeature actions show success toasts instead of small inline success text.
- Error feedback remains inline near the affected form or action; this task does not convert errors to toasts.

## Interfaces And Responsibilities
- `frontend/src/shared/ui` owns the reusable toast primitives, provider, hook/API, and public exports.
- `frontend/src/app/providers` wires the toast provider so route pages can trigger shared feedback without introducing a broader global application store.
- `/admin/photos/upload` owns the upload-only file selection state, preview state, filename display, byte-size display, and upload form rendering.
- `/admin/photos/:id` owns mapping photo action success states to toast messages for metadata and curation actions.
- The upload action may pass a transient success signal to the redirected detail route, such as a route-local flash/search parameter, but must not change backend API contracts.
- If a transient URL signal is used for upload success, the detail route must clear it with `replace` after the toast is queued so reloading/bookmarking does not replay stale feedback.
- React Router Data Mode remains the route/action boundary for photo mutations.
- FSD import direction remains intact: pages may import from `shared/ui`, and `shared/ui` must not import from page, feature, entity, or app slices.

## Data/Contracts Touched
- `frontend/src/shared/ui` public API for toasts
- `frontend/src/app/providers` provider composition
- `/admin/photos/upload` route component file input presentation and selected-file view model
- `/admin/photos/:id` route component success-feedback presentation
- admin photo action success view-model handling
- frontend tests for admin photo upload/detail feedback behavior

## Acceptance Checklist
- [ ] `/admin/photos/upload` renders a branded rectangular file chooser instead of the plain browser-default visible button.
- [ ] The upload file chooser displays `choose file` before a file is selected.
- [ ] The upload file chooser displays `change file` after a file is selected.
- [ ] The upload file chooser displays the selected file name and formatted size after selection.
- [ ] The native file input remains accessible to keyboard and assistive technology users.
- [ ] The upload file input preserves `accept="image/jpeg,image/png,image/webp"` and required-file behavior.
- [ ] The existing local image preview behavior remains available after selecting a file.
- [ ] Successful new photo upload still redirects to the new photo detail route.
- [ ] Successful new photo upload shows a bottom-right success toast on the destination detail route.
- [ ] Successful metadata save on `/admin/photos/:id` shows a bottom-right success toast.
- [ ] Successful publish/unpublish on `/admin/photos/:id` shows a bottom-right success toast.
- [ ] Successful feature/unfeature on `/admin/photos/:id` shows a bottom-right success toast.
- [ ] Success messages are no longer rendered as small inline text for upload, metadata, publish/unpublish, or feature/unfeature success states.
- [ ] Error messages remain rendered inline near the related form/action.
- [ ] Toasts auto-dismiss after `4000ms` and include a visible timer/progress bar.
- [ ] Toasts use `aria-live="polite"` and do not trap focus.
- [ ] Toast styling follows the Vinicius.Dev UI kit: rectangular geometry, existing tokens, glyph-based states, no emoji, no rounded UI, and reduced-motion support.
- [ ] `/admin/photos` gallery/list behavior is unchanged by this task.
- [ ] No backend API, persistence, media storage, schema, or deployment behavior changes are introduced.
- [ ] Frontend route/component tests cover the branded file chooser, selected filename/size display, upload redirect toast signal, detail success toasts, and inline error preservation.
- [ ] Frontend `bun run test`, `bun run lint`, and `bun run build` pass.

## Dependencies
- [photo-catalog-gallery.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/photo-catalog-gallery.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)

## Open Questions
- None. The requested behavior is locked for `PHOTO-005`.

Future follow-up decisions, outside this spec, can decide whether error toasts or toast usage across other admin screens should be standardized.

## Task-Splitting Notes
- Implement as one frontend/admin task: `PHOTO-005`.
- `PHOTO-005` should start only after the `/admin/photos/upload` and `/admin/photos/:id` routes from the photo catalog/admin upload cluster are available on the implementation base branch.
- Keep the shared toast system intentionally small and reusable; do not introduce a broad app state manager.
- Keep the file chooser work limited to `/admin/photos/upload`; do not change chat uploads or public photo gallery uploads.
- Keep success-toast wiring limited to upload, metadata save, publish/unpublish, and feature/unfeature on the scoped routes.
- The implementation agent must read the Vinicius.Dev design skill files and `preview/interactive-components.html` before writing UI code.

## Git Branch Implications
- Spec work uses `spec/SPEC-035-admin-photo-form-feedback`.
- Implementation work uses `admin/PHOTO-005-admin-photo-form-feedback`.
- Both branches base from `develop` and merge to `develop` after review.
- Commit messages and PR titles must include the task ID (`SPEC-035` or `PHOTO-005`).
- Commits must be created with `git commit -s -m "..."`.
- The implementation PR description must include the source spec, acceptance source, base branch, merge target, and verification performed.
