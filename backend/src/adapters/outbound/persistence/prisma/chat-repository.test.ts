import { describe, expect, it } from "bun:test";

import { createPrismaChatRepository } from "./chat-repository";
import type { PrismaDatabaseClient } from "./prisma-client";

describe("prisma chat repository", () => {
  it("maps a room session row for upload actor validation", async () => {
    const repository = createPrismaChatRepository({
      chatRoomSession: {
        findUnique: async () => ({
          createdAt: new Date("2026-04-24T10:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-24T10:00:00.000Z"),
          lastSeenAt: new Date("2026-04-24T10:05:00.000Z"),
          leftAt: null,
          roomId: "room_1",
          status: "active" as const,
          updatedAt: new Date("2026-04-24T10:05:00.000Z"),
        }),
      },
    } as unknown as PrismaDatabaseClient);

    await expect(repository.findSessionById("session_1")).resolves.toEqual({
      createdAt: new Date("2026-04-24T10:00:00.000Z"),
      expiresAt: null,
      handleId: "handle_1",
      id: "session_1",
      joinedAt: new Date("2026-04-24T10:00:00.000Z"),
      lastSeenAt: new Date("2026-04-24T10:05:00.000Z"),
      leftAt: null,
      roomId: "room_1",
      status: "active",
      updatedAt: new Date("2026-04-24T10:05:00.000Z"),
    });
  });

  it("persists and maps a message with upload metadata in one transaction", async () => {
    let capturedMessageData: Record<string, unknown> | null = null;
    let capturedUploadData: Record<string, unknown> | null = null;
    const repository = createPrismaChatRepository({
      $transaction: async <T>(
        runInTransaction: (tx: {
          chatMessage: {
            create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
          };
          chatUpload: {
            create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
          };
        }) => Promise<T>,
      ) =>
        runInTransaction({
          chatMessage: {
            create: async ({ data }: { data: Record<string, unknown> }) => {
              capturedMessageData = data;

              return {
                authorHandleId: "handle_1",
                body: "night drop",
                createdAt: new Date("2026-04-24T10:00:00.000Z"),
                deletedAt: null,
                hiddenAt: null,
                id: "message_1",
                moderationState: "visible" as const,
                roomId: "room_1",
                roomSessionId: "session_1",
                sentAt: new Date("2026-04-24T10:00:00.000Z"),
                tone: "pink" as const,
                updatedAt: new Date("2026-04-24T10:00:00.000Z"),
              };
            },
          },
          chatUpload: {
            create: async ({ data }: { data: Record<string, unknown> }) => {
              capturedUploadData = data;

              return {
                byteSize: 1234,
                createdAt: new Date("2026-04-24T10:00:00.000Z"),
                deletedAt: null,
                displayFilename: "drop.png",
                hiddenAt: null,
                id: "upload_1",
                kind: "image" as const,
                messageId: "message_1",
                mimeType: "image_png" as const,
                moderationState: "visible" as const,
                roomId: "room_1",
                storageKey: "room_1/upload_1.png",
                storagePath: "room_1/upload_1.png",
                updatedAt: new Date("2026-04-24T10:00:00.000Z"),
                uploaderHandleId: "handle_1",
                uploaderSessionId: "session_1",
              };
            },
          },
        }),
    } as unknown as PrismaDatabaseClient);

    const result = await repository.createMessageWithUpload({
      authorHandleId: "handle_1",
      body: "night drop",
      byteSize: 1234,
      displayFilename: "drop.png",
      messageId: "message_1",
      mimeType: "image/png",
      roomId: "room_1",
      roomSessionId: "session_1",
      sentAt: new Date("2026-04-24T10:00:00.000Z"),
      storageKey: "room_1/upload_1.png",
      storagePath: "room_1/upload_1.png",
      tone: "pink",
      uploadId: "upload_1",
    });

    expect(capturedMessageData).toMatchObject({
      authorHandleId: "handle_1",
      body: "night drop",
      id: "message_1",
      roomId: "room_1",
      roomSessionId: "session_1",
      tone: "pink",
    });
    expect(capturedUploadData).toMatchObject({
      byteSize: 1234,
      displayFilename: "drop.png",
      id: "upload_1",
      messageId: "message_1",
      mimeType: "image_png",
      roomId: "room_1",
      storageKey: "room_1/upload_1.png",
      storagePath: "room_1/upload_1.png",
      uploaderHandleId: "handle_1",
      uploaderSessionId: "session_1",
    });
    expect(result).toEqual({
      message: {
        authorHandleId: "handle_1",
        body: "night drop",
        createdAt: new Date("2026-04-24T10:00:00.000Z"),
        deletedAt: null,
        hiddenAt: null,
        id: "message_1",
        moderationState: "visible",
        roomId: "room_1",
        roomSessionId: "session_1",
        sentAt: new Date("2026-04-24T10:00:00.000Z"),
        tone: "pink",
        updatedAt: new Date("2026-04-24T10:00:00.000Z"),
      },
      upload: {
        byteSize: 1234,
        createdAt: new Date("2026-04-24T10:00:00.000Z"),
        deletedAt: null,
        displayFilename: "drop.png",
        hiddenAt: null,
        id: "upload_1",
        kind: "image",
        messageId: "message_1",
        mimeType: "image/png",
        moderationState: "visible",
        roomId: "room_1",
        storageKey: "room_1/upload_1.png",
        storagePath: "room_1/upload_1.png",
        updatedAt: new Date("2026-04-24T10:00:00.000Z"),
        uploaderHandleId: "handle_1",
        uploaderSessionId: "session_1",
      },
    });
  });
});
