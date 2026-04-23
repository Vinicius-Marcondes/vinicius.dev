# vinicius.dev Backend

Bun + Hono + TypeScript backend scaffold for Wave 2.

## Commands
- `bun install`
- `bun run dev`
- `bun run typecheck`
- `bun test`
- `bun run build`
- `bun run seed`
- `bun run prisma:format`
- `bun run prisma:validate`
- `bun run prisma:generate`
- `bun run prisma:migrate:status`
- `bun run prisma:check`
- `bun run verify`
- `bun run verify:boundary`

`bun run prisma:check` runs Prisma format, validate, generate, and conditionally migration status. Migration status is skipped with a clear message when `DATABASE_URL` is not set.

`bun run verify` runs the backend boundary check, persistence verification, and the frontend analyzer in non-mutating mode, writing the analyzer output to `/tmp/vinicius-dev-frontend-analyzer-be005.md`.

## Persistence
Copy `.env.example` to `.env` for local development and set `DATABASE_URL` to a PostgreSQL database. DATA-001 only establishes Prisma/Postgres tooling; product models are added by later persistence tasks.

`bun run seed` is a deterministic no-op baseline until product fixtures exist. It provides an explicit seed entrypoint now so later tasks can replace it with real development data without changing workflow conventions.

## Scope
This package starts as the BE-001 scaffold only. Domain modules, adapters, persistence, media, auth, admin, and chat behavior are introduced by later Wave 2 tasks.
