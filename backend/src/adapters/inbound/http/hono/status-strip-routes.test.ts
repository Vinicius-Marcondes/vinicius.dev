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
      execute: async () => null,
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
    listStatusStripEntries: {
      execute: async () => ({
        items: [
          {
            accent: "pink",
            label: "current focus",
            value: "cluster 3",
          },
          {
            label: "location",
            value: "Sao Paulo",
          },
        ],
      }),
    },
  },
});

describe("status strip routes", () => {
  it("serves ordered status strip entries", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/status-strip");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [
        {
          accent: "pink",
          label: "current focus",
          value: "cluster 3",
        },
        {
          label: "location",
          value: "Sao Paulo",
        },
      ],
    });
  });
});
