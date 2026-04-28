import type {
  ChatUploadStoragePort,
  MediaRepositoryPort,
} from "@/modules/media/ports/outbound";
import type { ChatRepositoryPort } from "@/modules/chat/ports/outbound";
import type {
  BanChatRoomHandleInput,
  BanChatRoomHandleOutput,
  BanChatRoomHandlePort,
  ChatUploadMimeType,
  ChatRoomMessageOutput,
  JoinChatRoomSessionInput,
  JoinChatRoomSessionOutput,
  JoinChatRoomSessionPort,
  ListChatModerationAuditsInput,
  ListChatModerationAuditsOutput,
  ListChatModerationAuditsPort,
  ListChatRoomMessagesInput,
  ListChatRoomMessagesOutput,
  ListChatRoomMessagesPort,
  ListChatRoomParticipantsInput,
  ListChatRoomParticipantsOutput,
  ListChatRoomParticipantsPort,
  ModerateChatRoomMessageInput,
  ModerateChatRoomMessageOutput,
  ModerateChatRoomMessagePort,
  ModerateChatUploadRetentionInput,
  ModerateChatUploadRetentionOutput,
  ModerateChatUploadRetentionPort,
  OpenChatUploadMediaInput,
  OpenChatUploadMediaOutput,
  OpenChatUploadMediaPort,
  RotateChatRoomPasswordInput,
  RotateChatRoomPasswordOutput,
  RotateChatRoomPasswordPort,
  SendChatRoomTextMessageInput,
  SendChatRoomTextMessageOutput,
  SendChatRoomTextMessagePort,
  UploadChatMessageWithImageInput,
  UploadChatMessageWithImageOutput,
  UploadChatMessageWithImagePort,
} from "@/modules/chat/ports/inbound";
import type {
  ChatModerationAuditAction,
  ModerateChatRoomMessageAction,
  ModerateChatUploadRetentionAction,
} from "@/modules/chat/ports/outbound";

const IMAGE_ONLY_FALLBACK_BODY = "uploaded an image without a caption";

export class InvalidChatRoomCredentialsError extends Error {
  constructor() {
    super("chat room credentials are invalid");
    this.name = "InvalidChatRoomCredentialsError";
  }
}

export class BannedChatHandleError extends Error {
  constructor() {
    super("chat handle is banned");
    this.name = "BannedChatHandleError";
  }
}

export class InvalidChatUploadActorError extends Error {
  constructor() {
    super("chat upload actor/session does not match the requested room");
    this.name = "InvalidChatUploadActorError";
  }
}

export class InvalidChatUploadAccessError extends Error {
  constructor() {
    super("chat upload access requires an active room session");
    this.name = "InvalidChatUploadAccessError";
  }
}

export class InvalidChatParticipantAccessError extends Error {
  constructor() {
    super("chat participants access requires an active room session bound to the room");
    this.name = "InvalidChatParticipantAccessError";
  }
}

export class InvalidChatMessageAccessError extends Error {
  constructor() {
    super("chat message access requires an active room session bound to the room");
    this.name = "InvalidChatMessageAccessError";
  }
}

export class InvalidChatMessageCursorError extends Error {
  constructor() {
    super("chat message cursor is invalid");
    this.name = "InvalidChatMessageCursorError";
  }
}

export class InvalidChatModerationAuditCursorError extends Error {
  constructor() {
    super("chat moderation audit cursor is invalid");
    this.name = "InvalidChatModerationAuditCursorError";
  }
}

const MIME_EXTENSION_BY_TYPE: Record<ChatUploadMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const normalizeBody = (value?: string): string => {
  const trimmed = value?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : IMAGE_ONLY_FALLBACK_BODY;
};

const sanitizeStorageSegment = (value: string): string => {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/_+/g, "_");

  return sanitized.length > 0 ? sanitized : "room";
};

const buildStorageKey = (roomId: string, uploadId: string, mimeType: ChatUploadMimeType): string => {
  return `${sanitizeStorageSegment(roomId)}/${uploadId}.${MIME_EXTENSION_BY_TYPE[mimeType]}`;
};

const collapseWhitespace = (value: string): string => value.trim().replace(/\s+/g, " ");

const normalizeHandle = (value: string): string => collapseWhitespace(value).toLowerCase();

