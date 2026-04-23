import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "./container";
import { createServer } from "./server";

const createTestContainer = (): BootstrapContainer => ({
  config: {
    auth: {
      mfaCodeMaxAgeSeconds: 600,
      roomPasswordSecret: "test-room-secret",
      sessionCookieName: "vinicius.dev-session",
      sessionMaxAgeSeconds: 604800,
      sessionSecret: "test-session-secret",
    },
    cors: {
      allowCredentials: true,
      allowedOrigins: [],
    },
    media: {
      chatRoot: "/tmp/chat",
      chatUploadAllowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      chatUploadMaxBytes: 5 * 1024 * 1024,
      chatUploadMaxFilesPerMessage: 1,
      photosRoot: "/tmp/photos",
      publicUrlBase: "/media",
    },
    server: {
      apiBasePath: "/api",
      mediaPhotoOriginalPath: "/media/photos/:id/original",
      nodeEnv: "test",
      port: 4000,
    },
  },
  content: {
    getPublishedThoughtBySlug: {
      execute: async ({ slug }) =>
        slug === "night-cable-interfaces"
          ? {
              body: "A homepage does not need to convert anyone.",
              bodyPreview: "A homepage does not need to convert anyone.",
              excerpt: "The best personal websites feel less like products.",
              id: "thought_1",
              publishedAt: "2026-03-28",
              readingTime: "7 min",
              slug,
              source: null,
              status: "published",
              tags: ["interface", "nostalgia"],
              title: "Night Cable Interfaces",
              type: "essay",
            }
          : null,
    },
    listPublishedThoughts: {
      execute: async () => ({
        items: [
          {
            bodyPreview: "A homepage does not need to convert anyone.",
            excerpt: "The best personal websites feel less like products.",
            id: "thought_1",
            publishedAt: "2026-03-28",
            readingTime: "7 min",
            slug: "night-cable-interfaces",
            status: "published",
            tags: ["interface", "nostalgia"],
            title: "Night Cable Interfaces",
            type: "essay",
          },
        ],
        pageInfo: {
          nextCursor: null,
        },
      }),
    },
    getPublishedProjectBySlug: {
      execute: async ({ slug }) =>
        slug === "crt-shader-kit"
          ? {
              body: "Shader notes",
              channel: "07",
              description: "a tiny webgl shader kit",
              id: "project_1",
              links: {
                github: "#",
                site: "#",
              },
              slug,
              source: null,
              status: "live",
              tags: ["webgl", "glsl"],
              thumbnail: {
                hue: "cyan",
                kind: "grid",
              },
              title: "crt.shader",
              year: 2025,
            }
          : null,
    },
    listPublishedProjects: {
      execute: async () => ({
        items: [
          {
            channel: "07",
            description: "a tiny webgl shader kit",
            id: "project_1",
            links: {
              github: "#",
              site: "#",
            },
            slug: "crt-shader-kit",
            status: "live",
            tags: ["webgl", "glsl"],
            thumbnail: {
              hue: "cyan",
              kind: "grid",
            },
            title: "crt.shader",
            year: 2025,
          },
        ],
        pageInfo: {
          page: 1,
          pageSize: 12,
          totalItems: 1,
          totalPages: 1,
        },
      }),
    },
  },
});

describe("backend server scaffold", () => {
  it("responds to the health route", async () => {
    const app = createServer(createTestContainer());
    const response = await app.request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      service: "vinicius.dev-backend",
      status: "ok",
    });
  });

  it("mounts the /api shell and placeholder route families", async () => {
    const app = createServer(createTestContainer());

    const shellResponse = await app.request("/api");
    expect(shellResponse.status).toBe(200);
    await expect(shellResponse.json()).resolves.toEqual({
      route: "/api",
      service: "vinicius.dev-backend",
      status: "ok",
      surface: "hono-http-adapter-shell",
    });

    const thoughtsResponse = await app.request("/api/thoughts");
    expect(thoughtsResponse.status).toBe(200);
    await expect(thoughtsResponse.json()).resolves.toEqual({
      items: [
        {
          bodyPreview: "A homepage does not need to convert anyone.",
          excerpt: "The best personal websites feel less like products.",
          id: "thought_1",
          publishedAt: "2026-03-28",
          readingTime: "7 min",
          slug: "night-cable-interfaces",
          status: "published",
          tags: ["interface", "nostalgia"],
          title: "Night Cable Interfaces",
          type: "essay",
        },
      ],
      pageInfo: {
        nextCursor: null,
      },
    });

    const projectsResponse = await app.request("/api/projects");
    expect(projectsResponse.status).toBe(200);
    await expect(projectsResponse.json()).resolves.toEqual({
      items: [
        {
          channel: "07",
          description: "a tiny webgl shader kit",
          id: "project_1",
          links: {
            github: "#",
            site: "#",
          },
          slug: "crt-shader-kit",
          status: "live",
          tags: ["webgl", "glsl"],
          thumbnail: {
            hue: "cyan",
            kind: "grid",
          },
          title: "crt.shader",
          year: 2025,
        },
      ],
      pageInfo: {
        page: 1,
        pageSize: 12,
        totalItems: 1,
        totalPages: 1,
      },
    });

    const placeholderRoutes = [
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
