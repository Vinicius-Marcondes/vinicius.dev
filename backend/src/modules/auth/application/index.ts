import { createHmac, randomBytes, randomInt } from "node:crypto";

import type {
  AuthReadyState,
  LoginWithCredentialsInput,
  LoginWithCredentialsOutput,
  LoginWithCredentialsPort,
  LogoutAdminSessionInput,
  LogoutAdminSessionOutput,
  LogoutAdminSessionPort,
  RefreshAdminSessionInput,
  RefreshAdminSessionOutput,
  RefreshAdminSessionPort,
  ResolveAdminSessionInput,
  ResolveAdminSessionOutput,
  ResolveAdminSessionPort,
  VerifyMfaChallengeInput,
  VerifyMfaChallengeOutput,
  VerifyMfaChallengePort,
} from "@/modules/auth/ports/inbound";
import type {
  AuthClockPort,
  AuthIdGeneratorPort,
  AuthMfaChallengeRepositoryRow,
  AuthMfaCodeGeneratorPort,
  AuthMfaMessagePort,
  AuthRepositoryPort,
  AuthSessionTokenGeneratorPort,
  MfaCodeHashPort,
  PasswordHashPort,
  SessionTokenHashPort,
} from "@/modules/auth/ports/outbound";

const DEFAULT_MFA_CODE_LENGTH = 6;
const DEFAULT_SESSION_TOKEN_BYTES = 32;

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const maskEmail = (value: string): string => {
  const [localPart, domainPart] = value.split("@");

  if (!localPart || !domainPart) {
    return "***";
  }

  const keep = Math.min(2, localPart.length);
  const visible = localPart.slice(0, keep);
  const hidden = "*".repeat(Math.max(3, localPart.length - keep));

  return `${visible}${hidden}@${domainPart}`;
};

const mapReadyState = (
  input: Readonly<{
    admin: Readonly<{
      id: string;
      email: string;
    }>;
    session: Readonly<{
      id: string;
      expiresAt: Date;
    }>;
    sessionToken: string;
  }>,
): AuthReadyState => ({
  state: "ready",
  admin: {
    id: input.admin.id,
    email: input.admin.email,
  },
  session: {
    id: input.session.id,
    expiresAt: input.session.expiresAt.toISOString(),
  },
  sessionToken: input.sessionToken,
});

const isPendingAndValidChallenge = (
  challenge: AuthMfaChallengeRepositoryRow,
  now: Date,
): boolean => {
  return challenge.status === "pending" && challenge.expiresAt.getTime() > now.getTime();
};

const createRandomDigitCode = (length: number = DEFAULT_MFA_CODE_LENGTH): string => {
  const digits: string[] = [];

  for (let index = 0; index < length; index += 1) {
    digits.push(String(randomInt(0, 10)));
  }

  return digits.join("");
};

export class InvalidAuthCredentialsError extends Error {
  constructor() {
    super("admin authentication credentials were rejected");
    this.name = "InvalidAuthCredentialsError";
  }
}

export class MfaChallengeNotPendingError extends Error {
  constructor() {
    super("mfa challenge is not pending");
    this.name = "MfaChallengeNotPendingError";
  }
}

export class InvalidAuthSessionError extends Error {
  constructor() {
    super("admin session is invalid");
    this.name = "InvalidAuthSessionError";
  }
}

type SessionIssueDependencies = Readonly<{
  clock: AuthClockPort;
  repository: Pick<AuthRepositoryPort, "createAdminSession">;
  sessionMaxAgeSeconds: number;
  sessionTokenGenerator: AuthSessionTokenGeneratorPort;
  sessionTokenHasher: SessionTokenHashPort;
}>;

const issueAdminSession = async (
  dependencies: SessionIssueDependencies,
  admin: Readonly<{
    id: string;
    email: string;
  }>,
): Promise<AuthReadyState> => {
  const issuedAt = dependencies.clock.now();
  const expiresAt = new Date(issuedAt.getTime() + dependencies.sessionMaxAgeSeconds * 1000);
  const sessionToken = dependencies.sessionTokenGenerator.create();
  const tokenHash = await dependencies.sessionTokenHasher.hash(sessionToken);
  const session = await dependencies.repository.createAdminSession({
    adminEmail: admin.email,
    adminUserId: admin.id,
    expiresAt,
    issuedAt,
    tokenHash,
  });

  return mapReadyState({
    admin,
    session: {
      expiresAt: session.expiresAt,
      id: session.id,
    },
    sessionToken,
  });
};

