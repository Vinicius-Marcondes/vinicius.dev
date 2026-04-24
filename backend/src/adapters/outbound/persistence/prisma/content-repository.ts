import type {
  ContentRepositoryPort,
  PhotoDetailRepositoryRow,
  PhotoListQuery,
  PhotoListPage,
  PhotoRepositoryRow,
  ProjectDetailRepositoryRow,
  ProjectListQuery,
  ProjectListPage,
  ProjectRepositoryRow,
  StatusStripEntryRepositoryRow,
  ThoughtDetailRepositoryRow,
  ThoughtListQuery,
  ThoughtListPage,
  ThoughtRepositoryRow,
} from "@/modules/content/ports/outbound";
import {
  PhotoStatus,
  Prisma,
  ProjectStatus,
  ThoughtStatus,
} from "../../../../../generated/prisma/client";

import type { PrismaDatabaseClient } from "./prisma-client";

const notImplemented = <T>(method: string): Promise<T> => {
  return Promise.reject(new Error(`Prisma content repository method not implemented: ${method}`));
};

const mapThoughtRow = (row: {
  bodyPreview: string;
  createdAt: Date;
  excerpt: string;
  featured: boolean;
  id: string;
  publishedAt: Date | null;
  readingTime: number | null;
  slug: string;
  status: "draft" | "published";
  tags: string[];
  title: string;
  type: "essay" | "note";
  updatedAt: Date;
}): ThoughtRepositoryRow => ({
  bodyPreview: row.bodyPreview,
  createdAt: row.createdAt,
  excerpt: row.excerpt,
  featured: row.featured,
  id: row.id,
  publishedAt: row.publishedAt,
  readingTime: row.readingTime,
  slug: row.slug,
  status: row.status,
  tags: [...row.tags],
  title: row.title,
  type: row.type,
  updatedAt: row.updatedAt,
});

const mapThoughtDetailRow = (row: {
  body: string;
  bodyPreview: string;
  createdAt: Date;
  excerpt: string;
  featured: boolean;
  id: string;
  publishedAt: Date | null;
  readingTime: number | null;
  slug: string;
  source: string | null;
  status: "draft" | "published";
  tags: string[];
  title: string;
  type: "essay" | "note";
  updatedAt: Date;
}): ThoughtDetailRepositoryRow => ({
  ...mapThoughtRow(row),
  body: row.body,
  source: row.source,
});

const mapProjectRow = (row: {
  channel: string;
  createdAt: Date;
  description: string;
  featured: boolean;
  githubUrl: string | null;
  id: string;
  siteUrl: string | null;
  slug: string;
  status: ProjectStatus;
  tags: string[];
  thumbnailHue: number;
  thumbnailKind: string;
  title: string;
  updatedAt: Date;
  year: number;
}): ProjectRepositoryRow => ({
  channel: row.channel,
  createdAt: row.createdAt,
  description: row.description,
  featured: row.featured,
  githubUrl: row.githubUrl,
  id: row.id,
  siteUrl: row.siteUrl,
  slug: row.slug,
  status: row.status === ProjectStatus.in_progress ? "in-progress" : row.status,
  tags: [...row.tags],
  thumbnailHue: row.thumbnailHue,
  thumbnailKind: row.thumbnailKind,
  title: row.title,
  updatedAt: row.updatedAt,
  year: row.year,
});

const mapProjectDetailRow = (row: {
  body: string;
  channel: string;
  createdAt: Date;
  description: string;
  featured: boolean;
  githubUrl: string | null;
  id: string;
  siteUrl: string | null;
  slug: string;
  source: string | null;
  status: ProjectStatus;
  tags: string[];
  thumbnailHue: number;
  thumbnailKind: string;
  title: string;
  updatedAt: Date;
  year: number;
}): ProjectDetailRepositoryRow => ({
  ...mapProjectRow(row),
  body: row.body,
  source: row.source,
});

const mapPhotoRow = (row: {
  caption: string | null;
  createdAt: Date;
  date: Date;
  featured: boolean;
  frame: string;
  id: string;
  location: string;
  tags: string[];
  title: string;
  tone: "amber" | "cyan" | "mono" | "sunset" | "violet";
  updatedAt: Date;
}): PhotoRepositoryRow => ({
  caption: row.caption,
  createdAt: row.createdAt,
  date: row.date,
  featured: row.featured,
  frame: row.frame,
  id: row.id,
  location: row.location,
  tags: [...row.tags],
  title: row.title,
  tone: row.tone,
  updatedAt: row.updatedAt,
});

