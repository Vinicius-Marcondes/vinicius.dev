import type { AdminRepositoryPort } from "@/modules/admin/ports/outbound";
import type { ChatRepositoryPort } from "@/modules/chat/ports/outbound";
import type { ContentRepositoryPort } from "@/modules/content/ports/outbound";
import type { MediaRepositoryPort } from "@/modules/media/ports/outbound";

import { createPrismaAdminRepository } from "./admin-repository";
import { createPrismaChatRepository } from "./chat-repository";
import { createPrismaClient, type PrismaDatabaseClient } from "./prisma-client";
import { createPrismaContentRepository } from "./content-repository";
import { createPrismaMediaRepository } from "./media-repository";

export type PrismaPersistenceAdapter = Readonly<{
  content: ContentRepositoryPort;
  chat: ChatRepositoryPort;
  admin: AdminRepositoryPort;
  media: MediaRepositoryPort;
}>;

export type PrismaPersistenceAdapterOptions = Readonly<{
  roomPasswordSecret: string;
}>;

export const createPrismaPersistenceAdapter = (
  client: PrismaDatabaseClient = createPrismaClient(),
  options: PrismaPersistenceAdapterOptions = { roomPasswordSecret: "test-room-secret" },
): PrismaPersistenceAdapter => ({
  content: createPrismaContentRepository(client),
  chat: createPrismaChatRepository(client, options),
  admin: createPrismaAdminRepository(client),
  media: createPrismaMediaRepository(client),
});
