import { describe, expect, it } from "bun:test";

import {
  createGetPublishedPhotoByIdUseCase,
  createGetPublishedProjectBySlugUseCase,
  createGetPublishedThoughtBySlugUseCase,
  createListPublishedPhotosUseCase,
  createListPublishedProjectsUseCase,
  createListPublishedThoughtsUseCase,
  createListStatusStripEntriesUseCase,
  InvalidThoughtCursorError,
} from "./index";
import type { ContentRepositoryPort, ThoughtCursor } from "../ports/outbound";

const now = new Date("2026-04-28T12:00:00.000Z");
const older = new Date("2026-04-20T12:00:00.000Z");

const thoughtRow = {
  bodyPreview: "Preview text",
  createdAt: older,
  excerpt: "Excerpt text",
  featured: true,
  id: "thought_1",
  publishedAt: now,
  readingTime: 7,
  slug: "night-cable-interfaces",
  status: "published" as const,
  tags: ["interface", "nostalgia"],
  title: "Night Cable Interfaces",
  type: "essay" as const,
  updatedAt: now,
};

const projectRow = {
  channel: "07",
  createdAt: older,
  description: "CRT shader experiments.",
  featured: true,
  githubUrl: "https://github.example/project",
  id: "project_1",
  siteUrl: null,
  slug: "crt-shader-kit",
  status: "in-progress" as const,
  tags: ["graphics"],
  thumbnailHue: 120,
  thumbnailKind: "unknown-kind",
  title: "crt.shader",
  updatedAt: now,
  year: 2025,
};

const photoRow = {
  caption: "Night street frame.",
  createdAt: older,
  date: new Date("2026-03-22T00:00:00.000Z"),
  featured: false,
  frame: "014",
  id: "photo_1",
  location: "Sao Paulo",
  tags: ["night", "street"],
  title: "paulista at 02:14",
  tone: "sunset" as const,
  updatedAt: now,
};

const createRepository = (
  overrides: Partial<ContentRepositoryPort> = {},
): ContentRepositoryPort => ({
  findPublishedPhotoById: async () => ({
    ...photoRow,
    camera: "Canon",
    film: "digital",
    originalPath: "photos/photo_1.jpg",
  }),
  findPublishedPhotos: async (query) => ({
    items: [photoRow],
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 24,
    totalItems: 1,
    totalPages: 1,
  }),
  findPublishedProjectBySlug: async () => ({
    ...projectRow,
    body: "Project body",
    source: "projects/crt-shader-kit.md",
  }),
  findPublishedProjects: async (query) => ({
    items: [projectRow],
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 12,
    totalItems: 1,
    totalPages: 1,
  }),
  findPublishedThoughtBySlug: async () => ({
    ...thoughtRow,
    body: "Full thought body",
    source: "thoughts/night-cable-interfaces.md",
  }),
  findPublishedThoughts: async (query) => ({
    items: [thoughtRow],
    nextCursor: query.cursor ?? null,
  }),
  listStatusStripEntries: async () => [
    {
      accent: "cyan",
      createdAt: older,
      displayOrder: 1,
      id: "strip_1",
      label: "now",
      updatedAt: now,
      value: "testing",
    },
    {
      accent: null,
      createdAt: older,
      displayOrder: 2,
      id: "strip_2",
      label: "mode",
      updatedAt: now,
      value: "quiet",
    },
  ],
  ...overrides,
});

const encodeThoughtCursor = (cursor: ThoughtCursor): string =>
  Buffer.from(
    JSON.stringify({
      id: cursor.id,
      publishedAt: cursor.publishedAt.toISOString(),
    }),
    "utf8",
  ).toString("base64url");

