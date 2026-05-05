import { describe, expect, it } from "bun:test";

import {
  BannedChatHandleError,
  createBanChatRoomHandleUseCase,
  createJoinChatRoomSessionUseCase,
  createListChatModerationAuditsUseCase,
  createListChatRoomMessagesUseCase,
  createListChatRoomParticipantsUseCase,
  createModerateChatRoomMessageUseCase,
  createModerateChatUploadRetentionUseCase,
  createOpenChatUploadMediaUseCase,
  createRotateChatRoomPasswordUseCase,
  createSendChatRoomTextMessageUseCase,
  createUploadChatMessageWithImageUseCase,
  InvalidChatModerationAuditCursorError,
  InvalidChatMessageAccessError,
  InvalidChatMessageCursorError,
  InvalidChatParticipantAccessError,
  InvalidChatRoomCredentialsError,
  InvalidChatUploadAccessError,
} from "./index";

describe("chat room join use case", () => {
  it("verifies room credentials, creates handle when needed, and issues an active room session", async () => {
    const now = new Date("2026-04-28T10:00:00.000Z");
    let capturedCreateHandle: Record<string, unknown> | undefined;
    let capturedCreateSession: Record<string, unknown> | undefined;
    const useCase = createJoinChatRoomSessionUseCase({
      clock: () => now,
      createSessionToken: () => "session-token-1",
      hashSessionToken: async (token) => `hash:${token}`,
      repository: {
        createHandle: async (input) => {
          capturedCreateHandle = input as unknown as Record<string, unknown>;

          return {
            createdAt: now,
            handle: "Vinicius",
            id: "handle_1",
            normalizedHandle: input.normalizedHandle,
            roomId: input.roomId,
            status: "active",
            updatedAt: now,
          };
        },
        createSession: async (input) => {
          capturedCreateSession = input as unknown as Record<string, unknown>;

          return {
            createdAt: now,
            expiresAt: input.expiresAt,
            handleId: input.handleId,
            id: "session_1",
            joinedAt: input.joinedAt,
            lastSeenAt: input.lastSeenAt,
            leftAt: null,
            roomId: input.roomId,
            status: "active",
            updatedAt: now,
          };
        },
        findHandleByRoomIdAndNormalizedHandle: async () => null,
        findRoomBySlug: async () => ({
          createdAt: now,
          id: "room_1",
          passwordHash: "hash:open-sesame",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: now,
        }),
      },
      verifyRoomPassword: async ({ passwordHash, plainText }) =>
        passwordHash === `hash:${plainText}`,
    });

    const result = await useCase.execute({
      handle: "  Vinicius  ",
      password: "open-sesame",
      slug: "night-shift",
    });

    expect(capturedCreateHandle).toMatchObject({
      handle: "Vinicius",
      normalizedHandle: "vinicius",
      roomId: "room_1",
      status: "active",
    });
    expect(capturedCreateSession).toMatchObject({
      handleId: "handle_1",
      roomId: "room_1",
      sessionTokenHash: "hash:session-token-1",
      status: "active",
    });
    expect(result).toEqual({
      participant: {
        handle: "Vinicius",
        id: "handle_1",
        status: "online",
      },
      room: {
        id: "room_1",
        slug: "night-shift",
      },
      session: {
        expiresAt: "2026-04-29T10:00:00.000Z",
        handleId: "handle_1",
        id: "session_1",
        joinedAt: "2026-04-28T10:00:00.000Z",
        roomId: "room_1",
        status: "active",
      },
    });
  });

  it("rejects room join with invalid credentials", async () => {
    const useCase = createJoinChatRoomSessionUseCase({
      repository: {
        createHandle: async () => {
          throw new Error("should not create handle");
        },
        createSession: async () => {
          throw new Error("should not create session");
        },
        findHandleByRoomIdAndNormalizedHandle: async () => null,
        findRoomBySlug: async () => ({
          createdAt: new Date("2026-04-28T10:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash:open-sesame",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: new Date("2026-04-28T10:00:00.000Z"),
        }),
      },
      verifyRoomPassword: async () => false,
    });

    await expect(
      useCase.execute({
        handle: "vinicius",
        password: "wrong-password",
        slug: "night-shift",
      }),
    ).rejects.toBeInstanceOf(InvalidChatRoomCredentialsError);
  });

  it("rejects room join when handle is banned", async () => {
    const useCase = createJoinChatRoomSessionUseCase({
      repository: {
        createHandle: async () => {
          throw new Error("should not create handle");
        },
        createSession: async () => {
          throw new Error("should not create session");
        },
        findHandleByRoomIdAndNormalizedHandle: async () => ({
          createdAt: new Date("2026-04-28T10:00:00.000Z"),
          handle: "vinicius",
          id: "handle_1",
          normalizedHandle: "vinicius",
          roomId: "room_1",
          status: "banned",
          updatedAt: new Date("2026-04-28T10:00:00.000Z"),
        }),
        findRoomBySlug: async () => ({
          createdAt: new Date("2026-04-28T10:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash:open-sesame",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: new Date("2026-04-28T10:00:00.000Z"),
        }),
      },
      verifyRoomPassword: async () => true,
    });

    await expect(
      useCase.execute({
        handle: "vinicius",
        password: "open-sesame",
        slug: "night-shift",
      }),
    ).rejects.toBeInstanceOf(BannedChatHandleError);
  });
});

describe("chat participants list use case", () => {
  it("returns participants only when session is active and bound to the room slug", async () => {
    const useCase = createListChatRoomParticipantsUseCase({
      repository: {
        findRoomBySlug: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
        findSessionById: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-28T12:00:00.000Z"),
          lastSeenAt: new Date("2026-04-28T12:01:00.000Z"),
          leftAt: null,
          roomId: "room_1",
          status: "active",
          updatedAt: new Date("2026-04-28T12:01:00.000Z"),
        }),
        listParticipantsByRoomId: async (roomId) => [
          {
            handle: roomId === "room_1" ? "vinicius" : "unknown",
            status: "online",
          },
          {
            handle: "guest",
            status: "idle",
          },
        ],
      },
    });

    await expect(
      useCase.execute({
        roomSessionId: "session_1",
        slug: "night-shift",
      }),
    ).resolves.toEqual({
      items: [
        {
          handle: "vinicius",
          status: "online",
        },
        {
          handle: "guest",
          status: "idle",
        },
      ],
    });
  });

  it("rejects participants access when room session is invalid for the room slug", async () => {
    const useCase = createListChatRoomParticipantsUseCase({
      repository: {
        findRoomBySlug: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
        findSessionById: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-28T12:00:00.000Z"),
          lastSeenAt: new Date("2026-04-28T12:01:00.000Z"),
          leftAt: null,
          roomId: "room_2",
          status: "active",
          updatedAt: new Date("2026-04-28T12:01:00.000Z"),
        }),
        listParticipantsByRoomId: async () => {
          throw new Error("should not list participants");
        },
      },
    });

    await expect(
      useCase.execute({
        roomSessionId: "session_1",
        slug: "night-shift",
      }),
    ).rejects.toBeInstanceOf(InvalidChatParticipantAccessError);
  });
});

