import type { UseCase } from "@/modules/shared/application/use-case";

export type ChatUploadMimeType = "image/jpeg" | "image/png" | "image/webp";

export type JoinChatRoomSessionInput = Readonly<{
  handle: string;
  password: string;
  slug: string;
}>;

export type JoinChatRoomSessionOutput = Readonly<{
  participant: Readonly<{
    handle: string;
    id: string;
    status: "online";
  }>;
  room: Readonly<{
    id: string;
    slug: string;
  }>;
  session: Readonly<{
    expiresAt: string | null;
    handleId: string;
    id: string;
    joinedAt: string;
    roomId: string;
    status: "active" | "revoked" | "expired";
  }>;
}>;

export interface JoinChatRoomSessionPort
  extends UseCase<JoinChatRoomSessionInput, JoinChatRoomSessionOutput> {}

export type ResolveChatRoomSessionInput = Readonly<{
  roomSessionId: string;
  slug: string;
}>;

export type ResolveChatRoomSessionOutput = JoinChatRoomSessionOutput;

export interface ResolveChatRoomSessionPort
  extends UseCase<ResolveChatRoomSessionInput, ResolveChatRoomSessionOutput> {}

export type ListChatRoomParticipantsInput = Readonly<{
  roomSessionId: string;
  slug: string;
}>;

export type ChatRoomParticipantOutput = Readonly<{
  handle: string;
  status: "online" | "idle";
}>;

export type ListChatRoomParticipantsOutput = Readonly<{
  items: readonly ChatRoomParticipantOutput[];
}>;

export interface ListChatRoomParticipantsPort
  extends UseCase<ListChatRoomParticipantsInput, ListChatRoomParticipantsOutput> {}

export type ListChatRoomMessagesInput = Readonly<{
  cursor?: string;
  limit?: number;
  roomSessionId: string;
  slug: string;
}>;

export type ChatMessageAttachmentOutput = Readonly<{
  byteSize: number;
  fileName: string;
  id: string;
  kind: "image";
  mimeType: ChatUploadMimeType;
}>;

export type ChatRoomMessageOutput = Readonly<{
  attachment?: ChatMessageAttachmentOutput;
  author: string;
  body: string;
  id: string;
  sentAt: string;
  tone?: "cyan" | "pink" | "system";
}>;

export type ListChatRoomMessagesOutput = Readonly<{
  items: readonly ChatRoomMessageOutput[];
  pageInfo: Readonly<{
    nextCursor: string | null;
  }>;
}>;

export interface ListChatRoomMessagesPort
  extends UseCase<ListChatRoomMessagesInput, ListChatRoomMessagesOutput> {}

export type ListChatModerationAuditsInput = Readonly<{
  action?: "delete_message" | "hide_media_metadata" | "ban_handle" | "room_password_rotation";
  actorAdminUserId?: string;
  cursor?: string;
  limit?: number;
  roomId?: string;
}>;

export type ChatModerationAuditOutput = Readonly<{
  action: "delete_message" | "hide_media_metadata" | "ban_handle" | "room_password_rotation";
  actorAdminUserId: string;
  createdAt: string;
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
}>;

export type ListChatModerationAuditsOutput = Readonly<{
  items: readonly ChatModerationAuditOutput[];
  pageInfo: Readonly<{
    nextCursor: string | null;
  }>;
}>;

export interface ListChatModerationAuditsPort
  extends UseCase<ListChatModerationAuditsInput, ListChatModerationAuditsOutput> {}

export type SendChatRoomTextMessageInput = Readonly<{
  body: string;
  roomSessionId: string;
  slug: string;
  tone?: "cyan" | "pink" | "system";
}>;

export type SendChatRoomTextMessageOutput = ChatRoomMessageOutput;

export interface SendChatRoomTextMessagePort
  extends UseCase<SendChatRoomTextMessageInput, SendChatRoomTextMessageOutput> {}

export type ModerateChatRoomMessageInput = Readonly<{
  action: "hide_message" | "delete_message";
  actorAdminUserId: string;
  messageId: string;
  reason?: string;
}>;

