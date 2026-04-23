import { Hono } from "hono";

import { createHonoHttpAdapter } from "../adapters/inbound/http/hono/http-adapter";

export const createServer = () => {
  const app = new Hono();

  app.get("/health", (c) =>
    c.json({
      service: "vinicius.dev-backend",
      status: "ok",
    }),
  );

  app.route("/", createHonoHttpAdapter());

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