describe("chat message archive list use case", () => {
  it("returns cursor-paginated messages for an active room session bound to the room slug", async () => {
    let capturedLimit: number | undefined;
    const useCase = createListChatRoomMessagesUseCase({
      repository: {
        findRoomBySlug: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
        findSessionById: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-28T12:00:00.000Z"),
          lastSeenAt: new Date("2026-04-28T12:01:00.000Z"),
          leftAt: null,
          roomId: "room_1",
          status: "active",
          updatedAt: new Date("2026-04-28T12:01:00.000Z"),
        }),
        listMessages: async (input) => {
          capturedLimit = input.limit;

          return {
            items: [
              {
                attachment: {
                  byteSize: 2048,
                  fileName: "bunker.jpg",
                  id: "upload_1",
                  kind: "image",
                  mimeType: "image/jpeg",
                },
                author: "vinicius",
                body: "late-night check-in",
                id: "message_2",
                sentAt: new Date("2026-04-28T12:03:00.000Z"),
                tone: "pink",
              },
              {
                author: "ghost-operator",
                body: "channel stable",
                id: "message_1",
                sentAt: new Date("2026-04-28T12:02:00.000Z"),
                tone: null,
              },
            ],
            nextCursor: {
              id: "message_0",
              sentAt: new Date("2026-04-28T12:01:00.000Z"),
            },
          };
        },
      },
    });

    const result = await useCase.execute({
      cursor: Buffer.from(
        JSON.stringify({
          id: "message_4",
          sentAt: "2026-04-28T12:10:00.000Z",
        }),
        "utf8",
      ).toString("base64url"),
      limit: 2,
      roomSessionId: "session_1",
      slug: "night-shift",
    });

    expect(capturedLimit).toBe(2);
    expect(result).toEqual({
      items: [
        {
          attachment: {
            byteSize: 2048,
            fileName: "bunker.jpg",
            id: "upload_1",
            kind: "image",
            mimeType: "image/jpeg",
          },
          author: "vinicius",
          body: "late-night check-in",
          id: "message_2",
          sentAt: "2026-04-28T12:03:00.000Z",
          tone: "pink",
        },
        {
          author: "ghost-operator",
          body: "channel stable",
          id: "message_1",
          sentAt: "2026-04-28T12:02:00.000Z",
        },
      ],
      pageInfo: {
        nextCursor: Buffer.from(
          JSON.stringify({
            id: "message_0",
            sentAt: "2026-04-28T12:01:00.000Z",
          }),
          "utf8",
        ).toString("base64url"),
      },
    });
  });

  it("rejects archive access when room session is invalid for the room slug", async () => {
    const useCase = createListChatRoomMessagesUseCase({
      repository: {
        findRoomBySlug: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
        findSessionById: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-28T12:00:00.000Z"),
          lastSeenAt: new Date("2026-04-28T12:01:00.000Z"),
          leftAt: null,
          roomId: "room_2",
          status: "active",
          updatedAt: new Date("2026-04-28T12:01:00.000Z"),
        }),
        listMessages: async () => {
          throw new Error("should not list messages");
        },
      },
    });

    await expect(
      useCase.execute({
        roomSessionId: "session_1",
        slug: "night-shift",
      }),
    ).rejects.toBeInstanceOf(InvalidChatMessageAccessError);
  });

  it("rejects archive access when cursor is malformed", async () => {
    const useCase = createListChatRoomMessagesUseCase({
      repository: {
        findRoomBySlug: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
        findSessionById: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-28T12:00:00.000Z"),
          lastSeenAt: new Date("2026-04-28T12:01:00.000Z"),
          leftAt: null,
          roomId: "room_1",
          status: "active",
          updatedAt: new Date("2026-04-28T12:01:00.000Z"),
        }),
        listMessages: async () => ({
          items: [],
          nextCursor: null,
        }),
      },
    });

    await expect(
      useCase.execute({
        cursor: "invalid-cursor",
        roomSessionId: "session_1",
        slug: "night-shift",
      }),
    ).rejects.toBeInstanceOf(InvalidChatMessageCursorError);
  });
});

