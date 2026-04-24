import type { UseCase } from "@/modules/shared/application/use-case";

export type ChatUploadMimeType = "image/jpeg" | "image/png" | "image/webp";

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

export type UploadChatMessageAttachment = Readonly<{
  byteSize: number;
  fileName: string;
  id: string;
  kind: "image";
  mimeType: ChatUploadMimeType;
}>;

export type UploadChatMessageWithImageOutput = Readonly<{
  attachment: UploadChatMessageAttachment;
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
