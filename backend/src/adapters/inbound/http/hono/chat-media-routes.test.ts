import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";
import type {
  OpenChatUploadMediaInput,
  OpenChatUploadMediaOutput,
  UploadChatMessageWithImageInput,
  UploadChatMessageWithImageOutput,
} from "@/modules/chat/ports/inbound";
import { InvalidChatUploadAccessError } from "@/modules/chat/application";

import { createHonoHttpAdapter } from "./http-adapter";

const encoder = new TextEncoder();

const createTestContainer = ({
  executeOpenUploadMedia = async () => null,
  executeUpload = async () => ({
    attachment: {
      byteSize: 0,
      fileName: "upload.webp",
      id: "upload_1",
      kind: "image" as const,
      mimeType: "image/webp" as const,
    },
    authorHandleId: "handle_1",
    body: "uploaded an image without a caption",
    id: "message_1",
    sentAt: "2026-04-24T00:00:00.000Z",
    tone: null,
  }),
}: {
  executeOpenUploadMedia?: (
    input: OpenChatUploadMediaInput,
  ) => OpenChatUploadMediaOutput | null | Promise<OpenChatUploadMediaOutput | null>;
  executeUpload?: (
    input: UploadChatMessageWithImageInput,
  ) => UploadChatMessageWithImageOutput | Promise<UploadChatMessageWithImageOutput>;
} = {}): BootstrapContainer => ({
  chat: {
    moderateUploadRetention: {
      execute: async () => null,
    },
    openUploadMedia: {
      execute: executeOpenUploadMedia,
    },
    uploadMessageWithImage: {
      execute: executeUpload,
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
        items: [],
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

describe("chat media routes", () => {
  it("delivers room-gated chat upload media", async () => {
    let captured: OpenChatUploadMediaInput | undefined;
    const bytes = encoder.encode("upload-bytes");
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeOpenUploadMedia: async (input) => {
          captured = input;

          return {
            byteSize: bytes.byteLength,
            mimeType: "image/webp",
            stream: new ReadableStream<Uint8Array>({
              start(controller) {
                controller.enqueue(bytes);
                controller.close();
              },
            }),
          };
        },
      }),
    );

    const response = await app.request("/api/chat/uploads/upload_1/media", {
      headers: {
        "x-chat-room-session-id": "session_1",
      },
    });

    expect(captured).toEqual({
      roomSessionId: "session_1",
      uploadId: "upload_1",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("content-length")).toBe(String(bytes.byteLength));
    expect(response.headers.get("vary")).toBe("x-chat-room-session-id");
    await expect(response.text()).resolves.toBe("upload-bytes");
  });

  it("returns denied when the room session is invalid", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeOpenUploadMedia: async () => {
          throw new InvalidChatUploadAccessError();
        },
      }),
    );

    const response = await app.request("/api/chat/uploads/upload_1/media", {
      headers: {
        "x-chat-room-session-id": "session_1",
      },
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "chat",
    });
  });

  it("returns not found when the upload is missing or hidden", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/chat/uploads/upload_1/media", {
      headers: {
        "x-chat-room-session-id": "session_1",
      },
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "not_found",
      resource: "chat_upload",
    });
  });

  it("rejects blank upload ids", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/chat/uploads/%20/media?roomSessionId=session_1");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_path",
      field: "id",
    });
  });

  it("rejects missing room session header values", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/chat/uploads/upload_1/media");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "x-chat-room-session-id",
    });
  });
});
