import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";

import { createHonoHttpAdapter } from "./http-adapter";

const encoder = new TextEncoder();

type TestContainerOptions = Readonly<{
  draftPhotoIds?: readonly string[];
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
      }>
    >
  >;
  publishedPhotoIds?: readonly string[];
}>;

const createAdminPhotoItem = (
  id: string,
  status: "draft" | "published",
) => ({
  camera: "Canon T7+",
  caption: "Night street frame.",
  date: "2026-03-22",
  featured: false,
  film: "digital",
  frame: "014",
  id,
  location: "Sao Paulo",
  original: {
    byteSize: 10,
    displayFilename: "photo.jpg",
    mimeType: "image/jpeg",
  },
  status,
  tags: ["night", "street"],
  title: "paulista at 02:14",
  tone: "sunset" as const,
  updatedAt: "2026-04-28T12:00:00.000Z",
});

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
  const draftPhotoIds = new Set(options.draftPhotoIds ?? ["p-draft-001"]);
  const mediaById = options.mediaById ?? {
    "p-2026-014": {
      originalReference: "published/p-2026-014.jpg",
    },
    "p-draft-001": {
      originalReference: "draft/p-draft-001.jpg",
    },
  };
  const filesByReference = options.filesByReference ?? {
    "published/p-2026-014.jpg": {
      absolutePath: "/tmp/photos/p-2026-014.jpg",
      body: "jpeg-bytes",
    },
    "draft/p-draft-001.jpg": {
      absolutePath: "/tmp/photos/p-draft-001.jpg",
      body: "draft-bytes",
    },
  };

  return {
    admin: {
      createPhoto: {
        execute: async () => ({
          item: createAdminPhotoItem("created-photo", "draft"),
        }),
      },
      getDashboardSummary: {
        execute: async () => ({
          moderationCommands: ["delete_message", "ban_handle", "rotate_room_password"] as const,
          panels: {
            chatFlags: 0,
            draftThoughts: 0,
            featuredSlots: 0,
            photoRecords: 0,
            statusStripEntries: 0,
          },
          queues: {
            content: [],
          },
        }),
      },
      getPhotoById: {
        execute: async ({ id }) => {
          if (publishedPhotoIds.has(id)) {
            return {
              item: createAdminPhotoItem(id, "published"),
            };
          }

          if (draftPhotoIds.has(id)) {
            return {
              item: createAdminPhotoItem(id, "draft"),
            };
          }

          return null;
        },
      },
      listPhotos: {
        execute: async () => ({
          items: [],
          pageInfo: {
            page: 1,
            pageSize: 20,
            totalItems: 0,
            totalPages: 1,
          },
        }),
      },
      listProjects: {
        execute: async () => ({
          items: [],
          pageInfo: {
            page: 1,
            pageSize: 20,
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
      listThoughts: {
        execute: async () => ({
          items: [],
          pageInfo: {
            page: 1,
            pageSize: 20,
            totalItems: 0,
            totalPages: 1,
          },
        }),
      },
      replaceStatusStripEntries: {
        execute: async () => ({
          items: [],
        }),
      },
      updatePhotoCuration: {
        execute: async () => null,
      },
      updatePhotoMetadata: {
        execute: async () => null,
      },
      updateProjectCuration: {
        execute: async () => null,
      },
      updateThoughtCuration: {
        execute: async () => null,
      },
    },
    auth: {
      loginWithCredentials: {
        execute: async () => ({
          challenge: {
            delivery: "email" as const,
            expiresAt: "2026-04-28T12:10:00.000Z",
            id: "challenge_1",
            maskedEmail: "ad***@example.com",
          },
          state: "mfa_required" as const,
        }),
      },
      logoutAdminSession: {
        execute: async () => ({
          status: "revoked" as const,
        }),
      },
      refreshAdminSession: {
        execute: async () => ({
          admin: {
            email: "admin@example.com",
            id: "admin_1",
          },
          session: {
            expiresAt: "2026-04-28T12:10:00.000Z",
            id: "session_1",
          },
          sessionToken: "session-token-1",
          state: "ready" as const,
        }),
      },
      resolveAdminSession: {
        execute: async () => ({
          admin: {
            email: "admin@example.com",
            id: "admin_1",
          },
          session: {
            expiresAt: "2026-04-28T12:10:00.000Z",
            id: "session_1",
          },
        }),
      },
      verifyMfaChallenge: {
        execute: async () => ({
          admin: {
            email: "admin@example.com",
            id: "admin_1",
          },
          session: {
            expiresAt: "2026-04-28T12:10:00.000Z",
            id: "session_1",
          },
          sessionToken: "session-token-1",
          state: "ready" as const,
        }),
      },
    },
    chat: {
      moderateUploadRetention: {
        execute: async () => null,
      },
      openUploadMedia: {
        execute: async () => null,
      },
      uploadMessageWithImage: {
        execute: async () => ({
          attachment: {
            byteSize: 0,
            fileName: "upload.webp",
            id: "upload_1",
            kind: "image" as const,
            mimeType: "image/webp" as const,
          },
          author: "vinicius",
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
        mfaMaxAttempts: 5,
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
          facets: {
            locations: [],
            years: [],
          },
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
            originalByteSize: 10,
            originalDisplayFilename: "photo.jpg",
            originalMimeType: "image/jpeg",
            originalReference: media.originalReference,
            originalReferencePolicy: "backend_media_route" as const,
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
            storageKey: "upload_1",
            storagePath: "upload_1",
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

describe("admin photo routes", () => {
  it("returns an admin photo detail for draft records", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/admin/photos/p-draft-001", {
      headers: {
        cookie: "vinicius.dev-session=session-token-1",
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      item: {
        camera: "Canon T7+",
        caption: "Night street frame.",
        date: "2026-03-22",
        featured: false,
        film: "digital",
        frame: "014",
        id: "p-draft-001",
        location: "Sao Paulo",
        original: {
          byteSize: 10,
          displayFilename: "photo.jpg",
          mimeType: "image/jpeg",
        },
        status: "draft",
        tags: ["night", "street"],
        title: "paulista at 02:14",
        tone: "sunset",
        updatedAt: "2026-04-28T12:00:00.000Z",
      },
    });
  });

  it("returns not_found for unknown admin photo ids", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/admin/photos/unknown", {
      headers: {
        cookie: "vinicius.dev-session=session-token-1",
      },
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "not_found",
      resource: "photo",
    });
  });

  it("serves private admin originals for draft photos", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/admin/photos/p-draft-001/original", {
      headers: {
        cookie: "vinicius.dev-session=session-token-1",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-type")).toBe("image/jpeg");
    expect(response.headers.get("content-length")).toBe("11");
    await expect(response.text()).resolves.toBe("draft-bytes");
  });

  it("requires an admin session for private originals", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/admin/photos/p-draft-001/original");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "auth",
    });
  });

  it("keeps public photo originals publish-only", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/media/photos/p-draft-001/original");

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "photo",
    });
  });
});