const requireActiveSession = async (
  dependencies: Readonly<{
    clock: AuthClockPort;
    repository: Pick<
      AuthRepositoryPort,
      "findAdminSessionByTokenHash" | "revokeAdminSessionById" | "touchAdminSessionLastSeen"
    >;
    sessionTokenHasher: SessionTokenHashPort;
  }>,
  sessionToken: string,
) => {
  const normalizedToken = sessionToken.trim();

  if (!normalizedToken) {
    throw new InvalidAuthSessionError();
  }

  const tokenHash = await dependencies.sessionTokenHasher.hash(normalizedToken);
  const now = dependencies.clock.now();
  const session = await dependencies.repository.findAdminSessionByTokenHash(tokenHash);

  if (!session || session.status !== "active") {
    throw new InvalidAuthSessionError();
  }

  if (session.expiresAt.getTime() <= now.getTime()) {
    await dependencies.repository.revokeAdminSessionById({
      revokedAt: now,
      sessionId: session.id,
    });
    throw new InvalidAuthSessionError();
  }

  await dependencies.repository.touchAdminSessionLastSeen({
    lastSeenAt: now,
    sessionId: session.id,
  });

  return session;
};

export type LoginWithCredentialsDependencies = Readonly<{
  mfaCodeMaxAgeSeconds: number;
  sessionMaxAgeSeconds: number;
  mfaEnabled?: boolean;
  repository: Pick<
    AuthRepositoryPort,
    "findAdminUserByEmail" | "createMfaChallenge" | "createAdminSession"
  >;
  passwordHasher: PasswordHashPort;
  mfaCodeHasher: Pick<MfaCodeHashPort, "hash">;
  mfaMessage: AuthMfaMessagePort;
  sessionTokenHasher: SessionTokenHashPort;
  clock?: AuthClockPort;
  idGenerator?: AuthIdGeneratorPort;
  mfaCodeGenerator?: AuthMfaCodeGeneratorPort;
  sessionTokenGenerator?: AuthSessionTokenGeneratorPort;
}>;

export type VerifyMfaChallengeDependencies = Readonly<{
  sessionMaxAgeSeconds: number;
  repository: Pick<
    AuthRepositoryPort,
    | "findMfaChallengeById"
    | "incrementMfaChallengeAttempts"
    | "markMfaChallengeExpired"
    | "markMfaChallengeVerified"
    | "createAdminSession"
  >;
  mfaCodeHasher: Pick<MfaCodeHashPort, "verify">;
  sessionTokenHasher: SessionTokenHashPort;
  clock?: AuthClockPort;
  sessionTokenGenerator?: AuthSessionTokenGeneratorPort;
}>;

export type ResolveAdminSessionDependencies = Readonly<{
  repository: Pick<
    AuthRepositoryPort,
    "findAdminSessionByTokenHash" | "revokeAdminSessionById" | "touchAdminSessionLastSeen"
  >;
  sessionTokenHasher: SessionTokenHashPort;
  clock?: AuthClockPort;
}>;

export type RefreshAdminSessionDependencies = Readonly<{
  sessionMaxAgeSeconds: number;
  repository: Pick<
    AuthRepositoryPort,
    | "findAdminSessionByTokenHash"
    | "revokeAdminSessionById"
    | "touchAdminSessionLastSeen"
    | "createAdminSession"
  >;
  sessionTokenHasher: SessionTokenHashPort;
  clock?: AuthClockPort;
  sessionTokenGenerator?: AuthSessionTokenGeneratorPort;
}>;

export type LogoutAdminSessionDependencies = Readonly<{
  repository: Pick<AuthRepositoryPort, "revokeAdminSessionByTokenHash">;
  sessionTokenHasher: SessionTokenHashPort;
  clock?: AuthClockPort;
}>;

