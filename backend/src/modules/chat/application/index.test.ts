import { describe, expect, it } from "bun:test";

import {
  createModerateChatUploadRetentionUseCase,
  createOpenChatUploadMediaUseCase,
  createUploadChatMessageWithImageUseCase,
  InvalidChatUploadAccessError,
} from "./index";

describe("chat upload message with image use case", () => {
  it("writes the upload and persists message/upload metadata", async () => {
    const writeCalls: Array<{ body: Uint8Array; storageKey: string }> = [];
    const repositoryCalls: Array<Record<string, unknown>> = [];
    const sentAt = new Date("2026-04-24T12:34:56.000Z");
    const useCase = createUploadChatMessageWithImageUseCase({
      clock: () => sentAt,
      createId: (() => {
        const ids = ["message_1", "upload_1"];
        return () => ids.shift() ?? "fallback";
      })(),
      repository: {
        findSessionById: async () => ({
          createdAt: sentAt,
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: sentAt,
          lastSeenAt: sentAt,
          leftAt: null,
          roomId: "room 123",
          status: "active",
          updatedAt: sentAt,
        }),
        createMessageWithUpload: async (input) => {
          repositoryCalls.push(input as unknown as Record<string, unknown>);

          return {
            message: {
              authorHandleId: input.authorHandleId,
              body: input.body,
              createdAt: sentAt,
              deletedAt: null,
              hiddenAt: null,
              id: input.messageId,
              moderationState: "visible",
              roomId: input.roomId,
              roomSessionId: input.roomSessionId,
              sentAt,
              tone: input.tone,
              updatedAt: sentAt,
            },
            upload: {
              byteSize: input.byteSize,
              createdAt: sentAt,
              deletedAt: null,
              displayFilename: input.displayFilename,
              hiddenAt: null,
              id: input.uploadId,
              kind: "image",
              messageId: input.messageId,
              mimeType: input.mimeType,
              moderationState: "visible",
              roomId: input.roomId,
              storageKey: input.storageKey,
              storagePath: input.storagePath,
              updatedAt: sentAt,
              uploaderHandleId: input.authorHandleId,
              uploaderSessionId: input.roomSessionId,
            },
          };
        },
      },
      storage: {
        deleteUpload: async () => {},
        openUpload: async () => null,
        writeUpload: async (input) => {
          writeCalls.push(input);

          return {
            byteSize: input.body.byteLength,
            storageKey: input.storageKey,
            storagePath: input.storageKey,
          };
        },
      },
    });

    const output = await useCase.execute({
      authorHandleId: "handle_1",
      body: "  post from bunker  ",
      image: {
        body: new TextEncoder().encode("upload-bytes"),
        displayFilename: "bunker.png",
        mimeType: "image/png",
      },
      roomId: "room 123",
      roomSessionId: "session_1",
      tone: "cyan",
    });

    expect(writeCalls).toHaveLength(1);
    expect(writeCalls[0]?.storageKey).toBe("room_123/upload_1.png");
    expect(repositoryCalls).toHaveLength(1);
    expect(repositoryCalls[0]?.storagePath).toBe("room_123/upload_1.png");
    expect(output).toEqual({
      attachment: {
        byteSize: 12,
        fileName: "bunker.png",
        id: "upload_1",
        kind: "image",
        mimeType: "image/png",
      },
      authorHandleId: "handle_1",
      body: "post from bunker",
      id: "message_1",
      sentAt: "2026-04-24T12:34:56.000Z",
      tone: "cyan",
    });
  });

  it("removes the stored upload if metadata persistence fails", async () => {
    const deletedPaths: string[] = [];
    const useCase = createUploadChatMessageWithImageUseCase({
      createId: (() => {
        const ids = ["message_1", "upload_1"];
        return () => ids.shift() ?? "fallback";
      })(),
      repository: {
        findSessionById: async () => ({
          createdAt: new Date("2026-04-24T00:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-24T00:00:00.000Z"),
          lastSeenAt: null,
          leftAt: null,
          roomId: "room-1",
          status: "active",
          updatedAt: new Date("2026-04-24T00:00:00.000Z"),
        }),
        createMessageWithUpload: async () => {
          throw new Error("database write failed");
        },
      },
      storage: {
        deleteUpload: async (storagePath) => {
          deletedPaths.push(storagePath);
        },
        openUpload: async () => null,
        writeUpload: async () => ({
          byteSize: 4,
          storageKey: "room_1/upload_1.webp",
          storagePath: "room_1/upload_1.webp",
        }),
      },
    });

    await expect(
      useCase.execute({
        authorHandleId: "handle_1",
        image: {
          body: new Uint8Array([1, 2, 3, 4]),
          displayFilename: "scan.webp",
          mimeType: "image/webp",
        },
        roomId: "room-1",
        roomSessionId: "session_1",
      }),
    ).rejects.toThrow("database write failed");
    expect(deletedPaths).toEqual(["room_1/upload_1.webp"]);
  });

  it("rejects uploads when the session does not match the requested room or handle", async () => {
    const useCase = createUploadChatMessageWithImageUseCase({
      repository: {
        createMessageWithUpload: async () => {
          throw new Error("should not persist");
        },
        findSessionById: async () => ({
          createdAt: new Date("2026-04-24T00:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_2",
          id: "session_1",
          joinedAt: new Date("2026-04-24T00:00:00.000Z"),
          lastSeenAt: null,
          leftAt: null,
          roomId: "room_2",
          status: "active",
          updatedAt: new Date("2026-04-24T00:00:00.000Z"),
        }),
      },
      storage: {
        deleteUpload: async () => {},
        openUpload: async () => null,
        writeUpload: async () => {
          throw new Error("should not write");
        },
      },
    });

    await expect(
      useCase.execute({
        authorHandleId: "handle_1",
        image: {
          body: new Uint8Array([1, 2, 3, 4]),
          displayFilename: "scan.webp",
          mimeType: "image/webp",
        },
        roomId: "room_1",
        roomSessionId: "session_1",
      }),
    ).rejects.toThrow("chat upload actor/session does not match the requested room");
  });
});

describe("chat upload media access use case", () => {
  it("opens visible upload media for an active room session", async () => {
    const useCase = createOpenChatUploadMediaUseCase({
      mediaRepository: {
        findChatUploadMediaById: async () => ({
          byteSize: 42,
          createdAt: new Date("2026-04-24T00:00:00.000Z"),
          displayFilename: "scan.webp",
          id: "upload_1",
          mimeType: "image/webp",
          moderationState: "visible",
          roomId: "room_1",
          storageKey: "room_1/upload_1.webp",
          storagePath: "room_1/upload_1.webp",
          updatedAt: new Date("2026-04-24T00:00:00.000Z"),
        }),
      },
      repository: {
        findSessionById: async () => ({
          createdAt: new Date("2026-04-24T00:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-24T00:00:00.000Z"),
          lastSeenAt: null,
          leftAt: null,
          roomId: "room_1",
          status: "active",
          updatedAt: new Date("2026-04-24T00:00:00.000Z"),
        }),
      },
      storage: {
        openUpload: async () => ({
          absolutePath: "/tmp/chat/room_1/upload_1.webp",
          byteSize: 42,
          stream: new ReadableStream<Uint8Array>(),
        }),
      },
    });

    const result = await useCase.execute({
      roomSessionId: "session_1",
      uploadId: "upload_1",
    });

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      byteSize: 42,
      mimeType: "image/webp",
    });
  });

  it("rejects access when the room session is missing or inactive", async () => {
    const useCase = createOpenChatUploadMediaUseCase({
      mediaRepository: {
        findChatUploadMediaById: async () => {
          throw new Error("should not read upload metadata");
        },
      },
      repository: {
        findSessionById: async () => null,
      },
      storage: {
        openUpload: async () => null,
      },
    });

    await expect(
      useCase.execute({
        roomSessionId: "session_1",
        uploadId: "upload_1",
      }),
    ).rejects.toBeInstanceOf(InvalidChatUploadAccessError);
  });

  it("returns null when upload metadata is hidden or outside the session room", async () => {
    const useCase = createOpenChatUploadMediaUseCase({
      mediaRepository: {
        findChatUploadMediaById: async () => ({
          byteSize: 42,
          createdAt: new Date("2026-04-24T00:00:00.000Z"),
          displayFilename: "scan.webp",
          id: "upload_1",
          mimeType: "image/webp",
          moderationState: "hidden",
          roomId: "room_2",
          storageKey: "room_2/upload_1.webp",
          storagePath: "room_2/upload_1.webp",
          updatedAt: new Date("2026-04-24T00:00:00.000Z"),
        }),
      },
      repository: {
        findSessionById: async () => ({
          createdAt: new Date("2026-04-24T00:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-24T00:00:00.000Z"),
          lastSeenAt: null,
          leftAt: null,
          roomId: "room_1",
          status: "active",
          updatedAt: new Date("2026-04-24T00:00:00.000Z"),
        }),
      },
      storage: {
        openUpload: async () => {
          throw new Error("should not open hidden or foreign-room upload");
        },
      },
    });

    await expect(
      useCase.execute({
        roomSessionId: "session_1",
        uploadId: "upload_1",
      }),
    ).resolves.toBeNull();
  });
});