describe("chat moderation audits list use case", () => {
  it("lists moderation audits with normalized filters and cursor pagination", async () => {
    const cursor = Buffer.from(
      JSON.stringify({
        createdAt: "2026-04-28T12:05:00.000Z",
        id: "audit_3",
      }),
      "utf8",
    ).toString("base64url");
    let capturedQuery: Record<string, unknown> | undefined;
    const useCase = createListChatModerationAuditsUseCase({
      repository: {
        listModerationAudits: async (input) => {
          capturedQuery = input as unknown as Record<string, unknown>;

          return {
            items: [
              {
                action: "ban_handle",
                actorAdminUserId: "admin_1",
                createdAt: new Date("2026-04-28T12:06:00.000Z"),
                id: "audit_2",
                nextState: {
                  handleStatus: "banned",
                },
                previousState: {
                  handleStatus: "active",
                },
                reason: "abuse",
                roomId: "room_1",
                targetBanId: "ban_1",
                targetHandleId: "handle_1",
                targetMessageId: null,
                targetRoomPasswordRotationId: null,
                targetSessionId: null,
                targetUploadId: null,
              },
            ],
            nextCursor: {
              createdAt: new Date("2026-04-28T12:06:00.000Z"),
              id: "audit_2",
            },
          };
        },
      },
    });

    const output = await useCase.execute({
      action: "ban_handle",
      actorAdminUserId: "  admin_1  ",
      cursor,
      limit: 999,
      roomId: "  room_1  ",
    });

    expect(capturedQuery).toEqual({
      action: "ban_handle",
      actorAdminUserId: "admin_1",
      cursor: {
        createdAt: new Date("2026-04-28T12:05:00.000Z"),
        id: "audit_3",
      },
      limit: 80,
      roomId: "room_1",
    });
    expect(output).toEqual({
      items: [
        {
          action: "ban_handle",
          actorAdminUserId: "admin_1",
          createdAt: "2026-04-28T12:06:00.000Z",
          id: "audit_2",
          nextState: {
            handleStatus: "banned",
          },
          previousState: {
            handleStatus: "active",
          },
          reason: "abuse",
          roomId: "room_1",
          targetBanId: "ban_1",
          targetHandleId: "handle_1",
          targetMessageId: null,
          targetRoomPasswordRotationId: null,
          targetSessionId: null,
          targetUploadId: null,
        },
      ],
      pageInfo: {
        nextCursor: Buffer.from(
          JSON.stringify({
            createdAt: "2026-04-28T12:06:00.000Z",
            id: "audit_2",
          }),
          "utf8",
        ).toString("base64url"),
      },
    });
  });

  it("rejects malformed moderation audit cursor input", async () => {
    const useCase = createListChatModerationAuditsUseCase({
      repository: {
        listModerationAudits: async () => {
          throw new Error("should not list moderation audits");
        },
      },
    });

    await expect(
      useCase.execute({
        cursor: "invalid-cursor",
      }),
    ).rejects.toBeInstanceOf(InvalidChatModerationAuditCursorError);
  });
});

