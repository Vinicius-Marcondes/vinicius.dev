# Frontend Legacy Snapshot

This directory is the tracked FE-001 snapshot of the imported legacy frontend that previously lived at `frontend/`.

Purpose:
- preserve the original migration source intact for FE-002 and later route-by-route adaptation work
- keep the legacy HTML entrypoints, JSX sources, assets, tokens, and scraps readable in one place
- free the top-level `frontend/` path for the clean Vite + React + TypeScript + Bun app

Legacy route entrypoints:
- `/` -> `index.html`
- `/projects` -> `projects.html`
- `/photos` -> `photos.html`

Preserved folders:
- `landing/`
- `projects/`
- `photos/`
- `assets/`
- `tokens/`
- `scraps/`

Notes:
- Internal relative paths are preserved, so the snapshot can still be inspected as a self-contained legacy artifact.
- Browser Babel, CDN React, and `window.*` exports are intentionally unchanged here because this directory is an archive, not the migration target.
- FE-002 should scaffold the new frontend under the repo-root `frontend/` path instead of modifying this snapshot in place.