describe("chat upload retention moderation use case", () => {
  it("records a hide-media moderation action", async () => {
    const occurredAt = new Date("2026-04-24T12:34:56.000Z");
    const capturedCalls: Array<Record<string, unknown>> = [];
    const useCase = createModerateChatUploadRetentionUseCase({
      clock: () => occurredAt,
      repository: {
        moderateUploadRetention: async (input) => {
          capturedCalls.push(input as unknown as Record<string, unknown>);

          return {
            auditId: "audit_1",
            message: {
              authorHandleId: "handle_1",
              body: "night drop",
              createdAt: occurredAt,
              deletedAt: null,
              hiddenAt: occurredAt,
              id: "message_1",
              moderationState: "hidden",
              roomId: "room_1",
              roomSessionId: "session_1",
              sentAt: occurredAt,
              tone: null,
              updatedAt: occurredAt,
            },
            upload: {
              byteSize: 42,
              createdAt: occurredAt,
              deletedAt: null,
              displayFilename: "scan.webp",
              hiddenAt: occurredAt,
              id: "upload_1",
              kind: "image",
              messageId: "message_1",
              mimeType: "image/webp",
              moderationState: "hidden",
              roomId: "room_1",
              storageKey: "room_1/upload_1.webp",
              storagePath: "room_1/upload_1.webp",
              updatedAt: occurredAt,
              uploaderHandleId: "handle_1",
              uploaderSessionId: "session_1",
            },
          };
        },
      },
    });

    const output = await useCase.execute({
      action: "hide_media_metadata",
      actorAdminUserId: " admin_1 ",
      reason: "  remove image from public room view  ",
      uploadId: "upload_1",
    });

    expect(capturedCalls).toEqual([
      {
        action: "hide_media_metadata",
        actorAdminUserId: "admin_1",
        occurredAt,
        reason: "remove image from public room view",
        uploadId: "upload_1",
      },
    ]);
    expect(output).toEqual({
      action: "hide_media_metadata",
      auditId: "audit_1",
      messageId: "message_1",
      messageModerationState: "hidden",
      uploadId: "upload_1",
      uploadModerationState: "hidden",
    });
  });

  it("returns null when the upload does not exist", async () => {
    const useCase = createModerateChatUploadRetentionUseCase({
      repository: {
        moderateUploadRetention: async () => null,
      },
    });

    await expect(
      useCase.execute({
        action: "delete_message",
        actorAdminUserId: "admin_1",
        uploadId: "upload_404",
      }),
    ).resolves.toBeNull();
  });
});
