import type {
  ContentRepositoryPort,
  PhotoListQuery,
  PhotoRepositoryRow,
  ProjectListQuery,
  ProjectRepositoryRow,
  StatusStripEntryRepositoryRow,
  ThoughtListQuery,
  ThoughtRepositoryRow,
} from "@/modules/content/ports/outbound";

import type { PrismaDatabaseClient } from "./prisma-client";

const notImplemented = <T>(method: string): Promise<T> => {
  return Promise.reject(new Error(`Prisma content repository method not implemented: ${method}`));
};

export const createPrismaContentRepository = (_client: PrismaDatabaseClient): ContentRepositoryPort => ({
  findPublishedThoughts: (_query: ThoughtListQuery): Promise<readonly ThoughtRepositoryRow[]> =>
    notImplemented("findPublishedThoughts"),
  findPublishedProjects: (_query: ProjectListQuery): Promise<readonly ProjectRepositoryRow[]> =>
    notImplemented("findPublishedProjects"),
  findPublishedPhotos: (_query: PhotoListQuery): Promise<readonly PhotoRepositoryRow[]> =>
    notImplemented("findPublishedPhotos"),
  listStatusStripEntries: (): Promise<readonly StatusStripEntryRepositoryRow[]> =>
    notImplemented("listStatusStripEntries"),
});
