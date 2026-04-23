# Frontend Analyzer Report

## Repo State Summary
- Report status: current
- Generated at: 2026-04-23T09:52:03.394Z
- Frontend presence: detected

## Frontend Presence Result
Frontend-related files were detected and analyzed.

## Legacy Snapshot
- Tracked legacy snapshot detected in `frontend-legacy/` with 35 files. It is treated as migration reference material, not active runtime code.

## Tooling and Runtime Detection
- package manifest: frontend/package.json
- react detected
- vite detected
- react runtime usage detected
- bun signal detected: frontend/bun.lock
- packageManager declares Bun

## Runtime and Migration Risk
- Target runtime: `Vite + React + TypeScript + Bun`
- Vite present: yes
- Bun present: yes
- TypeScript present: yes
- Browser Babel present: no
- CDN React present: no
- Global `window.*` exports present: no

## React Usage Correctness
- module/import-based React signal in `frontend/eslint.config.js`
- module/import-based React signal in `frontend/vite.config.ts`
- module/import-based React signal in `frontend/src/app/providers/index.tsx`
- module/import-based React signal in `frontend/src/app/entrypoint/main.tsx`
- module/import-based React signal in `frontend/src/features/filter-photos/ui/PhotosControls.tsx`
- module/import-based React signal in `frontend/src/features/filter-projects/ui/ProjectsControls.tsx`
- module/import-based React signal in `frontend/src/features/filter-thoughts/ui/ThoughtsControls.tsx`
- module/import-based React signal in `frontend/src/shared/ui/layout/Container.tsx`
- module/import-based React signal in `frontend/src/shared/ui/layout/Section.tsx`
- module/import-based React signal in `frontend/src/shared/ui/layout/Stack.tsx`
- module/import-based React signal in `frontend/src/shared/ui/primitives/SignalLink.tsx`
- module/import-based React signal in `frontend/src/shared/ui/primitives/ScreenFrame.tsx`
- module/import-based React signal in `frontend/src/shared/ui/primitives/InlineLabel.tsx`
- module/import-based React signal in `frontend/src/shared/ui/primitives/ActionButton.tsx`
- module/import-based React signal in `frontend/src/shared/ui/primitives/ScreenTitle.tsx`
- module/import-based React signal in `frontend/src/pages/home/ui/ChannelChangeOverlay.tsx`
- module/import-based React signal in `frontend/src/pages/home/ui/HomePage.tsx`
- module/import-based React signal in `frontend/src/pages/chat/room/ui/ChatRoomPage.tsx`
- module/import-based React signal in `frontend/src/pages/chat/room/ui/ChatGate.tsx`
- module/import-based React signal in `frontend/src/pages/chat/room/ui/ChatComposer.tsx`

- React hook usage in `frontend/src/pages/home/ui/ChannelChangeOverlay.tsx`
- React hook usage in `frontend/src/pages/home/ui/HomePage.tsx`
- React hook usage in `frontend/src/pages/chat/room/ui/ChatRoomPage.tsx`
- React hook usage in `frontend/src/pages/projects/catalog/ui/ProjectsCatalogPage.tsx`
- React hook usage in `frontend/src/pages/admin/login/ui/AdminLoginPage.tsx`
- React hook usage in `frontend/src/pages/thoughts/feed/ui/ThoughtsFeedPage.tsx`
- React hook usage in `frontend/src/pages/photos/gallery/ui/PhotoLightbox.tsx`
- React hook usage in `frontend/src/pages/photos/gallery/ui/PhotosGalleryPage.tsx`
- React hook usage in `frontend/src/widgets/status-strip/ui/StatusStrip.tsx`

- ReactDOM/createRoot usage in `frontend/src/app/entrypoint/main.tsx`

- No browser Babel usage detected

- No global component exports detected

