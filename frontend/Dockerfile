FROM oven/bun:1.3.11-alpine

WORKDIR /app/frontend

COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY frontend/. .
RUN bun run build

CMD ["bun", "scripts/serve-dist.ts"]
