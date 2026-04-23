# vinicius.dev Backend

Bun + Hono + TypeScript backend scaffold for Wave 2.

## Commands
- `bun install`
- `bun run dev`
- `bun run typecheck`
- `bun test`
- `bun run build`
- `bun run verify`
- `bun run verify:boundary`

`bun run verify` runs the backend boundary check and the frontend analyzer in non-mutating mode, writing the analyzer output to `/tmp/vinicius-dev-frontend-analyzer-be005.md`.

## Scope
This package starts as the BE-001 scaffold only. Domain modules, adapters, persistence, media, auth, admin, and chat behavior are introduced by later Wave 2 tasks.
