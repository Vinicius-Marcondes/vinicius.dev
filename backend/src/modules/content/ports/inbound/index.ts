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
