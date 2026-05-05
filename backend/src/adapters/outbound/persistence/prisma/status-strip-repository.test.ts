import { describe, expect, it } from "bun:test";

import { createPrismaContentRepository } from "./content-repository";
import type { PrismaDatabaseClient } from "./prisma-client";

describe("prisma status strip repository", () => {
  it("maps ordered status strip rows without leaking Prisma types", async () => {
    const repository = createPrismaContentRepository({
      photo: {
        findMany: async () => [],
        findFirst: async () => null,
      },
      project: {
        findMany: async () => [],
        findFirst: async () => null,
      },
      statusStripEntry: {
        findMany: async () => [
          {
            accent: "cyan" as const,
            createdAt: new Date("2026-04-24T00:00:00.000Z"),
            displayOrder: 1,
            id: "status_1",
            label: "now building",
            updatedAt: new Date("2026-04-24T00:00:00.000Z"),
            value: "vinicius.dev backend",
          },
          {
            accent: null,
            createdAt: new Date("2026-04-24T00:00:00.000Z"),
            displayOrder: 2,
            id: "status_2",
            label: "location",
            updatedAt: new Date("2026-04-24T00:00:00.000Z"),
            value: "Sao Paulo",
          },
        ],
      },
      thought: {
        findMany: async () => [],
        findFirst: async () => null,
      },
    } as unknown as PrismaDatabaseClient);

    const entries = await repository.listStatusStripEntries();

    expect(entries).toEqual([
      {
        accent: "cyan",
        createdAt: new Date("2026-04-24T00:00:00.000Z"),
        displayOrder: 1,
        id: "status_1",
        label: "now building",
        updatedAt: new Date("2026-04-24T00:00:00.000Z"),
        value: "vinicius.dev backend",
      },
      {
        accent: null,
        createdAt: new Date("2026-04-24T00:00:00.000Z"),
        displayOrder: 2,
        id: "status_2",
        label: "location",
        updatedAt: new Date("2026-04-24T00:00:00.000Z"),
        value: "Sao Paulo",
      },
    ]);
  });
});
