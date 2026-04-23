import { Hono } from "hono";

import { createHonoHttpAdapter } from "../adapters/inbound/http/hono/http-adapter";
import { createContainer } from "./container";

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

const container = createContainer();
const app = createServer();

if (import.meta.main) {
  Bun.serve({
    fetch: app.fetch,
    port: container.config.server.port,
  });

  console.info(`vinicius.dev backend listening on :${container.config.server.port}`);
}

export default app;