export const createLoginWithCredentialsUseCase = ({
  mfaCodeMaxAgeSeconds,
  sessionMaxAgeSeconds,
  mfaEnabled = true,
  repository,
  passwordHasher,
  mfaCodeHasher,
  mfaMessage,
  sessionTokenHasher,
  clock = createSystemAuthClock(),
  idGenerator = createCryptoAuthIdGenerator(),
  mfaCodeGenerator = createRandomDigitMfaCodeGenerator(),
  sessionTokenGenerator = createCryptoSessionTokenGenerator(),
}: LoginWithCredentialsDependencies): LoginWithCredentialsPort => ({
  execute: async (
    input: LoginWithCredentialsInput,
  ): Promise<LoginWithCredentialsOutput> => {
    const normalizedEmail = normalizeEmail(input.email);
    const password = input.password.trim();

    if (!normalizedEmail || !password) {
      throw new InvalidAuthCredentialsError();
    }

    const admin = await repository.findAdminUserByEmail(normalizedEmail);

    if (!admin) {
      throw new InvalidAuthCredentialsError();
    }

    const isValidPassword = await passwordHasher.verify({
      passwordHash: admin.passwordHash,
      passwordHashAlgorithm: admin.passwordHashAlgorithm,
      passwordHashParams: admin.passwordHashParams,
      plainText: password,
    });

    if (!isValidPassword) {
      throw new InvalidAuthCredentialsError();
    }

    if (!mfaEnabled) {
      return issueAdminSession(
        {
          clock,
          repository,
          sessionMaxAgeSeconds,
          sessionTokenGenerator,
          sessionTokenHasher,
        },
        admin,
      );
    }

    const sentAt = clock.now();
    const expiresAt = new Date(sentAt.getTime() + mfaCodeMaxAgeSeconds * 1000);
    const challengeId = idGenerator.create();
    const code = mfaCodeGenerator.create();
    const codeHash = await mfaCodeHasher.hash(code);

    await repository.createMfaChallenge({
      adminEmail: admin.email,
      adminUserId: admin.id,
      codeHash,
      expiresAt,
      id: challengeId,
      sentAt,
    });

    await mfaMessage.sendMfaChallenge({
      adminEmail: admin.email,
      challengeId,
      code,
      expiresAt,
    });

    return {
      state: "mfa_required",
      challenge: {
        delivery: "email",
        expiresAt: expiresAt.toISOString(),
        id: challengeId,
        maskedEmail: maskEmail(admin.email),
      },
    };
  },
});

export const createVerifyMfaChallengeUseCase = ({
  sessionMaxAgeSeconds,
  repository,
  mfaCodeHasher,
  sessionTokenHasher,
  clock = createSystemAuthClock(),
  sessionTokenGenerator = createCryptoSessionTokenGenerator(),
}: VerifyMfaChallengeDependencies): VerifyMfaChallengePort => ({
  execute: async (
    input: VerifyMfaChallengeInput,
  ): Promise<VerifyMfaChallengeOutput> => {
    const challengeId = input.challengeId.trim();
    const code = input.code.trim();

    if (!challengeId || !code) {
      throw new InvalidAuthCredentialsError();
    }

    const challenge = await repository.findMfaChallengeById(challengeId);
    const now = clock.now();

    if (!challenge) {
      throw new MfaChallengeNotPendingError();
    }

    if (!isPendingAndValidChallenge(challenge, now)) {
      if (challenge.status === "pending" && challenge.expiresAt.getTime() <= now.getTime()) {
        await repository.markMfaChallengeExpired({
          challengeId,
          expiredAt: now,
        });
      }

      throw new MfaChallengeNotPendingError();
    }

    const isValidCode = await mfaCodeHasher.verify({
      code,
      codeHash: challenge.codeHash,
    });

    if (!isValidCode) {
      await repository.incrementMfaChallengeAttempts(challengeId);
      throw new InvalidAuthCredentialsError();
    }

    const verifiedChallenge = await repository.markMfaChallengeVerified({
      challengeId,
      verifiedAt: now,
    });

    if (!verifiedChallenge) {
      throw new MfaChallengeNotPendingError();
    }

    return issueAdminSession(
      {
        clock,
        repository,
        sessionMaxAgeSeconds,
        sessionTokenGenerator,
        sessionTokenHasher,
      },
      {
        email: verifiedChallenge.adminEmail,
        id: verifiedChallenge.adminUserId,
      },
    );
  },
});

