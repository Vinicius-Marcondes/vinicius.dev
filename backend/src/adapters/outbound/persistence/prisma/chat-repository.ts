import { createCipheriv, createDecipheriv, createHash, hkdfSync, randomBytes } from "node:crypto";

import type {
  BanChatRoomHandleCommand,
  BanChatRoomHandleResult,
  ChatHandleRepositoryRow,
  ChatModerationAuditAction,
  ChatModerationAuditListPage,
  ChatModerationAuditListQuery,
  ChatModerationAuditRepositoryRow,
  ChatMessageListItemRepositoryRow,
  ChatMessageListPage,
  ChatMessageListQuery,
  ChatMessageRepositoryRow,
  ChatRoomAccessRepositoryRow,
  ChatRoomParticipantRepositoryRow,
  ChatRepositoryPort,
  ChatRoomRepositoryRow,
  ChatRoomSessionRepositoryRow,
  ChatUploadRepositoryRow,
  CreateChatHandleCommand,
  CreateChatTextMessageCommand,
  CreateChatMessageWithUploadCommand,
  CreateChatMessageWithUploadResult,
  CreateChatRoomSessionCommand,
  ModerateChatRoomMessageCommand,
  ModerateChatRoomMessageResult,
  ModerateChatUploadRetentionCommand,
  ModerateChatUploadRetentionResult,
  RotateChatRoomPasswordCommand,
  RotateChatRoomPasswordResult,
} from "@/modules/chat/ports/outbound";
import { ChatUploadMimeType } from "../../../../../generated/prisma/client";

import type { PrismaDatabaseClient } from "./prisma-client";

const ROOM_PASSWORD_CIPHERTEXT_VERSION = "v2";
const ROOM_PASSWORD_HKDF_INFO = "vinicius.dev/chat-room-readable-password/aes-256-gcm";
const ROOM_PASSWORD_HKDF_SALT = "vinicius.dev/chat-room-readable-password/salt";
const ROOM_PASSWORD_KEY_LENGTH_BYTES = 32;

const createReadablePasswordKey = (secret: string): Buffer =>
  Buffer.from(
    hkdfSync(
      "sha256",
      Buffer.from(secret, "utf8"),
      Buffer.from(ROOM_PASSWORD_HKDF_SALT, "utf8"),
      Buffer.from(ROOM_PASSWORD_HKDF_INFO, "utf8"),
      ROOM_PASSWORD_KEY_LENGTH_BYTES,
    ),
  );

const createLegacyReadablePasswordKey = (secret: string): Buffer =>
  createHash("sha256").update(secret).digest();

