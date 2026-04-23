import { Hono } from "hono";

export const createServer = () => {
  const app = new Hono();

  app.get("/health", (c) =>
    c.json({
      service: "vinicius.dev-backend",
      status: "ok",
    }),
  );

  return app;
};

const app = createServer();

if (import.meta.main) {
  const port = Number(Bun.env.PORT ?? 3000);

  Bun.serve({
    fetch: app.fetch,
    port,
  });

  console.info(`vinicius.dev backend listening on :${port}`);
}

export default app;
