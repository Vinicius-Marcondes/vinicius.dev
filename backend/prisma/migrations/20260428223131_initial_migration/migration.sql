-- CreateEnum
CREATE TYPE "ThoughtType" AS ENUM ('essay', 'note');

-- CreateEnum
CREATE TYPE "ThoughtStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('live', 'archived', 'in-progress');

-- CreateEnum
CREATE TYPE "PhotoStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "PhotoTone" AS ENUM ('amber', 'cyan', 'mono', 'sunset', 'violet');

-- CreateEnum
CREATE TYPE "PhotoOriginalReferencePolicy" AS ENUM ('backend_media_route', 'filesystem_reference');

-- CreateEnum
CREATE TYPE "StatusStripAccent" AS ENUM ('amber', 'cyan', 'pink');

-- CreateEnum
CREATE TYPE "AdminSessionStatus" AS ENUM ('active', 'revoked', 'expired');

-- CreateEnum
CREATE TYPE "AdminMfaChallengeStatus" AS ENUM ('pending', 'verified', 'expired', 'canceled');

-- CreateEnum
CREATE TYPE "ChatHandleStatus" AS ENUM ('active', 'banned');

-- CreateEnum
CREATE TYPE "ChatRoomSessionStatus" AS ENUM ('active', 'revoked', 'expired');

-- CreateEnum
CREATE TYPE "ChatMessageTone" AS ENUM ('cyan', 'pink', 'system');

-- CreateEnum
CREATE TYPE "ChatModerationState" AS ENUM ('visible', 'hidden', 'deleted');

-- CreateEnum
CREATE TYPE "ChatUploadKind" AS ENUM ('image');

-- CreateEnum
CREATE TYPE "ChatUploadMimeType" AS ENUM ('image/jpeg', 'image/png', 'image/webp');

-- CreateEnum
CREATE TYPE "ChatBanStatus" AS ENUM ('active', 'lifted');