const encryptReadablePassword = (plainText: string, secret: string): string => {
  const iv = randomBytes(12);
  const key = createReadablePasswordKey(secret);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${ROOM_PASSWORD_CIPHERTEXT_VERSION}.${iv.toString("base64url")}.${encrypted.toString("base64url")}.${tag.toString("base64url")}`;
};

const decryptReadablePasswordPayload = (
  ciphertextParts: readonly [string, string, string],
  key: Buffer,
): string => {
  const [ivBase64, payloadBase64, tagBase64] = ciphertextParts;
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivBase64, "base64url"));
  decipher.setAuthTag(Buffer.from(tagBase64, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(payloadBase64, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};

const decryptReadablePassword = (ciphertext: string, secret: string): string => {
  const parts = ciphertext.split(".");

  if (parts[0] === ROOM_PASSWORD_CIPHERTEXT_VERSION) {
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted room password payload");
    }

    const [, ivBase64, payloadBase64, tagBase64] = parts;

    if (!ivBase64 || !payloadBase64 || !tagBase64) {
      throw new Error("Invalid encrypted room password payload");
    }

    return decryptReadablePasswordPayload(
      [ivBase64, payloadBase64, tagBase64],
      createReadablePasswordKey(secret),
    );
  }

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted room password payload");
  }

  const [ivBase64, payloadBase64, tagBase64] = parts;

  if (!ivBase64 || !payloadBase64 || !tagBase64) {
    throw new Error("Invalid encrypted room password payload");
  }

  return decryptReadablePasswordPayload(
    [ivBase64, payloadBase64, tagBase64],
    createLegacyReadablePasswordKey(secret),
  );
};

const notImplemented = <T>(method: string): Promise<T> => {
  return Promise.reject(new Error(`Prisma chat repository method not implemented: ${method}`));
};

const mapUploadMimeTypeToPrisma = (
  value: "image/jpeg" | "image/png" | "image/webp",
): ChatUploadMimeType => {
  if (value === "image/jpeg") {
    return ChatUploadMimeType.image_jpeg;
  }

  if (value === "image/png") {
    return ChatUploadMimeType.image_png;
  }

  return ChatUploadMimeType.image_webp;
};

const mapUploadMimeTypeFromPrisma = (
  value: ChatUploadMimeType,
): "image/jpeg" | "image/png" | "image/webp" => {
  if (value === ChatUploadMimeType.image_jpeg) {
    return "image/jpeg";
  }

  if (value === ChatUploadMimeType.image_png) {
    return "image/png";
  }

  return "image/webp";
};

const mapMessageRow = (row: {
  authorHandleId: string;
  body: string;
  createdAt: Date;
  deletedAt: Date | null;
  hiddenAt: Date | null;
  id: string;
  moderationState: "visible" | "hidden" | "deleted";
  roomId: string;
  roomSessionId: string;
  sentAt: Date;
  tone: "cyan" | "pink" | "system" | null;
  updatedAt: Date;
}): ChatMessageRepositoryRow => ({
  authorHandleId: row.authorHandleId,
  body: row.body,
  createdAt: row.createdAt,
  deletedAt: row.deletedAt,
  hiddenAt: row.hiddenAt,
  id: row.id,
  moderationState: row.moderationState,
  roomId: row.roomId,
  roomSessionId: row.roomSessionId,
  sentAt: row.sentAt,
  tone: row.tone,
  updatedAt: row.updatedAt,
});

const mapSessionRow = (row: {
  createdAt: Date;
  expiresAt: Date | null;
  handleId: string;
  id: string;
  joinedAt: Date;
  lastSeenAt: Date | null;
  leftAt: Date | null;
  roomId: string;
  status: "active" | "revoked" | "expired";
  updatedAt: Date;
}): ChatRoomSessionRepositoryRow => ({
  createdAt: row.createdAt,
  expiresAt: row.expiresAt,
  handleId: row.handleId,
  id: row.id,
  joinedAt: row.joinedAt,
  lastSeenAt: row.lastSeenAt,
  leftAt: row.leftAt,
  roomId: row.roomId,
  status: row.status,
  updatedAt: row.updatedAt,
});

const mapRoomRow = (row: {
  createdAt: Date;
  id: string;
  passwordHash: string;
  passwordRotatedAt: Date | null;
  passwordVersion: number;
  slug: string;
  updatedAt: Date;
}): ChatRoomRepositoryRow => ({
  createdAt: row.createdAt,
  id: row.id,
  passwordHash: row.passwordHash,
  passwordRotatedAt: row.passwordRotatedAt,
  passwordVersion: row.passwordVersion,
  slug: row.slug,
  updatedAt: row.updatedAt,
});

const mapRoomAccessRow = (
  row: {
    currentPasswordCiphertext: string | null;
    id: string;
    passwordRotatedAt: Date | null;
    passwordVersion: number;
    slug: string;
  },
  roomPasswordSecret: string,
): ChatRoomAccessRepositoryRow | null => {
  if (!row.currentPasswordCiphertext) {
    return null;
  }

  return {
    currentPassword: decryptReadablePassword(row.currentPasswordCiphertext, roomPasswordSecret),
    id: row.id,
    passwordRotatedAt: row.passwordRotatedAt,
    passwordVersion: row.passwordVersion,
    slug: row.slug,
  };
};

const mapHandleRow = (row: {
  createdAt: Date;
  handle: string;
  id: string;
  normalizedHandle: string;
  roomId: string;
  status: "active" | "banned";
  updatedAt: Date;
}): ChatHandleRepositoryRow => ({
  createdAt: row.createdAt,
  handle: row.handle,
  id: row.id,
  normalizedHandle: row.normalizedHandle,
  roomId: row.roomId,
  status: row.status,
  updatedAt: row.updatedAt,
});

const mapUploadRow = (row: {
  byteSize: number;
  createdAt: Date;
  deletedAt: Date | null;
  displayFilename: string;
  hiddenAt: Date | null;
  id: string;
  kind: "image";
  messageId: string | null;
  mimeType: ChatUploadMimeType;
  moderationState: "visible" | "hidden" | "deleted";
  roomId: string;
  storageKey: string;
  storagePath: string;
  updatedAt: Date;
  uploaderHandleId: string;
  uploaderSessionId: string | null;
}): ChatUploadRepositoryRow => ({
  byteSize: row.byteSize,
  createdAt: row.createdAt,
  deletedAt: row.deletedAt,
  displayFilename: row.displayFilename,
  hiddenAt: row.hiddenAt,
  id: row.id,
  kind: row.kind,
  messageId: row.messageId,
  mimeType: mapUploadMimeTypeFromPrisma(row.mimeType),
  moderationState: row.moderationState,
  roomId: row.roomId,
  storageKey: row.storageKey,
  storagePath: row.storagePath,
  updatedAt: row.updatedAt,
  uploaderHandleId: row.uploaderHandleId,
  uploaderSessionId: row.uploaderSessionId,
});

const createMessageWithUpload = async (
  client: PrismaDatabaseClient,
  input: CreateChatMessageWithUploadCommand,
): Promise<CreateChatMessageWithUploadResult> => {
  return client.$transaction(async (tx) => {
    const message = await tx.chatMessage.create({
      data: {
        authorHandleId: input.authorHandleId,
        body: input.body,
        id: input.messageId,
        roomId: input.roomId,
        roomSessionId: input.roomSessionId,
        sentAt: input.sentAt,
        tone: input.tone,
      },
      select: {
        authorHandleId: true,
        body: true,
        createdAt: true,
        deletedAt: true,
        hiddenAt: true,
        id: true,
        moderationState: true,
        roomId: true,
        roomSessionId: true,
        sentAt: true,
        tone: true,
        updatedAt: true,
      },
    });

    const upload = await tx.chatUpload.create({
      data: {
        byteSize: input.byteSize,
        displayFilename: input.displayFilename,
        id: input.uploadId,
        messageId: message.id,
        mimeType: mapUploadMimeTypeToPrisma(input.mimeType),
        roomId: input.roomId,
        storageKey: input.storageKey,
        storagePath: input.storagePath,
        uploaderHandleId: input.authorHandleId,
        uploaderSessionId: input.roomSessionId,
      },
      select: {
        byteSize: true,
        createdAt: true,
        deletedAt: true,
        displayFilename: true,
        hiddenAt: true,
        id: true,
        kind: true,
        messageId: true,
        mimeType: true,
        moderationState: true,
        roomId: true,
        storageKey: true,
        storagePath: true,
        updatedAt: true,
        uploaderHandleId: true,
        uploaderSessionId: true,
      },
    });

    return {
      message: mapMessageRow(message),
      upload: mapUploadRow(upload),
    };
  });
};

const createTextMessage = async (
  client: PrismaDatabaseClient,
  input: CreateChatTextMessageCommand,
): Promise<ChatMessageRepositoryRow> => {
  const message = await client.chatMessage.create({
    data: {
      authorHandleId: input.authorHandleId,
      body: input.body,
      roomId: input.roomId,
      roomSessionId: input.roomSessionId,
      sentAt: input.sentAt,
      tone: input.tone,
    },
    select: {
      authorHandleId: true,
      body: true,
      createdAt: true,
      deletedAt: true,
      hiddenAt: true,
      id: true,
      moderationState: true,
      roomId: true,
      roomSessionId: true,
      sentAt: true,
      tone: true,
      updatedAt: true,
    },
  });

  return mapMessageRow(message);
};

const createHandle = async (
  client: PrismaDatabaseClient,
  input: CreateChatHandleCommand,
): Promise<ChatHandleRepositoryRow> => {
  const handle = await client.chatHandle.create({
    data: {
      handle: input.handle,
      normalizedHandle: input.normalizedHandle,
      roomId: input.roomId,
      status: input.status,
    },
    select: {
      createdAt: true,
      handle: true,
      id: true,
      normalizedHandle: true,
      roomId: true,
      status: true,
      updatedAt: true,
    },
  });

  return mapHandleRow(handle);
};

const createSession = async (
  client: PrismaDatabaseClient,
  input: CreateChatRoomSessionCommand,
): Promise<ChatRoomSessionRepositoryRow> => {
  const session = await client.chatRoomSession.create({
    data: {
      expiresAt: input.expiresAt,
      handleId: input.handleId,
      joinedAt: input.joinedAt,
      lastSeenAt: input.lastSeenAt,
      leftAt: input.leftAt,
      roomId: input.roomId,
      sessionTokenHash: input.sessionTokenHash,
      status: input.status,
    },
    select: {
      createdAt: true,
      expiresAt: true,
      handleId: true,
      id: true,
      joinedAt: true,
      lastSeenAt: true,
      leftAt: true,
      roomId: true,
      status: true,
      updatedAt: true,
    },
  });

  return mapSessionRow(session);
};

const moderateUploadRetention = async (
  client: PrismaDatabaseClient,
  input: ModerateChatUploadRetentionCommand,
): Promise<ModerateChatUploadRetentionResult | null> => {
  return client.$transaction(async (tx) => {
    const upload = await tx.chatUpload.findUnique({
      select: {
        byteSize: true,
        createdAt: true,
        deletedAt: true,
        displayFilename: true,
        hiddenAt: true,
        id: true,
        kind: true,
        messageId: true,
        mimeType: true,
        moderationState: true,
        roomId: true,
        storageKey: true,
        storagePath: true,
        updatedAt: true,
        uploaderHandleId: true,
        uploaderSessionId: true,
      },
      where: {
        id: input.uploadId,
      },
    });

    if (!upload) {
      return null;
    }

    const message = upload.messageId
      ? await tx.chatMessage.findUnique({
          select: {
            authorHandleId: true,
            body: true,
            createdAt: true,
            deletedAt: true,
            hiddenAt: true,
            id: true,
            moderationState: true,
            roomId: true,
            roomSessionId: true,
            sentAt: true,
            tone: true,
            updatedAt: true,
          },
          where: {
            id: upload.messageId,
          },
        })
      : null;

    const nextUploadHiddenAt = upload.hiddenAt ?? input.occurredAt;
    const nextUploadDeletedAt = upload.deletedAt;
    const nextUploadModerationState =
      upload.moderationState === "deleted" || upload.deletedAt
        ? "deleted"
        : "hidden";
    const nextMessageHiddenAt =
      message ? (message.hiddenAt ?? input.occurredAt) : null;
    const nextMessageDeletedAt =
      message && input.action === "delete_message"
        ? message.deletedAt ?? input.occurredAt
        : message?.deletedAt ?? null;
    const nextMessageModerationState =
      input.action === "delete_message" ||
      message?.moderationState === "deleted" ||
      !!message?.deletedAt
        ? "deleted"
        : "hidden";

    const updatedUpload = await tx.chatUpload.update({
      data: {
        deletedAt: nextUploadDeletedAt,
        hiddenAt: nextUploadHiddenAt,
        moderationState: nextUploadModerationState,
      },
      select: {
        byteSize: true,
        createdAt: true,
        deletedAt: true,
        displayFilename: true,
        hiddenAt: true,
        id: true,
        kind: true,
        messageId: true,
        mimeType: true,
        moderationState: true,
        roomId: true,
        storageKey: true,
        storagePath: true,
        updatedAt: true,
        uploaderHandleId: true,
        uploaderSessionId: true,
      },
      where: {
        id: input.uploadId,
      },
    });

    const updatedMessage =
      message && upload.messageId
        ? await tx.chatMessage.update({
            data: {
              deletedAt: nextMessageDeletedAt,
              hiddenAt: nextMessageHiddenAt,
              moderationState: nextMessageModerationState,
            },
            select: {
              authorHandleId: true,
              body: true,
              createdAt: true,
              deletedAt: true,
              hiddenAt: true,
              id: true,
              moderationState: true,
              roomId: true,
              roomSessionId: true,
              sentAt: true,
              tone: true,
              updatedAt: true,
            },
            where: {
              id: upload.messageId,
            },
          })
        : null;

    const audit = await tx.chatModerationAuditRecord.create({
      data: {
        action: input.action,
        actorAdminUserId: input.actorAdminUserId,
        nextState: {
          messageModerationState: updatedMessage?.moderationState ?? null,
          uploadModerationState: updatedUpload.moderationState,
        },
        previousState: {
          messageDeletedAt: message?.deletedAt?.toISOString() ?? null,
          messageHiddenAt: message?.hiddenAt?.toISOString() ?? null,
          messageModerationState: message?.moderationState ?? null,
          uploadDeletedAt: upload.deletedAt?.toISOString() ?? null,
          uploadHiddenAt: upload.hiddenAt?.toISOString() ?? null,
          uploadModerationState: upload.moderationState,
        },
        reason: input.reason,
        roomId: upload.roomId,
        targetMessageId: upload.messageId,
        targetUploadId: upload.id,
      },
      select: {
        id: true,
      },
    });

    return {
      auditId: audit.id,
      message: updatedMessage ? mapMessageRow(updatedMessage) : null,
      upload: mapUploadRow(updatedUpload),
    };
  });
};

const moderateMessage = async (
  client: PrismaDatabaseClient,
  input: ModerateChatRoomMessageCommand,
): Promise<ModerateChatRoomMessageResult | null> => {
  return client.$transaction(async (tx) => {
    const message = await tx.chatMessage.findUnique({
      select: {
        authorHandleId: true,
        body: true,
        createdAt: true,
        deletedAt: true,
        hiddenAt: true,
        id: true,
        moderationState: true,
        roomId: true,
        roomSessionId: true,
        sentAt: true,
        tone: true,
        updatedAt: true,
      },
      where: {
        id: input.messageId,
      },
    });

    if (!message) {
      return null;
    }

    const upload = await tx.chatUpload.findUnique({
      select: {
        byteSize: true,
        createdAt: true,
        deletedAt: true,
        displayFilename: true,
        hiddenAt: true,
        id: true,
        kind: true,
        messageId: true,
        mimeType: true,
        moderationState: true,
        roomId: true,
        storageKey: true,
        storagePath: true,
        updatedAt: true,
        uploaderHandleId: true,
        uploaderSessionId: true,
      },
      where: {
        messageId: message.id,
      },
    });

    const nextMessageHiddenAt = message.hiddenAt ?? input.occurredAt;
    const nextMessageDeletedAt =
      input.action === "delete_message"
        ? message.deletedAt ?? input.occurredAt
        : message.deletedAt;
    const nextMessageModerationState =
      input.action === "delete_message" ||
      message.moderationState === "deleted" ||
      !!message.deletedAt
        ? "deleted"
        : "hidden";

    const updatedMessage = await tx.chatMessage.update({
      data: {
        deletedAt: nextMessageDeletedAt,
        hiddenAt: nextMessageHiddenAt,
        moderationState: nextMessageModerationState,
      },
      select: {
        authorHandleId: true,
        body: true,
        createdAt: true,
        deletedAt: true,
        hiddenAt: true,
        id: true,
        moderationState: true,
        roomId: true,
        roomSessionId: true,
        sentAt: true,
        tone: true,
        updatedAt: true,
      },
      where: {
        id: message.id,
      },
    });

    const updatedUpload = upload
      ? await tx.chatUpload.update({
          data: {
            deletedAt: upload.deletedAt,
            hiddenAt: upload.hiddenAt ?? input.occurredAt,
            moderationState:
              upload.moderationState === "deleted" || upload.deletedAt
                ? "deleted"
                : "hidden",
          },
          select: {
            byteSize: true,
            createdAt: true,
            deletedAt: true,
            displayFilename: true,
            hiddenAt: true,
            id: true,
            kind: true,
            messageId: true,
            mimeType: true,
            moderationState: true,
            roomId: true,
            storageKey: true,
            storagePath: true,
            updatedAt: true,
            uploaderHandleId: true,
            uploaderSessionId: true,
          },
          where: {
            id: upload.id,
          },
        })
      : null;

    const audit = await tx.chatModerationAuditRecord.create({
      data: {
        action:
          input.action === "delete_message" ? "delete_message" : "hide_media_metadata",
        actorAdminUserId: input.actorAdminUserId,
        nextState: {
          messageDeletedAt: updatedMessage.deletedAt?.toISOString() ?? null,
          messageHiddenAt: updatedMessage.hiddenAt?.toISOString() ?? null,
          messageModerationState: updatedMessage.moderationState,
          uploadDeletedAt: updatedUpload?.deletedAt?.toISOString() ?? null,
          uploadHiddenAt: updatedUpload?.hiddenAt?.toISOString() ?? null,
          uploadModerationState: updatedUpload?.moderationState ?? null,
        },
        previousState: {
          messageDeletedAt: message.deletedAt?.toISOString() ?? null,
          messageHiddenAt: message.hiddenAt?.toISOString() ?? null,
          messageModerationState: message.moderationState,
          uploadDeletedAt: upload?.deletedAt?.toISOString() ?? null,
          uploadHiddenAt: upload?.hiddenAt?.toISOString() ?? null,
          uploadModerationState: upload?.moderationState ?? null,
        },
        reason: input.reason,
        roomId: message.roomId,
        targetMessageId: message.id,
        targetUploadId: upload?.id ?? null,
      },
      select: {
        id: true,
      },
    });

    return {
      auditId: audit.id,
      message: mapMessageRow(updatedMessage),
      upload: updatedUpload ? mapUploadRow(updatedUpload) : null,
    };
  });
};

const banHandle = async (
  client: PrismaDatabaseClient,
  input: BanChatRoomHandleCommand,
): Promise<BanChatRoomHandleResult | null> => {
  return client.$transaction(async (tx) => {
    const handle = await tx.chatHandle.findUnique({
      select: {
        createdAt: true,
        handle: true,
        id: true,
        normalizedHandle: true,
        roomId: true,
        status: true,
        updatedAt: true,
      },
      where: {
        id: input.handleId,
      },
    });

    if (!handle) {
      return null;
    }

    const nextHandle =
      handle.status === "banned"
        ? handle
        : await tx.chatHandle.update({
            data: {
              status: "banned",
            },
            select: {
              createdAt: true,
              handle: true,
              id: true,
              normalizedHandle: true,
              roomId: true,
              status: true,
              updatedAt: true,
            },
            where: {
              id: handle.id,
            },
          });

    const revokedSessions = await tx.chatRoomSession.updateMany({
      data: {
        leftAt: input.occurredAt,
        status: "revoked",
      },
      where: {
        handleId: handle.id,
        roomId: handle.roomId,
        status: "active",
      },
    });

    const ban = await tx.chatBan.create({
      data: {
        actorAdminUserId: input.actorAdminUserId,
        bannedAt: input.occurredAt,
        reason: input.reason,
        roomId: handle.roomId,
        status: "active",
        targetHandleId: handle.id,
      },
      select: {
        id: true,
      },
    });

    const audit = await tx.chatModerationAuditRecord.create({
      data: {
        action: "ban_handle",
        actorAdminUserId: input.actorAdminUserId,
        nextState: {
          handleStatus: nextHandle.status,
          revokedSessionCount: revokedSessions.count,
        },
        previousState: {
          handleStatus: handle.status,
        },
        reason: input.reason,
        roomId: handle.roomId,
        targetBanId: ban.id,
        targetHandleId: handle.id,
      },
      select: {
        id: true,
      },
    });

    return {
      auditId: audit.id,
      banId: ban.id,
      handle: mapHandleRow(nextHandle),
      revokedSessionCount: revokedSessions.count,
    };
  });
};

const rotateRoomPassword = async (
  client: PrismaDatabaseClient,
  input: RotateChatRoomPasswordCommand,
  roomPasswordSecret: string,
): Promise<RotateChatRoomPasswordResult | null> => {
  return client.$transaction(async (tx) => {
    const existingRoom = await tx.chatRoom.findUnique({
      select: {
        createdAt: true,
        id: true,
        passwordHash: true,
        passwordRotatedAt: true,
        passwordVersion: true,
        slug: true,
        updatedAt: true,
      },
      where: {
        slug: input.slug,
      },
    });

    const room = existingRoom ?? await tx.chatRoom.create({
      data: {
        currentPasswordCiphertext: encryptReadablePassword(input.nextPassword, roomPasswordSecret),
        passwordHash: input.nextPasswordHash,
        passwordRotatedAt: input.occurredAt,
        passwordVersion: 0,
        slug: input.slug,
      },
      select: {
        createdAt: true,
        id: true,
        passwordHash: true,
        passwordRotatedAt: true,
        passwordVersion: true,
        slug: true,
        updatedAt: true,
      },
    });

    const updatedRoom = await tx.chatRoom.update({
      data: {
        currentPasswordCiphertext: encryptReadablePassword(input.nextPassword, roomPasswordSecret),
        passwordHash: input.nextPasswordHash,
        passwordRotatedAt: input.occurredAt,
        passwordVersion: room.passwordVersion + 1,
      },
      select: {
        createdAt: true,
        id: true,
        passwordHash: true,
        passwordRotatedAt: true,
        passwordVersion: true,
        slug: true,
        updatedAt: true,
      },
      where: {
        id: room.id,
      },
    });

    const rotation = await tx.chatRoomPasswordRotation.create({
      data: {
        actorAdminUserId: input.actorAdminUserId,
        nextPasswordHash: input.nextPasswordHash,
        nextPasswordVersion: updatedRoom.passwordVersion,
        previousPasswordHash: room.passwordHash,
        previousPasswordVersion: room.passwordVersion,
        reason: input.reason,
        roomId: room.id,
        rotatedAt: input.occurredAt,
      },
      select: {
        id: true,
        rotatedAt: true,
      },
    });

    const revokedSessions = await tx.chatRoomSession.updateMany({
      data: {
        leftAt: input.occurredAt,
        status: "revoked",
      },
      where: {
        roomId: room.id,
        status: "active",
      },
    });

    const audit = await tx.chatModerationAuditRecord.create({
      data: {
        action: "room_password_rotation",
        actorAdminUserId: input.actorAdminUserId,
        nextState: {
          passwordRotatedAt: updatedRoom.passwordRotatedAt?.toISOString() ?? null,
          passwordVersion: updatedRoom.passwordVersion,
          revokedSessionCount: revokedSessions.count,
        },
        previousState: {
          passwordRotatedAt: room.passwordRotatedAt?.toISOString() ?? null,
          passwordVersion: room.passwordVersion,
        },
        reason: input.reason,
        roomId: room.id,
        targetRoomPasswordRotationId: rotation.id,
      },
      select: {
        id: true,
      },
    });

    return {
      auditId: audit.id,
      currentPassword: input.nextPassword,
      revokedSessionCount: revokedSessions.count,
      room: mapRoomRow(updatedRoom),
      rotation: {
        id: rotation.id,
        rotatedAt: rotation.rotatedAt,
      },
    };
  });
};

const mapModerationAuditRow = (row: {
  action: ChatModerationAuditAction;
  actorAdminUserId: string;
  createdAt: Date;
  id: string;
  nextState: unknown | null;
  previousState: unknown | null;
  reason: string | null;
  roomId: string | null;
  targetBanId: string | null;
  targetHandleId: string | null;
  targetMessageId: string | null;
  targetRoomPasswordRotationId: string | null;
  targetSessionId: string | null;
  targetUploadId: string | null;
}): ChatModerationAuditRepositoryRow => ({
  action: row.action,
  actorAdminUserId: row.actorAdminUserId,
  createdAt: row.createdAt,
  id: row.id,
  nextState: row.nextState,
  previousState: row.previousState,
  reason: row.reason,
  roomId: row.roomId,
  targetBanId: row.targetBanId,
  targetHandleId: row.targetHandleId,
  targetMessageId: row.targetMessageId,
  targetRoomPasswordRotationId: row.targetRoomPasswordRotationId,
  targetSessionId: row.targetSessionId,
  targetUploadId: row.targetUploadId,
});

const buildModerationAuditCursorWhere = (
  query: ChatModerationAuditListQuery,
):
  | {
      OR: Array<
        | { createdAt: { lt: Date } }
        | { createdAt: Date; id: { lt: string } }
      >;
    }
  | undefined => {
  if (!query.cursor) {
    return undefined;
  }

  return {
    OR: [
      {
        createdAt: {
          lt: query.cursor.createdAt,
        },
      },
      {
        createdAt: query.cursor.createdAt,
        id: {
          lt: query.cursor.id,
        },
      },
    ],
  };
};

const listModerationAudits = async (
  client: PrismaDatabaseClient,
  query: ChatModerationAuditListQuery,
): Promise<ChatModerationAuditListPage> => {
  const rows = await client.chatModerationAuditRecord.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      action: true,
      actorAdminUserId: true,
      createdAt: true,
      id: true,
      nextState: true,
      previousState: true,
      reason: true,
      roomId: true,
      targetBanId: true,
      targetHandleId: true,
      targetMessageId: true,
      targetRoomPasswordRotationId: true,
      targetSessionId: true,
      targetUploadId: true,
    },
    take: query.limit + 1,
    where: {
      ...buildModerationAuditCursorWhere(query),
      ...(query.action
        ? {
            action: query.action,
          }
        : {}),
      ...(query.roomId
        ? {
            roomId: query.roomId,
          }
        : {}),
      ...(query.actorAdminUserId
        ? {
            actorAdminUserId: query.actorAdminUserId,
          }
        : {}),
    },
  });

  const pageRows = rows.slice(0, query.limit);
  const hasNextPage = rows.length > query.limit;
  const nextCursorRow = pageRows.at(pageRows.length - 1);

  return {
    items: pageRows.map(mapModerationAuditRow),
    nextCursor:
      hasNextPage && nextCursorRow
        ? {
            createdAt: nextCursorRow.createdAt,
            id: nextCursorRow.id,
          }
        : null,
  };
};

const listParticipantsByRoomId = async (
  client: PrismaDatabaseClient,
  roomId: string,
): Promise<readonly ChatRoomParticipantRepositoryRow[]> => {
  const handles = await client.chatHandle.findMany({
    orderBy: {
      normalizedHandle: "asc",
    },
    select: {
      handle: true,
      sessions: {
        select: {
          id: true,
        },
        take: 1,
        where: {
          leftAt: null,
          roomId,
          status: "active",
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
      },
    },
    where: {
      roomId,
      status: "active",
    },
  });

  return handles.map((handle) => ({
    handle: handle.handle,
    status: handle.sessions.length > 0 ? "online" : "idle",
  }));
};

const buildMessageCursorWhere = (
  query: ChatMessageListQuery,
):
  | {
      OR: Array<
        | { sentAt: { lt: Date } }
        | { id: { lt: string }; sentAt: Date }
      >;
    }
  | undefined => {
  if (!query.cursor) {
    return undefined;
  }

  return {
    OR: [
      {
        sentAt: {
          lt: query.cursor.sentAt,
        },
      },
      {
        id: {
          lt: query.cursor.id,
        },
        sentAt: query.cursor.sentAt,
      },
    ],
  };
};

const mapMessageListRow = (row: {
  authorHandle: {
    handle: string;
  };
  body: string;
  id: string;
  sentAt: Date;
  tone: "cyan" | "pink" | "system" | null;
  upload: null | {
    byteSize: number;
    displayFilename: string;
    id: string;
    kind: "image";
    mimeType: ChatUploadMimeType;
    moderationState: "visible" | "hidden" | "deleted";
  };
}): ChatMessageListItemRepositoryRow => ({
  ...(row.upload && row.upload.moderationState === "visible"
    ? {
        attachment: {
          byteSize: row.upload.byteSize,
          fileName: row.upload.displayFilename,
          id: row.upload.id,
          kind: row.upload.kind,
          mimeType: mapUploadMimeTypeFromPrisma(row.upload.mimeType),
        },
      }
    : {}),
  author: row.authorHandle.handle,
  body: row.body,
  id: row.id,
  sentAt: row.sentAt,
  tone: row.tone,
});

const listMessages = async (
  client: PrismaDatabaseClient,
  query: ChatMessageListQuery,
): Promise<ChatMessageListPage> => {
  const rows = await client.chatMessage.findMany({
    orderBy: [{ sentAt: "desc" }, { id: "desc" }],
    select: {
      authorHandle: {
        select: {
          handle: true,
        },
      },
      body: true,
      id: true,
      sentAt: true,
      tone: true,
      upload: {
        select: {
          byteSize: true,
          displayFilename: true,
          id: true,
          kind: true,
          mimeType: true,
          moderationState: true,
        },
      },
    },
    take: query.limit + 1,
    where: {
      ...buildMessageCursorWhere(query),
      moderationState: "visible",
      roomId: query.roomId,
    },
  });

  const pageRows = rows.slice(0, query.limit);
  const hasNextPage = rows.length > query.limit;
  const nextCursorRow = pageRows.at(pageRows.length - 1);

  return {
    items: pageRows.map(mapMessageListRow),
    nextCursor: hasNextPage && nextCursorRow
      ? {
          id: nextCursorRow.id,
          sentAt: nextCursorRow.sentAt,
        }
      : null,
  };
};

export type PrismaChatRepositoryOptions = Readonly<{
  roomPasswordSecret: string;
}>;

export const createPrismaChatRepository = (
  client: PrismaDatabaseClient,
  options: PrismaChatRepositoryOptions = { roomPasswordSecret: "test-room-secret" },
): ChatRepositoryPort => ({
  createHandle: (input): Promise<ChatHandleRepositoryRow> => createHandle(client, input),
  createTextMessage: (input): Promise<ChatMessageRepositoryRow> =>
    createTextMessage(client, input),
  createMessageWithUpload: (input): Promise<CreateChatMessageWithUploadResult> =>
    createMessageWithUpload(client, input),
  createSession: (input): Promise<ChatRoomSessionRepositoryRow> => createSession(client, input),
  banHandle: (input): Promise<BanChatRoomHandleResult | null> => banHandle(client, input),
  moderateMessage: (input): Promise<ModerateChatRoomMessageResult | null> =>
    moderateMessage(client, input),
  moderateUploadRetention: (input): Promise<ModerateChatUploadRetentionResult | null> =>
    moderateUploadRetention(client, input),
  rotateRoomPassword: (input): Promise<RotateChatRoomPasswordResult | null> =>
    rotateRoomPassword(client, input, options.roomPasswordSecret),
  findSessionById: async (sessionId): Promise<ChatRoomSessionRepositoryRow | null> => {
    const session = await client.chatRoomSession.findUnique({
      select: {
        createdAt: true,
        expiresAt: true,
        handleId: true,
        id: true,
        joinedAt: true,
        lastSeenAt: true,
        leftAt: true,
        roomId: true,
        status: true,
        updatedAt: true,
      },
      where: {
        id: sessionId,
      },
    });

    return session ? mapSessionRow(session) : null;
  },
  findRoomAccessBySlug: async (slug): Promise<ChatRoomAccessRepositoryRow | null> => {
    const room = await client.chatRoom.findUnique({
      select: {
        currentPasswordCiphertext: true,
        id: true,
        passwordRotatedAt: true,
        passwordVersion: true,
        slug: true,
      },
      where: {
        slug,
      },
    });

    if (!room) {
      return null;
    }

    return mapRoomAccessRow(room, options.roomPasswordSecret);
  },
  findRoomBySlug: async (query): Promise<ChatRoomRepositoryRow | null> => {
    const room = await client.chatRoom.findUnique({
      select: {
        createdAt: true,
        id: true,
        passwordHash: true,
        passwordRotatedAt: true,
        passwordVersion: true,
        slug: true,
        updatedAt: true,
      },
      where: {
        slug: query.slug,
      },
    });

    return room ? mapRoomRow(room) : null;
  },
  findHandleById: async (handleId): Promise<ChatHandleRepositoryRow | null> => {
    const handle = await client.chatHandle.findUnique({
      select: {
        createdAt: true,
        handle: true,
        id: true,
        normalizedHandle: true,
        roomId: true,
        status: true,
        updatedAt: true,
      },
      where: {
        id: handleId,
      },
    });

    return handle ? mapHandleRow(handle) : null;
  },
  findHandleByRoomIdAndNormalizedHandle: async (
    roomId,
    normalizedHandle,
  ): Promise<ChatHandleRepositoryRow | null> => {
    const handle = await client.chatHandle.findUnique({
      select: {
        createdAt: true,
        handle: true,
        id: true,
        normalizedHandle: true,
        roomId: true,
        status: true,
        updatedAt: true,
      },
      where: {
        roomId_normalizedHandle: {
          normalizedHandle,
          roomId,
        },
      },
    });

    return handle ? mapHandleRow(handle) : null;
  },
  listParticipantsByRoomId: (roomId): Promise<readonly ChatRoomParticipantRepositoryRow[]> =>
    listParticipantsByRoomId(client, roomId),
  listMessages: (query: ChatMessageListQuery): Promise<ChatMessageListPage> =>
    listMessages(client, query),
  listModerationAudits: (query: ChatModerationAuditListQuery): Promise<ChatModerationAuditListPage> =>
    listModerationAudits(client, query),
  findUploadById: (_uploadId: string): Promise<ChatUploadRepositoryRow | null> =>
    notImplemented("findUploadById"),
});
