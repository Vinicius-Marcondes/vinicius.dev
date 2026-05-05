import type {
  ChatUploadMediaRepositoryRow,
  MediaRepositoryPort,
  PhotoMediaRepositoryRow,
} from "@/modules/media/ports/outbound";
import {
  ChatUploadMimeType,
  PhotoOriginalReferencePolicy,
} from "../../../../../generated/prisma/client";

import type { PrismaDatabaseClient } from "./prisma-client";

const mapPhotoMediaRow = (row: {
  createdAt: Date;
  id: string;
  originalPath: string;
  originalReferencePolicy: PhotoOriginalReferencePolicy;
  title: string;
  updatedAt: Date;
}): PhotoMediaRepositoryRow => ({
  createdAt: row.createdAt,
  id: row.id,
  originalReference: row.originalPath,
  originalReferencePolicy: row.originalReferencePolicy,
  title: row.title,
  updatedAt: row.updatedAt,
});

const mapChatUploadMediaRow = (row: {
  byteSize: number;
  createdAt: Date;
  displayFilename: string;
  id: string;
  mimeType: ChatUploadMimeType;
  moderationState: "visible" | "hidden" | "deleted";
  roomId: string;
  storagePath: string;
  storageKey: string;
  updatedAt: Date;
}): ChatUploadMediaRepositoryRow => ({
  byteSize: row.byteSize,
  createdAt: row.createdAt,
  displayFilename: row.displayFilename,
  id: row.id,
  mimeType:
    row.mimeType === ChatUploadMimeType.image_jpeg
      ? "image/jpeg"
      : row.mimeType === ChatUploadMimeType.image_png
        ? "image/png"
        : "image/webp",
  moderationState: row.moderationState,
  roomId: row.roomId,
  storagePath: row.storagePath,
  storageKey: row.storageKey,
  updatedAt: row.updatedAt,
});

export const createPrismaMediaRepository = (client: PrismaDatabaseClient): MediaRepositoryPort => ({
  findPhotoMediaById: async (photoId: string): Promise<PhotoMediaRepositoryRow | null> => {
    const photo = await client.photo.findFirst({
      select: {
        createdAt: true,
        id: true,
        originalPath: true,
        originalReferencePolicy: true,
        title: true,
        updatedAt: true,
      },
      where: {
        id: photoId,
      },
    });

    return photo ? mapPhotoMediaRow(photo) : null;
  },
  findChatUploadMediaById: async (
    uploadId: string,
  ): Promise<ChatUploadMediaRepositoryRow | null> => {
    const upload = await client.chatUpload.findFirst({
      select: {
        byteSize: true,
        createdAt: true,
        displayFilename: true,
        id: true,
        mimeType: true,
        moderationState: true,
        roomId: true,
        storagePath: true,
        storageKey: true,
        updatedAt: true,
      },
      where: {
        id: uploadId,
      },
    });

    return upload ? mapChatUploadMediaRow(upload) : null;
  },
});