## TypeScript Readiness
- `frontend/src/app/admin-shell/index.ts`
- `frontend/src/app/admin-shell/ui/AdminShell.tsx`
- `frontend/src/app/entrypoint/main.tsx`
- `frontend/src/app/providers/index.tsx`
- `frontend/src/app/public-shell/index.ts`
- `frontend/src/app/public-shell/ui/PublicShell.tsx`
- `frontend/src/app/routes/admin.tsx`
- `frontend/src/app/routes/public.tsx`
- `frontend/src/app/routes/router.tsx`
- `frontend/src/entities/chat/index.ts`
- `frontend/src/entities/chat/lib/fixtures.ts`
- `frontend/src/entities/chat/model/types.ts`
- `frontend/src/entities/photo/index.ts`
- `frontend/src/entities/photo/lib/filters.ts`
- `frontend/src/entities/photo/lib/fixtures.ts`
- `frontend/src/entities/photo/lib/mappers.ts`
- `frontend/src/entities/photo/model/types.ts`
- `frontend/src/entities/project/index.ts`
- `frontend/src/entities/project/lib/filters.ts`
- `frontend/src/entities/project/lib/fixtures.ts`
- `frontend/src/entities/project/lib/mappers.ts`
- `frontend/src/entities/project/model/types.ts`
- `frontend/src/entities/status-strip/index.ts`
- `frontend/src/entities/status-strip/lib/mappers.ts`
- `frontend/src/entities/status-strip/model/types.ts`
- `frontend/src/entities/thought/index.ts`
- `frontend/src/entities/thought/lib/filters.ts`
- `frontend/src/entities/thought/lib/fixtures.ts`
- `frontend/src/entities/thought/lib/mappers.ts`
- `frontend/src/entities/thought/model/types.ts`
- `frontend/src/features/filter-photos/index.ts`
- `frontend/src/features/filter-photos/lib/defaults.ts`
- `frontend/src/features/filter-photos/model/types.ts`
- `frontend/src/features/filter-photos/ui/PhotosControls.tsx`
- `frontend/src/features/filter-projects/index.ts`
- `frontend/src/features/filter-projects/lib/defaults.ts`
- `frontend/src/features/filter-projects/model/types.ts`
- `frontend/src/features/filter-projects/ui/ProjectsControls.tsx`
- `frontend/src/features/filter-thoughts/index.ts`
- `frontend/src/features/filter-thoughts/lib/defaults.ts`
- `frontend/src/features/filter-thoughts/model/types.ts`
- `frontend/src/features/filter-thoughts/ui/ThoughtsControls.tsx`
- `frontend/src/main.tsx`
- `frontend/src/pages/admin/dashboard/index.ts`
- `frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.tsx`
- `frontend/src/pages/admin/login/index.ts`
- `frontend/src/pages/admin/login/ui/AdminLoginPage.tsx`
- `frontend/src/pages/chat/room/index.ts`
- `frontend/src/pages/chat/room/ui/ChatComposer.tsx`
- `frontend/src/pages/chat/room/ui/ChatGate.tsx`
- `frontend/src/pages/chat/room/ui/ChatMessageBubble.tsx`
- `frontend/src/pages/chat/room/ui/ChatRoomPage.tsx`
- `frontend/src/pages/home/index.ts`
- `frontend/src/pages/home/ui/ChannelBug.tsx`
- `frontend/src/pages/home/ui/ChannelChangeOverlay.tsx`
- `frontend/src/pages/home/ui/HomePage.tsx`
- `frontend/src/pages/photos/gallery/index.ts`
- `frontend/src/pages/photos/gallery/ui/FilmFrame.tsx`
- `frontend/src/pages/photos/gallery/ui/PhotoCard.tsx`
- `frontend/src/pages/photos/gallery/ui/PhotoLightbox.tsx`
- `frontend/src/pages/photos/gallery/ui/PhotosEmptyState.tsx`
- `frontend/src/pages/photos/gallery/ui/PhotosGalleryPage.tsx`
- `frontend/src/pages/projects/catalog/index.ts`
- `frontend/src/pages/projects/catalog/ui/ProjectCard.tsx`
- `frontend/src/pages/projects/catalog/ui/ProjectThumbnail.tsx`
- `frontend/src/pages/projects/catalog/ui/ProjectsCatalogPage.tsx`
- `frontend/src/pages/projects/catalog/ui/ProjectsEmptyState.tsx`
- `frontend/src/pages/thoughts/feed/index.ts`
- `frontend/src/pages/thoughts/feed/ui/ThoughtCard.tsx`
- `frontend/src/pages/thoughts/feed/ui/ThoughtsEmptyState.tsx`
- `frontend/src/pages/thoughts/feed/ui/ThoughtsFeedPage.tsx`
- `frontend/src/shared/api/index.ts`
- `frontend/src/shared/config/index.ts`
- `frontend/src/shared/lib/index.ts`
- `frontend/src/shared/ui/index.ts`
- `frontend/src/shared/ui/layout/Container.tsx`
- `frontend/src/shared/ui/layout/Section.tsx`
- `frontend/src/shared/ui/layout/Stack.tsx`
- `frontend/src/shared/ui/primitives/ActionButton.tsx`
- `frontend/src/shared/ui/primitives/InlineLabel.tsx`
- `frontend/src/shared/ui/primitives/ScreenFrame.tsx`
- `frontend/src/shared/ui/primitives/ScreenTitle.tsx`
- `frontend/src/shared/ui/primitives/SignalLink.tsx`
- `frontend/src/vite-env.d.ts`
- `frontend/src/widgets/page-banner/index.ts`
- `frontend/src/widgets/page-banner/ui/PageBanner.tsx`
- `frontend/src/widgets/site-footer/index.ts`
- `frontend/src/widgets/site-footer/ui/SiteFooter.tsx`
- `frontend/src/widgets/site-header/index.ts`
- `frontend/src/widgets/site-header/ui/SiteHeader.tsx`
- `frontend/src/widgets/status-strip/index.ts`
- `frontend/src/widgets/status-strip/ui/StatusStrip.tsx`
- `frontend/vite.config.ts`

