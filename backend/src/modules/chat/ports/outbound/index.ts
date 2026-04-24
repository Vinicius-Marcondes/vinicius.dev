export type ChatRoomRepositoryRow = Readonly<{
  id: string;
  slug: string;
  passwordVersion: number;
  passwordRotatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ChatHandleRepositoryRow = Readonly<{
  id: string;
  roomId: string;
  handle: string;
  normalizedHandle: string;
  status: "active" | "banned";
  createdAt: Date;
  updatedAt: Date;
}>;

export type ChatRoomSessionRepositoryRow = Readonly<{
  id: string;
  roomId: string;
  handleId: string;
  status: "active" | "revoked" | "expired";
  joinedAt: Date;
  lastSeenAt: Date | null;
  expiresAt: Date | null;
  leftAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ChatMessageRepositoryRow = Readonly<{
  id: string;
  roomId: string;
  roomSessionId: string;
  authorHandleId: string;
  body: string;
  sentAt: Date;
  tone: "cyan" | "pink" | "system" | null;
  moderationState: "visible" | "hidden" | "deleted";
  hiddenAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ChatUploadRepositoryRow = Readonly<{
  id: string;
  roomId: string;
  displayFilename: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  byteSize: number;
  kind: "image";
  storageKey: string;
  storagePath: string;
  uploaderHandleId: string;
  uploaderSessionId: string | null;
  messageId: string | null;
  moderationState: "visible" | "hidden" | "deleted";
  hiddenAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type CreateChatMessageWithUploadCommand = Readonly<{
  authorHandleId: string;
  body: string;
  byteSize: number;
  displayFilename: string;
  messageId: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  roomId: string;
  roomSessionId: string;
  sentAt: Date;
  storageKey: string;
  storagePath: string;
  tone: "cyan" | "pink" | "system" | null;
  uploadId: string;
}>;

export type CreateChatMessageWithUploadResult = Readonly<{
  message: ChatMessageRepositoryRow;
  upload: ChatUploadRepositoryRow;
}>;

export type ChatRoomQuery = Readonly<{
  slug: string;
}>;

export type ChatMessageListQuery = Readonly<{
  roomId: string;
  roomSessionId?: string;
  cursor?: string;
  limit?: number;
}>;

export interface ChatRepositoryPort {
  createMessageWithUpload(
    input: CreateChatMessageWithUploadCommand,
  ): Promise<CreateChatMessageWithUploadResult>;
  findSessionById(sessionId: string): Promise<ChatRoomSessionRepositoryRow | null>;
  findRoomBySlug(query: ChatRoomQuery): Promise<ChatRoomRepositoryRow | null>;
  findHandleByRoomIdAndNormalizedHandle(roomId: string, normalizedHandle: string): Promise<ChatHandleRepositoryRow | null>;
  listMessages(query: ChatMessageListQuery): Promise<readonly ChatMessageRepositoryRow[]>;
  findUploadById(uploadId: string): Promise<ChatUploadRepositoryRow | null>;
}