export type ModerateChatRoomMessageOutput = Readonly<{
  action: "hide_message" | "delete_message";
  auditId: string;
  messageId: string;
  messageModerationState: "hidden" | "deleted";
  uploadId: string | null;
  uploadModerationState: "hidden" | "deleted" | null;
}>;

export interface ModerateChatRoomMessagePort
  extends UseCase<ModerateChatRoomMessageInput, ModerateChatRoomMessageOutput | null> {}

export type BanChatRoomHandleInput = Readonly<{
  actorAdminUserId: string;
  handleId: string;
  reason?: string;
}>;

export type BanChatRoomHandleOutput = Readonly<{
  auditId: string;
  banId: string;
  handleId: string;
  revokedSessionCount: number;
  roomId: string;
  status: "banned";
}>;

export interface BanChatRoomHandlePort
  extends UseCase<BanChatRoomHandleInput, BanChatRoomHandleOutput | null> {}

export type GetChatRoomAccessInput = Readonly<{
  slug: string;
}>;

export type GetChatRoomAccessOutput = Readonly<{
  currentPassword: string;
  room: Readonly<{
    id: string;
    passwordRotatedAt: string | null;
    passwordVersion: number;
    sessionTtlHours: number;
    slug: string;
  }>;
}>;

export interface GetChatRoomAccessPort
  extends UseCase<GetChatRoomAccessInput, GetChatRoomAccessOutput | null> {}

export type RotateChatRoomPasswordInput = Readonly<{
  actorAdminUserId: string;
  reason?: string;
  slug: string;
}>;

export type RotateChatRoomPasswordOutput = Readonly<{
  auditId: string;
  generatedPassword: string;
  revokedSessionCount: number;
  room: Readonly<{
    id: string;
    passwordVersion: number;
    passwordRotatedAt: string | null;
    sessionTtlHours: number;
    slug: string;
  }>;
  rotation: Readonly<{
    id: string;
    rotatedAt: string;
  }>;
}>;

export interface RotateChatRoomPasswordPort
  extends UseCase<RotateChatRoomPasswordInput, RotateChatRoomPasswordOutput | null> {}

export type UploadChatMessageImageInput = Readonly<{
  body: Uint8Array;
  displayFilename: string;
  mimeType: ChatUploadMimeType;
}>;

export type UploadChatMessageWithImageInput = Readonly<{
  body?: string;
  image: UploadChatMessageImageInput;
  roomSessionId: string;
  tone?: "cyan" | "pink" | "system" | null;
}>;

export type UploadChatMessageWithImageOutput = Readonly<{
  attachment: ChatMessageAttachmentOutput;
  author: string;
  body: string;
  id: string;
  sentAt: string;
  tone: "cyan" | "pink" | "system" | null;
}>;

export interface UploadChatMessageWithImagePort
  extends UseCase<UploadChatMessageWithImageInput, UploadChatMessageWithImageOutput> {}

export type OpenChatUploadMediaInput = Readonly<{
  roomSessionId: string;
  uploadId: string;
}>;

export type OpenChatUploadMediaOutput = Readonly<{
  byteSize: number;
  mimeType: ChatUploadMimeType;
  stream: ReadableStream<Uint8Array>;
}>;

export interface OpenChatUploadMediaPort
  extends UseCase<OpenChatUploadMediaInput, OpenChatUploadMediaOutput | null> {}

export type ModerateChatUploadRetentionInput = Readonly<{
  action: "hide_media_metadata" | "delete_message";
  actorAdminUserId: string;
  reason?: string;
  uploadId: string;
}>;

export type ModerateChatUploadRetentionOutput = Readonly<{
  action: "hide_media_metadata" | "delete_message";
  auditId: string;
  messageId: string | null;
  messageModerationState: "visible" | "hidden" | "deleted" | null;
  uploadId: string;
  uploadModerationState: "visible" | "hidden" | "deleted";
}>;

export interface ModerateChatUploadRetentionPort
  extends UseCase<ModerateChatUploadRetentionInput, ModerateChatUploadRetentionOutput | null> {}