## Route Inventory
- `/` -> `frontend/index.html`
- `/` -> `frontend/src/pages/home/ui/ChannelBug.tsx`
- `/` -> `frontend/src/pages/home/ui/ChannelChangeOverlay.tsx`
- `/` -> `frontend/src/pages/home/ui/HomePage.tsx`
- `/` -> `frontend/src/pages/home/index.ts`
- `/admin` -> `frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.tsx`
- `/admin` -> `frontend/src/pages/admin/dashboard/index.ts`
- `/admin` -> `frontend/src/pages/admin/login/ui/AdminLoginPage.tsx`
- `/admin` -> `frontend/src/pages/admin/login/index.ts`
- `/chat` -> `frontend/src/pages/chat/room/ui/ChatRoomPage.tsx`
- `/chat` -> `frontend/src/pages/chat/room/ui/ChatGate.tsx`
- `/chat` -> `frontend/src/pages/chat/room/ui/ChatComposer.tsx`
- `/chat` -> `frontend/src/pages/chat/room/ui/ChatMessageBubble.tsx`
- `/chat` -> `frontend/src/pages/chat/room/index.ts`
- `/photos` -> `frontend/src/pages/photos/gallery/ui/FilmFrame.tsx`
- `/photos` -> `frontend/src/pages/photos/gallery/ui/PhotoLightbox.tsx`
- `/photos` -> `frontend/src/pages/photos/gallery/ui/PhotosEmptyState.tsx`
- `/photos` -> `frontend/src/pages/photos/gallery/ui/PhotoCard.tsx`
- `/photos` -> `frontend/src/pages/photos/gallery/ui/PhotosGalleryPage.tsx`
- `/photos` -> `frontend/src/pages/photos/gallery/index.ts`
- `/projects` -> `frontend/src/pages/projects/catalog/ui/ProjectCard.tsx`
- `/projects` -> `frontend/src/pages/projects/catalog/ui/ProjectsCatalogPage.tsx`
- `/projects` -> `frontend/src/pages/projects/catalog/ui/ProjectsEmptyState.tsx`
- `/projects` -> `frontend/src/pages/projects/catalog/ui/ProjectThumbnail.tsx`
- `/projects` -> `frontend/src/pages/projects/catalog/index.ts`
- `/thoughts` -> `frontend/src/pages/thoughts/feed/ui/ThoughtsEmptyState.tsx`
- `/thoughts` -> `frontend/src/pages/thoughts/feed/ui/ThoughtCard.tsx`
- `/thoughts` -> `frontend/src/pages/thoughts/feed/ui/ThoughtsFeedPage.tsx`
- `/thoughts` -> `frontend/src/pages/thoughts/feed/index.ts`