describe("content application", () => {
  it("normalizes thought list input, maps DTOs, and encodes the next cursor", async () => {
    const calls: unknown[] = [];
    const nextCursor = {
      id: "thought_0",
      publishedAt: older,
    };
    const useCase = createListPublishedThoughtsUseCase({
      repository: createRepository({
        findPublishedThoughts: async (query) => {
          calls.push(query);
          return {
            items: [thoughtRow],
            nextCursor,
          };
        },
      }),
    });

    await expect(
      useCase.execute({
        limit: 999,
        search: "  cable  ",
        tags: ["interface", "", "nostalgia"],
        type: "essay",
      }),
    ).resolves.toEqual({
      items: [
        {
          bodyPreview: "Preview text",
          excerpt: "Excerpt text",
          id: "thought_1",
          publishedAt: "2026-04-28",
          readingTime: "7 min",
          slug: "night-cable-interfaces",
          status: "published",
          tags: ["interface", "nostalgia"],
          title: "Night Cable Interfaces",
          type: "essay",
        },
      ],
      pageInfo: {
        nextCursor: encodeThoughtCursor(nextCursor),
      },
    });
    expect(calls).toEqual([
      {
        cursor: undefined,
        limit: 24,
        search: "cable",
        tags: ["interface", "nostalgia"],
        type: "essay",
      },
    ]);
  });

  it("decodes valid thought cursors and rejects malformed cursors", async () => {
    const cursor = {
      id: "thought_1",
      publishedAt: now,
    };
    const calls: unknown[] = [];
    const useCase = createListPublishedThoughtsUseCase({
      repository: createRepository({
        findPublishedThoughts: async (query) => {
          calls.push(query);
          return {
            items: [],
            nextCursor: null,
          };
        },
      }),
    });

    await expect(
      useCase.execute({
        cursor: encodeThoughtCursor(cursor),
        limit: -5,
      }),
    ).resolves.toEqual({
      items: [],
      pageInfo: {
        nextCursor: null,
      },
    });
    expect(calls).toEqual([
      {
        cursor,
        limit: 1,
        search: undefined,
        tags: undefined,
        type: undefined,
      },
    ]);

    await expect(
      useCase.execute({
        cursor: "not-json",
      }),
    ).rejects.toBeInstanceOf(InvalidThoughtCursorError);
  });

  it("maps detail lookups and null detail paths", async () => {
    const repository = createRepository({
      findPublishedPhotoById: async (id) =>
        id === "missing"
          ? null
          : {
              ...photoRow,
              camera: "Canon",
              film: "digital",
              originalPath: "photos/photo_1.jpg",
            },
      findPublishedProjectBySlug: async (slug) =>
        slug === "missing"
          ? null
          : {
              ...projectRow,
              body: "Project body",
              source: null,
            },
      findPublishedThoughtBySlug: async (slug) =>
        slug === "missing"
          ? null
          : {
              ...thoughtRow,
              body: "Full thought body",
              source: null,
            },
    });

    await expect(
      createGetPublishedThoughtBySlugUseCase({ repository }).execute({
        slug: "night-cable-interfaces",
      }),
    ).resolves.toMatchObject({
      body: "Full thought body",
      publishedAt: "2026-04-28",
      readingTime: "7 min",
      source: null,
    });
    await expect(
      createGetPublishedProjectBySlugUseCase({ repository }).execute({
        slug: "missing",
      }),
    ).resolves.toBeNull();
    await expect(
      createGetPublishedPhotoByIdUseCase({ repository }).execute({
        id: "photo_1",
      }),
    ).resolves.toMatchObject({
      camera: "Canon",
      caption: "Night street frame.",
      date: "2026-03-22",
      film: "digital",
      originalUrl: "/media/photos/photo_1/original",
    });
  });

  it("normalizes project and photo pagination while mapping thumbnails and media URLs", async () => {
    const projectCalls: unknown[] = [];
    const photoCalls: unknown[] = [];
    const repository = createRepository({
      findPublishedPhotos: async (query) => {
        photoCalls.push(query);
        return {
          items: [photoRow],
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 24,
          totalItems: 1,
          totalPages: 1,
        };
      },
      findPublishedProjects: async (query) => {
        projectCalls.push(query);
        return {
          items: [projectRow],
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 12,
          totalItems: 1,
          totalPages: 1,
        };
      },
    });

    await expect(
      createListPublishedProjectsUseCase({ repository }).execute({
        page: -2,
        pageSize: 999,
        search: "  shader ",
        tags: ["graphics", ""],
      }),
    ).resolves.toMatchObject({
      items: [
        {
          links: {
            github: "https://github.example/project",
            site: null,
          },
          thumbnail: {
            hue: "cyan",
            kind: "bars",
          },
        },
      ],
      pageInfo: {
        page: 1,
        pageSize: 48,
      },
    });
    await expect(
      createListPublishedPhotosUseCase({ repository }).execute({
        location: "  Sao Paulo ",
        page: Number.NaN,
        pageSize: 999,
        search: " night ",
        year: 2026,
      }),
    ).resolves.toMatchObject({
      items: [
        {
          originalUrl: "/media/photos/photo_1/original",
        },
      ],
      pageInfo: {
        page: 1,
        pageSize: 96,
      },
    });
    expect(projectCalls).toEqual([
      {
        page: 1,
        pageSize: 48,
        search: "shader",
        sort: undefined,
        status: undefined,
        tags: ["graphics"],
      },
    ]);
    expect(photoCalls).toEqual([
      {
        location: "Sao Paulo",
        page: 1,
        pageSize: 96,
        search: "night",
        year: 2026,
      },
    ]);
  });

  it("maps status strip entries without serializing empty accents", async () => {
    const useCase = createListStatusStripEntriesUseCase({
      repository: createRepository(),
    });

    await expect(useCase.execute()).resolves.toEqual({
      items: [
        {
          accent: "cyan",
          label: "now",
          value: "testing",
        },
        {
          label: "mode",
          value: "quiet",
        },
      ],
    });
  });
});