const DEFAULT_CHAT_MESSAGES_PAGE_SIZE = 30;
const MAX_CHAT_MESSAGES_PAGE_SIZE = 80;
const DEFAULT_CHAT_MODERATION_AUDITS_PAGE_SIZE = 30;
const MAX_CHAT_MODERATION_AUDITS_PAGE_SIZE = 80;

const defaultSessionToken = (): string => crypto.randomUUID();

const hashToken = async (token: string): Promise<string> => {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
};

const hashPassword = async (plainText: string): Promise<string> => {
  return Bun.password.hash(plainText);
};

export type ChatApplicationDependencies = Readonly<{
  clock?: () => Date;
  createId?: () => string;
  repository: Pick<ChatRepositoryPort, "createMessageWithUpload" | "findSessionById">;
  storage: ChatUploadStoragePort;
}>;

export type JoinChatRoomSessionDependencies = Readonly<{
  clock?: () => Date;
  createSessionToken?: () => string;
  hashSessionToken?: (token: string) => Promise<string>;
  repository: Pick<
    ChatRepositoryPort,
    | "createHandle"
    | "createSession"
    | "findHandleByRoomIdAndNormalizedHandle"
    | "findRoomBySlug"
  >;
  verifyRoomPassword?: (input: Readonly<{ passwordHash: string; plainText: string }>) => Promise<boolean>;
}>;

export type ListChatRoomParticipantsDependencies = Readonly<{
  repository: Pick<
    ChatRepositoryPort,
    "findRoomBySlug" | "findSessionById" | "listParticipantsByRoomId"
  >;
}>;

export type ListChatRoomMessagesDependencies = Readonly<{
  repository: Pick<ChatRepositoryPort, "findRoomBySlug" | "findSessionById" | "listMessages">;
}>;

export type ListChatModerationAuditsDependencies = Readonly<{
  repository: Pick<ChatRepositoryPort, "listModerationAudits">;
}>;

export type SendChatRoomTextMessageDependencies = Readonly<{
  clock?: () => Date;
  repository: Pick<
    ChatRepositoryPort,
    "createTextMessage" | "findHandleById" | "findRoomBySlug" | "findSessionById"
  >;
}>;

export type ChatUploadMediaAccessDependencies = Readonly<{
  repository: Pick<ChatRepositoryPort, "findSessionById">;
  mediaRepository: Pick<MediaRepositoryPort, "findChatUploadMediaById">;
  storage: Pick<ChatUploadStoragePort, "openUpload">;
}>;

export type ChatUploadRetentionDependencies = Readonly<{
  clock?: () => Date;
  repository: Pick<ChatRepositoryPort, "moderateUploadRetention">;
}>;

export type ModerateChatRoomMessageDependencies = Readonly<{
  clock?: () => Date;
  repository: Pick<ChatRepositoryPort, "moderateMessage">;
}>;

export type BanChatRoomHandleDependencies = Readonly<{
  clock?: () => Date;
  repository: Pick<ChatRepositoryPort, "banHandle">;
}>;

export type RotateChatRoomPasswordDependencies = Readonly<{
  clock?: () => Date;
  hashRoomPassword?: (plainText: string) => Promise<string>;
  repository: Pick<ChatRepositoryPort, "rotateRoomPassword">;
}>;

const normalizeListMessagesLimit = (inputLimit: number | undefined): number => {
  if (typeof inputLimit !== "number" || Number.isNaN(inputLimit)) {
    return DEFAULT_CHAT_MESSAGES_PAGE_SIZE;
  }

  return Math.min(Math.max(Math.trunc(inputLimit), 1), MAX_CHAT_MESSAGES_PAGE_SIZE);
};

const normalizeListModerationAuditsLimit = (inputLimit: number | undefined): number => {
  if (typeof inputLimit !== "number" || Number.isNaN(inputLimit)) {
    return DEFAULT_CHAT_MODERATION_AUDITS_PAGE_SIZE;
  }

  return Math.min(
    Math.max(Math.trunc(inputLimit), 1),
    MAX_CHAT_MODERATION_AUDITS_PAGE_SIZE,
  );
};

const encodeChatMessageCursor = (cursor: Readonly<{ id: string; sentAt: Date }>): string => {
  return Buffer.from(
    JSON.stringify({
      id: cursor.id,
      sentAt: cursor.sentAt.toISOString(),
    }),
    "utf8",
  ).toString("base64url");
};

