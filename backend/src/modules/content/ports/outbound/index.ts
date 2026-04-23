export type ThoughtCursor = Readonly<{
  publishedAt: Date;
  id: string;
}>;

export type ThoughtRepositoryRow = Readonly<{
  id: string;
  title: string;
  slug: string;
  type: "essay" | "note";
  status: "draft" | "published";
  publishedAt: Date | null;
  readingTime: number | null;
  tags: readonly string[];
  excerpt: string;
  bodyPreview: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ThoughtDetailRepositoryRow = ThoughtRepositoryRow &
  Readonly<{
    body: string;
    source: string | null;
  }>;

export type ThoughtListPage = Readonly<{
  items: readonly ThoughtRepositoryRow[];
  nextCursor: ThoughtCursor | null;
}>;

export type ProjectRepositoryRow = Readonly<{
  id: string;
  channel: string;
  title: string;
  slug: string;
  year: number;
  status: "live" | "archived" | "in-progress";
  description: string;
  tags: readonly string[];
  githubUrl: string | null;
  siteUrl: string | null;
  thumbnailHue: number;
  thumbnailKind: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ProjectDetailRepositoryRow = ProjectRepositoryRow &
  Readonly<{
    body: string;
    source: string | null;
  }>;

export type ProjectListPage = Readonly<{
  items: readonly ProjectRepositoryRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}>;

export type PhotoRepositoryRow = Readonly<{
  id: string;
  frame: string;
  title: string;
  date: Date;
  location: string;
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
  cursor?: ThoughtCursor;
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
  findPublishedThoughts(query: ThoughtListQuery): Promise<ThoughtListPage>;
  findPublishedThoughtBySlug(slug: string): Promise<ThoughtDetailRepositoryRow | null>;
  findPublishedProjects(query: ProjectListQuery): Promise<ProjectListPage>;
  findPublishedProjectBySlug(slug: string): Promise<ProjectDetailRepositoryRow | null>;
  findPublishedPhotos(query: PhotoListQuery): Promise<readonly PhotoRepositoryRow[]>;
  listStatusStripEntries(): Promise<readonly StatusStripEntryRepositoryRow[]>;
}
