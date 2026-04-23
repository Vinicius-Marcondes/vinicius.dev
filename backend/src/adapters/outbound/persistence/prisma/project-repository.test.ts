import { describe, expect, it } from "bun:test";

import { createPrismaContentRepository } from "./content-repository";
import type { PrismaDatabaseClient } from "./prisma-client";

describe("prisma project repository", () => {
  it("maps paginated project rows without leaking Prisma types", async () => {
    const repository = createPrismaContentRepository({
      project: {
        findMany: async () => [
          {
            channel: "07",
            createdAt: new Date("2025-01-01T00:00:00.000Z"),
            description: "a tiny webgl shader kit",
            featured: true,
            githubUrl: "#",
            id: "project_1",
            siteUrl: "#",
            slug: "crt-shader-kit",
            status: "live" as const,
            tags: ["webgl", "glsl"],
            thumbnailHue: 180,
            thumbnailKind: "grid",
            title: "crt.shader",
            updatedAt: new Date("2025-01-02T00:00:00.000Z"),
            year: 2025,
          },
          {
            channel: "15",
            createdAt: new Date("2024-01-01T00:00:00.000Z"),
            description: "offline-first music library",
            featured: false,
            githubUrl: "#",
            id: "project_2",
            siteUrl: null,
            slug: "tape-deck",
            status: "archived" as const,
            tags: ["rust", "tauri"],
            thumbnailHue: 30,
            thumbnailKind: "bars",
            title: "tape.deck",
            updatedAt: new Date("2024-01-02T00:00:00.000Z"),
            year: 2024,
          },
        ],
        findFirst: async () => null,
      },
      thought: {
        findMany: async () => [],
        findFirst: async () => null,
      },
    } as unknown as PrismaDatabaseClient);

    const page = await repository.findPublishedProjects({
      page: 1,
      pageSize: 1,
      sort: "recent",
    });

    expect(page).toEqual({
      items: [
        {
          channel: "07",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          description: "a tiny webgl shader kit",
          featured: true,
          githubUrl: "#",
          id: "project_1",
          siteUrl: "#",
          slug: "crt-shader-kit",
          status: "live",
          tags: ["webgl", "glsl"],
          thumbnailHue: 180,
          thumbnailKind: "grid",
          title: "crt.shader",
          updatedAt: new Date("2025-01-02T00:00:00.000Z"),
          year: 2025,
        },
      ],
      page: 1,
      pageSize: 1,
      totalItems: 2,
      totalPages: 2,
    });
  });

  it("maps a project detail row without leaking Prisma types", async () => {
    const repository = createPrismaContentRepository({
      project: {
        findMany: async () => [],
        findFirst: async () => ({
          body: "Shader notes",
          channel: "07",
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          description: "a tiny webgl shader kit",
          featured: true,
          githubUrl: "#",
          id: "project_1",
          siteUrl: "#",
          slug: "crt-shader-kit",
          source: "projects/crt-shader-kit.md",
          status: "live" as const,
          tags: ["webgl", "glsl"],
          thumbnailHue: 180,
          thumbnailKind: "grid",
          title: "crt.shader",
          updatedAt: new Date("2025-01-02T00:00:00.000Z"),
          year: 2025,
        }),
      },
      thought: {
        findMany: async () => [],
        findFirst: async () => null,
      },
    } as unknown as PrismaDatabaseClient);

    const project = await repository.findPublishedProjectBySlug("crt-shader-kit");

    expect(project).toEqual({
      body: "Shader notes",
      channel: "07",
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      description: "a tiny webgl shader kit",
      featured: true,
      githubUrl: "#",
      id: "project_1",
      siteUrl: "#",
      slug: "crt-shader-kit",
      source: "projects/crt-shader-kit.md",
      status: "live",
      tags: ["webgl", "glsl"],
      thumbnailHue: 180,
      thumbnailKind: "grid",
      title: "crt.shader",
      updatedAt: new Date("2025-01-02T00:00:00.000Z"),
      year: 2025,
    });
  });
});
