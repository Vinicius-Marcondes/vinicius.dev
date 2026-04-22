# Frontend Analyzer Report

## Repo State Summary
- Report status: current
- Generated at: 2026-04-21T20:46:29.210Z
- Frontend presence: detected

## Frontend Presence Result
Frontend-related files were detected and analyzed.

## Tooling and Runtime Detection
- react runtime usage detected
- browser Babel detected
- CDN React detected

## Runtime and Migration Risk
- Target runtime: `Vite + React + TypeScript + Bun`
- Vite present: no
- Bun present: no
- TypeScript present: no
- Browser Babel present: yes
- CDN React present: yes
- Global `window.*` exports present: yes

## React Usage Correctness
- No React module import signals detected

- React hook usage in `frontend/landing/StatusStrip.jsx`
- React hook usage in `frontend/landing/ChannelChange.jsx`
- React hook usage in `frontend/landing/BootLoader.jsx`
- React hook usage in `frontend/landing/Nav.jsx`
- React hook usage in `frontend/landing/Hero.jsx`
- React hook usage in `frontend/landing/TweaksPanel.jsx`
- React hook usage in `frontend/index.html`
- React hook usage in `frontend/projects/PageNav.jsx`
- React hook usage in `frontend/projects/Tweaks.jsx`
- React hook usage in `frontend/projects/ProjectCard.jsx`
- React hook usage in `frontend/projects.html`
- React hook usage in `frontend/photos.html`
- React hook usage in `frontend/photos/Lightbox.jsx`
- React hook usage in `frontend/photos/PageNav.jsx`
- React hook usage in `frontend/photos/ContactFrame.jsx`
- React hook usage in `frontend/photos/Tweaks.jsx`

- ReactDOM/createRoot usage in `frontend/index.html`
- ReactDOM/createRoot usage in `frontend/projects.html`
- ReactDOM/createRoot usage in `frontend/photos.html`

- browser Babel usage in `frontend/index.html`
- browser Babel usage in `frontend/projects.html`
- browser Babel usage in `frontend/photos.html`

- global component export in `frontend/landing/StatusStrip.jsx`
- global component export in `frontend/landing/ChannelBug.jsx`
- global component export in `frontend/landing/Footer.jsx`
- global component export in `frontend/landing/ChannelChange.jsx`
- global component export in `frontend/landing/BootLoader.jsx`
- global component export in `frontend/landing/Nav.jsx`
- global component export in `frontend/landing/Hero.jsx`
- global component export in `frontend/landing/TweaksPanel.jsx`
- global component export in `frontend/projects/Thumbnail.jsx`
- global component export in `frontend/projects/data.jsx`
- global component export in `frontend/projects/Controls.jsx`
- global component export in `frontend/projects/EmptyState.jsx`
- global component export in `frontend/projects/PageBanner.jsx`
- global component export in `frontend/projects/PageNav.jsx`
- global component export in `frontend/projects/Tweaks.jsx`
- global component export in `frontend/projects/ProjectCard.jsx`
- global component export in `frontend/photos/data.jsx`
- global component export in `frontend/photos/Lightbox.jsx`
- global component export in `frontend/photos/Controls.jsx`
- global component export in `frontend/photos/PageBanner.jsx`

## TypeScript Readiness
- No TypeScript files detected

## Route Inventory
- `/` -> `frontend/index.html`
- `/photos` -> `frontend/photos.html`
- `/projects` -> `frontend/projects.html`

## Route and Screen Completeness
- Expected planned routes: `/`, `/thoughts`, `/projects`, `/photos`, `/chat`, `/admin`
- Missing planned routes/screens: `/thoughts`, `/chat`, `/admin`

## Layout and Component Structure
- `frontend/landing/BootLoader.jsx`
- `frontend/landing/ChannelBug.jsx`
- `frontend/landing/ChannelChange.jsx`
- `frontend/landing/Footer.jsx`
- `frontend/landing/Hero.jsx`
- `frontend/landing/Nav.jsx`
- `frontend/landing/StatusStrip.jsx`
- `frontend/landing/TweaksPanel.jsx`
- `frontend/photos/ContactFrame.jsx`
- `frontend/photos/Controls.jsx`
- `frontend/photos/FilmFrame.jsx`
- `frontend/photos/Lightbox.jsx`
- `frontend/photos/PageBanner.jsx`
- `frontend/photos/PageNav.jsx`
- `frontend/photos/Tweaks.jsx`
- `frontend/photos/data.jsx`
- `frontend/projects/Controls.jsx`
- `frontend/projects/EmptyState.jsx`
- `frontend/projects/PageBanner.jsx`
- `frontend/projects/PageNav.jsx`

