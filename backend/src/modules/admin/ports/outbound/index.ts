export type AdminUserRepositoryRow = Readonly<{
  id: string;
  email: string;
  passwordHash: string;
  passwordHashAlgorithm: string;
  passwordHashParams: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type AdminSessionRepositoryRow = Readonly<{
  id: string;
  adminUserId: string;
  adminEmail: string;
  tokenHash: string;
  status: "active" | "revoked" | "expired";
  issuedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type AdminMfaChallengeRepositoryRow = Readonly<{
  id: string;
  adminUserId: string;
  adminEmail: string;
  codeHash: string;
  status: "pending" | "verified" | "expired" | "canceled";
  sentAt: Date;
  expiresAt: Date;
  verifiedAt: Date | null;
  canceledAt: Date | null;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}>;

export type CreateAdminMfaChallengeCommand = Readonly<{
  id: string;
  adminUserId: string;
  adminEmail: string;
  codeHash: string;
  sentAt: Date;
  expiresAt: Date;
}>;

export type MarkAdminMfaChallengeVerifiedCommand = Readonly<{
  challengeId: string;
  verifiedAt: Date;
}>;

export type MarkAdminMfaChallengeExpiredCommand = Readonly<{
  challengeId: string;
  expiredAt: Date;
}>;

export type CreateAdminSessionCommand = Readonly<{
  adminUserId: string;
  adminEmail: string;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
}>;

export type RevokeAdminSessionByTokenHashCommand = Readonly<{
  tokenHash: string;
  revokedAt: Date;
}>;

export type RevokeAdminSessionByIdCommand = Readonly<{
  sessionId: string;
  revokedAt: Date;
}>;

export type TouchAdminSessionLastSeenCommand = Readonly<{
  sessionId: string;
  lastSeenAt: Date;
}>;

export type AdminDashboardQueueItemRepositoryRow = Readonly<{
  kind: "thought" | "project" | "photo";
  id: string;
  channel: string;
  title: string;
}>;

export type AdminDashboardSummaryRepositoryRow = Readonly<{
  draftThoughts: number;
  featuredSlots: number;
  photoRecords: number;
  chatFlags: number;
  statusStripEntries: number;
  queue: readonly AdminDashboardQueueItemRepositoryRow[];
}>;

export type AdminThoughtCurationRow = Readonly<{
  id: string;
  title: string;
  slug: string;
  type: "essay" | "note";
  status: "draft" | "published";
  featured: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
}>;

export type AdminThoughtCurationListQuery = Readonly<{
  page: number;
  pageSize: number;
  status?: "draft" | "published";
  featured?: boolean;
  search?: string;
  type?: "essay" | "note";
}>;

export type AdminThoughtCurationListPage = Readonly<{
  items: readonly AdminThoughtCurationRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}>;

export type UpdateAdminThoughtCurationCommand = Readonly<{
  id: string;
  status?: "draft" | "published";
  featured?: boolean;
}>;

export type AdminProjectCurationRow = Readonly<{
  id: string;
  channel: string;
  title: string;
  slug: string;
  year: number;
  status: "live" | "archived" | "in-progress";
  featured: boolean;
  updatedAt: Date;
}>;

export type AdminProjectCurationListQuery = Readonly<{
  page: number;
  pageSize: number;
  status?: "live" | "archived" | "in-progress";
  featured?: boolean;
  search?: string;
}>;

export type AdminProjectCurationListPage = Readonly<{
  items: readonly AdminProjectCurationRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}>;

export type UpdateAdminProjectCurationCommand = Readonly<{
  id: string;
  status?: "live" | "archived" | "in-progress";
  featured?: boolean;
}>;

export type AdminPhotoCurationRow = Readonly<{
  id: string;
  frame: string;
  title: string;
  date: Date;
  location: string;
  status: "draft" | "published";
  featured: boolean;
  tone: "amber" | "cyan" | "mono" | "sunset" | "violet";
  caption: string | null;
  camera: string | null;
  film: string | null;
  tags: readonly string[];
  updatedAt: Date;
}>;

export type AdminPhotoCurationListQuery = Readonly<{
  page: number;
  pageSize: number;
  status?: "draft" | "published";
  featured?: boolean;
  year?: number;
  location?: string;
  search?: string;
}>;

export type AdminPhotoCurationListPage = Readonly<{
  items: readonly AdminPhotoCurationRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}>;

export type UpdateAdminPhotoCurationCommand = Readonly<{
  id: string;
  status?: "draft" | "published";
  featured?: boolean;
}>;

export type UpdateAdminPhotoMetadataCommand = Readonly<{
  id: string;
  title?: string;
  frame?: string;
  date?: Date;
  location?: string;
  tags?: readonly string[];
  tone?: "amber" | "cyan" | "mono" | "sunset" | "violet";
  caption?: string | null;
  camera?: string | null;
  film?: string | null;
}>;

export type AdminStatusStripEntryRepositoryRow = Readonly<{
  id: string;
  label: string;
  value: string;
  accent: "amber" | "cyan" | "pink" | null;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ReplaceAdminStatusStripEntryInput = Readonly<{
  id?: string;
  label: string;
  value: string;
  accent?: "amber" | "cyan" | "pink" | null;
  displayOrder: number;
}>;

export interface AdminRepositoryPort {
  findAdminUserByEmail(email: string): Promise<AdminUserRepositoryRow | null>;
  createMfaChallenge(input: CreateAdminMfaChallengeCommand): Promise<AdminMfaChallengeRepositoryRow>;
  findMfaChallengeById(challengeId: string): Promise<AdminMfaChallengeRepositoryRow | null>;
  incrementMfaChallengeAttempts(challengeId: string): Promise<void>;
  markMfaChallengeVerified(
    input: MarkAdminMfaChallengeVerifiedCommand,
  ): Promise<AdminMfaChallengeRepositoryRow | null>;
  markMfaChallengeExpired(
    input: MarkAdminMfaChallengeExpiredCommand,
  ): Promise<AdminMfaChallengeRepositoryRow | null>;
  createAdminSession(input: CreateAdminSessionCommand): Promise<AdminSessionRepositoryRow>;
  findAdminSessionByTokenHash(tokenHash: string): Promise<AdminSessionRepositoryRow | null>;
  revokeAdminSessionByTokenHash(
    input: RevokeAdminSessionByTokenHashCommand,
  ): Promise<AdminSessionRepositoryRow | null>;
  revokeAdminSessionById(
    input: RevokeAdminSessionByIdCommand,
  ): Promise<AdminSessionRepositoryRow | null>;
  touchAdminSessionLastSeen(input: TouchAdminSessionLastSeenCommand): Promise<void>;
  readDashboardSummary(): Promise<AdminDashboardSummaryRepositoryRow>;
  listThoughtsForCuration(query: AdminThoughtCurationListQuery): Promise<AdminThoughtCurationListPage>;
  updateThoughtCuration(input: UpdateAdminThoughtCurationCommand): Promise<AdminThoughtCurationRow | null>;
  listProjectsForCuration(query: AdminProjectCurationListQuery): Promise<AdminProjectCurationListPage>;
  updateProjectCuration(input: UpdateAdminProjectCurationCommand): Promise<AdminProjectCurationRow | null>;
  listPhotosForCuration(query: AdminPhotoCurationListQuery): Promise<AdminPhotoCurationListPage>;
  updatePhotoCuration(input: UpdateAdminPhotoCurationCommand): Promise<AdminPhotoCurationRow | null>;
  updatePhotoMetadata(input: UpdateAdminPhotoMetadataCommand): Promise<AdminPhotoCurationRow | null>;
  listStatusStripEntriesForAdmin(): Promise<readonly AdminStatusStripEntryRepositoryRow[]>;
  replaceStatusStripEntries(
    entries: readonly ReplaceAdminStatusStripEntryInput[],
  ): Promise<readonly AdminStatusStripEntryRepositoryRow[]>;
}
