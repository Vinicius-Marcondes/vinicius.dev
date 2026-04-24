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
      execute: async () => null,
    },
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
              source: "notes/night-cable-interfaces.md",
              status: "published",
              tags: ["interface", "nostalgia"],
              title: "Night Cable Interfaces",
              type: "essay",
            }
          : null,
    },
    listPublishedThoughts: {
      execute: async ({ cursor, limit, search, tags, type }) => ({
        items: [
          {
            bodyPreview: `cursor=${cursor ?? "none"} search=${search ?? "none"} tags=${tags?.join("|") ?? "none"} limit=${limit ?? 0}`,
            excerpt: "The best personal websites feel less like products.",
            id: "thought_1",
            publishedAt: "2026-03-28",
            readingTime: "7 min",
            slug: "night-cable-interfaces",
            status: "published",
            tags: ["interface", "nostalgia"],
            title: type === "note" ? "Adjusted Type" : "Night Cable Interfaces",
            type: type ?? "essay",
          },
        ],
        pageInfo: {
          nextCursor: null,
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
    listStatusStripEntries: {
      execute: async () => ({
        items: [],
      }),
    },
  },
});

describe("thoughts routes", () => {
  it("maps validated list queries to the Thoughts use case", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request(
      "/api/thoughts?type=note&tag=ops&tags=web,craft&search=retro&limit=3&cursor=abc123",
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [
        {
          bodyPreview: "cursor=abc123 search=retro tags=ops|web|craft limit=3",
          excerpt: "The best personal websites feel less like products.",
          id: "thought_1",
          publishedAt: "2026-03-28",
          readingTime: "7 min",
          slug: "night-cable-interfaces",
          status: "published",
          tags: ["interface", "nostalgia"],
          title: "Adjusted Type",
          type: "note",
        },
      ],
      pageInfo: {
        nextCursor: null,
      },
    });
  });

  it("rejects invalid list queries before reaching the core", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/thoughts?limit=0&type=invalid");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_query",
      field: "type",
    });
  });

  it("returns a published thought detail by slug", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/thoughts/night-cable-interfaces");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      item: {
        body: "A homepage does not need to convert anyone.",
        bodyPreview: "A homepage does not need to convert anyone.",
        excerpt: "The best personal websites feel less like products.",
        id: "thought_1",
        publishedAt: "2026-03-28",
        readingTime: "7 min",
        slug: "night-cable-interfaces",
        source: "notes/night-cable-interfaces.md",
        status: "published",
        tags: ["interface", "nostalgia"],
        title: "Night Cable Interfaces",
        type: "essay",
      },
    });
  });

  it("returns not found for an unknown thought slug", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/thoughts/unknown-thought");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "not_found",
      resource: "thought",
    });
  });
});
