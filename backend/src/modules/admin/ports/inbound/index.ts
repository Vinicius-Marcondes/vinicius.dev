import type { UseCase } from "@/modules/shared/application/use-case";

export type AdminDashboardQueueItem = Readonly<{
  kind: "thought" | "project" | "photo";
  id: string;
  channel: string;
  title: string;
  suggestedActions: readonly string[];
}>;

export type AdminDashboardSummaryOutput = Readonly<{
  panels: Readonly<{
    draftThoughts: number;
    featuredSlots: number;
    photoRecords: number;
    chatFlags: number;
    statusStripEntries: number;
  }>;
  queues: Readonly<{
    content: readonly AdminDashboardQueueItem[];
  }>;
  moderationCommands: readonly ["delete_message", "ban_handle", "rotate_room_password"];
}>;

export interface GetAdminDashboardSummaryPort
  extends UseCase<void, AdminDashboardSummaryOutput> {}

export type AdminThoughtCurationItem = Readonly<{
  id: string;
  title: string;
  slug: string;
  type: "essay" | "note";
  status: "draft" | "published";
  featured: boolean;
  publishedAt: string | null;
  updatedAt: string;
}>;

export type ListAdminThoughtsInput = Readonly<{
  page?: number;
  pageSize?: number;
  status?: "draft" | "published";
  featured?: boolean;
  search?: string;
  type?: "essay" | "note";
}>;

export type ListAdminThoughtsOutput = Readonly<{
  items: readonly AdminThoughtCurationItem[];
  pageInfo: Readonly<{
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;
}>;

export interface ListAdminThoughtsPort
  extends UseCase<ListAdminThoughtsInput, ListAdminThoughtsOutput> {}

export type UpdateAdminThoughtCurationInput = Readonly<{
  id: string;
  status?: "draft" | "published";
  featured?: boolean;
}>;

export type UpdateAdminThoughtCurationOutput = Readonly<{
  item: AdminThoughtCurationItem;
}>;

export interface UpdateAdminThoughtCurationPort
  extends UseCase<UpdateAdminThoughtCurationInput, UpdateAdminThoughtCurationOutput | null> {}

export type AdminProjectCurationItem = Readonly<{
  id: string;
  channel: string;
  title: string;
  slug: string;
  year: number;
  status: "live" | "archived" | "in-progress";
  featured: boolean;
  updatedAt: string;
}>;

export type ListAdminProjectsInput = Readonly<{
  page?: number;
  pageSize?: number;
  status?: "live" | "archived" | "in-progress";
  featured?: boolean;
  search?: string;
}>;

export type ListAdminProjectsOutput = Readonly<{
  items: readonly AdminProjectCurationItem[];
  pageInfo: Readonly<{
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;
}>;

export interface ListAdminProjectsPort
  extends UseCase<ListAdminProjectsInput, ListAdminProjectsOutput> {}

export type UpdateAdminProjectCurationInput = Readonly<{
  id: string;
  status?: "live" | "archived" | "in-progress";
  featured?: boolean;
}>;

export type UpdateAdminProjectCurationOutput = Readonly<{
  item: AdminProjectCurationItem;
}>;

export interface UpdateAdminProjectCurationPort
  extends UseCase<UpdateAdminProjectCurationInput, UpdateAdminProjectCurationOutput | null> {}

export type AdminPhotoCurationItem = Readonly<{
  id: string;
  frame: string;
  title: string;
  date: string;
  location: string;
  status: "draft" | "published";
  featured: boolean;
  tone: "amber" | "cyan" | "mono" | "sunset" | "violet";
  caption: string | null;
  camera: string | null;
  film: string | null;
  tags: readonly string[];
  updatedAt: string;
}>;

export type ListAdminPhotosInput = Readonly<{
  page?: number;
  pageSize?: number;
  status?: "draft" | "published";
  featured?: boolean;
  year?: number;
  location?: string;
  search?: string;
}>;

export type ListAdminPhotosOutput = Readonly<{
  items: readonly AdminPhotoCurationItem[];
  pageInfo: Readonly<{
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }>;
}>;

export interface ListAdminPhotosPort
  extends UseCase<ListAdminPhotosInput, ListAdminPhotosOutput> {}

export type UpdateAdminPhotoCurationInput = Readonly<{
  id: string;
  status?: "draft" | "published";
  featured?: boolean;
}>;

export type UpdateAdminPhotoCurationOutput = Readonly<{
  item: AdminPhotoCurationItem;
}>;

export interface UpdateAdminPhotoCurationPort
  extends UseCase<UpdateAdminPhotoCurationInput, UpdateAdminPhotoCurationOutput | null> {}

export type UpdateAdminPhotoMetadataInput = Readonly<{
  id: string;
  title?: string;
  frame?: string;
  date?: string;
  location?: string;
  tags?: readonly string[];
  tone?: "amber" | "cyan" | "mono" | "sunset" | "violet";
  caption?: string | null;
  camera?: string | null;
  film?: string | null;
}>;

export type UpdateAdminPhotoMetadataOutput = Readonly<{
  item: AdminPhotoCurationItem;
}>;

export interface UpdateAdminPhotoMetadataPort
  extends UseCase<UpdateAdminPhotoMetadataInput, UpdateAdminPhotoMetadataOutput | null> {}

export type AdminStatusStripEntry = Readonly<{
  id: string;
  label: string;
  value: string;
  accent?: "amber" | "cyan" | "pink";
  displayOrder: number;
}>;

export type ListAdminStatusStripEntriesOutput = Readonly<{
  items: readonly AdminStatusStripEntry[];
}>;

export interface ListAdminStatusStripEntriesPort
  extends UseCase<void, ListAdminStatusStripEntriesOutput> {}

export type ReplaceAdminStatusStripEntriesInput = Readonly<{
  items: readonly Readonly<{
    id?: string;
    label: string;
    value: string;
    accent?: "amber" | "cyan" | "pink";
    displayOrder: number;
  }>[];
}>;

export type ReplaceAdminStatusStripEntriesOutput = Readonly<{
  items: readonly AdminStatusStripEntry[];
}>;

export interface ReplaceAdminStatusStripEntriesPort
  extends UseCase<ReplaceAdminStatusStripEntriesInput, ReplaceAdminStatusStripEntriesOutput> {}