export const createResolveAdminSessionUseCase = ({
  repository,
  sessionTokenHasher,
  clock = createSystemAuthClock(),
}: ResolveAdminSessionDependencies): ResolveAdminSessionPort => ({
  execute: async (
    input: ResolveAdminSessionInput,
  ): Promise<ResolveAdminSessionOutput> => {
    const session = await requireActiveSession(
      {
        clock,
        repository,
        sessionTokenHasher,
      },
      input.sessionToken,
    );

    return {
      admin: {
        email: session.adminEmail,
        id: session.adminUserId,
      },
      session: {
        expiresAt: session.expiresAt.toISOString(),
        id: session.id,
      },
    };
  },
});

export const createRefreshAdminSessionUseCase = ({
  sessionMaxAgeSeconds,
  repository,
  sessionTokenHasher,
  clock = createSystemAuthClock(),
  sessionTokenGenerator = createCryptoSessionTokenGenerator(),
}: RefreshAdminSessionDependencies): RefreshAdminSessionPort => ({
  execute: async (
    input: RefreshAdminSessionInput,
  ): Promise<RefreshAdminSessionOutput> => {
    const currentSession = await requireActiveSession(
      {
        clock,
        repository,
        sessionTokenHasher,
      },
      input.sessionToken,
    );
    const now = clock.now();

    await repository.revokeAdminSessionById({
      revokedAt: now,
      sessionId: currentSession.id,
    });

    return issueAdminSession(
      {
        clock,
        repository,
        sessionMaxAgeSeconds,
        sessionTokenGenerator,
        sessionTokenHasher,
      },
      {
        email: currentSession.adminEmail,
        id: currentSession.adminUserId,
      },
    );
  },
});

export const createLogoutAdminSessionUseCase = ({
  repository,
  sessionTokenHasher,
  clock = createSystemAuthClock(),
}: LogoutAdminSessionDependencies): LogoutAdminSessionPort => ({
  execute: async (
    input: LogoutAdminSessionInput,
  ): Promise<LogoutAdminSessionOutput> => {
    const sessionToken = input.sessionToken.trim();

    if (!sessionToken) {
      throw new InvalidAuthSessionError();
    }

    const tokenHash = await sessionTokenHasher.hash(sessionToken);
    const revoked = await repository.revokeAdminSessionByTokenHash({
      revokedAt: clock.now(),
      tokenHash,
    });

    if (!revoked) {
      throw new InvalidAuthSessionError();
    }

    return {
      status: "revoked",
    };
  },
});

export const createSystemAuthClock = (): AuthClockPort => ({
  now: () => new Date(),
});

export const createCryptoAuthIdGenerator = (): AuthIdGeneratorPort => ({
  create: () => crypto.randomUUID(),
});

export const createRandomDigitMfaCodeGenerator = (
  length: number = DEFAULT_MFA_CODE_LENGTH,
): AuthMfaCodeGeneratorPort => ({
  create: () => createRandomDigitCode(length),
});

export const createCryptoSessionTokenGenerator = (
  byteSize: number = DEFAULT_SESSION_TOKEN_BYTES,
): AuthSessionTokenGeneratorPort => ({
  create: () => randomBytes(byteSize).toString("base64url"),
});

export const createBunPasswordHashPort = (): PasswordHashPort => ({
  verify: async ({ plainText, passwordHash }) => {
    try {
      return await Bun.password.verify(plainText, passwordHash);
    } catch (_error) {
      return false;
    }
  },
});

export const createBunMfaCodeHashPort = (): MfaCodeHashPort => ({
  hash: async (code) => Bun.password.hash(code),
  verify: async ({ code, codeHash }) => {
    try {
      return await Bun.password.verify(code, codeHash);
    } catch (_error) {
      return false;
    }
  },
});

export const createHmacSessionTokenHashPort = (secret: string): SessionTokenHashPort => ({
  hash: async (token) => createHmac("sha256", secret).update(token).digest("hex"),
});

export const createNoopAuthMfaMessagePort = (): AuthMfaMessagePort => ({
  sendMfaChallenge: async () => {},
});

export type InMemoryAuthRepositoryDependencies = Readonly<{
  findAdminUserByEmail: (email: string) => Promise<{
    id: string;
    email: string;
    passwordHash: string;
    passwordHashAlgorithm: string;
    passwordHashParams: unknown | null;
    createdAt: Date;
    updatedAt: Date;
  } | null>;
  clock?: AuthClockPort;
}>;

