# Frontend Structure

## Purpose
Define the canonical internal structure of the `frontend/` project so frontend-facing specs and tasks follow one strict, reusable architecture policy.

## Scope
Frontend folder layout under `frontend/src`, Feature-Sliced Design layer rules, React Router Data Mode placement, public/admin shell ownership, route/public API boundaries, and frontend state/data placement rules.

## Locked Decisions
- The frontend remains a single top-level app under `frontend/`.
- Frontend uses `Vite + React + TypeScript + Bun`.
- Frontend internal structure uses strict Feature-Sliced Design.
- The allowed FSD layers are `app`, `pages`, `widgets`, `features`, `entities`, and `shared`.
- The deprecated `processes` layer is not used.
- Routing uses React Router Data Mode via `createBrowserRouter` and `RouterProvider`.
- The frontend remains one app with two shells: a public shell and an admin shell.
- The route tree is owned only by `app/routes`.
- Page slices are organized per navigable screen and grouped by domain where that improves navigation.
- Router loaders/actions are the default server data and mutation boundary.
- Local component state is the default client-state model; no global store is introduced by default.
- `app` and `shared` do not contain slices.
- Every slice or segment must expose a public API and external code may only import that public API.
- Segments must be purpose-driven such as `ui`, `api`, `model`, `lib`, or `config`; catch-all names such as `components`, `hooks`, and `types` are not the default structure contract.
- This spec defines structure and ownership rules only; it does not select enforcement tooling yet.

## Interfaces and Responsibilities
- Canonical frontend target:

```text
frontend/
  src/
    app/
      entrypoint/
      routes/
      providers/
      styles/
      public-shell/
      admin-shell/
    pages/
      home/
      thoughts/
        feed/
        details/
      projects/
        catalog/
        details/
      photos/
        gallery/
        details/
      chat/
        room/
      admin/
        login/
        dashboard/
        thoughts/
        projects/
        photos/
        moderation/
        settings/
    widgets/
      site-header/
      site-footer/
      page-banner/
      featured-preview-strip/
      status-strip/
      filters-panel/
      chat-timeline/
      admin-sidebar/
    features/
      filter-thoughts/
      filter-projects/
      filter-photos/
      enter-chat-room/
      persist-chat-handle/
      send-chat-message/
      upload-chat-image/
      login-admin/
      complete-mfa/
      publish-content/
      feature-content/
      update-status-strip/
      moderate-chat/
    entities/
      thought/
      project/
      photo/
      chat-message/
      chat-handle/
      admin-session/
      status-strip/
    shared/
      api/
      ui/
      lib/
      config/
      assets/
      styles/
```

- `app` owns the entrypoint, provider composition, route tree, app-wide styles, and the public/admin shells.
- `pages` owns route-facing screens, route composition, route error/loading states, and page-level UI that is not reused elsewhere.
- `widgets` owns large reusable or self-sufficient UI blocks and layout sections.
- `features` owns user interactions and workflows that matter to the product, especially when reused or meaningfully isolated.
- `entities` owns stable business concepts such as thoughts, projects, photos, chat messages, chat handles, admin session state, and status-strip state.
- `shared` owns non-business-specific primitives such as the HTTP client, generic UI kit, configuration, utility libraries, assets, and global style tokens.
- `shared/api` owns the transport client and request primitives.
- `entities/*/api` owns reusable read/write operations for stable domain concepts.
- `features/*/api` owns interaction-specific mutations or flows when the behavior is broader than one entity.
- `app/routes` owns only the route tree and route composition; it does not become a dump site for page internals.
- Page slices expose their route-facing component and route data contracts through their public API.
- Loaders and actions stay router-native and orchestrate lower-layer APIs; raw fetch logic does not live inline in route definitions.
- Imports may flow only from a higher FSD layer to a lower one.
- Code outside a slice may only import from that slice public API, not its internal files.
- Not every button, hook, or local helper becomes a feature; page-local code may stay in the page slice when it is not reused.
- A block becomes a widget only when it is large and reusable or clearly self-sufficient.

## Data/Contracts Touched
- `frontend/src` folder layout
- FSD layer and slice boundaries
- page public APIs
- route module and shell boundaries
- loader/action ownership
- client-side API ownership
- auth/session and content view-model contracts

## Acceptance Checklist
- [ ] Frontend structure is defined as a strict FSD app using `app`, `pages`, `widgets`, `features`, `entities`, and `shared`.
- [ ] The deprecated `processes` layer is explicitly excluded.
- [ ] React Router Data Mode is the routing standard.
- [ ] The route tree is explicitly owned by `app/routes`.
- [ ] The frontend is defined as one app with separate public and admin shells.
- [ ] Page slices are defined per navigable screen and grouped by domain where helpful.
- [ ] Layer import direction and slice public API rules are explicit.
- [ ] `app` and `shared` are treated as non-sliced layers.
- [ ] State/data ownership is explicit: router-native loaders/actions first, local state by default, no global store by default.
- [ ] API ownership is explicit across `shared/api`, `entities/*/api`, and `features/*/api`.
- [ ] The structure rules explicitly avoid over-modeling small local UI behavior as features or widgets.
- [ ] Explicit non-goal: lint/plugin/tool selection for enforcing FSD rules is not chosen in this spec.

## Dependencies
- [README.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/README.md)
- [frontend-analyzer.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-analyzer.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)

## Open Questions
- Which tooling should later enforce the FSD import and public API rules can be decided during implementation planning.
- Whether a future move to React Router Framework Mode is worthwhile can be decided later if the runtime requirements change.

## Task-Splitting Notes
- Frontend implementation tasks should cite both this spec and [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md).
- Frontend migration should establish the `app/routes` tree, shells, and layer skeleton before page-by-page migration.
- Page-level tasks should name the owning page slice and any widgets, features, or entities they introduce.
- Avoid bundling broad structural refactors with visual redesign or data-contract changes in the same task.

## Git Branch Implications
- Frontend structure changes use `fe/` or `spec/` branches depending on whether code or spec is changing.
- Tasks that reshape FSD slice boundaries or route shells must be isolated from unrelated backend or design work.