## Design System Observations
- token or CSS variable signal in `frontend/tokens/safelight.css`
- token or CSS variable signal in `frontend/tokens/colors_and_type.css`

## API and Contract Assumptions
- API usage hint in `frontend/projects/data.jsx`
- API usage hint in `frontend/photos/data.jsx`

- auth/session hint in `frontend/landing/StatusStrip.jsx`
- auth/session hint in `frontend/landing/Nav.jsx`
- auth/session hint in `frontend/index.html`
- auth/session hint in `frontend/projects/data.jsx`

- No upload/media hints detected

- content-domain hint in `frontend/landing/StatusStrip.jsx`
- content-domain hint in `frontend/landing/Footer.jsx`
- content-domain hint in `frontend/landing/ChannelChange.jsx`
- content-domain hint in `frontend/landing/Nav.jsx`
- content-domain hint in `frontend/projects/Thumbnail.jsx`
- content-domain hint in `frontend/projects/data.jsx`
- content-domain hint in `frontend/projects/Controls.jsx`
- content-domain hint in `frontend/projects/PageBanner.jsx`
- content-domain hint in `frontend/projects/PageNav.jsx`
- content-domain hint in `frontend/projects/Tweaks.jsx`
- content-domain hint in `frontend/projects/ProjectCard.jsx`
- content-domain hint in `frontend/projects.html`
- content-domain hint in `frontend/photos.html`
- content-domain hint in `frontend/photos/data.jsx`
- content-domain hint in `frontend/photos/Lightbox.jsx`
- content-domain hint in `frontend/photos/PageBanner.jsx`
- content-domain hint in `frontend/photos/PageNav.jsx`
- content-domain hint in `frontend/photos/ContactFrame.jsx`
- content-domain hint in `frontend/photos/FilmFrame.jsx`
- content-domain hint in `frontend/photos/Tweaks.jsx`

## Findings
| Area | Class | Notes | Spec Action |
| --- | --- | --- | --- |
| Route / | matches-spec | Detected in frontend/index.html. | none |
| Route /thoughts | blocks-backend | Expected planned screen is not present in current frontend files. | create or migrate the missing screen before backend tasking |
| Route /projects | matches-spec | Detected in frontend/projects.html. | none |
| Route /photos | matches-spec | Detected in frontend/photos.html. | none |
| Route /chat | blocks-backend | Expected planned screen is not present in current frontend files. | create or migrate the missing screen before backend tasking |
| Route /admin | blocks-backend | Expected planned screen is not present in current frontend files. | create or migrate the missing screen before backend tasking |
| React presence | matches-spec | React usage was detected in the imported frontend. | none |
| Vite/Bun runtime | blocks-backend | Frontend is not yet aligned to the target Vite + Bun runtime. | scaffold a clean Vite + Bun frontend before backend tasking |
| TypeScript readiness | blocks-backend | No TypeScript source files detected in the frontend. | migrate frontend source to TypeScript before backend tasking |
| React architecture correctness | blocks-backend | Frontend uses browser Babel, CDN React, or global `window.*` component exports. | archive legacy frontend and migrate to typed module-based React |
| Static multi-page entrypoints | blocks-backend | Multiple static HTML entrypoints detected: frontend/index.html, frontend/photos.html, frontend/projects.html. | replace static entrypoints with routed Vite React screens |
| API assumptions | adapt-spec | Frontend contains API usage in frontend/projects/data.jsx, frontend/photos/data.jsx. | reconcile backend-architecture.md and data-model.md |

## Blocking Items
- Route /thoughts: Expected planned screen is not present in current frontend files.
- Route /chat: Expected planned screen is not present in current frontend files.
- Route /admin: Expected planned screen is not present in current frontend files.
- Vite/Bun runtime: Frontend is not yet aligned to the target Vite + Bun runtime.
- TypeScript readiness: No TypeScript source files detected in the frontend.
- React architecture correctness: Frontend uses browser Babel, CDN React, or global `window.*` component exports.
- Static multi-page entrypoints: Multiple static HTML entrypoints detected: frontend/index.html, frontend/photos.html, frontend/projects.html.

## Migration Recommendation
- Archive current `frontend/` into a tracked legacy snapshot such as `frontend-legacy/`.
- Scaffold a clean `Vite + React + TypeScript + Bun` app.
- Migrate landing, projects, and photos into typed module-based React screens.
- Implement fully designed Thoughts, Chat Room, and Admin screens.
- Re-run the analyzer and keep backend tasking blocked until no migration blockers remain.

## Recommended Spec Updates
- Re-run this analyzer after any material frontend change.
- If findings include `adapt-spec`, update the cited specs before backend tasking.
- If findings include `blocks-backend` or `missing-surface`, resolve those gaps before marking backend-facing specs as `Tasked`.
