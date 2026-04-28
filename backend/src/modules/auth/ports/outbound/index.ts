export type AuthAdminUserRepositoryRow = Readonly<{
  id: string;
  email: string;
  passwordHash: string;
  passwordHashAlgorithm: string;
  passwordHashParams: unknown | null;
  createdAt: Date;
  updatedAt: Date;
}>;

export type AuthMfaChallengeRepositoryRow = Readonly<{
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

export type AuthAdminSessionRepositoryRow = Readonly<{
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

export type CreateAuthMfaChallengeCommand = Readonly<{
  id: string;
  adminUserId: string;
  adminEmail: string;
  codeHash: string;
  sentAt: Date;
  expiresAt: Date;
}>;

export type MarkAuthMfaChallengeVerifiedCommand = Readonly<{
  challengeId: string;
  verifiedAt: Date;
}>;

export type MarkAuthMfaChallengeExpiredCommand = Readonly<{
  challengeId: string;
  expiredAt: Date;
}>;

export type CreateAuthAdminSessionCommand = Readonly<{
  adminUserId: string;
  adminEmail: string;
  tokenHash: string;
  issuedAt: Date;
  expiresAt: Date;
}>;

export type RevokeAuthAdminSessionByTokenHashCommand = Readonly<{
  tokenHash: string;
  revokedAt: Date;
}>;

export type RevokeAuthAdminSessionByIdCommand = Readonly<{
  sessionId: string;
  revokedAt: Date;
}>;

export type TouchAuthAdminSessionLastSeenCommand = Readonly<{
  sessionId: string;
  lastSeenAt: Date;
}>;

export interface AuthRepositoryPort {
  findAdminUserByEmail(email: string): Promise<AuthAdminUserRepositoryRow | null>;
  createMfaChallenge(input: CreateAuthMfaChallengeCommand): Promise<AuthMfaChallengeRepositoryRow>;
  findMfaChallengeById(challengeId: string): Promise<AuthMfaChallengeRepositoryRow | null>;
  incrementMfaChallengeAttempts(challengeId: string): Promise<void>;
  markMfaChallengeVerified(
    input: MarkAuthMfaChallengeVerifiedCommand,
  ): Promise<AuthMfaChallengeRepositoryRow | null>;
  markMfaChallengeExpired(
    input: MarkAuthMfaChallengeExpiredCommand,
  ): Promise<AuthMfaChallengeRepositoryRow | null>;
  createAdminSession(input: CreateAuthAdminSessionCommand): Promise<AuthAdminSessionRepositoryRow>;
  findAdminSessionByTokenHash(tokenHash: string): Promise<AuthAdminSessionRepositoryRow | null>;
  revokeAdminSessionByTokenHash(
    input: RevokeAuthAdminSessionByTokenHashCommand,
  ): Promise<AuthAdminSessionRepositoryRow | null>;
  revokeAdminSessionById(
    input: RevokeAuthAdminSessionByIdCommand,
  ): Promise<AuthAdminSessionRepositoryRow | null>;
  touchAdminSessionLastSeen(input: TouchAuthAdminSessionLastSeenCommand): Promise<void>;
}

export type VerifyPasswordHashInput = Readonly<{
  plainText: string;
  passwordHash: string;
  passwordHashAlgorithm: string;
  passwordHashParams: unknown | null;
}>;

export interface PasswordHashPort {
  verify(input: VerifyPasswordHashInput): Promise<boolean>;
}

export type VerifyMfaCodeHashInput = Readonly<{
  code: string;
  codeHash: string;
}>;

export interface MfaCodeHashPort {
  hash(code: string): Promise<string>;
  verify(input: VerifyMfaCodeHashInput): Promise<boolean>;
}

export interface SessionTokenHashPort {
  hash(token: string): Promise<string>;
}

export type SendMfaChallengeMessageInput = Readonly<{
  adminEmail: string;
  code: string;
  challengeId: string;
  expiresAt: Date;
}>;

export interface AuthMfaMessagePort {
  sendMfaChallenge(input: SendMfaChallengeMessageInput): Promise<void>;
}

export interface AuthClockPort {
  now(): Date;
}

export interface AuthIdGeneratorPort {
  create(): string;
}

export interface AuthMfaCodeGeneratorPort {
  create(): string;
}

export interface AuthSessionTokenGeneratorPort {
  create(): string;
}
