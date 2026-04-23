import { Hono } from "hono";

import { createHonoHttpAdapter } from "../adapters/inbound/http/hono/http-adapter";
import { createContainer, type BootstrapContainer } from "./container";

export const createServer = (container: BootstrapContainer = createContainer()) => {
  const app = new Hono();

  app.get("/health", (c) =>
    c.json({
      service: "vinicius.dev-backend",
      status: "ok",
    }),
  );

  app.route("/", createHonoHttpAdapter(container));

  return app;
};

if (import.meta.main) {
  const container = createContainer();
  const app = createServer(container);

  Bun.serve({
    fetch: app.fetch,
    port: container.config.server.port,
  });

  console.info(`vinicius.dev backend listening on :${container.config.server.port}`);
}

export default createServer;
