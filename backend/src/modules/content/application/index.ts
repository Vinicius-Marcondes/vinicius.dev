import type {
  ContentRepositoryPort,
  PhotoDetailRepositoryRow,
  PhotoRepositoryRow,
  ThoughtCursor,
  ThoughtDetailRepositoryRow,
  ThoughtRepositoryRow,
  ProjectDetailRepositoryRow,
  ProjectRepositoryRow,
} from "@/modules/content/ports/outbound";

import type {
  GetPublishedProjectBySlugPort,
  GetPublishedPhotoByIdPort,
  GetPublishedThoughtBySlugPort,
  ListStatusStripEntriesPort,
  ListPublishedPhotosInput,
  ListPublishedPhotosOutput,
  ListPublishedPhotosPort,
  ListPublishedProjectsInput,
  ListPublishedProjectsOutput,
  ListPublishedProjectsPort,
  ListPublishedThoughtsInput,
  ListPublishedThoughtsOutput,
  ListPublishedThoughtsPort,
  PublishedProjectDetail,
  PublishedProjectSummary,
  PublishedPhotoDetail,
  PublishedPhotoSummary,
  StatusStripEntry,
  PublishedThoughtDetail,
  PublishedThoughtSummary,
} from "../ports/inbound";

const DEFAULT_THOUGHTS_PAGE_SIZE = 6;
const MAX_THOUGHTS_PAGE_SIZE = 24;
const DEFAULT_PROJECTS_PAGE = 1;
const DEFAULT_PROJECTS_PAGE_SIZE = 12;
const MAX_PROJECTS_PAGE_SIZE = 48;
const DEFAULT_PHOTOS_PAGE = 1;
const DEFAULT_PHOTOS_PAGE_SIZE = 24;
const MAX_PHOTOS_PAGE_SIZE = 96;

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

const buildPhotoOriginalUrl = (id: string): string => `/media/photos/${id}/original`;

const mapPhotoSummary = (row: PhotoRepositoryRow): PublishedPhotoSummary => ({
  date: row.date.toISOString().slice(0, 10),
  frame: row.frame,
  id: row.id,
  location: row.location,
  originalUrl: buildPhotoOriginalUrl(row.id),
  tags: [...row.tags],
  title: row.title,
  tone: row.tone,
});

const mapPhotoDetail = (row: PhotoDetailRepositoryRow): PublishedPhotoDetail => ({
  ...mapPhotoSummary(row),
  camera: row.camera,
  caption: row.caption,
  film: row.film,
});

const mapStatusStripEntry = (row: {
  accent: "amber" | "cyan" | "pink" | null;
  label: string;
  value: string;
}): StatusStripEntry => ({
  ...(row.accent ? { accent: row.accent } : {}),
  label: row.label,
  value: row.value,
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

const normalizePhotoPage = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_PHOTOS_PAGE;
  }

  return Math.max(Math.trunc(value), 1);
};

const normalizePhotoPageSize = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return DEFAULT_PHOTOS_PAGE_SIZE;
  }

  return Math.min(Math.max(Math.trunc(value), 1), MAX_PHOTOS_PAGE_SIZE);
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

export const createListPublishedPhotosUseCase = ({
  repository,
}: ContentApplicationDependencies): ListPublishedPhotosPort => ({
  execute: async (input: ListPublishedPhotosInput): Promise<ListPublishedPhotosOutput> => {
    const result = await repository.findPublishedPhotos({
      location: input.location?.trim() || undefined,
      page: normalizePhotoPage(input.page),
      pageSize: normalizePhotoPageSize(input.pageSize),
      search: input.search?.trim() || undefined,
      year: input.year,
    });

    return {
      items: result.items.map(mapPhotoSummary),
      pageInfo: {
        page: result.page,
        pageSize: result.pageSize,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      },
    };
  },
});

export const createGetPublishedPhotoByIdUseCase = ({
  repository,
}: ContentApplicationDependencies): GetPublishedPhotoByIdPort => ({
  execute: async ({ id }) => {
    const photo = await repository.findPublishedPhotoById(id);

    return photo ? mapPhotoDetail(photo) : null;
  },
});

export const createListStatusStripEntriesUseCase = ({
  repository,
}: ContentApplicationDependencies): ListStatusStripEntriesPort => ({
  execute: async () => {
    const entries = await repository.listStatusStripEntries();

    return {
      items: entries.map(mapStatusStripEntry),
    };
  },
});