## Route and Screen Completeness
- Expected planned routes: `/`, `/thoughts`, `/projects`, `/photos`, `/chat`, `/admin`
- All planned routes/screens are currently present

## Layout and Component Structure
- `frontend/src/app/admin-shell/ui/AdminShell.tsx`
- `frontend/src/app/public-shell/ui/PublicShell.tsx`
- `frontend/src/features/filter-photos/ui/PhotosControls.tsx`
- `frontend/src/features/filter-projects/ui/ProjectsControls.tsx`
- `frontend/src/features/filter-thoughts/ui/ThoughtsControls.tsx`
- `frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.tsx`
- `frontend/src/pages/admin/login/ui/AdminLoginPage.tsx`
- `frontend/src/pages/chat/room/ui/ChatComposer.tsx`
- `frontend/src/pages/chat/room/ui/ChatGate.tsx`
- `frontend/src/pages/chat/room/ui/ChatMessageBubble.tsx`
- `frontend/src/pages/chat/room/ui/ChatRoomPage.tsx`
- `frontend/src/pages/home/ui/ChannelBug.tsx`
- `frontend/src/pages/home/ui/ChannelChangeOverlay.tsx`
- `frontend/src/pages/home/ui/HomePage.tsx`
- `frontend/src/pages/photos/gallery/ui/FilmFrame.tsx`
- `frontend/src/pages/photos/gallery/ui/PhotoCard.tsx`
- `frontend/src/pages/photos/gallery/ui/PhotoLightbox.tsx`
- `frontend/src/pages/photos/gallery/ui/PhotosEmptyState.tsx`
- `frontend/src/pages/photos/gallery/ui/PhotosGalleryPage.tsx`
- `frontend/src/pages/projects/catalog/ui/ProjectCard.tsx`

## Design System Observations
- token or CSS variable signal in `frontend/src/app/styles/global.css`
- token or CSS variable signal in `frontend/src/shared/styles/tokens.css`
- token or CSS variable signal in `frontend/src/shared/styles/themes.css`

## API and Contract Assumptions
- API usage hint in `frontend/src/shared/api/index.ts`

- auth/session hint in `frontend/src/app/styles/global.css`
- auth/session hint in `frontend/src/app/routes/admin.tsx`
- auth/session hint in `frontend/src/shared/config/index.ts`
- auth/session hint in `frontend/src/pages/chat/room/ui/ChatRoomPage.tsx`
- auth/session hint in `frontend/src/pages/chat/room/ui/ChatGate.tsx`
- auth/session hint in `frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.tsx`
- auth/session hint in `frontend/src/pages/admin/login/ui/AdminLoginPage.tsx`
- auth/session hint in `frontend/src/entities/chat/lib/fixtures.ts`
- auth/session hint in `frontend/src/entities/project/lib/fixtures.ts`

- upload/media hint in `frontend/src/app/styles/global.css`
- upload/media hint in `frontend/src/pages/chat/room/ui/ChatRoomPage.tsx`
- upload/media hint in `frontend/src/pages/chat/room/ui/ChatComposer.tsx`
- upload/media hint in `frontend/src/entities/chat/lib/fixtures.ts`

