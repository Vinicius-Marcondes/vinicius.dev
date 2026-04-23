# GitHub Actions CI/CD

## Purpose
Define the validation and release-automation policy for `vinicius.dev`, including what GitHub Actions must validate, what remains manual on the VPS, and how production releases are triggered.

## Scope
GitHub Actions workflow families, trigger rules, GitHub environments, release-tag policy, VPS deploy transport, and CI/CD task-splitting boundaries.

## Locked Decisions
- CI uses GitHub Actions.
- Pull requests targeting `develop` or `main` must run validation in GitHub Actions.
- Pushes to `develop` or `main` may run validation, but do not deploy any environment.
- Development deployment is manual on the VPS at `development.viniciuslab.dev`.
- Production deployment is automated from pushed release tags matching `v*`.
- Production deploy jobs run on GitHub-hosted runners and connect to the VPS over SSH.
- `development.viniciuslab.dev` and `viniciuslab.dev` run on the same VPS behind `Caddy`.
- `Caddy` handles public `80/443` traffic and routes by hostname to separate internal services or ports.
- Frontend validation uses Bun and must cover install, typecheck/lint where configured, build, and analyzer policy.
- Backend validation uses Bun once scaffolded and must cover install, lint/typecheck where configured, tests, Prisma migration checks, and backend boundary checks.
- Frontend analyzer freshness is required for spec/frontend-impacting PRs.
- Backend-only PRs run the frontend analyzer as a non-mutating validation check and do not require report changes unless drift is detected.
- The repo currently has no backend workflow YAML files or deploy descriptors, so this spec defines required validation families and lets implementation tasks wire concrete script names as the runtime is scaffolded.

## Interfaces and Responsibilities
### Workflow families
- `pr-validation`: runs on `pull_request` to `develop` and `main`
- `branch-validation`: runs on `push` to `develop` and `main`
- `production-deploy`: runs on `push` for tags matching `v*`
- `workflow_dispatch`: allowed only for manual production redeploys or reruns

### Validation policy
- `pr-validation` is the required review gate for merge readiness.
- `branch-validation` protects long-lived branches after merges and direct maintenance work.
- Validation jobs must call canonical frontend and backend verification commands once those commands are defined by package scripts.
- Frontend validation must run through Bun and include dependency install, static checks configured by the frontend package, production build, and analyzer policy.
- Spec/frontend-impacting PRs must update or verify `docs/specs/frontend-analyzer-report.md` when frontend contracts change.
- Backend-only PRs must run `bun scripts/frontend-analyzer.ts` as a non-mutating validation check, preferably writing temporary output outside the repo or comparing without modifying the tracked report.
- Backend validation must run through Bun after backend scaffold exists and include tests, lint/typecheck where configured, Prisma migration validation, and an architectural boundary check.
- CI must fail on contract drift once analyzer automation and boundary checks exist.

### Deployment policy
- Development deployment is outside CI/CD scope and is performed manually on the VPS.
- Production deployment is triggered only by a pushed `v*` tag that points to a commit already promoted to `main`.
- Production deployment must not trigger on branch pushes.
- The production deployment path uses SSH plus environment-scoped secrets, then invokes the server-side deploy mechanism chosen later for the VPS.

### GitHub environments
- `development`: defined for environment naming consistency and future secret isolation, but not used for automated deployments in v1
- `production`: used for production deployment secrets and optional protection rules

### VPS and routing contract
- `development.viniciuslab.dev` serves the manual dev/test environment.
- `viniciuslab.dev` serves production.
- Both environments live on the same VPS.
- Hostname routing is handled by `Caddy`, with separate internal frontend/backend services, ports, or compose projects per environment.
- Public alternate ports are not part of the standard topology.

### Secret categories
- SSH host
- SSH user
- SSH private key
- SSH known hosts
- remote deploy path or compose project target
- production environment file source or injection mechanism
- optional restart, health-check, or rollback command inputs

### Required command families
- Frontend install/build family: Bun-based install and production build for the Vite React TypeScript app.
- Frontend static check family: typecheck and lint commands when configured.
- Frontend analyzer family: tracked-report refresh for frontend/spec-impacting work and non-mutating validation for backend-only work.
- Backend install/check family: Bun-based install, typecheck/lint when configured, and unit/integration tests after backend scaffold exists.
- Prisma migration family: schema format/validate and migration status/check after Prisma exists.
- Boundary check family: verifies backend domain/application code does not import Hono, Prisma, filesystem, email providers, or other adapter-only dependencies.

## Data/Contracts Touched
- GitHub Actions workflow names
- workflow trigger matrix
- GitHub environment names and secret scopes
- release-tag convention
- VPS deploy transport
- hostname-to-service routing expectations
- frontend analyzer freshness policy
- backend migration and boundary check policy

## Acceptance Checklist
- [ ] `ci-cd.md` exists and is referenced by the harness.
- [ ] The workflow families `pr-validation`, `branch-validation`, and `production-deploy` are explicit.
- [ ] `pull_request` validation for `develop` and `main` is explicit.
- [ ] `push` validation for `develop` and `main` is explicit and does not deploy.
- [ ] Automated development deployment is explicitly out of scope.
- [ ] Production deployment is triggered only by pushed `v*` tags.
- [ ] Production tags are defined as valid only when created from commits already on `main`.
- [ ] `workflow_dispatch` is limited to production redeploy or rerun paths.
- [ ] GitHub-hosted runners plus SSH are the chosen production deploy transport.
- [ ] The same-VPS, two-hostname topology is consistent with `Caddy` on `80/443` and internal environment separation.
- [ ] Frontend checks explicitly use Bun and include build/static-check/analyzer policy.
- [ ] Backend checks explicitly use Bun once scaffolded and include tests, migration validation, and boundary checks.
- [ ] Spec/frontend-impacting PRs require analyzer freshness.
- [ ] Backend-only PRs run analyzer as a non-mutating validation check.
- [ ] Workflow implementation may choose exact package script names, but must satisfy the required command families.

## Dependencies
- [README.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/README.md)
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)
- [git-workflow.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/git-workflow.md)
- [github-project-execution.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/github-project-execution.md)
- [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md)
- [frontend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-architecture.md)
- [project-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/project-structure.md)
- [backend-architecture.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/backend-architecture.md)
- [infra-deployment.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/infra-deployment.md)

## Open Questions
- The exact workflow YAML layout, package script names, and VPS deploy script or compose target can be decided once backend runtime scaffolding and deployment descriptors exist.

## Task-Splitting Notes
- Do not split CI/CD implementation tasks until this spec is `Approved`.
- Keep workflow authoring separate from frontend or backend scaffold tasks if runtime commands are not ready yet.
- Do not bundle manual development environment operations into GitHub Actions work.
- Add analyzer and backend boundary checks as separate CI tasks if the first workflow task would otherwise become too broad.

## Git Branch Implications
- CI/CD harness changes use `spec/` branches.
- Production deploy workflow changes should be isolated from feature work so release rollbacks are straightforward.
