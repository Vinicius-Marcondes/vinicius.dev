export type ThoughtRepositoryRow = Readonly<{
  id: string;
  title: string;
  slug: string;
  type: "essay" | "note";
  status: "draft" | "published";
  publishedAt: Date | null;
  readingTime: number;
  tags: readonly string[];
  excerpt: string | null;
  bodyPreview: string | null;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ProjectRepositoryRow = Readonly<{
  id: string;
  channel: string;
  title: string;
  slug: string;
  year: number;
  status: "live" | "archived" | "in-progress";
  description: string | null;
  tags: readonly string[];
  githubUrl: string | null;
  siteUrl: string | null;
  thumbnailHue: number | null;
  thumbnailKind: string | null;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;

export type PhotoRepositoryRow = Readonly<{
  id: string;
  frame: string;
  title: string;
  date: Date;
  location: string | null;
  tags: readonly string[];
  tone: "amber" | "cyan" | "mono" | "sunset" | "violet";
  caption: string | null;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;

export type StatusStripEntryRepositoryRow = Readonly<{
  id: string;
  label: string;
  value: string;
  accent: "amber" | "cyan" | "pink" | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ThoughtListQuery = Readonly<{
  cursor?: string;
  limit?: number;
  type?: "essay" | "note";
  tags?: readonly string[];
  search?: string;
}>;

export type ProjectListQuery = Readonly<{
  page?: number;
  pageSize?: number;
  status?: "live" | "archived" | "in-progress";
  tags?: readonly string[];
  search?: string;
  sort?: "recent" | "alpha" | "channel";
}>;

export type PhotoListQuery = Readonly<{
  page?: number;
  pageSize?: number;
  year?: number;
  location?: string;
  search?: string;
}>;

export interface ContentRepositoryPort {
  findPublishedThoughts(query: ThoughtListQuery): Promise<readonly ThoughtRepositoryRow[]>;
  findPublishedProjects(query: ProjectListQuery): Promise<readonly ProjectRepositoryRow[]>;
  findPublishedPhotos(query: PhotoListQuery): Promise<readonly PhotoRepositoryRow[]>;
  listStatusStripEntries(): Promise<readonly StatusStripEntryRepositoryRow[]>;
}
