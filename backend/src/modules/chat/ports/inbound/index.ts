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
