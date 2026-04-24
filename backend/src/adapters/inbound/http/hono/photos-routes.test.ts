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
      execute: async () => null,
    },
    getPublishedPhotoById: {
      execute: async ({ id }) =>
        id === "p-2026-014"
          ? {
              camera: "Canon T7+",
              caption: "Night street frame.",
              date: "2026-03-22",
              film: "digital",
              frame: "014",
              id,
              location: "Sao Paulo",
              originalUrl: "/media/photos/p-2026-014/original",
              tags: ["night", "street"],
              title: "paulista at 02:14",
              tone: "sunset",
            }
          : null,
    },
    getPublishedThoughtBySlug: {
      execute: async () => null,
    },
    listPublishedPhotos: {
      execute: async ({ location, page, pageSize, search, year }) => ({
        items: [
          {
            date: "2026-03-22",
            frame: "014",
            id: "p-2026-014",
            location: location ?? "Sao Paulo",
            originalUrl: "/media/photos/p-2026-014/original",
            tags: ["night", "street"],
            title: `search=${search ?? "none"} year=${year ?? 0} page=${page ?? 0} size=${pageSize ?? 0}`,
            tone: "sunset",
          },
        ],
        pageInfo: {
          page: page ?? 1,
          pageSize: pageSize ?? 24,
          totalItems: 1,
          totalPages: 1,
        },
      }),
    },
    listPublishedProjects: {
      execute: async () => ({
        items: [],
        pageInfo: {
          page: 1,
          pageSize: 12,
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

describe("photos routes", () => {
  it("maps validated list queries to the Photos use case", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request(
      "/api/photos?year=2026&location=Sao%20Paulo&search=night&page=2&pageSize=8",
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [
        {
          date: "2026-03-22",
          frame: "014",
          id: "p-2026-014",
          location: "Sao Paulo",
          originalUrl: "/media/photos/p-2026-014/original",
          tags: ["night", "street"],
          title: "search=night year=2026 page=2 size=8",
          tone: "sunset",
        },
      ],
      pageInfo: {
        page: 2,
        pageSize: 8,
        totalItems: 1,
        totalPages: 1,
      },
    });
  });

  it("rejects invalid photo list queries before reaching the core", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/photos?year=nope");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_query",
      field: "year",
    });
  });

  it("returns a photo detail by id", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/photos/p-2026-014");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      item: {
        camera: "Canon T7+",
        caption: "Night street frame.",
        date: "2026-03-22",
        film: "digital",
        frame: "014",
        id: "p-2026-014",
        location: "Sao Paulo",
        originalUrl: "/media/photos/p-2026-014/original",
        tags: ["night", "street"],
        title: "paulista at 02:14",
        tone: "sunset",
      },
    });
  });

  it("returns not found for an unknown photo id", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/photos/missing");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "not_found",
      resource: "photo",
    });
  });
});
