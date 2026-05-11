# TRACKER

## Agent Instructions
- Execute only the `Current Task`.
- Use task files as stable requirements.
- Use this tracker for execution state only.
- Do not change task boundaries without asking Vinicius first.
- Stop immediately on blockers.
- Do not commit blocked work unless Vinicius explicitly asks for a checkpoint commit.
- Commit exactly one accepted task at a time.
- Use signed commits with `git commit -s`.
- For `Review Mode: Human`, stop before committing and wait for Vinicius to accept.
- For `Review Mode: Agent`, verify, accept, commit, and continue when appropriate.

## PRD
- ID: PRD-005
- Title: Admin Photo Upload Reference Restyle
- Status: Active
- PRD File: docs/prds/PRD-005/PRD-005.md
- Summary: Restyle `/admin/photos/upload` to match `references/vinicius.dev.v2/photo-upload.html` while preserving the existing backend-connected upload flow and existing admin photo listing/editing behavior.

## Git
- Branch: feature/PRD-005-admin-photo-upload-reference-restyle
- Base: develop
- Merge Target: develop

## Current Task
UPL-002

## Task Index
1. UPL-001 - Build Reference Upload Screen
   - Task File: docs/prds/PRD-005/tasks/UPL-001.md
   - Status: Accepted
2. UPL-002 - Preserve Upload Contract Interactions
   - Task File: docs/prds/PRD-005/tasks/UPL-002.md
   - Status: Accepted
3. UPL-003 - Add Upload Regression Coverage
   - Task File: docs/prds/PRD-005/tasks/UPL-003.md
   - Status: Todo
4. UPL-004 - Final Visual Review And PRD Verification
   - Task File: docs/prds/PRD-005/tasks/UPL-004.md
   - Status: Todo

## Tasks

### UPL-001 - Build Reference Upload Screen
Task File: docs/prds/PRD-005/tasks/UPL-001.md
Status: Accepted
Evidence:
- Started UPL-001 after reading required repo rules, task file, PRD, tracker, reference target, and Vinicius.Dev design-system skill files.
- Updated `frontend/src/pages/admin/photos/ui/AdminPhotoUploadPage.tsx` from the old single-panel form into the reference-style upload screen with a compact header, back-to-gallery action, left media/drop-zone panel, right metadata panel, grouped sections, tone controls, status area, and submit footer.
- Preserved the production React Router `<Form method="post" encType="multipart/form-data">`, hidden `intent=upload_photo`, required controls, accepted file types, and existing field names: `file`, `title`, `frame`, `date`, `location`, `tone`, `tags`, `caption`, `camera`, and `film`.
- Updated `frontend/src/app/styles/global.css` with scoped `admin-photo-upload__*` styles for the reference layout, panel hierarchy, prompt-style fields, focus states, file preview treatment, file info strip, tone buttons, status feedback, submit button, CRT hover effect, and responsive collapse.
- Removed the inherited admin shell outer `ScreenFrame` treatment around the upload route after human review noted the reference has no large page-level container around the form.
- Adjusted the admin shell header container on the upload route after human review noted the header was still centered in the normal site container instead of using the reference full-width shell spacing.
- `cd frontend && bun run test -- src/pages/admin/photos/ui/AdminPhotosGalleryPage.test.tsx` passed: 1 test file passed, 5 tests passed.
- `cd frontend && bun run lint` passed with exit code 0.
- `cd frontend && bun run build` passed: `tsc -b && vite build`, 132 modules transformed.
Decision Log:
- Scope is limited to the upload page restyle and tracker execution state for UPL-001.
- Kept prototype-only fields out of production; `lens` and `iso` from the reference were not added because PRD-005 preserves only existing backend fields.
- Used radio-backed tone controls so the styled selector still submits exactly one existing `tone` value: `amber`, `cyan`, `mono`, `sunset`, or `violet`.
- Kept tags as a single comma-delimited `tags` input and did not add non-submitting decorative tag chips.
- Did not implement fake upload simulation or client-only success behavior; loading and action feedback remain tied to React Router navigation/action state.
- Added an admin shell frame exemption for the upload route to match the open reference layout while preserving framed drop-zone and metadata panels.
- Scoped the header spacing override to `:has(.admin-photo-upload__header)` so other admin screens keep their existing shell layout.
- Vinicius accepted UPL-001 after visual review and follow-up fixes for the outer page frame and header spacing.
Commit: 154f98d PRD-005 UPL-001: build reference upload screen
Blocked Reason: None
Requested Decision: None

### UPL-002 - Preserve Upload Contract Interactions
Task File: docs/prds/PRD-005/tasks/UPL-002.md
Status: Accepted
Evidence:
- Started UPL-002 after reading required repo rules, PRD-005, tracker, task file, and Vinicius.Dev design-system guidance.
- Updated `frontend/src/pages/admin/photos/ui/AdminPhotoUploadPage.tsx` so file selection and replacement keep preview/file metadata in sync with the native production `file` input and revoke object URLs on replacement and unmount.
- Added drag/drop handling that accepts only the existing upload MIME types and writes the dropped file back to the same production file input via `DataTransfer`.
- Preserved the React Router `<Form method="post" encType="multipart/form-data">`, hidden `intent=upload_photo`, and existing field names: `file`, `title`, `frame`, `date`, `location`, `tone`, `tags`, `caption`, `camera`, and `film`.
- Kept the tone selector radio-backed with only the supported values: `amber`, `cyan`, `mono`, `sunset`, and `violet`.
- Added keyboard-accessible tag chips backed by a hidden `tags` field that serializes the submitted value as backend-compatible comma-delimited text.
- Mapped React Router submitting state into the upload status area while keeping upload action errors rendered only when `actionData.intent === 'upload_photo'`.
- Updated `frontend/src/app/styles/global.css` for drag-active drop-zone styling and accessible tag-chip removal controls.
- Updated `frontend/src/pages/admin/photos/ui/AdminPhotosGalleryPage.test.tsx` to cover form attributes/field names, selected-file preview, replacement metadata, object URL cleanup, tone exclusivity/values, and comma-delimited tag submission.
- `cd frontend && bun run test -- src/pages/admin/photos/ui/AdminPhotosGalleryPage.test.tsx` passed: 1 test file passed, 5 tests passed.
- `cd frontend && bun run lint` passed with exit code 0.
- `cd frontend && bun run build` passed: `tsc -b && vite build`, 132 modules transformed.
Decision Log:
- Scope stayed limited to UPL-002 interaction behavior, scoped upload styles, focused test coverage, and tracker execution state.
- Drag/drop was implemented because it can update the same native file input used by the production form; standard keyboard/file-picker selection remains available.
- Tags use a hidden submitted `tags` input plus visible keyboard chips so enhanced entry does not change the backend comma-delimited contract.
- No backend action, endpoint, Prisma, storage, auth, gallery, or detail editor behavior was changed.
Commit: b2c253e PRD-005 UPL-002: preserve upload contract interactions
Blocked Reason: None
Requested Decision: None

### UPL-003 - Add Upload Regression Coverage
Task File: docs/prds/PRD-005/tasks/UPL-003.md
Status: Todo
Evidence:
- Pending
Decision Log:
- Pending
Commit: Pending
Blocked Reason: None
Requested Decision: None

### UPL-004 - Final Visual Review And PRD Verification
Task File: docs/prds/PRD-005/tasks/UPL-004.md
Status: Todo
Evidence:
- Pending
Decision Log:
- Pending
Commit: Pending
Blocked Reason: None
Requested Decision: None