const decodeChatMessageCursor = (input: string): Readonly<{ id: string; sentAt: Date }> => {
  try {
    const parsed = JSON.parse(Buffer.from(input, "base64url").toString("utf8")) as {
      id?: unknown;
      sentAt?: unknown;
    };

    if (typeof parsed.id !== "string" || typeof parsed.sentAt !== "string") {
      throw new InvalidChatMessageCursorError();
    }

    const sentAt = new Date(parsed.sentAt);

    if (Number.isNaN(sentAt.getTime())) {
      throw new InvalidChatMessageCursorError();
    }

    return {
      id: parsed.id,
      sentAt,
    };
  } catch (_error) {
    throw new InvalidChatMessageCursorError();
  }
};

const encodeChatModerationAuditCursor = (cursor: Readonly<{ createdAt: Date; id: string }>): string => {
  return Buffer.from(
    JSON.stringify({
      createdAt: cursor.createdAt.toISOString(),
      id: cursor.id,
    }),
    "utf8",
  ).toString("base64url");
};

const decodeChatModerationAuditCursor = (
  input: string,
): Readonly<{ createdAt: Date; id: string }> => {
  try {
    const parsed = JSON.parse(Buffer.from(input, "base64url").toString("utf8")) as {
      createdAt?: unknown;
      id?: unknown;
    };

    if (typeof parsed.createdAt !== "string" || typeof parsed.id !== "string") {
      throw new InvalidChatModerationAuditCursorError();
    }

    const createdAt = new Date(parsed.createdAt);

    if (Number.isNaN(createdAt.getTime())) {
      throw new InvalidChatModerationAuditCursorError();
    }

    return {
      createdAt,
      id: parsed.id,
    };
  } catch (_error) {
    throw new InvalidChatModerationAuditCursorError();
  }
};

const normalizeChatModerationAuditAction = (
  value: ListChatModerationAuditsInput["action"],
): ChatModerationAuditAction | undefined => value;

const normalizeOptionalFilter = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();

  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

const mapChatMessageOutput = (input: Readonly<{
  attachment?: Readonly<{
    byteSize: number;
    fileName: string;
    id: string;
    kind: "image";
    mimeType: ChatUploadMimeType;
  }>;
  author: string;
  body: string;
  id: string;
  sentAt: Date;
  tone: "cyan" | "pink" | "system" | null;
}>): ChatRoomMessageOutput => ({
  ...(input.attachment
    ? {
        attachment: input.attachment,
      }
    : {}),
  ...(input.tone
    ? {
        tone: input.tone,
      }
    : {}),
  author: input.author,
  body: input.body,
  id: input.id,
  sentAt: input.sentAt.toISOString(),
});

const mapChatModerationAuditOutput = (input: Readonly<{
  action: "delete_message" | "hide_media_metadata" | "ban_handle" | "room_password_rotation";
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
}>) => ({
  action: input.action,
  actorAdminUserId: input.actorAdminUserId,
  createdAt: input.createdAt.toISOString(),
  id: input.id,
  nextState: input.nextState,
  previousState: input.previousState,
  reason: input.reason,
  roomId: input.roomId,
  targetBanId: input.targetBanId,
  targetHandleId: input.targetHandleId,
  targetMessageId: input.targetMessageId,
  targetRoomPasswordRotationId: input.targetRoomPasswordRotationId,
  targetSessionId: input.targetSessionId,
  targetUploadId: input.targetUploadId,
});

