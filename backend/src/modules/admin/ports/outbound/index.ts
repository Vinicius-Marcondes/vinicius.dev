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

export interface AdminRepositoryPort {
  findAdminUserByEmail(email: string): Promise<AdminUserRepositoryRow | null>;
  findAdminSessionByTokenHash(tokenHash: string): Promise<AdminSessionRepositoryRow | null>;
  findMfaChallengeById(challengeId: string): Promise<AdminMfaChallengeRepositoryRow | null>;
}
