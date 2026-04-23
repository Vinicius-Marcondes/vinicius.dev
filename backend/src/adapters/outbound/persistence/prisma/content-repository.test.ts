import { describe, expect, it } from "bun:test";

import { createPrismaContentRepository } from "./content-repository";
import type { PrismaDatabaseClient } from "./prisma-client";

describe("prisma content repository", () => {
  it("maps published thought rows and produces a cursor for the next page", async () => {
    const findMany = async () => [
      {
        bodyPreview: "First preview",
        createdAt: new Date("2026-03-28T00:00:00.000Z"),
        excerpt: "First excerpt",
        featured: true,
        id: "thought_2",
        publishedAt: new Date("2026-03-28T00:00:00.000Z"),
        readingTime: 7,
        slug: "night-cable-interfaces",
        status: "published" as const,
        tags: ["interface", "nostalgia"],
        title: "Night Cable Interfaces",
        type: "essay" as const,
        updatedAt: new Date("2026-03-28T00:00:00.000Z"),
      },
      {
        bodyPreview: "Second preview",
        createdAt: new Date("2026-03-16T00:00:00.000Z"),
        excerpt: "Second excerpt",
        featured: false,
        id: "thought_1",
        publishedAt: new Date("2026-03-16T00:00:00.000Z"),
        readingTime: 3,
        slug: "runbook-for-small-tools",
        status: "published" as const,
        tags: ["tools", "ops"],
        title: "Runbook for Small Tools",
        type: "note" as const,
        updatedAt: new Date("2026-03-16T00:00:00.000Z"),
      },
    ];

    const repository = createPrismaContentRepository({
      thought: {
        findMany,
        findFirst: async () => null,
      },
    } as unknown as PrismaDatabaseClient);

    const page = await repository.findPublishedThoughts({
      limit: 1,
    });

    expect(page.items).toEqual([
      {
        bodyPreview: "First preview",
        createdAt: new Date("2026-03-28T00:00:00.000Z"),
        excerpt: "First excerpt",
        featured: true,
        id: "thought_2",
        publishedAt: new Date("2026-03-28T00:00:00.000Z"),
        readingTime: 7,
        slug: "night-cable-interfaces",
        status: "published",
        tags: ["interface", "nostalgia"],
        title: "Night Cable Interfaces",
        type: "essay",
        updatedAt: new Date("2026-03-28T00:00:00.000Z"),
      },
    ]);
    expect(page.nextCursor).toEqual({
      id: "thought_1",
      publishedAt: new Date("2026-03-16T00:00:00.000Z"),
    });
  });

  it("maps a published thought detail row without leaking Prisma types", async () => {
    const repository = createPrismaContentRepository({
      thought: {
        findMany: async () => [],
        findFirst: async () => ({
          body: "A homepage does not need to convert anyone.",
          bodyPreview: "A homepage does not need to convert anyone.",
          createdAt: new Date("2026-03-28T00:00:00.000Z"),
          excerpt: "The best personal websites feel less like products.",
          featured: true,
          id: "thought_2",
          publishedAt: new Date("2026-03-28T00:00:00.000Z"),
          readingTime: 7,
          slug: "night-cable-interfaces",
          source: "notes/night-cable-interfaces.md",
          status: "published" as const,
          tags: ["interface", "nostalgia"],
          title: "Night Cable Interfaces",
          type: "essay" as const,
          updatedAt: new Date("2026-03-28T00:00:00.000Z"),
        }),
      },
    } as unknown as PrismaDatabaseClient);

    const thought = await repository.findPublishedThoughtBySlug("night-cable-interfaces");

    expect(thought).toEqual({
      body: "A homepage does not need to convert anyone.",
      bodyPreview: "A homepage does not need to convert anyone.",
      createdAt: new Date("2026-03-28T00:00:00.000Z"),
      excerpt: "The best personal websites feel less like products.",
      featured: true,
      id: "thought_2",
      publishedAt: new Date("2026-03-28T00:00:00.000Z"),
      readingTime: 7,
      slug: "night-cable-interfaces",
      source: "notes/night-cable-interfaces.md",
      status: "published",
      tags: ["interface", "nostalgia"],
      title: "Night Cable Interfaces",
      type: "essay",
      updatedAt: new Date("2026-03-28T00:00:00.000Z"),
    });
  });
});
