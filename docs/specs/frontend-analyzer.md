# Frontend Analyzer

## Purpose
Define how to inspect a pre-existing frontend and reconcile the spec pack to reality.

## Scope
Used when frontend files exist in the repo or are dropped in later from external design tooling.

## Locked Decisions
- The analyzer is descriptive first and prescriptive second.
- The analyzer reports mismatches; it does not silently mutate locked product decisions.
- Backend-facing specs depend on analyzer findings when a frontend exists.
- Browser Babel, CDN React, global `window.*` component exports, missing TypeScript, and missing planned screens are migration blockers for backend tasking.
- The analyzer must distinguish between a prebuilt Vite React app and a legacy React artifact that needs archive-first migration.
- The analyzer must identify structural gaps relative to [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md) when they affect migration planning.

## Interfaces and Responsibilities
The analyzer must inspect:
- route/page inventory
- route shell and route-tree ownership assumptions
- layout/component structure
- design tokens, theme variables, and typography primitives
- runtime/tooling shape, including Vite/Bun presence versus browser-Babel/CDN React delivery
- React usage correctness, including module-based React imports versus global `React` and `window.*` exports
- TypeScript readiness
- compatibility with the target FSD layer and slice model
- API assumptions embedded in components or data hooks
- auth and admin assumptions
- content shapes implied by cards, forms, filters, status strips, and chat UI
- media and upload assumptions
- missing or divergent surfaces relative to the specs

The analyzer report must include:
- repo state summary
- frontend presence result
- tooling/runtime detection
- runtime/tooling migration risk
- React usage correctness
- TypeScript readiness
- route inventory
- route and screen completeness against planned IA
- design system observations
- implied contracts
- divergence table
- blocking items
- migration recommendation
- recommended spec updates

Finding classes:
- `matches-spec`
- `adapt-spec`
- `blocks-backend`
- `missing-surface`

Default command:
- `bun scripts/frontend-analyzer.ts`
- Optional output override: `bun scripts/frontend-analyzer.ts --output=docs/specs/frontend-analyzer-report.md`

## Data/Contracts Touched
- frontend route contracts
- view-model contracts
- API payload expectations
- auth/session expectations
- upload and media assumptions
- runtime/tooling migration state
- TypeScript and module-boundary expectations
- frontend structure and public API expectations

## Acceptance Checklist
- [ ] Analyzer covers routes, layouts, components, tokens, runtime/tooling shape, React correctness, TypeScript readiness, API assumptions, auth, and uploads.
- [ ] Analyzer identifies structural gaps relative to `frontend-structure.md` when they affect migration.
- [ ] Findings are classified using the standard classes.
- [ ] Blocking mismatches are explicit.
- [ ] Recommended spec updates identify which spec files must change.
- [ ] Legacy React intake produces a concrete migration recommendation.
- [ ] Analyzer output is written to the canonical report file.

## Dependencies
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)

## Open Questions
- Whether a later scripted analyzer should be added in addition to this documented procedure.

## Task-Splitting Notes
- Analyzer tasks should be small and isolated.
- If analyzer findings change API expectations, follow with dedicated `data/` or `be/` spec tasks rather than bundling all reconciliation together.
- If analyzer findings show legacy React architecture, migration-first frontend tasks must be cut before any backend implementation tasks.

## Git Branch Implications
- Analyzer updates use `spec/` task branches.
- A report refresh that changes task readiness or dependency edges must be reviewable as its own branch.
