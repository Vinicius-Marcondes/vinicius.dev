import type {
  ContentRepositoryPort,
  ThoughtCursor,
  ThoughtDetailRepositoryRow,
  ThoughtRepositoryRow,
} from "@/modules/content/ports/outbound";

import type {
  GetPublishedThoughtBySlugPort,
  ListPublishedThoughtsInput,
  ListPublishedThoughtsOutput,
  ListPublishedThoughtsPort,
  PublishedThoughtDetail,
  PublishedThoughtSummary,
} from "../ports/inbound";

const DEFAULT_THOUGHTS_PAGE_SIZE = 6;
const MAX_THOUGHTS_PAGE_SIZE = 24;

export class InvalidThoughtCursorError extends Error {
  constructor() {
    super("Thought cursor is invalid.");
    this.name = "InvalidThoughtCursorError";
  }
}

const formatPublishedDate = (value: Date | null): string => {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 10);
};

const formatReadingTime = (value: number | null): string | null => {
  if (value === null) {
    return null;
  }

  return `${value} min`;
};

const mapThoughtSummary = (row: ThoughtRepositoryRow): PublishedThoughtSummary => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  type: row.type,
  status: "published",
  publishedAt: formatPublishedDate(row.publishedAt),
  readingTime: formatReadingTime(row.readingTime),
  tags: [...row.tags],
  excerpt: row.excerpt,
  bodyPreview: row.bodyPreview,
});

const mapThoughtDetail = (row: ThoughtDetailRepositoryRow): PublishedThoughtDetail => ({
  ...mapThoughtSummary(row),
  body: row.body,
  source: row.source,
});

const normalizeLimit = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_THOUGHTS_PAGE_SIZE;
  }

  return Math.min(Math.max(Math.trunc(value), 1), MAX_THOUGHTS_PAGE_SIZE);
};

const encodeThoughtCursor = (cursor: ThoughtCursor): string => {
  return Buffer.from(
    JSON.stringify({
      id: cursor.id,
      publishedAt: cursor.publishedAt.toISOString(),
    }),
    "utf8",
  ).toString("base64url");
};

const decodeThoughtCursor = (input: string): ThoughtCursor => {
  try {
    const parsed = JSON.parse(Buffer.from(input, "base64url").toString("utf8")) as {
      id?: unknown;
      publishedAt?: unknown;
    };

    if (typeof parsed.id !== "string" || typeof parsed.publishedAt !== "string") {
      throw new InvalidThoughtCursorError();
    }

    const publishedAt = new Date(parsed.publishedAt);

    if (Number.isNaN(publishedAt.getTime())) {
      throw new InvalidThoughtCursorError();
    }

    return {
      id: parsed.id,
      publishedAt,
    };
  } catch (_error) {
    throw new InvalidThoughtCursorError();
  }
};

export type ContentApplicationDependencies = Readonly<{
  repository: ContentRepositoryPort;
}>;

export const createListPublishedThoughtsUseCase = ({
  repository,
}: ContentApplicationDependencies): ListPublishedThoughtsPort => ({
  execute: async (input: ListPublishedThoughtsInput): Promise<ListPublishedThoughtsOutput> => {
    const limit = normalizeLimit(input.limit);
    const result = await repository.findPublishedThoughts({
      cursor: input.cursor ? decodeThoughtCursor(input.cursor) : undefined,
      limit,
      search: input.search?.trim() || undefined,
      tags: input.tags?.filter(Boolean),
      type: input.type,
    });

    return {
      items: result.items.map(mapThoughtSummary),
      pageInfo: {
        nextCursor: result.nextCursor ? encodeThoughtCursor(result.nextCursor) : null,
      },
    };
  },
});

export const createGetPublishedThoughtBySlugUseCase = ({
  repository,
}: ContentApplicationDependencies): GetPublishedThoughtBySlugPort => ({
  execute: async ({ slug }) => {
    const thought = await repository.findPublishedThoughtBySlug(slug);

    return thought ? mapThoughtDetail(thought) : null;
  },
});
