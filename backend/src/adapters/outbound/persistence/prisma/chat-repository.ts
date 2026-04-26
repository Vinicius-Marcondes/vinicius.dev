import type {
  CreateChatMessageWithUploadCommand,
  CreateChatMessageWithUploadResult,
  ChatHandleRepositoryRow,
  ChatMessageListQuery,
  ChatMessageRepositoryRow,
  ChatRepositoryPort,
  ChatRoomRepositoryRow,
  ChatRoomSessionRepositoryRow,
  ChatUploadRepositoryRow,
  ModerateChatUploadRetentionCommand,
  ModerateChatUploadRetentionResult,
} from "@/modules/chat/ports/outbound";
import { ChatUploadMimeType } from "../../../../../generated/prisma/client";

import type { PrismaDatabaseClient } from "./prisma-client";

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

export const createPrismaChatRepository = (client: PrismaDatabaseClient): ChatRepositoryPort => ({
  createMessageWithUpload: (input): Promise<CreateChatMessageWithUploadResult> =>
    createMessageWithUpload(client, input),
  moderateUploadRetention: (input): Promise<ModerateChatUploadRetentionResult | null> =>
    moderateUploadRetention(client, input),
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
  findRoomBySlug: (_query): Promise<ChatRoomRepositoryRow | null> => notImplemented("findRoomBySlug"),
  findHandleByRoomIdAndNormalizedHandle: (_roomId, _normalizedHandle): Promise<ChatHandleRepositoryRow | null> =>
    notImplemented("findHandleByRoomIdAndNormalizedHandle"),
  listMessages: (_query: ChatMessageListQuery): Promise<readonly ChatMessageRepositoryRow[]> =>
    notImplemented("listMessages"),
  findUploadById: (_uploadId: string): Promise<ChatUploadRepositoryRow | null> =>
    notImplemented("findUploadById"),
});