export const createJoinChatRoomSessionUseCase = ({
  clock = () => new Date(),
  createSessionToken = defaultSessionToken,
  hashSessionToken = hashToken,
  repository,
  verifyRoomPassword = async ({ passwordHash, plainText }) => {
    try {
      return await Bun.password.verify(plainText, passwordHash);
    } catch (_error) {
      return false;
    }
  },
}: JoinChatRoomSessionDependencies): JoinChatRoomSessionPort => ({
  execute: async (
    input: JoinChatRoomSessionInput,
  ): Promise<JoinChatRoomSessionOutput> => {
    const room = await repository.findRoomBySlug({
      slug: input.slug.trim(),
    });

    if (!room) {
      throw new InvalidChatRoomCredentialsError();
    }

    const validPassword = await verifyRoomPassword({
      passwordHash: room.passwordHash,
      plainText: input.password,
    });

    if (!validPassword) {
      throw new InvalidChatRoomCredentialsError();
    }

    const normalizedHandle = normalizeHandle(input.handle);
    let participant = await repository.findHandleByRoomIdAndNormalizedHandle(
      room.id,
      normalizedHandle,
    );

    if (participant?.status === "banned") {
      throw new BannedChatHandleError();
    }

    if (!participant) {
      participant = await repository.createHandle({
        handle: collapseWhitespace(input.handle),
        normalizedHandle,
        roomId: room.id,
        status: "active",
      });
    }

    const joinedAt = clock();
    const session = await repository.createSession({
      expiresAt: null,
      handleId: participant.id,
      joinedAt,
      lastSeenAt: joinedAt,
      leftAt: null,
      roomId: room.id,
      sessionTokenHash: await hashSessionToken(createSessionToken()),
      status: "active",
    });

    return {
      participant: {
        handle: participant.handle,
        id: participant.id,
        status: "online",
      },
      room: {
        id: room.id,
        slug: room.slug,
      },
      session: {
        handleId: session.handleId,
        id: session.id,
        joinedAt: session.joinedAt.toISOString(),
        roomId: session.roomId,
        status: session.status,
      },
    };
  },
});

export const createListChatRoomParticipantsUseCase = ({
  repository,
}: ListChatRoomParticipantsDependencies): ListChatRoomParticipantsPort => ({
  execute: async (
    input: ListChatRoomParticipantsInput,
  ): Promise<ListChatRoomParticipantsOutput> => {
    const room = await repository.findRoomBySlug({
      slug: input.slug.trim(),
    });

    if (!room) {
      throw new InvalidChatParticipantAccessError();
    }

    const session = await repository.findSessionById(input.roomSessionId);

    if (!session || session.status !== "active" || session.roomId !== room.id) {
      throw new InvalidChatParticipantAccessError();
    }

    const items = await repository.listParticipantsByRoomId(room.id);

    return {
      items,
    };
  },
});

export const createListChatRoomMessagesUseCase = ({
  repository,
}: ListChatRoomMessagesDependencies): ListChatRoomMessagesPort => ({
  execute: async (
    input: ListChatRoomMessagesInput,
  ): Promise<ListChatRoomMessagesOutput> => {
    const room = await repository.findRoomBySlug({
      slug: input.slug.trim(),
    });

    if (!room) {
      throw new InvalidChatMessageAccessError();
    }

    const session = await repository.findSessionById(input.roomSessionId);

    if (!session || session.status !== "active" || session.roomId !== room.id) {
      throw new InvalidChatMessageAccessError();
    }

    const page = await repository.listMessages({
      cursor: input.cursor ? decodeChatMessageCursor(input.cursor) : undefined,
      limit: normalizeListMessagesLimit(input.limit),
      roomId: room.id,
    });

    return {
      items: page.items.map((item) => mapChatMessageOutput(item)),
      pageInfo: {
        nextCursor: page.nextCursor ? encodeChatMessageCursor(page.nextCursor) : null,
      },
    };
  },
});

export const createListChatModerationAuditsUseCase = ({
  repository,
}: ListChatModerationAuditsDependencies): ListChatModerationAuditsPort => ({
  execute: async (
    input: ListChatModerationAuditsInput,
  ): Promise<ListChatModerationAuditsOutput> => {
    const page = await repository.listModerationAudits({
      action: normalizeChatModerationAuditAction(input.action),
      actorAdminUserId: normalizeOptionalFilter(input.actorAdminUserId),
      cursor: input.cursor ? decodeChatModerationAuditCursor(input.cursor) : undefined,
      limit: normalizeListModerationAuditsLimit(input.limit),
      roomId: normalizeOptionalFilter(input.roomId),
    });

    return {
      items: page.items.map((item) => mapChatModerationAuditOutput(item)),
      pageInfo: {
        nextCursor: page.nextCursor
          ? encodeChatModerationAuditCursor(page.nextCursor)
          : null,
      },
    };
  },
});

