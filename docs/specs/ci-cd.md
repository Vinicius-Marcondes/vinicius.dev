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
- The repo currently has no workflow YAML files, package manifests, or deploy descriptors, so this spec defines policy first and does not invent concrete commands yet.

## Interfaces and Responsibilities
### Workflow families
- `pr-validation`: runs on `pull_request` to `develop` and `main`
- `branch-validation`: runs on `push` to `develop` and `main`
- `production-deploy`: runs on `push` for tags matching `v*`
- `workflow_dispatch`: allowed only for manual production redeploys or reruns

### Validation policy
- `pr-validation` is the required review gate for merge readiness.
- `branch-validation` protects long-lived branches after merges and direct maintenance work.
- Validation jobs must call the canonical frontend and backend verification commands once those commands are defined by the runtime specs.
- Until those commands exist, the harness records the requirement and leaves the exact command names to later implementation-facing specs or workflow tasks.

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

## Data/Contracts Touched
- GitHub Actions workflow names
- workflow trigger matrix
- GitHub environment names and secret scopes
- release-tag convention
- VPS deploy transport
- hostname-to-service routing expectations

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
- [ ] The spec acknowledges that workflow YAML, build commands, and deploy descriptors are not defined yet and does not invent them.

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
- The exact workflow YAML layout, concrete validation commands, and the VPS deploy script or compose target can be decided once the frontend and backend runtime scaffolds exist.

## Task-Splitting Notes
- Do not split CI/CD implementation tasks until this spec is `Approved`.
- Keep workflow authoring separate from frontend or backend scaffold tasks if runtime commands are not ready yet.
- Do not bundle manual development environment operations into GitHub Actions work.

## Git Branch Implications
- CI/CD harness changes use `spec/` branches.
- Production deploy workflow changes should be isolated from feature work so release rollbacks are straightforward.
