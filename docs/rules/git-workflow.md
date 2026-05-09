# Git Workflow

## Purpose
Define branch, commit, PR, merge, and release rules for the supervised PRD workflow.

## Hard Rules
- Before any Git command, read this file.
- Never run `git push origin master`.
- Do not rewrite shared history unless Vinicius explicitly asks.
- Do not revert user changes unless Vinicius explicitly asks.
- `main` is the stable branch.
- `develop` is the integration branch.
- PRD implementation branches base from updated `develop`.
- Pull requests target only `develop`.
- Merges into `develop` require a reviewed PR.
- Use merge commits for integration.
- Every accepted task gets exactly one signed commit with `git commit -s`.

## Branches
Use one implementation branch per PRD.

Branch format:
```text
feature/PRD-004-photo-catalog-admin-upload
hotfix/PRD-005-login-regression
release/PRD-006-milestone-release
```

Use broad prefixes such as `feature/`, `hotfix/`, and `release/`. Do not create task-specific branch prefixes for normal PRD work.

## Commits
Commit exactly one accepted task at a time.

Commit subject format:
```text
PRD-004 PHOTO-001: implement public photo catalog list
```

Commit body template:
```text
Motivation:
<why this task exists>

Goal:
<what this task needed to achieve>

Changes:
- <what changed>

Verification:
- <command or check and result>
```

Each accepted task commit must include:
- implementation changes for that task
- relevant tests or docs
- `docs/TRACKER.md` updates for that task's status, evidence, decision log, and commit entry

Do not commit blocked work unless Vinicius explicitly asks for a checkpoint commit.

## Pull Requests
- Open one PR per PRD implementation branch.
- PRs target `develop`.
- The PR title includes the PRD ID.
- The PR description is generated from `docs/TRACKER.md`.
- Include accepted tasks, commits, evidence, and known limitations from task decision logs.
- PRs are mandatory before merging to `develop`.

## Releases
- Development deployment is manual on the VPS at `development.viniciuslab.dev`.
- Production releases come from `v*` tags that point to commits already on `main`.
- Production deployment must not trigger from branch pushes.
