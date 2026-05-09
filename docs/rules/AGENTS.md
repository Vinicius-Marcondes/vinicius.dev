# Repository Rules

This directory is the canonical source of truth for `vinicius.dev` agents and implementation work.

## Read Order
1. [supervised-workflow.md](supervised-workflow.md) for PRD execution, task statuses, review modes, blockers, and acceptance.
2. [git-workflow.md](git-workflow.md) before any Git command.
3. [prd-and-tracker.md](prd-and-tracker.md) before creating PRDs, task files, or `docs/TRACKER.md`.
4. [architecture.md](architecture.md) before changing frontend, backend, routing, API boundaries, or repo structure.
5. [product-and-platform.md](product-and-platform.md) before changing product behavior, data, media, admin, infra, CI, deployment, security, or testing.

## Active Work Files
- PRDs live under `docs/prds/<PRD-ID>/`.
- Task files live under `docs/prds/<PRD-ID>/tasks/`.
- The live execution tracker is `docs/TRACKER.md`.
- `docs/TRACKER.md` is replaced for each PRD.

## Hard Guardrails
- Never read inside `node_modules`.
- Never run `git push origin master`.
- Do not rewrite shared history or revert user changes unless Vinicius explicitly asks.
- Do not change task boundaries without asking Vinicius first.
- Stop immediately on blockers.
