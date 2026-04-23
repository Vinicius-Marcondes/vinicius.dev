import { createPrismaPersistenceAdapter } from "@/adapters/outbound/persistence";
import {
  createGetPublishedProjectBySlugUseCase,
  createGetPublishedThoughtBySlugUseCase,
  createListPublishedProjectsUseCase,
  createListPublishedThoughtsUseCase,
} from "@/modules/content/application";
import type {
  GetPublishedProjectBySlugPort,
  GetPublishedThoughtBySlugPort,
  ListPublishedProjectsPort,
  ListPublishedThoughtsPort,
} from "@/modules/content/ports/inbound";

import { loadBootstrapConfig, type BootstrapConfig } from "../config";

export type BootstrapContainer = Readonly<{
  config: BootstrapConfig;
  content: Readonly<{
    getPublishedProjectBySlug: GetPublishedProjectBySlugPort;
    getPublishedThoughtBySlug: GetPublishedThoughtBySlugPort;
    listPublishedProjects: ListPublishedProjectsPort;
    listPublishedThoughts: ListPublishedThoughtsPort;
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
      getPublishedThoughtBySlug: createGetPublishedThoughtBySlugUseCase({
        repository: persistence.content,
      }),
      listPublishedProjects: createListPublishedProjectsUseCase({
        repository: persistence.content,
      }),
      listPublishedThoughts: createListPublishedThoughtsUseCase({
        repository: persistence.content,
      }),
    },
  };
};