export const createInMemoryAuthRepository = ({
  findAdminUserByEmail,
  clock = createSystemAuthClock(),
}: InMemoryAuthRepositoryDependencies): AuthRepositoryPort => {
  const challenges = new Map<string, AuthMfaChallengeRepositoryRow>();
  const sessions = new Map<string, {
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
  }>();

  const createSessionId = () => `session_${crypto.randomUUID()}`;

  const mapSession = (session: {
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
  }) => ({
    ...session,
  });

  return {
    findAdminUserByEmail,
    createMfaChallenge: async (input) => {
      const row: AuthMfaChallengeRepositoryRow = {
        adminEmail: input.adminEmail,
        adminUserId: input.adminUserId,
        attempts: 0,
        canceledAt: null,
        codeHash: input.codeHash,
        createdAt: input.sentAt,
        expiresAt: input.expiresAt,
        id: input.id,
        sentAt: input.sentAt,
        status: "pending",
        updatedAt: input.sentAt,
        verifiedAt: null,
      };

      challenges.set(row.id, row);

      return row;
    },
    findMfaChallengeById: async (challengeId) => {
      return challenges.get(challengeId) ?? null;
    },
    incrementMfaChallengeAttempts: async (challengeId) => {
      const challenge = challenges.get(challengeId);

      if (!challenge) {
        return;
      }

      challenges.set(challengeId, {
        ...challenge,
        attempts: challenge.attempts + 1,
        updatedAt: clock.now(),
      });
    },
    markMfaChallengeExpired: async ({ challengeId, expiredAt }) => {
      const challenge = challenges.get(challengeId);

      if (!challenge || challenge.status !== "pending") {
        return null;
      }

      const next: AuthMfaChallengeRepositoryRow = {
        ...challenge,
        status: "expired",
        updatedAt: expiredAt,
      };

      challenges.set(challengeId, next);

      return next;
    },
    markMfaChallengeVerified: async ({ challengeId, verifiedAt }) => {
      const challenge = challenges.get(challengeId);

      if (!challenge || challenge.status !== "pending") {
        return null;
      }

      const next: AuthMfaChallengeRepositoryRow = {
        ...challenge,
        status: "verified",
        updatedAt: verifiedAt,
        verifiedAt,
      };

      challenges.set(challengeId, next);

      return next;
    },
    createAdminSession: async (input) => {
      const now = clock.now();
      const row = {
        id: createSessionId(),
        adminUserId: input.adminUserId,
        adminEmail: input.adminEmail,
        tokenHash: input.tokenHash,
        status: "active" as const,
        issuedAt: input.issuedAt,
        expiresAt: input.expiresAt,
        revokedAt: null,
        lastSeenAt: null,
        createdAt: now,
        updatedAt: now,
      };

      sessions.set(row.id, row);

      return mapSession(row);
    },
    findAdminSessionByTokenHash: async (tokenHash) => {
      for (const session of sessions.values()) {
        if (session.tokenHash === tokenHash) {
          return mapSession(session);
        }
      }

      return null;
    },
    revokeAdminSessionByTokenHash: async ({ tokenHash, revokedAt }) => {
      for (const [sessionId, session] of sessions.entries()) {
        if (session.tokenHash !== tokenHash || session.status !== "active") {
          continue;
        }

        const next = {
          ...session,
          status: "revoked" as const,
          revokedAt,
          updatedAt: revokedAt,
        };

        sessions.set(sessionId, next);

        return mapSession(next);
      }

      return null;
    },
    revokeAdminSessionById: async ({ sessionId, revokedAt }) => {
      const session = sessions.get(sessionId);

      if (!session || session.status !== "active") {
        return null;
      }

      const next = {
        ...session,
        status: "revoked" as const,
        revokedAt,
        updatedAt: revokedAt,
      };

      sessions.set(sessionId, next);

      return mapSession(next);
    },
    touchAdminSessionLastSeen: async ({ sessionId, lastSeenAt }) => {
      const session = sessions.get(sessionId);

      if (!session) {
        return;
      }

      sessions.set(sessionId, {
        ...session,
        lastSeenAt,
        updatedAt: lastSeenAt,
      });
    },
  };
};
