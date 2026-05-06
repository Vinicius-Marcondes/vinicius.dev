# Agent Onboarding Docs Refresh

## Purpose
Define the documentation-only refresh that keeps `AGENTS.md` and adjacent agent onboarding references aligned with the current repository shape, spec harness, Git workflow, and Vinicius.Dev frontend design workflow.

## Scope
This spec covers repo onboarding docs, harness registry updates, stale spec dependency references, and local skill/UI-kit documentation for frontend creation.

This spec does not cover runtime code, product behavior, API contracts, database schema, deployment behavior, or automated documentation tooling.

## Locked Decisions
- `AGENTS.md` is the primary repository onboarding file for coding agents.
- Agent onboarding must describe the current repo areas: `frontend/`, `backend/`, `infra/`, `.github/workflows/`, `docs/specs/`, `.agents/skills/`, and root `scripts/`.
- Agent onboarding must include the hard guardrails: never read `node_modules`, never run `git push origin master`, and read `docs/specs/git-workflow.md` before any Git command.
- Frontend UI creation must start from `frontend-structure.md`, `frontend-architecture.md`, and the `viniciusdev-design` skill.
- The canonical Vinicius.Dev brand/UI implementation source is `.agents/skills/vinicius.dev-website-guidelines/`.
- `ui_kits/vinicius-dev/` must be checked before creating new frontend pages or page-level visual patterns.
- Missing `design-system.md` references are resolved through a bridge spec instead of duplicating the skill content inside the harness.
- Stale dependencies on missing frontend intake/analyzer docs must be removed or replaced with existing current specs.

## Interfaces And Responsibilities
- `AGENTS.md` owns concise, actionable agent onboarding and should point into the harness instead of restating every spec.
- `docs/specs/design-system.md` is a bridge that points specs to the local `viniciusdev-design` skill as the canonical design source.
- `docs/specs/README.md` owns canonical spec registration and agent workflow ordering.
- `docs/specs/tracker.md` owns task metadata, branch names, acceptance sources, and status.
- `.agents/skills/vinicius.dev-website-guidelines/README.md` and `ui_kits/vinicius-dev/README.md` must name actual files present in the skill directory.
- Existing architecture specs should depend only on files that exist in `docs/specs/` unless they intentionally reference an external/local skill path.

## Data/Contracts Touched
- `AGENTS.md` onboarding contract
- spec harness registry
- tracker task metadata
- design-system dependency references
- frontend creation workflow references
- local skill and UI-kit file inventory docs

## Acceptance Checklist
- [ ] `docs/specs/agent-onboarding-refresh.md` exists and follows the harness section template.
- [ ] `docs/specs/README.md` registers `agent-onboarding-refresh.md`.
- [ ] `docs/specs/tracker.md` registers `SPEC-034` and `DOCS-001` with branch names, base branch, merge target, and acceptance source.
- [ ] `AGENTS.md` describes the current repo areas and package command surface, including frontend `test`/`test:coverage` and backend `test:coverage`/`test:db`.
- [ ] `AGENTS.md` includes the hard guardrails for `node_modules`, `git push origin master`, and reading `git-workflow.md` before Git.
- [ ] `AGENTS.md` documents the frontend creation workflow through the `viniciusdev-design` skill, `colors_and_type.css`, `preview/interactive-components.html`, and `ui_kits/vinicius-dev/`.
- [ ] Missing `design-system.md` references are resolved by an existing bridge spec or by replacing the references with current docs.
- [ ] No references to missing frontend intake/analyzer docs remain unless those files are restored in the same task.
- [ ] Local skill/UI-kit docs no longer name absent component files.
- [ ] Link checks confirm all touched Markdown paths point to existing files or directories.
- [ ] Explicit non-goal: no runtime code, schema, deployment, or product behavior changes.

## Dependencies
- [README.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/README.md)
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)

## Open Questions
- Whether a future automated Markdown link checker should enforce this contract can be decided in a separate verification task.

## Task-Splitting Notes
- `SPEC-034` covers the spec and harness registration.
- `DOCS-001` covers the onboarding document refresh and adjacent stale-reference cleanup.
- Keep this docs-only cluster separate from runtime frontend/backend changes.

## Git Branch Implications
- Spec work uses `spec/SPEC-034-agent-onboarding-refresh`.
- Onboarding implementation work uses `spec/DOCS-001-agent-onboarding-docs-refresh`.
- Both branches base from `develop`, merge to `develop`, include task IDs in commits and PR titles, and require review.
