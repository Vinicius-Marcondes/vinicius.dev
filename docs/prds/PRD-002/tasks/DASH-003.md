# DASH-003 - Apply control-deck visual style

## Metadata
- PRD: PRD-002
- Review Mode: Human
- Dependencies: DASH-002
- Files Expected To Change:
  - `frontend/src/pages/admin/dashboard/ui/AdminDashboardPage.tsx`
  - `frontend/src/app/admin-shell/ui/AdminShell.tsx`
  - `frontend/src/app/styles/global.css`
  - `frontend/src/shared/ui/`

## Goal
Apply the final visual treatment so `/admin/dashboard` matches `references/vinicius.dev.v2/dashboard.html` while staying inside the Vinicius.Dev design rules.

## Scope
- Implement the reference-inspired sticky admin nav treatment, channel bug, compact header, stat cards, queue rows, panel headers, info fields, rotation control, live state, and responsive lower grid.
- Add CRT scanlines, restrained glitch hover, blinking or pulsing live states, hard rectangular surfaces, visible focus states, and reduced-motion fallbacks.
- Use only Vinicius.Dev tokens, typography roles, approved neon treatment, rectangular geometry, and allowed glyph/ASCII iconography.
- Reconcile reference details with the canonical design rules when they conflict, favoring the design rules unless Vinicius approves an explicit exception.

## Non-Scope
- Changing product behavior, backend calls, data mappings, or admin photo workflows.
- Redesigning public pages or non-dashboard admin screens beyond unavoidable shared component styling.
- Adding new dashboard features or new editable status-strip controls.

## Implementation Plan
1. Read `references/vinicius.dev.v2/dashboard.html` and the Vinicius.Dev design skill files before editing visuals.
2. Implement dashboard and admin shell CSS for the reference layout, panel hierarchy, typography, states, responsive behavior, and motion.
3. Ensure shared UI primitive changes remain generic, token-based, and compatible with existing admin photo screens.
4. Add reduced-motion handling for all new animation and keep visible keyboard focus states.
5. Run focused tests and prepare the screen for human visual review.

## Acceptance Criteria
- [ ] `/admin/dashboard` matches the reference dashboard's layout, density, panel hierarchy, and CRT control-deck atmosphere.
- [ ] The visual system follows brand constraints: no rounded UI, no emoji, no glassmorphism, no unsupported fonts, no unapproved colors, and no broad gradients outside allowed contexts.
- [ ] The dashboard uses Press Start 2P only for the `vinicius.dev control` wordmark, VT323 for non-wordmark display/counter text, and Fira Mono for body/UI text.
- [ ] Animations are limited to approved CRT-style effects and respect `prefers-reduced-motion`.
- [ ] Keyboard focus remains visible for admin nav, queue actions/links, field-like values, and the room password rotation control.
- [ ] Dashboard behavior tests still pass after the visual styling.

## Verification Strategy
- `cd frontend && bun run test -- AdminDashboardPage.test.tsx route.test.ts` should pass.
- `cd frontend && bun run build` should pass.

## Human Review Needs
- Compare `/admin/dashboard` against `references/vinicius.dev.v2/dashboard.html` on desktop and mobile widths.
- Confirm any intentional differences caused by Vinicius.Dev design-system constraints are acceptable.
- Confirm the final dashboard feels like the requested control deck without regressing readability or admin usability.
