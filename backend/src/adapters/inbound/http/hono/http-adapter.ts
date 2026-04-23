import { Hono } from "hono";

const serviceName = "vinicius.dev-backend";

type NotImplementedResponse = {
  family: string;
  method: string;
  route: string;
  service: string;
  status: "not_implemented";
};

const createNotImplementedFamily = (family: string) => {
  const familyApp = new Hono();

  familyApp.all("*", (c) =>
    c.json<NotImplementedResponse>(
      {
        family,
        method: c.req.method,
        route: c.req.path,
        service: serviceName,
        status: "not_implemented",
      },
      501,
    ),
  );

  return familyApp;
};

const mountPlaceholderFamily = (app: Hono, path: string, family: string) => {
  app.route(path, createNotImplementedFamily(family));
};

export const createHonoHttpAdapter = () => {
  const app = new Hono();

  app.get("/api", (c) =>
    c.json({
      route: "/api",
      service: serviceName,
      status: "ok",
      surface: "hono-http-adapter-shell",
    }),
  );

  mountPlaceholderFamily(app, "/api/thoughts", "public content");
  mountPlaceholderFamily(app, "/api/projects", "public content");
  mountPlaceholderFamily(app, "/api/photos", "public content");
  mountPlaceholderFamily(app, "/api/status-strip", "status strip");
  mountPlaceholderFamily(app, "/api/chat", "chat");
  mountPlaceholderFamily(app, "/api/admin", "admin");
  mountPlaceholderFamily(app, "/api/auth", "auth");
  mountPlaceholderFamily(app, "/api/rss", "rss");
  mountPlaceholderFamily(app, "/api/sitemap", "sitemap");

  app.get("/media/photos/:id/original", (c) =>
    c.json<NotImplementedResponse>(
      {
        family: "photo media",
        method: c.req.method,
        route: c.req.path,
        service: serviceName,
        status: "not_implemented",
      },
      501,
    ),
  );

  return app;
};