export const createSendChatRoomTextMessageUseCase = ({
  clock = () => new Date(),
  repository,
}: SendChatRoomTextMessageDependencies): SendChatRoomTextMessagePort => ({
  execute: async (
    input: SendChatRoomTextMessageInput,
  ): Promise<SendChatRoomTextMessageOutput> => {
    const room = await repository.findRoomBySlug({
      slug: input.slug.trim(),
    });

    if (!room) {
      throw new InvalidChatMessageAccessError();
    }

    const session = await repository.findSessionById(input.roomSessionId);

    if (!session || session.status !== "active" || session.roomId !== room.id) {
      throw new InvalidChatMessageAccessError();
    }

    const authorHandle = await repository.findHandleById(session.handleId);

    if (
      !authorHandle ||
      authorHandle.status !== "active" ||
      authorHandle.roomId !== room.id
    ) {
      throw new InvalidChatMessageAccessError();
    }

    const message = await repository.createTextMessage({
      authorHandleId: authorHandle.id,
      body: collapseWhitespace(input.body),
      roomId: room.id,
      roomSessionId: session.id,
      sentAt: clock(),
      tone: input.tone ?? null,
    });

    return mapChatMessageOutput({
      author: authorHandle.handle,
      body: message.body,
      id: message.id,
      sentAt: message.sentAt,
      tone: message.tone,
    });
  },
});

const normalizeMessageModerationAction = (
  value: ModerateChatRoomMessageInput["action"],
): ModerateChatRoomMessageAction => value;

export const createModerateChatRoomMessageUseCase = ({
  clock = () => new Date(),
  repository,
}: ModerateChatRoomMessageDependencies): ModerateChatRoomMessagePort => ({
  execute: async (
    input: ModerateChatRoomMessageInput,
  ): Promise<ModerateChatRoomMessageOutput | null> => {
    const result = await repository.moderateMessage({
      action: normalizeMessageModerationAction(input.action),
      actorAdminUserId: input.actorAdminUserId.trim(),
      messageId: input.messageId,
      occurredAt: clock(),
      reason: input.reason?.trim() || undefined,
    });

    if (!result) {
      return null;
    }

    const uploadModerationState =
      result.upload?.moderationState === "hidden" || result.upload?.moderationState === "deleted"
        ? result.upload.moderationState
        : null;

    return {
      action: input.action,
      auditId: result.auditId,
      messageId: result.message.id,
      messageModerationState:
        result.message.moderationState === "deleted" ? "deleted" : "hidden",
      uploadId: result.upload?.id ?? null,
      uploadModerationState,
    };
  },
});

export const createBanChatRoomHandleUseCase = ({
  clock = () => new Date(),
  repository,
}: BanChatRoomHandleDependencies): BanChatRoomHandlePort => ({
  execute: async (
    input: BanChatRoomHandleInput,
  ): Promise<BanChatRoomHandleOutput | null> => {
    const result = await repository.banHandle({
      actorAdminUserId: input.actorAdminUserId.trim(),
      handleId: input.handleId,
      occurredAt: clock(),
      reason: input.reason?.trim() || undefined,
    });

    if (!result) {
      return null;
    }

    return {
      auditId: result.auditId,
      banId: result.banId,
      handleId: result.handle.id,
      revokedSessionCount: result.revokedSessionCount,
      roomId: result.handle.roomId,
      status: "banned",
    };
  },
});

export const createRotateChatRoomPasswordUseCase = ({
  clock = () => new Date(),
  hashRoomPassword = hashPassword,
  repository,
}: RotateChatRoomPasswordDependencies): RotateChatRoomPasswordPort => ({
  execute: async (
    input: RotateChatRoomPasswordInput,
  ): Promise<RotateChatRoomPasswordOutput | null> => {
    const result = await repository.rotateRoomPassword({
      actorAdminUserId: input.actorAdminUserId.trim(),
      nextPasswordHash: await hashRoomPassword(input.nextPassword),
      occurredAt: clock(),
      reason: input.reason?.trim() || undefined,
      slug: input.slug.trim(),
    });

    if (!result) {
      return null;
    }

    return {
      auditId: result.auditId,
      revokedSessionCount: result.revokedSessionCount,
      room: {
        id: result.room.id,
        passwordRotatedAt: result.room.passwordRotatedAt?.toISOString() ?? null,
        passwordVersion: result.room.passwordVersion,
        slug: result.room.slug,
      },
      rotation: {
        id: result.rotation.id,
        rotatedAt: result.rotation.rotatedAt.toISOString(),
      },
    };
  },
});