-- CreateEnum
CREATE TYPE "ChatModerationAuditAction" AS ENUM ('delete_message', 'hide_media_metadata', 'ban_handle', 'room_password_rotation');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordHashAlgorithm" TEXT NOT NULL,
    "passwordHashParams" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "AdminSessionStatus" NOT NULL DEFAULT 'active',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminMfaChallenge" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "status" "AdminMfaChallengeStatus" NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminMfaChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordVersion" INTEGER NOT NULL DEFAULT 1,
    "passwordRotatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatHandle" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "normalizedHandle" TEXT NOT NULL,
    "status" "ChatHandleStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatHandle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoomSession" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "handleId" TEXT NOT NULL,
    "sessionTokenHash" TEXT NOT NULL,
    "status" "ChatRoomSessionStatus" NOT NULL DEFAULT 'active',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoomSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "roomSessionId" TEXT NOT NULL,
    "authorHandleId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tone" "ChatMessageTone",
    "moderationState" "ChatModerationState" NOT NULL DEFAULT 'visible',
    "hiddenAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatUpload" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "displayFilename" TEXT NOT NULL,
    "mimeType" "ChatUploadMimeType" NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "kind" "ChatUploadKind" NOT NULL DEFAULT 'image',
    "storageKey" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploaderHandleId" TEXT NOT NULL,
    "uploaderSessionId" TEXT,
    "messageId" TEXT,
    "moderationState" "ChatModerationState" NOT NULL DEFAULT 'visible',
    "hiddenAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatBan" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "targetHandleId" TEXT NOT NULL,
    "actorAdminUserId" TEXT NOT NULL,
    "reason" TEXT,
    "status" "ChatBanStatus" NOT NULL DEFAULT 'active',
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liftedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatBan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoomPasswordRotation" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "actorAdminUserId" TEXT NOT NULL,
    "reason" TEXT,
    "previousPasswordHash" TEXT NOT NULL,
    "nextPasswordHash" TEXT NOT NULL,
    "previousPasswordVersion" INTEGER NOT NULL,
    "nextPasswordVersion" INTEGER NOT NULL,
    "rotatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoomPasswordRotation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatModerationAuditRecord" (
    "id" TEXT NOT NULL,
    "action" "ChatModerationAuditAction" NOT NULL,
    "roomId" TEXT,
    "actorAdminUserId" TEXT NOT NULL,
    "targetHandleId" TEXT,
    "targetSessionId" TEXT,
    "targetMessageId" TEXT,
    "targetUploadId" TEXT,
    "targetBanId" TEXT,
    "targetRoomPasswordRotationId" TEXT,
    "reason" TEXT,
    "previousState" JSONB,
    "nextState" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatModerationAuditRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thought" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ThoughtType" NOT NULL,
    "status" "ThoughtStatus" NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "readingTime" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excerpt" TEXT NOT NULL,
    "bodyPreview" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thought_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'in-progress',
    "description" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "githubUrl" TEXT,
    "siteUrl" TEXT,
    "thumbnailHue" INTEGER NOT NULL,
    "thumbnailKind" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "source" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "frame" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tone" "PhotoTone" NOT NULL,
    "caption" TEXT,
    "camera" TEXT,
    "film" TEXT,
    "originalPath" TEXT NOT NULL,
    "originalReferencePolicy" "PhotoOriginalReferencePolicy" NOT NULL DEFAULT 'backend_media_route',
    "status" "PhotoStatus" NOT NULL DEFAULT 'draft',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusStripEntry" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "accent" "StatusStripAccent",
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatusStripEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSession_adminUserId_status_idx" ON "AdminSession"("adminUserId", "status");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AdminMfaChallenge_adminUserId_status_idx" ON "AdminMfaChallenge"("adminUserId", "status");

-- CreateIndex
CREATE INDEX "AdminMfaChallenge_expiresAt_idx" ON "AdminMfaChallenge"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_slug_key" ON "ChatRoom"("slug");

-- CreateIndex
CREATE INDEX "ChatRoom_slug_idx" ON "ChatRoom"("slug");

-- CreateIndex
CREATE INDEX "ChatHandle_roomId_status_idx" ON "ChatHandle"("roomId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChatHandle_roomId_normalizedHandle_key" ON "ChatHandle"("roomId", "normalizedHandle");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoomSession_sessionTokenHash_key" ON "ChatRoomSession"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "ChatRoomSession_roomId_status_joinedAt_idx" ON "ChatRoomSession"("roomId", "status", "joinedAt" DESC);

-- CreateIndex
CREATE INDEX "ChatRoomSession_handleId_joinedAt_idx" ON "ChatRoomSession"("handleId", "joinedAt" DESC);

-- CreateIndex
CREATE INDEX "ChatMessage_roomId_sentAt_idx" ON "ChatMessage"("roomId", "sentAt" DESC);

-- CreateIndex
CREATE INDEX "ChatMessage_roomSessionId_sentAt_idx" ON "ChatMessage"("roomSessionId", "sentAt" DESC);

-- CreateIndex
CREATE INDEX "ChatMessage_authorHandleId_sentAt_idx" ON "ChatMessage"("authorHandleId", "sentAt" DESC);

-- CreateIndex
CREATE INDEX "ChatMessage_moderationState_sentAt_idx" ON "ChatMessage"("moderationState", "sentAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ChatUpload_messageId_key" ON "ChatUpload"("messageId");

-- CreateIndex
CREATE INDEX "ChatUpload_roomId_createdAt_idx" ON "ChatUpload"("roomId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChatUpload_uploaderHandleId_createdAt_idx" ON "ChatUpload"("uploaderHandleId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChatUpload_uploaderSessionId_createdAt_idx" ON "ChatUpload"("uploaderSessionId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChatUpload_moderationState_createdAt_idx" ON "ChatUpload"("moderationState", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChatBan_roomId_status_bannedAt_idx" ON "ChatBan"("roomId", "status", "bannedAt" DESC);

-- CreateIndex
CREATE INDEX "ChatBan_targetHandleId_bannedAt_idx" ON "ChatBan"("targetHandleId", "bannedAt" DESC);

-- CreateIndex
CREATE INDEX "ChatBan_actorAdminUserId_bannedAt_idx" ON "ChatBan"("actorAdminUserId", "bannedAt" DESC);

-- CreateIndex
CREATE INDEX "ChatRoomPasswordRotation_roomId_rotatedAt_idx" ON "ChatRoomPasswordRotation"("roomId", "rotatedAt" DESC);

-- CreateIndex
CREATE INDEX "ChatRoomPasswordRotation_actorAdminUserId_rotatedAt_idx" ON "ChatRoomPasswordRotation"("actorAdminUserId", "rotatedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "ChatModerationAuditRecord_targetRoomPasswordRotationId_key" ON "ChatModerationAuditRecord"("targetRoomPasswordRotationId");

-- CreateIndex
CREATE INDEX "ChatModerationAuditRecord_roomId_createdAt_idx" ON "ChatModerationAuditRecord"("roomId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChatModerationAuditRecord_actorAdminUserId_createdAt_idx" ON "ChatModerationAuditRecord"("actorAdminUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ChatModerationAuditRecord_action_createdAt_idx" ON "ChatModerationAuditRecord"("action", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Thought_slug_key" ON "Thought"("slug");

-- CreateIndex
CREATE INDEX "Thought_status_publishedAt_idx" ON "Thought"("status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Thought_type_status_publishedAt_idx" ON "Thought"("type", "status", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "Thought_featured_publishedAt_idx" ON "Thought"("featured", "publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_status_year_idx" ON "Project"("status", "year" DESC);

-- CreateIndex
CREATE INDEX "Project_channel_title_idx" ON "Project"("channel", "title");

-- CreateIndex
CREATE INDEX "Project_title_idx" ON "Project"("title");

-- CreateIndex
CREATE INDEX "Project_featured_status_idx" ON "Project"("featured", "status");

-- CreateIndex
CREATE INDEX "Photo_status_date_idx" ON "Photo"("status", "date" DESC);

-- CreateIndex
CREATE INDEX "Photo_location_date_idx" ON "Photo"("location", "date" DESC);

-- CreateIndex
CREATE INDEX "Photo_frame_date_idx" ON "Photo"("frame", "date" DESC);

-- CreateIndex
CREATE INDEX "Photo_featured_date_idx" ON "Photo"("featured", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "StatusStripEntry_displayOrder_key" ON "StatusStripEntry"("displayOrder");

-- CreateIndex
CREATE INDEX "StatusStripEntry_displayOrder_idx" ON "StatusStripEntry"("displayOrder");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminMfaChallenge" ADD CONSTRAINT "AdminMfaChallenge_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatHandle" ADD CONSTRAINT "ChatHandle_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoomSession" ADD CONSTRAINT "ChatRoomSession_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoomSession" ADD CONSTRAINT "ChatRoomSession_handleId_fkey" FOREIGN KEY ("handleId") REFERENCES "ChatHandle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_roomSessionId_fkey" FOREIGN KEY ("roomSessionId") REFERENCES "ChatRoomSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_authorHandleId_fkey" FOREIGN KEY ("authorHandleId") REFERENCES "ChatHandle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUpload" ADD CONSTRAINT "ChatUpload_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUpload" ADD CONSTRAINT "ChatUpload_uploaderHandleId_fkey" FOREIGN KEY ("uploaderHandleId") REFERENCES "ChatHandle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUpload" ADD CONSTRAINT "ChatUpload_uploaderSessionId_fkey" FOREIGN KEY ("uploaderSessionId") REFERENCES "ChatRoomSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUpload" ADD CONSTRAINT "ChatUpload_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBan" ADD CONSTRAINT "ChatBan_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBan" ADD CONSTRAINT "ChatBan_targetHandleId_fkey" FOREIGN KEY ("targetHandleId") REFERENCES "ChatHandle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBan" ADD CONSTRAINT "ChatBan_actorAdminUserId_fkey" FOREIGN KEY ("actorAdminUserId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoomPasswordRotation" ADD CONSTRAINT "ChatRoomPasswordRotation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoomPasswordRotation" ADD CONSTRAINT "ChatRoomPasswordRotation_actorAdminUserId_fkey" FOREIGN KEY ("actorAdminUserId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAuditRecord" ADD CONSTRAINT "ChatModerationAuditRecord_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAuditRecord" ADD CONSTRAINT "ChatModerationAuditRecord_actorAdminUserId_fkey" FOREIGN KEY ("actorAdminUserId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAuditRecord" ADD CONSTRAINT "ChatModerationAuditRecord_targetHandleId_fkey" FOREIGN KEY ("targetHandleId") REFERENCES "ChatHandle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAuditRecord" ADD CONSTRAINT "ChatModerationAuditRecord_targetSessionId_fkey" FOREIGN KEY ("targetSessionId") REFERENCES "ChatRoomSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAuditRecord" ADD CONSTRAINT "ChatModerationAuditRecord_targetMessageId_fkey" FOREIGN KEY ("targetMessageId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAuditRecord" ADD CONSTRAINT "ChatModerationAuditRecord_targetUploadId_fkey" FOREIGN KEY ("targetUploadId") REFERENCES "ChatUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAuditRecord" ADD CONSTRAINT "ChatModerationAuditRecord_targetBanId_fkey" FOREIGN KEY ("targetBanId") REFERENCES "ChatBan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAuditRecord" ADD CONSTRAINT "ChatModerationAuditRecord_targetRoomPasswordRotationId_fkey" FOREIGN KEY ("targetRoomPasswordRotationId") REFERENCES "ChatRoomPasswordRotation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
