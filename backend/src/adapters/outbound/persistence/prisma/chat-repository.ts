import type {
  ChatHandleRepositoryRow,
  ChatMessageListQuery,
  ChatMessageRepositoryRow,
  ChatRepositoryPort,
  ChatRoomRepositoryRow,
  ChatUploadRepositoryRow,
} from "@/modules/chat/ports/outbound";

import type { PrismaDatabaseClient } from "./prisma-client";

const notImplemented = <T>(method: string): Promise<T> => {
  return Promise.reject(new Error(`Prisma chat repository method not implemented: ${method}`));
};

export const createPrismaChatRepository = (_client: PrismaDatabaseClient): ChatRepositoryPort => ({
  findRoomBySlug: (_query): Promise<ChatRoomRepositoryRow | null> =>
    notImplemented("findRoomBySlug"),
  findHandleByRoomIdAndNormalizedHandle: (_roomId, _normalizedHandle): Promise<ChatHandleRepositoryRow | null> =>
    notImplemented("findHandleByRoomIdAndNormalizedHandle"),
  listMessages: (_query: ChatMessageListQuery): Promise<readonly ChatMessageRepositoryRow[]> =>
    notImplemented("listMessages"),
  findUploadById: (_uploadId: string): Promise<ChatUploadRepositoryRow | null> =>
    notImplemented("findUploadById"),
});
