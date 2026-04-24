import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";

import { createHonoHttpAdapter } from "./http-adapter";

const encoder = new TextEncoder();

type TestContainerOptions = Readonly<{
  filesByReference?: Readonly<
    Record<
      string,
      Readonly<{
        absolutePath: string;
        body: string;
      }>
    >
  >;
  mediaById?: Readonly<
    Record<
      string,
      Readonly<{
        originalReference: string;
        originalReferencePolicy?: "backend_media_route" | "filesystem_reference";
      }>
    >
  >;
  publishedPhotoIds?: readonly string[];
}>;

const createPublishedPhotoDetail = (id: string) => ({
  camera: "Canon T7+",
  caption: "Night street frame.",
  date: "2026-03-22",
  film: "digital",
  frame: "014",
  id,
  location: "Sao Paulo",
  originalUrl: `/media/photos/${id}/original`,
  tags: ["night", "street"],
  title: "paulista at 02:14",
  tone: "sunset" as const,
});

const createTestContainer = (options: TestContainerOptions = {}): BootstrapContainer => {
  const publishedPhotoIds = new Set(options.publishedPhotoIds ?? ["p-2026-014"]);
  const mediaById = options.mediaById ?? {
    "p-2026-014": {
      originalReference: "published/p-2026-014.jpg",
    },
  };
  const filesByReference = options.filesByReference ?? {
    "published/p-2026-014.jpg": {
      absolutePath: "/tmp/photos/p-2026-014.jpg",
      body: "jpeg-bytes",
    },
  };

  return {
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
        execute: async ({ id }) => (publishedPhotoIds.has(id) ? createPublishedPhotoDetail(id) : null),
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
          items: [],
        }),
      },
    },
    media: {
      repository: {
        findChatUploadMediaById: async () => null,
        findPhotoMediaById: async (id) => {
          const media = mediaById[id];

          if (!media) {
            return null;
          }

          return {
            createdAt: new Date("2026-03-22T00:00:00.000Z"),
            id,
            originalReference: media.originalReference,
            originalReferencePolicy: media.originalReferencePolicy ?? "backend_media_route",
            title: "paulista at 02:14",
            updatedAt: new Date("2026-03-23T00:00:00.000Z"),
          };
        },
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
          openOriginal: async (reference) => {
            const file = filesByReference[reference];

            if (!file) {
              return null;
            }

            const bytes = encoder.encode(file.body);

            return {
              absolutePath: file.absolutePath,
              byteSize: bytes.byteLength,
              stream: new ReadableStream<Uint8Array>({
                start(controller) {
                  controller.enqueue(bytes);
                  controller.close();
                },
              }),
            };
          },
        },
      },
    },
  };
};

describe("photo media routes", () => {
  it("delivers original media for published photos", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/media/photos/p-2026-014/original");

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("content-length")).toBe("10");
    await expect(response.text()).resolves.toBe("jpeg-bytes");
  });

  it("returns denied for unpublished photos with existing media metadata", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        publishedPhotoIds: [],
      }),
    );
    const response = await app.request("/media/photos/p-2026-014/original");

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "photo",
    });
  });

  it("returns not found when media metadata is missing", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        mediaById: {},
        publishedPhotoIds: [],
      }),
    );
    const response = await app.request("/media/photos/p-2026-014/original");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "not_found",
      resource: "photo",
    });
  });

  it("returns not found when photo media storage is missing", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        filesByReference: {},
      }),
    );
    const response = await app.request("/media/photos/p-2026-014/original");

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "not_found",
      resource: "photo",
    });
  });

  it("rejects blank ids", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/media/photos/%20/original");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_path",
      field: "id",
    });
  });
});