export const createUploadChatMessageWithImageUseCase = ({
  clock = () => new Date(),
  createId = () => crypto.randomUUID(),
  repository,
  storage,
}: ChatApplicationDependencies): UploadChatMessageWithImagePort => ({
  execute: async (
    input: UploadChatMessageWithImageInput,
  ): Promise<UploadChatMessageWithImageOutput> => {
    const session = await repository.findSessionById(input.roomSessionId);

    if (
      !session ||
      session.status !== "active" ||
      session.roomId !== input.roomId ||
      session.handleId !== input.authorHandleId
    ) {
      throw new InvalidChatUploadActorError();
    }

    const messageId = createId();
    const uploadId = createId();
    const sentAt = clock();
    const storageKey = buildStorageKey(input.roomId, uploadId, input.image.mimeType);

    const persistedBody = normalizeBody(input.body);
    const writtenUpload = await storage.writeUpload({
      body: input.image.body,
      storageKey,
    });

    try {
      const created = await repository.createMessageWithUpload({
        authorHandleId: input.authorHandleId,
        body: persistedBody,
        byteSize: writtenUpload.byteSize,
        displayFilename: input.image.displayFilename,
        messageId,
        mimeType: input.image.mimeType,
        roomId: input.roomId,
        roomSessionId: input.roomSessionId,
        sentAt,
        storageKey: writtenUpload.storageKey,
        storagePath: writtenUpload.storagePath,
        tone: input.tone ?? null,
        uploadId,
      });

      return {
        attachment: {
          byteSize: created.upload.byteSize,
          fileName: created.upload.displayFilename,
          id: created.upload.id,
          kind: "image",
          mimeType: created.upload.mimeType,
        },
        authorHandleId: created.message.authorHandleId,
        body: created.message.body,
        id: created.message.id,
        sentAt: created.message.sentAt.toISOString(),
        tone: created.message.tone,
      };
    } catch (error) {
      await storage.deleteUpload(writtenUpload.storagePath).catch(() => undefined);
      throw error;
    }
  },
});

export const createOpenChatUploadMediaUseCase = ({
  mediaRepository,
  repository,
  storage,
}: ChatUploadMediaAccessDependencies): OpenChatUploadMediaPort => ({
  execute: async (
    input: OpenChatUploadMediaInput,
  ): Promise<OpenChatUploadMediaOutput | null> => {
    const session = await repository.findSessionById(input.roomSessionId);

    if (!session || session.status !== "active") {
      throw new InvalidChatUploadAccessError();
    }

    const upload = await mediaRepository.findChatUploadMediaById(input.uploadId);

    if (
      !upload ||
      upload.roomId !== session.roomId ||
      upload.moderationState !== "visible"
    ) {
      return null;
    }

    const storedObject = await storage.openUpload(upload.storagePath);

    if (!storedObject) {
      return null;
    }

    return {
      byteSize: storedObject.byteSize,
      mimeType: upload.mimeType,
      stream: storedObject.stream,
    };
  },
});

const normalizeRetentionAction = (
  value: ModerateChatUploadRetentionInput["action"],
): ModerateChatUploadRetentionAction => value;

export const createModerateChatUploadRetentionUseCase = ({
  clock = () => new Date(),
  repository,
}: ChatUploadRetentionDependencies): ModerateChatUploadRetentionPort => ({
  execute: async (
    input: ModerateChatUploadRetentionInput,
  ): Promise<ModerateChatUploadRetentionOutput | null> => {
    const result = await repository.moderateUploadRetention({
      action: normalizeRetentionAction(input.action),
      actorAdminUserId: input.actorAdminUserId.trim(),
      occurredAt: clock(),
      reason: input.reason?.trim() || undefined,
      uploadId: input.uploadId,
    });

    if (!result) {
      return null;
    }

    return {
      action: input.action,
      auditId: result.auditId,
      messageId: result.message?.id ?? null,
      messageModerationState: result.message?.moderationState ?? null,
      uploadId: result.upload.id,
      uploadModerationState: result.upload.moderationState,
    };
  },
});
