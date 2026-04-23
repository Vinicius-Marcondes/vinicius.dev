import type {
  ChatUploadMediaRepositoryRow,
  MediaRepositoryPort,
  PhotoMediaRepositoryRow,
} from "@/modules/media/ports/outbound";

import type { PrismaDatabaseClient } from "./prisma-client";

const notImplemented = <T>(method: string): Promise<T> => {
  return Promise.reject(new Error(`Prisma media repository method not implemented: ${method}`));
};

export const createPrismaMediaRepository = (_client: PrismaDatabaseClient): MediaRepositoryPort => ({
  findPhotoMediaById: (_photoId: string): Promise<PhotoMediaRepositoryRow | null> =>
    notImplemented("findPhotoMediaById"),
  findChatUploadMediaById: (_uploadId: string): Promise<ChatUploadMediaRepositoryRow | null> =>
    notImplemented("findChatUploadMediaById"),
});
