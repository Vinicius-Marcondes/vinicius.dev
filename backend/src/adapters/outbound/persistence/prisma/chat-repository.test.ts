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

  it("maps a room row for slug-based join lookup", async () => {
    const repository = createPrismaChatRepository({
      chatRoom: {
        findUnique: async () => ({
          createdAt: new Date("2026-04-24T10:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash:open-sesame",
          passwordRotatedAt: new Date("2026-04-20T08:00:00.000Z"),
          passwordVersion: 3,
          slug: "night-shift",
          updatedAt: new Date("2026-04-24T10:05:00.000Z"),
        }),
      },
    } as unknown as PrismaDatabaseClient);

    await expect(repository.findRoomBySlug({ slug: "night-shift" })).resolves.toEqual({
      createdAt: new Date("2026-04-24T10:00:00.000Z"),
      id: "room_1",
      passwordHash: "hash:open-sesame",
      passwordRotatedAt: new Date("2026-04-20T08:00:00.000Z"),
      passwordVersion: 3,
      slug: "night-shift",
      updatedAt: new Date("2026-04-24T10:05:00.000Z"),
    });
  });

  it("maps handle lookup by room and normalized handle", async () => {
    const repository = createPrismaChatRepository({
      chatHandle: {
        findUnique: async () => ({
          createdAt: new Date("2026-04-24T10:00:00.000Z"),
          handle: "Vinicius",
          id: "handle_1",
          normalizedHandle: "vinicius",
          roomId: "room_1",
          status: "active" as const,
          updatedAt: new Date("2026-04-24T10:05:00.000Z"),
        }),
      },
    } as unknown as PrismaDatabaseClient);

    await expect(
      repository.findHandleByRoomIdAndNormalizedHandle("room_1", "vinicius"),
    ).resolves.toEqual({
      createdAt: new Date("2026-04-24T10:00:00.000Z"),
      handle: "Vinicius",
      id: "handle_1",
      normalizedHandle: "vinicius",
      roomId: "room_1",
      status: "active",
      updatedAt: new Date("2026-04-24T10:05:00.000Z"),
    });
  });

  it("maps handle lookup by id", async () => {
    const repository = createPrismaChatRepository({
      chatHandle: {
        findUnique: async () => ({
          createdAt: new Date("2026-04-24T10:00:00.000Z"),
          handle: "Vinicius",
          id: "handle_1",
          normalizedHandle: "vinicius",
          roomId: "room_1",
          status: "active" as const,
          updatedAt: new Date("2026-04-24T10:05:00.000Z"),
        }),
      },
    } as unknown as PrismaDatabaseClient);

    await expect(repository.findHandleById("handle_1")).resolves.toEqual({
      createdAt: new Date("2026-04-24T10:00:00.000Z"),
      handle: "Vinicius",
      id: "handle_1",
      normalizedHandle: "vinicius",
      roomId: "room_1",
      status: "active",
      updatedAt: new Date("2026-04-24T10:05:00.000Z"),
    });
  });

  it("maps room participants with online/idle status", async () => {
    let capturedWhere: Record<string, unknown> | null = null;
    const repository = createPrismaChatRepository({
      chatHandle: {
        findMany: async ({ where }: { where: Record<string, unknown> }) => {
          capturedWhere = where;

          return [
            {
              handle: "guest",
              sessions: [],
            },
            {
              handle: "vinicius",
              sessions: [{ id: "session_1" }],
            },
          ];
        },
      },
    } as unknown as PrismaDatabaseClient);

    const result = await repository.listParticipantsByRoomId("room_1");

    expect(capturedWhere).not.toBeNull();
    expect(capturedWhere!).toEqual({
      roomId: "room_1",
      status: "active",
    });
    expect(result).toEqual([
      {
        handle: "guest",
        status: "idle",
      },
      {
        handle: "vinicius",
        status: "online",
      },
    ]);
  });

  it("maps room message archive rows with cursor pagination and attachment metadata", async () => {
    let capturedTake = -1;
    let capturedWhere: Record<string, unknown> = {};
    const repository = createPrismaChatRepository({
      chatMessage: {
        findMany: async ({
          take,
          where,
        }: {
          take: number;
          where: Record<string, unknown>;
        }) => {
          capturedTake = take;
          capturedWhere = where;

          return [
            {
              authorHandle: {
                handle: "vinicius",
              },
              body: "late-night check-in",
              id: "message_3",
              sentAt: new Date("2026-04-24T10:03:00.000Z"),
              tone: "pink" as const,
              upload: {
                byteSize: 2048,
                displayFilename: "drop.png",
                id: "upload_1",
                kind: "image" as const,
                mimeType: "image_png" as const,
                moderationState: "visible" as const,
              },
            },
            {
              authorHandle: {
                handle: "ghost-operator",
              },
              body: "signal copy",
              id: "message_2",
              sentAt: new Date("2026-04-24T10:02:00.000Z"),
              tone: null,
              upload: {
                byteSize: 1024,
                displayFilename: "hidden.png",
                id: "upload_hidden",
                kind: "image" as const,
                mimeType: "image_png" as const,
                moderationState: "hidden" as const,
              },
            },
            {
              authorHandle: {
                handle: "system",
              },
              body: "older row",
              id: "message_1",
              sentAt: new Date("2026-04-24T10:01:00.000Z"),
              tone: "system" as const,
              upload: null,
            },
          ];
        },
      },
    } as unknown as PrismaDatabaseClient);

    const page = await repository.listMessages({
      cursor: {
        id: "message_5",
        sentAt: new Date("2026-04-24T10:05:00.000Z"),
      },
      limit: 2,
      roomId: "room_1",
    });

    expect(capturedTake).toBe(3);
    expect(capturedWhere).toEqual({
      OR: [
        {
          sentAt: {
            lt: new Date("2026-04-24T10:05:00.000Z"),
          },
        },
        {
          id: {
            lt: "message_5",
          },
          sentAt: new Date("2026-04-24T10:05:00.000Z"),
        },
      ],
      moderationState: "visible",
      roomId: "room_1",
    });
    expect(page).toEqual({
      items: [
        {
          attachment: {
            byteSize: 2048,
            fileName: "drop.png",
            id: "upload_1",
            kind: "image",
            mimeType: "image/png",
          },
          author: "vinicius",
          body: "late-night check-in",
          id: "message_3",
          sentAt: new Date("2026-04-24T10:03:00.000Z"),
          tone: "pink",
        },
        {
          author: "ghost-operator",
          body: "signal copy",
          id: "message_2",
          sentAt: new Date("2026-04-24T10:02:00.000Z"),
          tone: null,
        },
      ],
      nextCursor: {
        id: "message_2",
        sentAt: new Date("2026-04-24T10:02:00.000Z"),
      },
    });
  });

  it("creates and maps a chat handle row", async () => {
    let capturedData: Record<string, unknown> | null = null;
    const repository = createPrismaChatRepository({
      chatHandle: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          capturedData = data;

          return {
            createdAt: new Date("2026-04-24T10:00:00.000Z"),
            handle: "Vinicius",
            id: "handle_1",
            normalizedHandle: "vinicius",
            roomId: "room_1",
            status: "active" as const,
            updatedAt: new Date("2026-04-24T10:05:00.000Z"),
          };
        },
      },
    } as unknown as PrismaDatabaseClient);

    const result = await repository.createHandle({
      handle: "Vinicius",
      normalizedHandle: "vinicius",
      roomId: "room_1",
      status: "active",
    });

    expect(capturedData).not.toBeNull();
    expect(capturedData!).toEqual({
      handle: "Vinicius",
      normalizedHandle: "vinicius",
      roomId: "room_1",
      status: "active",
    });
    expect(result).toEqual({
      createdAt: new Date("2026-04-24T10:00:00.000Z"),
      handle: "Vinicius",
      id: "handle_1",
      normalizedHandle: "vinicius",
      roomId: "room_1",
      status: "active",
      updatedAt: new Date("2026-04-24T10:05:00.000Z"),
    });
  });

  it("creates and maps a room session row", async () => {
    let capturedData: Record<string, unknown> | null = null;
    const repository = createPrismaChatRepository({
      chatRoomSession: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          capturedData = data;

          return {
            createdAt: new Date("2026-04-24T10:00:00.000Z"),
            expiresAt: null,
            handleId: "handle_1",
            id: "session_1",
            joinedAt: new Date("2026-04-24T10:00:00.000Z"),
            lastSeenAt: new Date("2026-04-24T10:00:00.000Z"),
            leftAt: null,
            roomId: "room_1",
            status: "active" as const,
            updatedAt: new Date("2026-04-24T10:05:00.000Z"),
          };
        },
      },
    } as unknown as PrismaDatabaseClient);

    const joinedAt = new Date("2026-04-24T10:00:00.000Z");
    const result = await repository.createSession({
      expiresAt: null,
      handleId: "handle_1",
      joinedAt,
      lastSeenAt: joinedAt,
      leftAt: null,
      roomId: "room_1",
      sessionTokenHash: "hash:session-token",
      status: "active",
    });

    expect(capturedData).not.toBeNull();
    expect(capturedData!).toEqual({
      expiresAt: null,
      handleId: "handle_1",
      joinedAt,
      lastSeenAt: joinedAt,
      leftAt: null,
      roomId: "room_1",
      sessionTokenHash: "hash:session-token",
      status: "active",
    });
    expect(result).toEqual({
      createdAt: new Date("2026-04-24T10:00:00.000Z"),
      expiresAt: null,
      handleId: "handle_1",
      id: "session_1",
      joinedAt: new Date("2026-04-24T10:00:00.000Z"),
      lastSeenAt: new Date("2026-04-24T10:00:00.000Z"),
      leftAt: null,
      roomId: "room_1",
      status: "active",
      updatedAt: new Date("2026-04-24T10:05:00.000Z"),
    });
  });

  it("creates and maps a text chat message row", async () => {
    let capturedData: Record<string, unknown> | null = null;
    const repository = createPrismaChatRepository({
      chatMessage: {
        create: async ({ data }: { data: Record<string, unknown> }) => {
          capturedData = data;

          return {
            authorHandleId: "handle_1",
            body: "from the bunker",
            createdAt: new Date("2026-04-24T10:00:00.000Z"),
            deletedAt: null,
            hiddenAt: null,
            id: "message_2",
            moderationState: "visible" as const,
            roomId: "room_1",
            roomSessionId: "session_1",
            sentAt: new Date("2026-04-24T10:00:00.000Z"),
            tone: "system" as const,
            updatedAt: new Date("2026-04-24T10:00:00.000Z"),
          };
        },
      },
    } as unknown as PrismaDatabaseClient);

    const sentAt = new Date("2026-04-24T10:00:00.000Z");
    const result = await repository.createTextMessage({
      authorHandleId: "handle_1",
      body: "from the bunker",
      roomId: "room_1",
      roomSessionId: "session_1",
      sentAt,
      tone: "system",
    });

    expect(capturedData).not.toBeNull();
    expect(capturedData!).toEqual({
      authorHandleId: "handle_1",
      body: "from the bunker",
      roomId: "room_1",
      roomSessionId: "session_1",
      sentAt,
      tone: "system",
    });
    expect(result).toEqual({
      authorHandleId: "handle_1",
      body: "from the bunker",
      createdAt: new Date("2026-04-24T10:00:00.000Z"),
      deletedAt: null,
      hiddenAt: null,
      id: "message_2",
      moderationState: "visible",
      roomId: "room_1",
      roomSessionId: "session_1",
      sentAt,
      tone: "system",
      updatedAt: new Date("2026-04-24T10:00:00.000Z"),
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

  it("records retention moderation for an upload and linked message", async () => {
    let capturedAuditData: Record<string, unknown> | null = null;
    let capturedMessageUpdate: Record<string, unknown> | null = null;
    let capturedUploadUpdate: Record<string, unknown> | null = null;
    const occurredAt = new Date("2026-04-24T12:34:56.000Z");
    const repository = createPrismaChatRepository({
      $transaction: async <T>(
        runInTransaction: (tx: {
          chatMessage: {
            findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
            update: (args: {
              data: Record<string, unknown>;
              where: { id: string };
            }) => Promise<Record<string, unknown>>;
          };
          chatModerationAuditRecord: {
            create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
          };
          chatUpload: {
            findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
            update: (args: {
              data: Record<string, unknown>;
              where: { id: string };
            }) => Promise<Record<string, unknown>>;
          };
        }) => Promise<T>,
      ) =>
        runInTransaction({
          chatMessage: {
            findUnique: async () => ({
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
            }),
            update: async ({ data }) => {
              capturedMessageUpdate = data;

              return {
                authorHandleId: "handle_1",
                body: "night drop",
                createdAt: new Date("2026-04-24T10:00:00.000Z"),
                deletedAt: occurredAt,
                hiddenAt: occurredAt,
                id: "message_1",
                moderationState: "deleted" as const,
                roomId: "room_1",
                roomSessionId: "session_1",
                sentAt: new Date("2026-04-24T10:00:00.000Z"),
                tone: "pink" as const,
                updatedAt: occurredAt,
              };
            },
          },
          chatModerationAuditRecord: {
            create: async ({ data }) => {
              capturedAuditData = data;

              return {
                id: "audit_1",
              };
            },
          },
          chatUpload: {
            findUnique: async () => ({
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
            }),
            update: async ({ data }) => {
              capturedUploadUpdate = data;

              return {
                byteSize: 1234,
                createdAt: new Date("2026-04-24T10:00:00.000Z"),
                deletedAt: null,
                displayFilename: "drop.png",
                hiddenAt: occurredAt,
                id: "upload_1",
                kind: "image" as const,
                messageId: "message_1",
                mimeType: "image_png" as const,
                moderationState: "hidden" as const,
                roomId: "room_1",
                storageKey: "room_1/upload_1.png",
                storagePath: "room_1/upload_1.png",
                updatedAt: occurredAt,
                uploaderHandleId: "handle_1",
                uploaderSessionId: "session_1",
              };
            },
          },
        }),
    } as unknown as PrismaDatabaseClient);

    const result = await repository.moderateUploadRetention({
      action: "delete_message",
      actorAdminUserId: "admin_1",
      occurredAt,
      reason: "remove from room history",
      uploadId: "upload_1",
    });

    expect(capturedUploadUpdate).toMatchObject({
      deletedAt: null,
      hiddenAt: occurredAt,
      moderationState: "hidden",
    });
    expect(capturedMessageUpdate).toMatchObject({
      deletedAt: occurredAt,
      hiddenAt: occurredAt,
      moderationState: "deleted",
    });
    expect(capturedAuditData).toMatchObject({
      action: "delete_message",
      actorAdminUserId: "admin_1",
      reason: "remove from room history",
      roomId: "room_1",
      targetMessageId: "message_1",
      targetUploadId: "upload_1",
    });
    expect(result).toEqual({
      auditId: "audit_1",
      message: {
        authorHandleId: "handle_1",
        body: "night drop",
        createdAt: new Date("2026-04-24T10:00:00.000Z"),
        deletedAt: occurredAt,
        hiddenAt: occurredAt,
        id: "message_1",
        moderationState: "deleted",
        roomId: "room_1",
        roomSessionId: "session_1",
        sentAt: new Date("2026-04-24T10:00:00.000Z"),
        tone: "pink",
        updatedAt: occurredAt,
      },
      upload: {
        byteSize: 1234,
        createdAt: new Date("2026-04-24T10:00:00.000Z"),
        deletedAt: null,
        displayFilename: "drop.png",
        hiddenAt: occurredAt,
        id: "upload_1",
        kind: "image",
        messageId: "message_1",
        mimeType: "image/png",
        moderationState: "hidden",
        roomId: "room_1",
        storageKey: "room_1/upload_1.png",
        storagePath: "room_1/upload_1.png",
        updatedAt: occurredAt,
        uploaderHandleId: "handle_1",
        uploaderSessionId: "session_1",
      },
    });
  });

  it("preserves deleted moderation state when hide_media_metadata is re-applied", async () => {
    const repository = createPrismaChatRepository({
      $transaction: async <T>(
        runInTransaction: (tx: {
          chatMessage: {
            findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
            update: (args: {
              data: Record<string, unknown>;
              where: { id: string };
            }) => Promise<Record<string, unknown>>;
          };
          chatModerationAuditRecord: {
            create: (args: { data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
          };
          chatUpload: {
            findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
            update: (args: {
              data: Record<string, unknown>;
              where: { id: string };
            }) => Promise<Record<string, unknown>>;
          };
        }) => Promise<T>,
      ) =>
        runInTransaction({
          chatMessage: {
            findUnique: async () => ({
              authorHandleId: "handle_1",
              body: "night drop",
              createdAt: new Date("2026-04-24T10:00:00.000Z"),
              deletedAt: new Date("2026-04-24T11:00:00.000Z"),
              hiddenAt: new Date("2026-04-24T11:00:00.000Z"),
              id: "message_1",
              moderationState: "deleted" as const,
              roomId: "room_1",
              roomSessionId: "session_1",
              sentAt: new Date("2026-04-24T10:00:00.000Z"),
              tone: "pink" as const,
              updatedAt: new Date("2026-04-24T11:00:00.000Z"),
            }),
            update: async ({ data }) => ({
              authorHandleId: "handle_1",
              body: "night drop",
              createdAt: new Date("2026-04-24T10:00:00.000Z"),
              deletedAt: data.deletedAt as Date,
              hiddenAt: data.hiddenAt as Date,
              id: "message_1",
              moderationState: data.moderationState as "deleted",
              roomId: "room_1",
              roomSessionId: "session_1",
              sentAt: new Date("2026-04-24T10:00:00.000Z"),
              tone: "pink" as const,
              updatedAt: new Date("2026-04-24T12:34:56.000Z"),
            }),
          },
          chatModerationAuditRecord: {
            create: async () => ({
              id: "audit_2",
            }),
          },
          chatUpload: {
            findUnique: async () => ({
              byteSize: 1234,
              createdAt: new Date("2026-04-24T10:00:00.000Z"),
              deletedAt: new Date("2026-04-24T11:00:00.000Z"),
              displayFilename: "drop.png",
              hiddenAt: new Date("2026-04-24T11:00:00.000Z"),
              id: "upload_1",
              kind: "image" as const,
              messageId: "message_1",
              mimeType: "image_png" as const,
              moderationState: "deleted" as const,
              roomId: "room_1",
              storageKey: "room_1/upload_1.png",
              storagePath: "room_1/upload_1.png",
              updatedAt: new Date("2026-04-24T11:00:00.000Z"),
              uploaderHandleId: "handle_1",
              uploaderSessionId: "session_1",
            }),
            update: async ({ data }) => ({
              byteSize: 1234,
              createdAt: new Date("2026-04-24T10:00:00.000Z"),
              deletedAt: data.deletedAt as Date,
              displayFilename: "drop.png",
              hiddenAt: data.hiddenAt as Date,
              id: "upload_1",
              kind: "image" as const,
              messageId: "message_1",
              mimeType: "image_png" as const,
              moderationState: data.moderationState as "deleted",
              roomId: "room_1",
              storageKey: "room_1/upload_1.png",
              storagePath: "room_1/upload_1.png",
              updatedAt: new Date("2026-04-24T12:34:56.000Z"),
              uploaderHandleId: "handle_1",
              uploaderSessionId: "session_1",
            }),
          },
        }),
    } as unknown as PrismaDatabaseClient);

    const result = await repository.moderateUploadRetention({
      action: "hide_media_metadata",
      actorAdminUserId: "admin_1",
      occurredAt: new Date("2026-04-24T12:34:56.000Z"),
      uploadId: "upload_1",
    });

    expect(result?.message?.moderationState).toBe("deleted");
    expect(result?.upload.moderationState).toBe("deleted");
  });
});
