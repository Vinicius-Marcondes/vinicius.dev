import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";

import { createHonoHttpAdapter } from "./http-adapter";

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
              source: "projects/crt-shader-kit.md",
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
    getPublishedPhotoById: {
      execute: async () => null,
    },
    getPublishedThoughtBySlug: {
      execute: async () => null,
    },
    listPublishedProjects: {
      execute: async ({ page, pageSize, search, sort, status, tags }) => ({
        items: [
          {
            channel: "07",
            description: `search=${search ?? "none"} tags=${tags?.join("|") ?? "none"} page=${page ?? 0} size=${pageSize ?? 0}`,
            id: "project_1",
            links: {
              github: "#",
              site: "#",
            },
            slug: "crt-shader-kit",
            status: status ?? "live",
            tags: ["webgl", "glsl"],
            thumbnail: {
              hue: sort === "alpha" ? "pink" : "cyan",
              kind: "grid",
            },
            title: "crt.shader",
            year: 2025,
          },
        ],
        pageInfo: {
          page: page ?? 1,
          pageSize: pageSize ?? 12,
          totalItems: 1,
          totalPages: 1,
        },
      }),
    },
    listPublishedPhotos: {
      execute: async () => ({
        items: [],
        pageInfo: {
          page: 1,
          pageSize: 24,
          totalItems: 0,
          totalPages: 1,
        },
      }),
    },
    listPublishedThoughts: {
      execute: async () => ({
        items: [],
        pageInfo: {
          nextCursor: null,
        },
      }),
    },
  },
});

describe("projects routes", () => {
  it("maps validated list queries to the Projects use case", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request(
      "/api/projects?status=live&tag=typescript&tags=react,bun&search=shader&sort=alpha&page=2&pageSize=5",
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [
        {
          channel: "07",
          description: "search=shader tags=typescript|react|bun page=2 size=5",
          id: "project_1",
          links: {
            github: "#",
            site: "#",
          },
          slug: "crt-shader-kit",
          status: "live",
          tags: ["webgl", "glsl"],
          thumbnail: {
            hue: "pink",
            kind: "grid",
          },
          title: "crt.shader",
          year: 2025,
        },
      ],
      pageInfo: {
        page: 2,
        pageSize: 5,
        totalItems: 1,
        totalPages: 1,
      },
    });
  });

  it("rejects invalid project list queries before reaching the core", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/projects?status=nope&sort=weird");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_query",
      field: "status",
    });
  });

  it("returns a project detail by slug", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/projects/crt-shader-kit");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      item: {
        body: "Shader notes",
        channel: "07",
        description: "a tiny webgl shader kit",
        id: "project_1",
        links: {
          github: "#",
          site: "#",
        },
        slug: "crt-shader-kit",
        source: "projects/crt-shader-kit.md",
        status: "live",
        tags: ["webgl", "glsl"],
        thumbnail: {
          hue: "cyan",
          kind: "grid",
        },
        title: "crt.shader",
        year: 2025,
      },
    });
  });

  it("returns not found for an unknown project slug", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/projects/unknown-project");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "not_found",
      resource: "project",
    });
  });
});
