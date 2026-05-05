import { describe, expect, it } from "bun:test";

import { createPrismaContentRepository } from "./content-repository";
import type { PrismaDatabaseClient } from "./prisma-client";

describe("prisma photo repository", () => {
  it("maps paginated photo rows without leaking Prisma types", async () => {
    const repository = createPrismaContentRepository({
      photo: {
        findMany: async () => [
          {
            caption: "Night street frame.",
            createdAt: new Date("2026-03-22T00:00:00.000Z"),
            date: new Date("2026-03-22T00:00:00.000Z"),
            featured: true,
            frame: "014",
            id: "p-2026-014",
            location: "Sao Paulo",
            tags: ["night", "street"],
            title: "paulista at 02:14",
            tone: "sunset" as const,
            updatedAt: new Date("2026-03-23T00:00:00.000Z"),
          },
          {
            caption: null,
            createdAt: new Date("2026-03-18T00:00:00.000Z"),
            date: new Date("2026-03-18T00:00:00.000Z"),
            featured: false,
            frame: "013",
            id: "p-2026-013",
            location: "Sao Paulo",
            tags: ["night", "arcade"],
            title: "arcade exit",
            tone: "cyan" as const,
            updatedAt: new Date("2026-03-19T00:00:00.000Z"),
          },
        ],
        findFirst: async () => null,
      },
      project: {
        findMany: async () => [],
        findFirst: async () => null,
      },
      thought: {
        findMany: async () => [],
        findFirst: async () => null,
      },
    } as unknown as PrismaDatabaseClient);

    const page = await repository.findPublishedPhotos({
      page: 1,
      pageSize: 1,
      year: 2026,
    });

    expect(page).toEqual({
      items: [
        {
          caption: "Night street frame.",
          createdAt: new Date("2026-03-22T00:00:00.000Z"),
          date: new Date("2026-03-22T00:00:00.000Z"),
          featured: true,
          frame: "014",
          id: "p-2026-014",
          location: "Sao Paulo",
          tags: ["night", "street"],
          title: "paulista at 02:14",
          tone: "sunset",
          updatedAt: new Date("2026-03-23T00:00:00.000Z"),
        },
      ],
      page: 1,
      pageSize: 1,
      totalItems: 2,
      totalPages: 2,
    });
  });

  it("maps a published photo detail row without leaking Prisma types", async () => {
    const repository = createPrismaContentRepository({
      photo: {
        findMany: async () => [],
        findFirst: async () => ({
          camera: "Canon T7+",
          caption: "Night street frame.",
          createdAt: new Date("2026-03-22T00:00:00.000Z"),
          date: new Date("2026-03-22T00:00:00.000Z"),
          featured: true,
          film: "digital",
          frame: "014",
          id: "p-2026-014",
          location: "Sao Paulo",
          originalPath: "photos/p-2026-014/original.jpg",
          tags: ["night", "street"],
          title: "paulista at 02:14",
          tone: "sunset" as const,
          updatedAt: new Date("2026-03-23T00:00:00.000Z"),
        }),
      },
      project: {
        findMany: async () => [],
        findFirst: async () => null,
      },
      thought: {
        findMany: async () => [],
        findFirst: async () => null,
      },
    } as unknown as PrismaDatabaseClient);

    const photo = await repository.findPublishedPhotoById("p-2026-014");

    expect(photo).toEqual({
      camera: "Canon T7+",
      caption: "Night street frame.",
      createdAt: new Date("2026-03-22T00:00:00.000Z"),
      date: new Date("2026-03-22T00:00:00.000Z"),
      featured: true,
      film: "digital",
      frame: "014",
      id: "p-2026-014",
      location: "Sao Paulo",
      originalPath: "photos/p-2026-014/original.jpg",
      tags: ["night", "street"],
      title: "paulista at 02:14",
      tone: "sunset",
      updatedAt: new Date("2026-03-23T00:00:00.000Z"),
    });
  });
});
