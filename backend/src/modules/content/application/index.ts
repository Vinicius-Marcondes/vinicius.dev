import type {
  ContentRepositoryPort,
  ThoughtCursor,
  ThoughtDetailRepositoryRow,
  ThoughtRepositoryRow,
  ProjectDetailRepositoryRow,
  ProjectRepositoryRow,
} from "@/modules/content/ports/outbound";

import type {
  GetPublishedProjectBySlugPort,
  GetPublishedThoughtBySlugPort,
  ListPublishedProjectsInput,
  ListPublishedProjectsOutput,
  ListPublishedProjectsPort,
  ListPublishedThoughtsInput,
  ListPublishedThoughtsOutput,
  ListPublishedThoughtsPort,
  PublishedProjectDetail,
  PublishedProjectSummary,
  PublishedThoughtDetail,
  PublishedThoughtSummary,
} from "../ports/inbound";

const DEFAULT_THOUGHTS_PAGE_SIZE = 6;
const MAX_THOUGHTS_PAGE_SIZE = 24;
const DEFAULT_PROJECTS_PAGE = 1;
const DEFAULT_PROJECTS_PAGE_SIZE = 12;
const MAX_PROJECTS_PAGE_SIZE = 48;

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

const mapProjectHue = (value: number): "amber" | "cyan" | "pink" => {
  if (value <= 90) {
    return "amber";
  }

  if (value <= 270) {
    return "cyan";
  }

  return "pink";
};

const mapProjectKind = (value: string): "bars" | "grid" | "noise" | "sig" => {
  if (value === "bars" || value === "grid" || value === "noise" || value === "sig") {
    return value;
  }

  return "bars";
};

const mapProjectSummary = (row: ProjectRepositoryRow): PublishedProjectSummary => ({
  channel: row.channel,
  description: row.description,
  id: row.id,
  links: {
    github: row.githubUrl,
    site: row.siteUrl,
  },
  slug: row.slug,
  status: row.status,
  tags: [...row.tags],
  thumbnail: {
    hue: mapProjectHue(row.thumbnailHue),
    kind: mapProjectKind(row.thumbnailKind),
  },
  title: row.title,
  year: row.year,
});

const mapProjectDetail = (row: ProjectDetailRepositoryRow): PublishedProjectDetail => ({
  ...mapProjectSummary(row),
  body: row.body,
  source: row.source,
});

const normalizeLimit = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_THOUGHTS_PAGE_SIZE;
  }

  return Math.min(Math.max(Math.trunc(value), 1), MAX_THOUGHTS_PAGE_SIZE);
};

const normalizeProjectPage = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_PROJECTS_PAGE;
  }

  return Math.max(Math.trunc(value), 1);
};

const normalizeProjectPageSize = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_PROJECTS_PAGE_SIZE;
  }

  return Math.min(Math.max(Math.trunc(value), 1), MAX_PROJECTS_PAGE_SIZE);
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

export const createListPublishedProjectsUseCase = ({
  repository,
}: ContentApplicationDependencies): ListPublishedProjectsPort => ({
  execute: async (input: ListPublishedProjectsInput): Promise<ListPublishedProjectsOutput> => {
    const result = await repository.findPublishedProjects({
      page: normalizeProjectPage(input.page),
      pageSize: normalizeProjectPageSize(input.pageSize),
      search: input.search?.trim() || undefined,
      sort: input.sort,
      status: input.status,
      tags: input.tags?.filter(Boolean),
    });

    return {
      items: result.items.map(mapProjectSummary),
      pageInfo: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    };
  },
});

export const createGetPublishedProjectBySlugUseCase = ({
  repository,
}: ContentApplicationDependencies): GetPublishedProjectBySlugPort => ({
  execute: async ({ slug }) => {
    const project = await repository.findPublishedProjectBySlug(slug);

    return project ? mapProjectDetail(project) : null;
  },
});
