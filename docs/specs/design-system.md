# Design System

## Purpose
Capture the locked visual language and interaction rules for the site.

## Scope
Color, typography, layout tone, motion, component shape, overlays, and global interaction rules.

## Locked Decisions
- Background is near-black with a purple-to-orange sunset gradient.
- Headlines use pixel or bitmap styling; body text uses monospace.
- UI is sharp and rectangular with no rounded corners.
- Use subtle scanlines globally, a soft vignette on the hero, and chromatic aberration on large display text only.
- Motion stays restrained: hover glitch or cursor effects are acceptable, heavy animation is not.
- Footer repeats navigation and social links.
- Header behaves like an arcade menu bar.

## Interfaces and Responsibilities
- Provide reusable tokens for color, spacing, typography, borders, and effects.
- Define where CRT/VHS effects are global versus localized.
- Define responsive behavior so the site remains intentional on mobile and desktop.
- Restrict decorative effects that would undermine performance or readability.

## Data/Contracts Touched
- design tokens
- component presentation states
- motion constraints
- image and text treatment rules

## Acceptance Checklist
- [ ] Visual direction stays faithful to the locked retro-futuristic brief.
- [ ] Global tokens define the near-black base, sunset gradient, and neon accents.
- [ ] Pixel/bitmap and monospace typography roles are explicit.
- [ ] Rounded corners and soft drop shadows are absent.
- [ ] Effects are constrained to scanlines, hero vignette, and headline-only chromatic aberration.
- [ ] Motion remains light and performance-conscious.
- [ ] Mobile and desktop layouts both preserve the visual identity.

## Dependencies
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)

## Open Questions
- Exact font families can be selected later as long as they preserve the intended visual roles.

## Task-Splitting Notes
- Shared token work should happen before page-specific frontend implementation.
- If a generated frontend arrives with usable tokens, reconcile them instead of re-specifying blindly.

## Git Branch Implications
- Token or visual rule changes require dedicated branches because they affect multiple downstream tasks.
- Do not bundle design-system changes with unrelated backend work.

