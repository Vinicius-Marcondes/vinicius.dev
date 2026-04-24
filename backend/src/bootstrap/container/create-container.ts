import { createPrismaPersistenceAdapter } from "@/adapters/outbound/persistence";
import {
  createGetPublishedProjectBySlugUseCase,
  createGetPublishedPhotoByIdUseCase,
  createGetPublishedThoughtBySlugUseCase,
  createListPublishedPhotosUseCase,
  createListPublishedProjectsUseCase,
  createListPublishedThoughtsUseCase,
  createListStatusStripEntriesUseCase,
} from "@/modules/content/application";
import type {
  GetPublishedProjectBySlugPort,
  GetPublishedPhotoByIdPort,
  GetPublishedThoughtBySlugPort,
  ListPublishedPhotosPort,
  ListPublishedProjectsPort,
  ListPublishedThoughtsPort,
  ListStatusStripEntriesPort,
} from "@/modules/content/ports/inbound";

import { loadBootstrapConfig, type BootstrapConfig } from "../config";

export type BootstrapContainer = Readonly<{
  config: BootstrapConfig;
  content: Readonly<{
    getPublishedProjectBySlug: GetPublishedProjectBySlugPort;
    getPublishedPhotoById: GetPublishedPhotoByIdPort;
    getPublishedThoughtBySlug: GetPublishedThoughtBySlugPort;
    listPublishedPhotos: ListPublishedPhotosPort;
    listPublishedProjects: ListPublishedProjectsPort;
    listPublishedThoughts: ListPublishedThoughtsPort;
    listStatusStripEntries: ListStatusStripEntriesPort;
  }>;
}>;

type BootstrapEnv = Readonly<Record<string, string | undefined>>;

export const createContainer = (env: BootstrapEnv = Bun.env): BootstrapContainer => {
  const persistence = createPrismaPersistenceAdapter();

  return {
    config: loadBootstrapConfig(env),
    content: {
      getPublishedProjectBySlug: createGetPublishedProjectBySlugUseCase({
        repository: persistence.content,
      }),
      getPublishedPhotoById: createGetPublishedPhotoByIdUseCase({
        repository: persistence.content,
      }),
      getPublishedThoughtBySlug: createGetPublishedThoughtBySlugUseCase({
        repository: persistence.content,
      }),
      listPublishedPhotos: createListPublishedPhotosUseCase({
        repository: persistence.content,
      }),
      listPublishedProjects: createListPublishedProjectsUseCase({
        repository: persistence.content,
      }),
      listPublishedThoughts: createListPublishedThoughtsUseCase({
        repository: persistence.content,
      }),
      listStatusStripEntries: createListStatusStripEntriesUseCase({
        repository: persistence.content,
      }),
    },
  };
};