- content-domain hint in `frontend/src/app/admin-shell/ui/AdminShell.tsx`
- content-domain hint in `frontend/src/app/styles/global.css`
- content-domain hint in `frontend/src/app/routes/public.tsx`
- content-domain hint in `frontend/src/app/routes/router.tsx`
- content-domain hint in `frontend/src/app/routes/admin.tsx`
- content-domain hint in `frontend/src/features/filter-photos/ui/PhotosControls.tsx`
- content-domain hint in `frontend/src/features/filter-projects/ui/ProjectsControls.tsx`
- content-domain hint in `frontend/src/features/filter-projects/model/types.ts`
- content-domain hint in `frontend/src/features/filter-projects/lib/defaults.ts`
- content-domain hint in `frontend/src/features/filter-thoughts/ui/ThoughtsControls.tsx`
- content-domain hint in `frontend/src/features/filter-thoughts/model/types.ts`
- content-domain hint in `frontend/src/shared/config/index.ts`
- content-domain hint in `frontend/src/pages/home/ui/ChannelChangeOverlay.tsx`
- content-domain hint in `frontend/src/pages/home/ui/HomePage.tsx`
- content-domain hint in `frontend/src/pages/chat/room/ui/ChatRoomPage.tsx`
- content-domain hint in `frontend/src/pages/chat/room/ui/ChatGate.tsx`
- content-domain hint in `frontend/src/pages/chat/room/ui/ChatComposer.tsx`
- content-domain hint in `frontend/src/pages/chat/room/ui/ChatMessageBubble.tsx`
- content-domain hint in `frontend/src/pages/projects/catalog/ui/ProjectCard.tsx`
- content-domain hint in `frontend/src/pages/projects/catalog/ui/ProjectsCatalogPage.tsx`

## Findings
| Area | Class | Notes | Spec Action |
| --- | --- | --- | --- |
| Route / | matches-spec | Detected in frontend/index.html. | none |
| Route /thoughts | matches-spec | Detected in frontend/src/pages/thoughts/feed/ui/ThoughtsEmptyState.tsx. | none |
| Route /projects | matches-spec | Detected in frontend/src/pages/projects/catalog/ui/ProjectCard.tsx. | none |
| Route /photos | matches-spec | Detected in frontend/src/pages/photos/gallery/ui/FilmFrame.tsx. | none |
| Route /chat | matches-spec | Detected in frontend/src/pages/chat/room/ui/ChatRoomPage.tsx. | none |
| Route /admin | matches-spec | Detected in frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.tsx. | none |
| React presence | matches-spec | React usage was detected in the imported frontend. | none |
| Vite/Bun runtime | matches-spec | Frontend shows Vite and Bun signals. | none |
| TypeScript readiness | matches-spec | TypeScript source files detected in frontend/src/app/admin-shell/index.ts, frontend/src/app/admin-shell/ui/AdminShell.tsx, frontend/src/app/entrypoint/main.tsx, frontend/src/app/providers/index.tsx, frontend/src/app/public-shell/index.ts. | none |
| React architecture correctness | matches-spec | Frontend appears to use module-based React rather than legacy global composition. | none |
| Static multi-page entrypoints | matches-spec | Single app HTML entrypoint detected: frontend/index.html. | none |
| API assumptions | adapt-spec | Frontend contains API usage in frontend/src/shared/api/index.ts. | reconcile backend-architecture.md and data-model.md |
| Upload assumptions | adapt-spec | Upload-related UI hints found in frontend/src/app/styles/global.css, frontend/src/pages/chat/room/ui/ChatRoomPage.tsx, frontend/src/pages/chat/room/ui/ChatComposer.tsx, frontend/src/entities/chat/lib/fixtures.ts. | reconcile media-storage.md, backend-architecture.md, and admin-cms.md |

## Blocking Items
- None detected in this pass

## Migration Recommendation
- No migration blockers detected. Current frontend is close to target architecture.

## Recommended Spec Updates
- Re-run this analyzer after any material frontend change.
- If findings include `adapt-spec`, update the cited specs before backend tasking.
- If findings include `blocks-backend` or `missing-surface`, resolve those gaps before marking backend-facing specs as `Tasked`.
