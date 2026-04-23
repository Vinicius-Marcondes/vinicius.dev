import { describe, expect, it } from "bun:test";

import { createServer } from "./server";

describe("backend server scaffold", () => {
  it("responds to the health route", async () => {
    const app = createServer();
    const response = await app.request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      service: "vinicius.dev-backend",
      status: "ok",
    });
  });

  it("mounts the /api shell and placeholder route families", async () => {
    const app = createServer();

    const shellResponse = await app.request("/api");
    expect(shellResponse.status).toBe(200);
    await expect(shellResponse.json()).resolves.toEqual({
      route: "/api",
      service: "vinicius.dev-backend",
      status: "ok",
      surface: "hono-http-adapter-shell",
    });

    const placeholderRoutes = [
      ["/api/thoughts", "public content"],
      ["/api/projects", "public content"],
      ["/api/photos", "public content"],
      ["/api/status-strip", "status strip"],
      ["/api/chat", "chat"],
      ["/api/admin", "admin"],
      ["/api/auth", "auth"],
      ["/api/rss", "rss"],
      ["/api/sitemap", "sitemap"],
      ["/media/photos/123/original", "photo media"],
    ] as const;

    for (const [path, family] of placeholderRoutes) {
      const response = await app.request(path);

      expect(response.status).toBe(501);
      await expect(response.json()).resolves.toMatchObject({
        family,
        route: path,
        service: "vinicius.dev-backend",
        status: "not_implemented",
      });
    }
  });
});
