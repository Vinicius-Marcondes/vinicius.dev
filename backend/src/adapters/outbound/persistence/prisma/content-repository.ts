import type {
  ContentRepositoryPort,
  PhotoListQuery,
  PhotoRepositoryRow,
  ProjectListQuery,
  ProjectRepositoryRow,
  StatusStripEntryRepositoryRow,
  ThoughtDetailRepositoryRow,
  ThoughtListQuery,
  ThoughtListPage,
  ThoughtRepositoryRow,
} from "@/modules/content/ports/outbound";
import { Prisma, ThoughtStatus } from "../../../../../generated/prisma/client";

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
  findPublishedProjects: (_query: ProjectListQuery): Promise<readonly ProjectRepositoryRow[]> =>
    notImplemented("findPublishedProjects"),
  findPublishedPhotos: (_query: PhotoListQuery): Promise<readonly PhotoRepositoryRow[]> =>
    notImplemented("findPublishedPhotos"),
  listStatusStripEntries: (): Promise<readonly StatusStripEntryRepositoryRow[]> =>
    notImplemented("listStatusStripEntries"),
});
