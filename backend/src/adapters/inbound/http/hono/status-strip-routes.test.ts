import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";

import { createHonoHttpAdapter } from "./http-adapter";

const createTestContainer = (): BootstrapContainer => ({
  chat: {
    uploadMessageWithImage: {
      execute: async () => ({
        attachment: {
          byteSize: 0,
          fileName: "upload.webp",
          id: "upload_1",
          kind: "image",
          mimeType: "image/webp",
        },
        authorHandleId: "handle_1",
        body: "uploaded an image without a caption",
        id: "message_1",
        sentAt: "2026-04-24T00:00:00.000Z",
        tone: null,
      }),
    },
  },
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
  media: {
    repository: {
      findChatUploadMediaById: async () => null,
      findPhotoMediaById: async () => null,
    },
    storage: {
      chatUploads: {
        deleteUpload: async () => {},
        openUpload: async () => null,
        writeUpload: async () => ({
          byteSize: 0,
          storageKey: "test-upload",
          storagePath: "test-upload",
        }),
      },
      photos: {
        openOriginal: async () => null,
      },
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
