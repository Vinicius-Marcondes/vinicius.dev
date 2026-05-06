# Design System

## Purpose
Bridge spec-harness design-system references to the local Vinicius.Dev brand and UI skill that contains the canonical implementation guidance.

## Scope
This file defines where agents find brand, visual, component, interaction, and frontend creation guidance for Vinicius.Dev UI work.

This file does not duplicate the full design system content and does not define runtime code.

## Locked Decisions
- The canonical design source is the `viniciusdev-design` skill at `.agents/skills/vinicius.dev-website-guidelines/`.
- Frontend UI work must read the skill manifest, brand README, full guidelines, token CSS, interactive previews, and UI kit before creating new visual patterns.
- The active UI kit path is `.agents/skills/vinicius.dev-website-guidelines/ui_kits/vinicius-dev/`.
- The active token source is `.agents/skills/vinicius.dev-website-guidelines/colors_and_type.css`.
- The design language keeps rectangular geometry, restrained CRT/arcade visual references, existing tokens only, no emoji, and reduced-motion support.

## Interfaces And Responsibilities
- `.agents/skills/vinicius.dev-website-guidelines/SKILL.md` owns the agent-facing skill trigger, core rules, and quick reference.
- `.agents/skills/vinicius.dev-website-guidelines/README.md` owns brand context and source inventory.
- `.agents/skills/vinicius.dev-website-guidelines/GUIDELINES.md` owns the full UI/UX implementation spec.
- `.agents/skills/vinicius.dev-website-guidelines/colors_and_type.css` owns color, type, spacing, shadow, and CRT primitive tokens.
- `.agents/skills/vinicius.dev-website-guidelines/preview/interactive-components.html` owns interactive component reference patterns.
- `.agents/skills/vinicius.dev-website-guidelines/ui_kits/vinicius-dev/` owns the assembled landing-page kit and reusable page patterns.

## Data/Contracts Touched
- frontend UI visual conventions
- shared style token references
- local skill and UI-kit file paths
- documentation dependencies that refer to `design-system.md`

## Acceptance Checklist
- [ ] Specs that depend on `design-system.md` have an existing file to resolve.
- [ ] The bridge points to the canonical `viniciusdev-design` skill path.
- [ ] The bridge names the token CSS, interactive preview, and `ui_kits/vinicius-dev/` path.
- [ ] The bridge stays documentation-only and does not duplicate the full skill content.

## Dependencies
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)

## Open Questions
- Whether the skill content should later be mirrored into a fully versioned spec can be decided separately.

## Task-Splitting Notes
- Design-system changes should update the skill source first, then this bridge only if canonical paths or responsibilities change.
- Frontend implementation tasks should cite this file only as a pointer; the skill files remain the detailed acceptance source for visual behavior.

## Git Branch Implications
- Design documentation bridge changes use `spec/` branches and should not be mixed with runtime UI implementation.