describe("chat text message send use case", () => {
  it("creates a text message for an active room session bound to the room slug", async () => {
    const now = new Date("2026-04-28T12:05:00.000Z");
    let capturedCreateInput: Record<string, unknown> | undefined;
    const useCase = createSendChatRoomTextMessageUseCase({
      clock: () => now,
      repository: {
        createTextMessage: async (input) => {
          capturedCreateInput = input as unknown as Record<string, unknown>;

          return {
            authorHandleId: input.authorHandleId,
            body: input.body,
            createdAt: now,
            deletedAt: null,
            hiddenAt: null,
            id: "message_1",
            moderationState: "visible",
            roomId: input.roomId,
            roomSessionId: input.roomSessionId,
            sentAt: now,
            tone: input.tone,
            updatedAt: now,
          };
        },
        findHandleById: async () => ({
          createdAt: now,
          handle: "vinicius",
          id: "handle_1",
          normalizedHandle: "vinicius",
          roomId: "room_1",
          status: "active",
          updatedAt: now,
        }),
        findRoomBySlug: async () => ({
          createdAt: now,
          id: "room_1",
          passwordHash: "hash",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: now,
        }),
        findSessionById: async () => ({
          createdAt: now,
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: now,
          lastSeenAt: now,
          leftAt: null,
          roomId: "room_1",
          status: "active",
          updatedAt: now,
        }),
      },
    });

    const result = await useCase.execute({
      body: "  message from   bunker  ",
      roomSessionId: "session_1",
      slug: "night-shift",
      tone: "pink",
    });

    expect(capturedCreateInput).toEqual({
      authorHandleId: "handle_1",
      body: "message from bunker",
      roomId: "room_1",
      roomSessionId: "session_1",
      sentAt: now,
      tone: "pink",
    });
    expect(result).toEqual({
      author: "vinicius",
      body: "message from bunker",
      id: "message_1",
      sentAt: "2026-04-28T12:05:00.000Z",
      tone: "pink",
    });
  });

  it("rejects text message send when room session is invalid for the room slug", async () => {
    const useCase = createSendChatRoomTextMessageUseCase({
      repository: {
        createTextMessage: async () => {
          throw new Error("should not create message");
        },
        findHandleById: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          handle: "vinicius",
          id: "handle_1",
          normalizedHandle: "vinicius",
          roomId: "room_1",
          status: "active",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
        findRoomBySlug: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
        findSessionById: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-28T12:00:00.000Z"),
          lastSeenAt: new Date("2026-04-28T12:00:00.000Z"),
          leftAt: null,
          roomId: "room_2",
          status: "active",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
      },
    });

    await expect(
      useCase.execute({
        body: "message body",
        roomSessionId: "session_1",
        slug: "night-shift",
      }),
    ).rejects.toBeInstanceOf(InvalidChatMessageAccessError);
  });

  it("rejects text message send when the session handle is no longer active in the room", async () => {
    const useCase = createSendChatRoomTextMessageUseCase({
      repository: {
        createTextMessage: async () => {
          throw new Error("should not create message");
        },
        findHandleById: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          handle: "vinicius",
          id: "handle_1",
          normalizedHandle: "vinicius",
          roomId: "room_1",
          status: "banned",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
        findRoomBySlug: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          id: "room_1",
          passwordHash: "hash",
          passwordRotatedAt: null,
          passwordVersion: 1,
          slug: "night-shift",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
        findSessionById: async () => ({
          createdAt: new Date("2026-04-28T12:00:00.000Z"),
          expiresAt: null,
          handleId: "handle_1",
          id: "session_1",
          joinedAt: new Date("2026-04-28T12:00:00.000Z"),
          lastSeenAt: new Date("2026-04-28T12:00:00.000Z"),
          leftAt: null,
          roomId: "room_1",
          status: "active",
          updatedAt: new Date("2026-04-28T12:00:00.000Z"),
        }),
      },
    });

    await expect(
      useCase.execute({
        body: "message body",
        roomSessionId: "session_1",
        slug: "night-shift",
      }),
    ).rejects.toBeInstanceOf(InvalidChatMessageAccessError);
  });
});

