export type ChatRoomRepositoryRow = Readonly<{
  id: string;
  passwordHash: string;
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

export type ChatRoomParticipantRepositoryRow = Readonly<{
  handle: string;
  status: "online" | "idle";
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

export type ChatMessageAttachmentRepositoryRow = Readonly<{
  byteSize: number;
  fileName: string;
  id: string;
  kind: "image";
  mimeType: "image/jpeg" | "image/png" | "image/webp";
}>;

export type ChatMessageListItemRepositoryRow = Readonly<{
  attachment?: ChatMessageAttachmentRepositoryRow;
  author: string;
  body: string;
  id: string;
  sentAt: Date;
  tone: "cyan" | "pink" | "system" | null;
}>;

export type ChatMessageCursor = Readonly<{
  id: string;
  sentAt: Date;
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

export type CreateChatHandleCommand = Readonly<{
  handle: string;
  normalizedHandle: string;
  roomId: string;
  status: "active" | "banned";
}>;

export type CreateChatRoomSessionCommand = Readonly<{
  expiresAt: Date | null;
  handleId: string;
  joinedAt: Date;
  lastSeenAt: Date | null;
  leftAt: Date | null;
  roomId: string;
  sessionTokenHash: string;
  status: "active" | "revoked" | "expired";
}>;

export type CreateChatTextMessageCommand = Readonly<{
  authorHandleId: string;
  body: string;
  roomId: string;
  roomSessionId: string;
  sentAt: Date;
  tone: "cyan" | "pink" | "system" | null;
}>;

export type CreateChatMessageWithUploadResult = Readonly<{
  message: ChatMessageRepositoryRow;
  upload: ChatUploadRepositoryRow;
}>;

export type ModerateChatUploadRetentionAction = "hide_media_metadata" | "delete_message";

export type ModerateChatUploadRetentionCommand = Readonly<{
  action: ModerateChatUploadRetentionAction;
  actorAdminUserId: string;
  occurredAt: Date;
  reason?: string;
  uploadId: string;
}>;

export type ModerateChatUploadRetentionResult = Readonly<{
  auditId: string;
  message: ChatMessageRepositoryRow | null;
  upload: ChatUploadRepositoryRow;
}>;

export type ModerateChatRoomMessageAction = "hide_message" | "delete_message";

export type ModerateChatRoomMessageCommand = Readonly<{
  action: ModerateChatRoomMessageAction;
  actorAdminUserId: string;
  messageId: string;
  occurredAt: Date;
  reason?: string;
}>;

export type ModerateChatRoomMessageResult = Readonly<{
  auditId: string;
  message: ChatMessageRepositoryRow;
  upload: ChatUploadRepositoryRow | null;
}>;

export type BanChatRoomHandleCommand = Readonly<{
  actorAdminUserId: string;
  handleId: string;
  occurredAt: Date;
  reason?: string;
}>;

export type BanChatRoomHandleResult = Readonly<{
  auditId: string;
  banId: string;
  handle: ChatHandleRepositoryRow;
  revokedSessionCount: number;
}>;

export type RotateChatRoomPasswordCommand = Readonly<{
  actorAdminUserId: string;
  nextPasswordHash: string;
  occurredAt: Date;
  reason?: string;
  slug: string;
}>;

export type RotateChatRoomPasswordResult = Readonly<{
  auditId: string;
  revokedSessionCount: number;
  room: ChatRoomRepositoryRow;
  rotation: Readonly<{
    id: string;
    rotatedAt: Date;
  }>;
}>;

export type ChatRoomQuery = Readonly<{
  slug: string;
}>;

export type ChatMessageListQuery = Readonly<{
  cursor?: ChatMessageCursor;
  limit: number;
  roomId: string;
}>;

export type ChatMessageListPage = Readonly<{
  items: readonly ChatMessageListItemRepositoryRow[];
  nextCursor: ChatMessageCursor | null;
}>;

export interface ChatRepositoryPort {
  createHandle(input: CreateChatHandleCommand): Promise<ChatHandleRepositoryRow>;
  createTextMessage(input: CreateChatTextMessageCommand): Promise<ChatMessageRepositoryRow>;
  createMessageWithUpload(
    input: CreateChatMessageWithUploadCommand,
  ): Promise<CreateChatMessageWithUploadResult>;
  createSession(input: CreateChatRoomSessionCommand): Promise<ChatRoomSessionRepositoryRow>;
  moderateUploadRetention(
    input: ModerateChatUploadRetentionCommand,
  ): Promise<ModerateChatUploadRetentionResult | null>;
  moderateMessage(
    input: ModerateChatRoomMessageCommand,
  ): Promise<ModerateChatRoomMessageResult | null>;
  banHandle(input: BanChatRoomHandleCommand): Promise<BanChatRoomHandleResult | null>;
  rotateRoomPassword(
    input: RotateChatRoomPasswordCommand,
  ): Promise<RotateChatRoomPasswordResult | null>;
  findHandleById(handleId: string): Promise<ChatHandleRepositoryRow | null>;
  findSessionById(sessionId: string): Promise<ChatRoomSessionRepositoryRow | null>;
  findRoomBySlug(query: ChatRoomQuery): Promise<ChatRoomRepositoryRow | null>;
  findHandleByRoomIdAndNormalizedHandle(roomId: string, normalizedHandle: string): Promise<ChatHandleRepositoryRow | null>;
  listParticipantsByRoomId(roomId: string): Promise<readonly ChatRoomParticipantRepositoryRow[]>;
  listMessages(query: ChatMessageListQuery): Promise<ChatMessageListPage>;
  findUploadById(uploadId: string): Promise<ChatUploadRepositoryRow | null>;
}
