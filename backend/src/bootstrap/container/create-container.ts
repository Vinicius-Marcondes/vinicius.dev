import { createPrismaPersistenceAdapter } from "@/adapters/outbound/persistence";
import {
  createGetPublishedThoughtBySlugUseCase,
  createListPublishedThoughtsUseCase,
} from "@/modules/content/application";
import type {
  GetPublishedThoughtBySlugPort,
  ListPublishedThoughtsPort,
} from "@/modules/content/ports/inbound";

import { loadBootstrapConfig, type BootstrapConfig } from "../config";

export type BootstrapContainer = Readonly<{
  config: BootstrapConfig;
  content: Readonly<{
    getPublishedThoughtBySlug: GetPublishedThoughtBySlugPort;
    listPublishedThoughts: ListPublishedThoughtsPort;
  }>;
}>;

type BootstrapEnv = Readonly<Record<string, string | undefined>>;

export const createContainer = (env: BootstrapEnv = Bun.env): BootstrapContainer => {
  const persistence = createPrismaPersistenceAdapter();

  return {
    config: loadBootstrapConfig(env),
    content: {
      getPublishedThoughtBySlug: createGetPublishedThoughtBySlugUseCase({
        repository: persistence.content,
      }),
      listPublishedThoughts: createListPublishedThoughtsUseCase({
        repository: persistence.content,
      }),
    },
  };
};
