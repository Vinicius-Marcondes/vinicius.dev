import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";
import type {
  UploadChatMessageWithImageInput,
  UploadChatMessageWithImageOutput,
} from "@/modules/chat/ports/inbound";
import { InvalidChatUploadActorError } from "@/modules/chat/application";

import { createHonoHttpAdapter } from "./http-adapter";

const createTestContainer = (
  executeUpload: (
    input: UploadChatMessageWithImageInput,
  ) => UploadChatMessageWithImageOutput | Promise<UploadChatMessageWithImageOutput>,
): BootstrapContainer => ({
  chat: {
    moderateUploadRetention: {
      execute: async () => null,
    },
    openUploadMedia: {
      execute: async () => null,
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

const createUploadFormData = ({
  body = "message body",
  bytes = new Uint8Array([1, 2, 3, 4]),
  fileName = "scan.png",
  mimeType = "image/png",
  tone = "cyan",
}: {
  body?: string;
  bytes?: Uint8Array;
  fileName?: string;
  mimeType?: string;
  tone?: string;
} = {}): FormData => {
  const formData = new FormData();
  const fileBytes = new Uint8Array(bytes.byteLength);
  fileBytes.set(bytes);
  formData.append("roomId", "room_1");
  formData.append("roomSessionId", "session_1");
  formData.append("authorHandleId", "handle_1");
  formData.append("body", body);
  formData.append("tone", tone);
  formData.append("file", new File([fileBytes.buffer], fileName, { type: mimeType }));

  return formData;
};

describe("chat routes", () => {
  it("maps a valid upload request into the chat upload use case", async () => {
    let capturedAuthorHandleId: string | undefined;
    let capturedMimeType: string | undefined;
    let capturedRoomId: string | undefined;
    let capturedRoomSessionId: string | undefined;
    let capturedTone: "cyan" | "pink" | "system" | null | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer(async (input) => {
        capturedAuthorHandleId = input.authorHandleId;
        capturedMimeType = input.image.mimeType;
        capturedRoomId = input.roomId;
        capturedRoomSessionId = input.roomSessionId;
        capturedTone = input.tone;

        return {
          attachment: {
            byteSize: 4,
            fileName: "scan.png",
            id: "upload_1",
            kind: "image",
            mimeType: "image/png",
          },
          authorHandleId: "handle_1",
          body: "message body",
          id: "message_1",
          sentAt: "2026-04-24T12:00:00.000Z",
          tone: "cyan",
        };
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData(),
      method: "POST",
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      item: {
        attachment: {
          byteSize: 4,
          fileName: "scan.png",
          id: "upload_1",
          kind: "image",
          mimeType: "image/png",
        },
        authorHandleId: "handle_1",
        body: "message body",
        id: "message_1",
        sentAt: "2026-04-24T12:00:00.000Z",
        tone: "cyan",
      },
    });
    expect(capturedRoomId).toBe("room_1");
    expect(capturedRoomSessionId).toBe("session_1");
    expect(capturedAuthorHandleId).toBe("handle_1");
    expect(capturedTone).toBe("cyan");
    expect(capturedMimeType).toBe("image/png");
  });

  it("rejects invalid MIME types before reaching the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer(async () => {
        called = true;
        throw new Error("should not run");
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData({
        fileName: "scan.bin",
        mimeType: "application/octet-stream",
      }),
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_upload",
      field: "file",
      reason: "unsupported_mime_type",
    });
    expect(called).toBe(false);
  });

  it("rejects oversized uploads before reaching the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer(async () => {
        called = true;
        throw new Error("should not run");
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData({ bytes: new Uint8Array(5 * 1024 * 1024 + 1) }),
      method: "POST",
    });

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_upload",
      field: "file",
      reason: "file_too_large",
    });
    expect(called).toBe(false);
  });

  it("rejects multiple upload files per message", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer(async () => {
        called = true;
        throw new Error("should not run");
      }),
    );
    const formData = createUploadFormData();
    formData.append("file", new File([new Uint8Array([5, 6])], "extra.jpg", { type: "image/jpeg" }));

    const response = await app.request("/api/chat/messages/upload", {
      body: formData,
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_upload",
      field: "file",
      reason: "too_many_files",
    });
    expect(called).toBe(false);
  });

  it("returns denied when the room session and author ids do not match", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer(async () => {
        throw new InvalidChatUploadActorError();
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData(),
      method: "POST",
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "chat",
    });
  });
});
