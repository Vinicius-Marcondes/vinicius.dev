import type {
  ChatUploadStoragePort,
  MediaRepositoryPort,
} from "@/modules/media/ports/outbound";
import type { ChatRepositoryPort } from "@/modules/chat/ports/outbound";
import type {
  ChatUploadMimeType,
  ModerateChatUploadRetentionInput,
  ModerateChatUploadRetentionOutput,
  ModerateChatUploadRetentionPort,
  OpenChatUploadMediaInput,
  OpenChatUploadMediaOutput,
  OpenChatUploadMediaPort,
  UploadChatMessageWithImageInput,
  UploadChatMessageWithImageOutput,
  UploadChatMessageWithImagePort,
} from "@/modules/chat/ports/inbound";
import type { ModerateChatUploadRetentionAction } from "@/modules/chat/ports/outbound";

const IMAGE_ONLY_FALLBACK_BODY = "uploaded an image without a caption";

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

export type ChatApplicationDependencies = Readonly<{
  clock?: () => Date;
  createId?: () => string;
  repository: Pick<ChatRepositoryPort, "createMessageWithUpload" | "findSessionById">;
  storage: ChatUploadStoragePort;
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
