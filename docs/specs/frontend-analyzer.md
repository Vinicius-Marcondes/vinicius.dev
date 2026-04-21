# Frontend Analyzer

## Purpose
Define how to inspect a pre-existing frontend and reconcile the spec pack to reality.

## Scope
Used when frontend files exist in the repo or are dropped in later from external design tooling.

## Locked Decisions
- The analyzer is descriptive first and prescriptive second.
- The analyzer reports mismatches; it does not silently mutate locked product decisions.
- Backend-facing specs depend on analyzer findings when a frontend exists.

## Interfaces and Responsibilities
The analyzer must inspect:
- route/page inventory
- layout/component structure
- design tokens, theme variables, and typography primitives
- API assumptions embedded in components or data hooks
- auth and admin assumptions
- content shapes implied by cards, forms, filters, status strips, and chat UI
- media and upload assumptions
- missing or divergent surfaces relative to the specs

The analyzer report must include:
- repo state summary
- frontend presence result
- tooling/runtime detection
- route inventory
- design system observations
- implied contracts
- divergence table
- blocking items
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

## Acceptance Checklist
- [ ] Analyzer covers routes, layouts, components, tokens, API assumptions, auth, and uploads.
- [ ] Findings are classified using the standard classes.
- [ ] Blocking mismatches are explicit.
- [ ] Recommended spec updates identify which spec files must change.
- [ ] Analyzer output is written to the canonical report file.

## Dependencies
- [frontend-intake.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-intake.md)
- [product-scope.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/product-scope.md)
- [design-system.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/design-system.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)

## Open Questions
- Whether a later scripted analyzer should be added in addition to this documented procedure.

## Task-Splitting Notes
- Analyzer tasks should be small and isolated.
- If analyzer findings change API expectations, follow with dedicated `data/` or `be/` spec tasks rather than bundling all reconciliation together.

## Git Branch Implications
- Analyzer updates use `spec/` task branches.
- A report refresh that changes task readiness or dependency edges must be reviewable as its own branch.