const mapPhotoDetailRow = (row: {
  camera: string | null;
  caption: string | null;
  createdAt: Date;
  date: Date;
  featured: boolean;
  film: string | null;
  frame: string;
  id: string;
  location: string;
  originalPath: string;
  tags: string[];
  title: string;
  tone: "amber" | "cyan" | "mono" | "sunset" | "violet";
  updatedAt: Date;
}): PhotoDetailRepositoryRow => ({
  ...mapPhotoRow(row),
  camera: row.camera,
  film: row.film,
  originalPath: row.originalPath,
});

const applyThoughtSearch = <
  TRow extends {
    bodyPreview: string;
    excerpt: string;
    tags: string[];
    title: string;
  },
>(
  rows: readonly TRow[],
  search?: string,
) => {
  const normalizedSearch = search?.trim().toLowerCase();

  if (!normalizedSearch) {
    return rows;
  }

  return rows.filter((row) => {
    return (
      row.title.toLowerCase().includes(normalizedSearch) ||
      row.excerpt.toLowerCase().includes(normalizedSearch) ||
      row.bodyPreview.toLowerCase().includes(normalizedSearch) ||
      row.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
    );
  });
};

const buildThoughtCursorWhere = (query: ThoughtListQuery): Prisma.ThoughtWhereInput | undefined => {
  if (!query.cursor) {
    return undefined;
  }

  return {
    OR: [
      {
        publishedAt: {
          lt: query.cursor.publishedAt,
        },
      },
      {
        id: {
          lt: query.cursor.id,
        },
        publishedAt: query.cursor.publishedAt,
      },
    ],
  };
};

const buildThoughtBaseWhere = (query: ThoughtListQuery): Prisma.ThoughtWhereInput => ({
  ...buildThoughtCursorWhere(query),
  ...(query.tags?.length
    ? {
        tags: {
          hasEvery: [...query.tags],
        },
      }
    : {}),
  ...(query.type
    ? {
        type: query.type,
      }
    : {}),
  publishedAt: {
    not: null,
  },
  status: ThoughtStatus.published,
});

const mapProjectStatusFilter = (
  value: "live" | "archived" | "in-progress" | undefined,
): ProjectStatus | undefined => {
  if (value === "in-progress") {
    return ProjectStatus.in_progress;
  }

  return value;
};

