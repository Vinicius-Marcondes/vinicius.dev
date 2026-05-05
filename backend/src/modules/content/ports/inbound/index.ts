import type { UseCase } from "@/modules/shared/application/use-case";

export type PublishedThoughtSummary = Readonly<{
  id: string;
  title: string;
  slug: string;
  type: "essay" | "note";
  status: "published";
  publishedAt: string;
  readingTime: string | null;
  tags: readonly string[];
  excerpt: string;
  bodyPreview: string;
}>;

export type PublishedThoughtDetail = PublishedThoughtSummary &
  Readonly<{
    body: string;
    source: string | null;
  }>;

export type ListPublishedThoughtsInput = Readonly<{
  cursor?: string;
  limit?: number;
  type?: "essay" | "note";
  tags?: readonly string[];
  search?: string;
}>;

export type ListPublishedThoughtsOutput = Readonly<{
  items: readonly PublishedThoughtSummary[];
  pageInfo: Readonly<{
    nextCursor: string | null;
  }>;
}>;

export type GetPublishedThoughtBySlugInput = Readonly<{
  slug: string;
}>;

export interface ListPublishedThoughtsPort
  extends UseCase<ListPublishedThoughtsInput, ListPublishedThoughtsOutput> {}

export interface GetPublishedThoughtBySlugPort
  extends UseCase<GetPublishedThoughtBySlugInput, PublishedThoughtDetail | null> {}

export type PublishedProjectSummary = Readonly<{
  id: string;
  channel: string;
  title: string;
  slug: string;
  year: number;
  status: "live" | "archived" | "in-progress";
  description: string;
  tags: readonly string[];
  links: Readonly<{
    github?: string | null;
    site?: string | null;
  }>;
  thumbnail: Readonly<{
    hue: "amber" | "cyan" | "pink";
    kind: "bars" | "grid" | "noise" | "sig";
  }>;
}>;

export type PublishedProjectDetail = PublishedProjectSummary &
  Readonly<{
    body: string;
    source: string | null;
  }>;

export type ListPublishedProjectsInput = Readonly<{
  page?: number;
  pageSize?: number;
  status?: "live" | "archived" | "in-progress";
  tags?: readonly string[];
  search?: string;
  sort?: "recent" | "alpha" | "channel";
}>;

export type ListPublishedProjectsOutput = Readonly<{
  items: readonly PublishedProjectSummary[];
  pageInfo: Readonly<{
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;
}>;

export type GetPublishedProjectBySlugInput = Readonly<{
  slug: string;
}>;

export interface ListPublishedProjectsPort
  extends UseCase<ListPublishedProjectsInput, ListPublishedProjectsOutput> {}

export interface GetPublishedProjectBySlugPort
  extends UseCase<GetPublishedProjectBySlugInput, PublishedProjectDetail | null> {}

export type PublishedPhotoSummary = Readonly<{
  id: string;
  frame: string;
  title: string;
  date: string;
  location: string;
  tags: readonly string[];
  tone: "amber" | "cyan" | "mono" | "sunset" | "violet";
  originalUrl: string;
}>;

export type PublishedPhotoDetail = PublishedPhotoSummary &
  Readonly<{
    camera: string | null;
    caption: string | null;
    film: string | null;
  }>;

export type ListPublishedPhotosInput = Readonly<{
  page?: number;
  pageSize?: number;
  year?: number;
  location?: string;
  search?: string;
}>;

export type ListPublishedPhotosOutput = Readonly<{
  items: readonly PublishedPhotoSummary[];
  pageInfo: Readonly<{
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;
}>;

export type GetPublishedPhotoByIdInput = Readonly<{
  id: string;
}>;

export interface ListPublishedPhotosPort
  extends UseCase<ListPublishedPhotosInput, ListPublishedPhotosOutput> {}

export interface GetPublishedPhotoByIdPort
  extends UseCase<GetPublishedPhotoByIdInput, PublishedPhotoDetail | null> {}

export type StatusStripEntry = Readonly<{
  accent?: "amber" | "cyan" | "pink";
  label: string;
  value: string;
}>;

export type ListStatusStripEntriesOutput = Readonly<{
  items: readonly StatusStripEntry[];
}>;

export interface ListStatusStripEntriesPort
  extends UseCase<void, ListStatusStripEntriesOutput> {}
