FROM oven/bun:1.3.11-alpine

WORKDIR /app/backend

COPY backend/package.json backend/bun.lock backend/prisma.config.ts ./
COPY backend/prisma ./prisma
RUN bun install --frozen-lockfile
RUN bun run prisma:generate

COPY backend/src ./src

CMD ["bun", "run", "start"]
