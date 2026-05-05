# CI Workflow Maintenance

## Purpose
Define a narrow CI maintenance slice that removes analyzer freshness automation and updates workflow action usage for the GitHub Actions Node.js 24 transition.

## Scope
- removal of analyzer freshness workflow enforcement
- removal of the frontend analyzer report/script contract from CI maintenance scope
- Node.js 24 compatibility updates for JavaScript-based GitHub Actions used by repo workflows
- minimal harness alignment needed to keep workflow behavior consistent after the analyzer freshness removal

## Locked Decisions
- `docs/specs/frontend-analyzer-report.md` is no longer a required tracked CI artifact.
- `scripts/frontend-analyzer.ts` is removed from this CI maintenance slice.
- `.github/workflows/analyzer-freshness.yml` no longer enforces tracked-report freshness.
- Workflow runtime maintenance must prefer upgrading action versions over relying on temporary GitHub Actions compatibility flags.
- Shared workflow changes in this slice are limited to removing analyzer freshness enforcement and Node.js 24 compatibility maintenance; trigger policy, deploy policy, and validation scope remain unchanged unless a minimal fix is required.
- No frontend or backend product behavior changes are included.

## Interfaces and Responsibilities
- `scripts/frontend-analyzer.ts`
  - removed as part of this maintenance slice
- `docs/specs/frontend-analyzer-report.md`
  - no longer required as a tracked CI contract artifact
- `.github/workflows/analyzer-freshness.yml`
  - removed or neutralized so CI does not run analyzer freshness checks
- `.github/workflows/pr-validation.yml`
- `.github/workflows/branch-validation.yml`
- `.github/workflows/backend-boundary-architecture.yml`
- `.github/workflows/persistence-migration-validation.yml`
- `.github/workflows/production-deploy.yml`
  - upgrade JavaScript-based actions to Node.js 24 compatible releases where available
  - preserve current triggers, permissions, concurrency, and validation intent

## Data/Contracts Touched
- removal of tracked analyzer report contract path `docs/specs/frontend-analyzer-report.md`
- removal of analyzer freshness workflow contract
- GitHub Actions action-version references
- GitHub Actions Node.js runtime compatibility behavior

## Acceptance Checklist
### Functional acceptance
- [ ] `scripts/frontend-analyzer.ts` is removed from the repository.
- [ ] `.github/workflows/analyzer-freshness.yml` no longer runs analyzer freshness checks.
- [ ] CI no longer fails because `docs/specs/frontend-analyzer-report.md` is missing.
- [ ] Workflow maintenance still preserves required validation and deploy intent outside analyzer freshness.

### Data/integration acceptance
- [ ] The tracked analyzer report contract path is removed from this maintenance scope.
- [ ] All workflow files using `actions/checkout` are updated to a Node.js 24 compatible release.
- [ ] Temporary compatibility flags are added only if an upgraded required action still needs them after version updates.
- [ ] Workflow trigger scope and merge-gate intent remain aligned with `ci-cd.md` except for analyzer freshness removal.

### Operational acceptance
- [ ] The maintenance slice can be verified locally by reviewing workflow YAML diffs and confirming analyzer script/report removal.
- [ ] No deployment trigger, VPS secret contract, or production tag policy changes are introduced.
- [ ] The fix remains isolated enough to revert without bundling unrelated frontend or backend changes.

### Explicit non-goals or exclusions
- [ ] No analyzer algorithm redesign is included.
- [ ] No frontend or backend application code changes are included.
- [ ] No CI trigger-matrix redesign or deployment-policy redesign is included.

## Dependencies
- [README.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/README.md)
- [ci-cd.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/ci-cd.md)
- [verification.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/verification.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [acceptance-criteria.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/acceptance-criteria.md)

## Open Questions
- Should a later spec introduce a lighter analyzer check mechanism, or keep analyzer checks out of CI entirely?
- If another third-party action in the repo lags on Node.js 24 support later, should the repo standardize a temporary workflow-level opt-in flag or continue handling compatibility per workflow?

## Task-Splitting Notes
- First implementation task: `QA-008`.
- Task title: `Remove analyzer freshness automation and complete Node.js 24 workflow compatibility`.
- Base branch: `develop`.
- Branch name: `infra/QA-008-analyzer-freshness-node24-maintenance`.
- Merge target: `develop`.
- Primary acceptance source: this spec.
- Review requirement: yes; `QA-008` may not self-merge.
- Verification method: workflow YAML diff review, removal checks for analyzer script/report contract, and inspection of `actions/checkout` upgrades.
- Keep `QA-008` limited to analyzer freshness removal, workflow YAML maintenance, and any minimal harness alignment directly required by those changes.

## Git Branch Implications
- Spec authoring uses `spec/SPEC-029-ci-workflow-maintenance`.
- Implementation uses `infra/QA-008-analyzer-freshness-node24-maintenance`.
- Do not mix `QA-008` with deployment-topology changes or unrelated frontend/backend feature work.