export const createPrismaContentRepository = (client: PrismaDatabaseClient): ContentRepositoryPort => ({
  findPublishedThoughts: async (query: ThoughtListQuery): Promise<ThoughtListPage> => {
    const limit = query.limit ?? 6;
    const rows = await client.thought.findMany({
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      select: {
        bodyPreview: true,
        createdAt: true,
        excerpt: true,
        featured: true,
        id: true,
        publishedAt: true,
        readingTime: true,
        slug: true,
        status: true,
        tags: true,
        title: true,
        type: true,
        updatedAt: true,
      },
      take: query.search ? undefined : limit + 1,
      where: buildThoughtBaseWhere(query),
    });

    const filteredRows = applyThoughtSearch(rows, query.search);
    const pageRows = filteredRows.slice(0, limit).map(mapThoughtRow);
    const nextRow = filteredRows.at(limit);

    return {
      items: pageRows,
      nextCursor:
        nextRow && nextRow.publishedAt
          ? {
              id: nextRow.id,
              publishedAt: nextRow.publishedAt,
            }
          : null,
    };
  },
  findPublishedThoughtBySlug: async (slug: string): Promise<ThoughtDetailRepositoryRow | null> => {
    const row = await client.thought.findFirst({
      select: {
        body: true,
        bodyPreview: true,
        createdAt: true,
        excerpt: true,
        featured: true,
        id: true,
        publishedAt: true,
        readingTime: true,
        slug: true,
        source: true,
        status: true,
        tags: true,
        title: true,
        type: true,
        updatedAt: true,
      },
      where: {
        OR: [{ id: slug }, { slug }],
        publishedAt: {
          not: null,
        },
        status: ThoughtStatus.published,
      },
    });

    return row ? mapThoughtDetailRow(row) : null;
  },
  findPublishedProjects: async (query: ProjectListQuery): Promise<ProjectListPage> => {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const rows = await client.project.findMany({
      orderBy:
        query.sort === "alpha"
          ? [{ title: "asc" }]
          : query.sort === "channel"
            ? [{ channel: "asc" }]
            : [{ year: "desc" }, { createdAt: "desc" }],
      select: {
        channel: true,
        createdAt: true,
        description: true,
        featured: true,
        githubUrl: true,
        id: true,
        siteUrl: true,
        slug: true,
        status: true,
        tags: true,
        thumbnailHue: true,
        thumbnailKind: true,
        title: true,
        updatedAt: true,
        year: true,
      },
      where: {
        ...(query.status
          ? {
              status: mapProjectStatusFilter(query.status),
            }
          : {}),
        ...(query.tags?.length
          ? {
              tags: {
                hasEvery: [...query.tags],
              },
            }
          : {}),
      },
    });

    const normalizedSearch = query.search?.trim().toLowerCase();
    const filteredRows = normalizedSearch
      ? rows.filter((row) => {
          return (
            row.title.toLowerCase().includes(normalizedSearch) ||
            row.description.toLowerCase().includes(normalizedSearch) ||
            row.channel.toLowerCase().includes(normalizedSearch) ||
            row.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
          );
        })
      : rows;
    const totalItems = filteredRows.length;
    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
    const startIndex = (page - 1) * pageSize;

    return {
      items: filteredRows.slice(startIndex, startIndex + pageSize).map(mapProjectRow),
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  },
  findPublishedProjectBySlug: async (slug: string): Promise<ProjectDetailRepositoryRow | null> => {
    const row = await client.project.findFirst({
      select: {
        body: true,
        channel: true,
        createdAt: true,
        description: true,
        featured: true,
        githubUrl: true,
        id: true,
        siteUrl: true,
        slug: true,
        source: true,
        status: true,
        tags: true,
        thumbnailHue: true,
        thumbnailKind: true,
        title: true,
        updatedAt: true,
        year: true,
      },
      where: {
        OR: [{ id: slug }, { slug }],
      },
    });

    return row ? mapProjectDetailRow(row) : null;
  },
  findPublishedPhotos: async (query: PhotoListQuery): Promise<PhotoListPage> => {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;
    const rows = await client.photo.findMany({
      orderBy: [{ date: "desc" }, { id: "desc" }],
      select: {
        caption: true,
        createdAt: true,
        date: true,
        featured: true,
        frame: true,
        id: true,
        location: true,
        tags: true,
        title: true,
        tone: true,
        updatedAt: true,
      },
      where: {
        ...(query.location
          ? {
              location: query.location,
            }
          : {}),
        ...(query.year
          ? {
              date: {
                gte: new Date(Date.UTC(query.year, 0, 1)),
                lt: new Date(Date.UTC(query.year + 1, 0, 1)),
              },
            }
          : {}),
        status: PhotoStatus.published,
      },
    });

    const normalizedSearch = query.search?.trim().toLowerCase();
    const filteredRows = normalizedSearch
      ? rows.filter((row) => {
          return (
            row.title.toLowerCase().includes(normalizedSearch) ||
            row.location.toLowerCase().includes(normalizedSearch) ||
            row.frame.toLowerCase().includes(normalizedSearch) ||
            row.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
          );
        })
      : rows;
    const totalItems = filteredRows.length;
    const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
    const startIndex = (page - 1) * pageSize;

    return {
      items: filteredRows.slice(startIndex, startIndex + pageSize).map(mapPhotoRow),
      page,
      pageSize,
      totalItems,
      totalPages,
    };
  },
  findPublishedPhotoById: async (id: string): Promise<PhotoDetailRepositoryRow | null> => {
    const row = await client.photo.findFirst({
      select: {
        camera: true,
        caption: true,
        createdAt: true,
        date: true,
        featured: true,
        film: true,
        frame: true,
        id: true,
        location: true,
        originalPath: true,
        tags: true,
        title: true,
        tone: true,
        updatedAt: true,
      },
      where: {
        id,
        status: PhotoStatus.published,
      },
    });

    return row ? mapPhotoDetailRow(row) : null;
  },
  listStatusStripEntries: (): Promise<readonly StatusStripEntryRepositoryRow[]> =>
    notImplemented("listStatusStripEntries"),
});