describe("chat message moderation use case", () => {
  it("records a hide-message moderation action", async () => {
    const occurredAt = new Date("2026-04-28T12:06:00.000Z");
    const capturedCalls: Array<Record<string, unknown>> = [];
    const useCase = createModerateChatRoomMessageUseCase({
      clock: () => occurredAt,
      repository: {
        moderateMessage: async (input) => {
          capturedCalls.push(input as unknown as Record<string, unknown>);

          return {
            auditId: "audit_1",
            message: {
              authorHandleId: "handle_1",
              body: "from the bunker",
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
              byteSize: 512,
              createdAt: occurredAt,
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
          };
        },
      },
    });

    const output = await useCase.execute({
      action: "hide_message",
      actorAdminUserId: " admin_1 ",
      messageId: "message_1",
      reason: "  redact from room thread  ",
    });

    expect(capturedCalls).toEqual([
      {
        action: "hide_message",
        actorAdminUserId: "admin_1",
        messageId: "message_1",
        occurredAt,
        reason: "redact from room thread",
      },
    ]);
    expect(output).toEqual({
      action: "hide_message",
      auditId: "audit_1",
      messageId: "message_1",
      messageModerationState: "hidden",
      uploadId: "upload_1",
      uploadModerationState: "hidden",
    });
  });

  it("maps delete-message moderation state transitions", async () => {
    const useCase = createModerateChatRoomMessageUseCase({
      repository: {
        moderateMessage: async () => ({
          auditId: "audit_2",
          message: {
            authorHandleId: "handle_1",
            body: "from the bunker",
            createdAt: new Date("2026-04-28T12:06:00.000Z"),
            deletedAt: new Date("2026-04-28T12:06:00.000Z"),
            hiddenAt: new Date("2026-04-28T12:06:00.000Z"),
            id: "message_1",
            moderationState: "deleted",
            roomId: "room_1",
            roomSessionId: "session_1",
            sentAt: new Date("2026-04-28T12:06:00.000Z"),
            tone: null,
            updatedAt: new Date("2026-04-28T12:06:00.000Z"),
          },
          upload: {
            byteSize: 512,
            createdAt: new Date("2026-04-28T12:06:00.000Z"),
            deletedAt: new Date("2026-04-28T12:06:00.000Z"),
            displayFilename: "drop.png",
            hiddenAt: new Date("2026-04-28T12:06:00.000Z"),
            id: "upload_1",
            kind: "image",
            messageId: "message_1",
            mimeType: "image/png",
            moderationState: "deleted",
            roomId: "room_1",
            storageKey: "room_1/upload_1.png",
            storagePath: "room_1/upload_1.png",
            updatedAt: new Date("2026-04-28T12:06:00.000Z"),
            uploaderHandleId: "handle_1",
            uploaderSessionId: "session_1",
          },
        }),
      },
    });

    await expect(
      useCase.execute({
        action: "delete_message",
        actorAdminUserId: "admin_1",
        messageId: "message_1",
      }),
    ).resolves.toEqual({
      action: "delete_message",
      auditId: "audit_2",
      messageId: "message_1",
      messageModerationState: "deleted",
      uploadId: "upload_1",
      uploadModerationState: "deleted",
    });
  });

  it("returns null when target message does not exist", async () => {
    const useCase = createModerateChatRoomMessageUseCase({
      repository: {
        moderateMessage: async () => null,
      },
    });

    await expect(
      useCase.execute({
        action: "delete_message",
        actorAdminUserId: "admin_1",
        messageId: "message_404",
      }),
    ).resolves.toBeNull();
  });
});

describe("chat handle ban use case", () => {
  it("creates a ban and returns audit metadata", async () => {
    const occurredAt = new Date("2026-04-28T12:07:00.000Z");
    const capturedCalls: Array<Record<string, unknown>> = [];
    const useCase = createBanChatRoomHandleUseCase({
      clock: () => occurredAt,
      repository: {
        banHandle: async (input) => {
          capturedCalls.push(input as unknown as Record<string, unknown>);

          return {
            auditId: "audit_2",
            banId: "ban_1",
            handle: {
              createdAt: occurredAt,
              handle: "vinicius",
              id: "handle_1",
              normalizedHandle: "vinicius",
              roomId: "room_1",
              status: "banned",
              updatedAt: occurredAt,
            },
            revokedSessionCount: 2,
          };
        },
      },
    });

    const output = await useCase.execute({
      actorAdminUserId: " admin_1 ",
      handleId: "handle_1",
      reason: "  repeated abuse  ",
    });

    expect(capturedCalls).toEqual([
      {
        actorAdminUserId: "admin_1",
        handleId: "handle_1",
        occurredAt,
        reason: "repeated abuse",
      },
    ]);
    expect(output).toEqual({
      auditId: "audit_2",
      banId: "ban_1",
      handleId: "handle_1",
      revokedSessionCount: 2,
      roomId: "room_1",
      status: "banned",
    });
  });

  it("returns null when the target handle does not exist", async () => {
    const useCase = createBanChatRoomHandleUseCase({
      repository: {
        banHandle: async () => null,
      },
    });

    await expect(
      useCase.execute({
        actorAdminUserId: "admin_1",
        handleId: "handle_404",
      }),
    ).resolves.toBeNull();
  });
});

describe("chat room password rotation use case", () => {
  it("generates the next password, rotates the hash, and returns rotation metadata", async () => {
    const occurredAt = new Date("2026-04-28T12:08:00.000Z");
    const capturedCalls: Array<Record<string, unknown>> = [];
    const useCase = createRotateChatRoomPasswordUseCase({
      clock: () => occurredAt,
      generateRoomPassword: () => "new-secret",
      hashRoomPassword: async (plainText) => `hash:${plainText}`,
      repository: {
        rotateRoomPassword: async (input) => {
          capturedCalls.push(input as unknown as Record<string, unknown>);

          return {
            auditId: "audit_3",
            currentPassword: input.nextPassword,
            revokedSessionCount: 3,
            room: {
              createdAt: occurredAt,
              id: "room_1",
              passwordHash: "hash:new-secret",
              passwordRotatedAt: occurredAt,
              passwordVersion: 4,
              slug: "night-shift",
              updatedAt: occurredAt,
            },
            rotation: {
              id: "rotation_1",
              rotatedAt: occurredAt,
            },
          };
        },
      },
      sessionTtlHours: 24,
    });

    const output = await useCase.execute({
      actorAdminUserId: " admin_1 ",
      reason: "  leaked in public channel  ",
      slug: " night-shift ",
    });

    expect(capturedCalls).toEqual([
      {
        actorAdminUserId: "admin_1",
        nextPassword: "new-secret",
        nextPasswordHash: "hash:new-secret",
        occurredAt,
        reason: "leaked in public channel",
        slug: "night-shift",
      },
    ]);
    expect(output).toEqual({
      auditId: "audit_3",
      generatedPassword: "new-secret",
      revokedSessionCount: 3,
      room: {
        id: "room_1",
        passwordRotatedAt: "2026-04-28T12:08:00.000Z",
        passwordVersion: 4,
        sessionTtlHours: 24,
        slug: "night-shift",
      },
      rotation: {
        id: "rotation_1",
        rotatedAt: "2026-04-28T12:08:00.000Z",
      },
    });
  });

  it("returns null when room slug does not exist", async () => {
    const useCase = createRotateChatRoomPasswordUseCase({
      generateRoomPassword: () => "new-secret",
      hashRoomPassword: async (plainText) => `hash:${plainText}`,
      repository: {
        rotateRoomPassword: async () => null,
      },
      sessionTtlHours: 24,
    });

    await expect(
      useCase.execute({
        actorAdminUserId: "admin_1",
        slug: "unknown-room",
      }),
    ).resolves.toBeNull();
  });
});

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
        findHandleById: async () => ({
          createdAt: sentAt,
          handle: "vinicius",
          id: "handle_1",
          normalizedHandle: "vinicius",
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
      body: "  post from bunker  ",
      image: {
        body: new TextEncoder().encode("upload-bytes"),
        displayFilename: "bunker.png",
        mimeType: "image/png",
      },
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
      author: "vinicius",
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
        findHandleById: async () => ({
          createdAt: new Date("2026-04-24T00:00:00.000Z"),
          handle: "vinicius",
          id: "handle_1",
          normalizedHandle: "vinicius",
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
        image: {
          body: new Uint8Array([1, 2, 3, 4]),
          displayFilename: "scan.webp",
          mimeType: "image/webp",
        },
        roomSessionId: "session_1",
      }),
    ).rejects.toThrow("database write failed");
    expect(deletedPaths).toEqual(["room_1/upload_1.webp"]);
  });

  it("rejects uploads when the session actor cannot be resolved as an active room handle", async () => {
    const useCase = createUploadChatMessageWithImageUseCase({
      repository: {
        createMessageWithUpload: async () => {
          throw new Error("should not persist");
        },
        findHandleById: async () => ({
          createdAt: new Date("2026-04-24T00:00:00.000Z"),
          handle: "vinicius",
          id: "handle_2",
          normalizedHandle: "vinicius",
          roomId: "room_1",
          status: "active",
          updatedAt: new Date("2026-04-24T00:00:00.000Z"),
        }),
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
        image: {
          body: new Uint8Array([1, 2, 3, 4]),
          displayFilename: "scan.webp",
          mimeType: "image/webp",
        },
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
