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
    handleId: string;
    id: string;
    joinedAt: string;
    roomId: string;
    status: "active" | "revoked" | "expired";
  }>;
}>;

export interface JoinChatRoomSessionPort
  extends UseCase<JoinChatRoomSessionInput, JoinChatRoomSessionOutput> {}

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

export type UploadChatMessageImageInput = Readonly<{
  body: Uint8Array;
  displayFilename: string;
  mimeType: ChatUploadMimeType;
}>;

export type UploadChatMessageWithImageInput = Readonly<{
  authorHandleId: string;
  body?: string;
  image: UploadChatMessageImageInput;
  roomId: string;
  roomSessionId: string;
  tone?: "cyan" | "pink" | "system" | null;
}>;

export type UploadChatMessageWithImageOutput = Readonly<{
  attachment: ChatMessageAttachmentOutput;
  authorHandleId: string;
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
