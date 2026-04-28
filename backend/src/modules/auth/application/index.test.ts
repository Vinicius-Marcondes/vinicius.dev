import { describe, expect, it } from "bun:test";

import {
  createInMemoryAuthRepository,
  createLoginWithCredentialsUseCase,
  createLogoutAdminSessionUseCase,
  createRefreshAdminSessionUseCase,
  createResolveAdminSessionUseCase,
  createVerifyMfaChallengeUseCase,
  InvalidAuthCredentialsError,
  InvalidAuthSessionError,
  MfaChallengeNotPendingError,
} from "./index";

const baseNow = new Date("2026-04-28T12:00:00.000Z");

const createTestRepository = () =>
  createInMemoryAuthRepository({
    clock: {
      now: () => baseNow,
    },
    findAdminUserByEmail: async (email) =>
      email === "admin@example.com"
        ? {
            createdAt: baseNow,
            email: "admin@example.com",
            id: "admin_1",
            passwordHash: "hash:correct-password",
            passwordHashAlgorithm: "mock",
            passwordHashParams: null,
            updatedAt: baseNow,
          }
        : null,
  });

const createTokenHasher = () => ({
  hash: async (value: string) => `hash:${value}`,
});

describe("auth login use case", () => {
  it("returns mfa_required when credentials are valid and MFA is enabled", async () => {
    const repository = createTestRepository();
    const sentCodes: string[] = [];
    const useCase = createLoginWithCredentialsUseCase({
      clock: {
        now: () => baseNow,
      },
      idGenerator: {
        create: () => "challenge_1",
      },
      mfaCodeGenerator: {
        create: () => "123456",
      },
      mfaCodeHasher: {
        hash: async (code) => `hashed:${code}`,
      },
      mfaCodeMaxAgeSeconds: 600,
      mfaMessage: {
        sendMfaChallenge: async ({ code }) => {
          sentCodes.push(code);
        },
      },
      passwordHasher: {
        verify: async ({ plainText, passwordHash }) => {
          return passwordHash === `hash:${plainText}`;
        },
      },
      repository,
      sessionMaxAgeSeconds: 3600,
      sessionTokenGenerator: {
        create: () => "session-token-1",
      },
      sessionTokenHasher: createTokenHasher(),
    });

    const result = await useCase.execute({
      email: "admin@example.com",
      password: "correct-password",
    });

    expect(result).toEqual({
      challenge: {
        delivery: "email",
        expiresAt: "2026-04-28T12:10:00.000Z",
        id: "challenge_1",
        maskedEmail: "ad***@example.com",
      },
      state: "mfa_required",
    });
    expect(sentCodes).toEqual(["123456"]);
    await expect(repository.findMfaChallengeById("challenge_1")).resolves.toMatchObject({
      codeHash: "hashed:123456",
      status: "pending",
    });
  });

  it("returns ready with a session when credentials are valid and MFA is disabled", async () => {
    const repository = createTestRepository();
    let sent = false;
    const useCase = createLoginWithCredentialsUseCase({
      clock: {
        now: () => baseNow,
      },
      mfaCodeMaxAgeSeconds: 600,
      mfaEnabled: false,
      mfaCodeHasher: {
        hash: async () => "unused",
      },
      mfaMessage: {
        sendMfaChallenge: async () => {
          sent = true;
        },
      },
      passwordHasher: {
        verify: async () => true,
      },
      repository,
      sessionMaxAgeSeconds: 3600,
      sessionTokenGenerator: {
        create: () => "session-token-2",
      },
      sessionTokenHasher: createTokenHasher(),
    });

    await expect(
      useCase.execute({
        email: "admin@example.com",
        password: "correct-password",
      }),
    ).resolves.toEqual({
      admin: {
        email: "admin@example.com",
        id: "admin_1",
      },
      session: {
        expiresAt: "2026-04-28T13:00:00.000Z",
        id: expect.stringContaining("session_"),
      },
      sessionToken: "session-token-2",
      state: "ready",
    });
    expect(sent).toBe(false);
  });

  it("rejects unknown users and invalid passwords with the same error", async () => {
    const repository = createTestRepository();
    const useCase = createLoginWithCredentialsUseCase({
      mfaCodeMaxAgeSeconds: 600,
      mfaCodeHasher: {
        hash: async () => "unused",
      },
      mfaMessage: {
        sendMfaChallenge: async () => {},
      },
      passwordHasher: {
        verify: async () => false,
      },
      repository,
      sessionMaxAgeSeconds: 3600,
      sessionTokenHasher: createTokenHasher(),
    });

    await expect(
      useCase.execute({
        email: "unknown@example.com",
        password: "secret",
      }),
    ).rejects.toBeInstanceOf(InvalidAuthCredentialsError);

    await expect(
      useCase.execute({
        email: "admin@example.com",
        password: "wrong-password",
      }),
    ).rejects.toBeInstanceOf(InvalidAuthCredentialsError);
  });
});

describe("auth MFA verify use case", () => {
  it("moves a pending challenge to ready when the code matches", async () => {
    const repository = createTestRepository();
    await repository.createMfaChallenge({
      adminEmail: "admin@example.com",
      adminUserId: "admin_1",
      codeHash: "hashed:123456",
      expiresAt: new Date("2026-04-28T12:10:00.000Z"),
      id: "challenge_1",
      sentAt: baseNow,
    });

    const useCase = createVerifyMfaChallengeUseCase({
      clock: {
        now: () => baseNow,
      },
      mfaCodeHasher: {
        verify: async ({ code, codeHash }) => codeHash === `hashed:${code}`,
      },
      repository,
      sessionMaxAgeSeconds: 3600,
      sessionTokenGenerator: {
        create: () => "session-token-3",
      },
      sessionTokenHasher: createTokenHasher(),
    });

    await expect(
      useCase.execute({
        challengeId: "challenge_1",
        code: "123456",
      }),
    ).resolves.toEqual({
      admin: {
        email: "admin@example.com",
        id: "admin_1",
      },
      session: {
        expiresAt: "2026-04-28T13:00:00.000Z",
        id: expect.stringContaining("session_"),
      },
      sessionToken: "session-token-3",
      state: "ready",
    });
    await expect(repository.findMfaChallengeById("challenge_1")).resolves.toMatchObject({
      status: "verified",
    });
  });

  it("rejects non-pending or expired challenges", async () => {
    const repository = createTestRepository();
    const useCase = createVerifyMfaChallengeUseCase({
      clock: {
        now: () => baseNow,
      },
      mfaCodeHasher: {
        verify: async () => true,
      },
      repository,
      sessionMaxAgeSeconds: 3600,
      sessionTokenHasher: createTokenHasher(),
    });

    await expect(
      useCase.execute({
        challengeId: "missing",
        code: "123456",
      }),
    ).rejects.toBeInstanceOf(MfaChallengeNotPendingError);

    await repository.createMfaChallenge({
      adminEmail: "admin@example.com",
      adminUserId: "admin_1",
      codeHash: "hashed:123456",
      expiresAt: new Date("2026-04-28T11:59:00.000Z"),
      id: "expired_1",
      sentAt: new Date("2026-04-28T11:50:00.000Z"),
    });

    await expect(
      useCase.execute({
        challengeId: "expired_1",
        code: "123456",
      }),
    ).rejects.toBeInstanceOf(MfaChallengeNotPendingError);
  });

  it("increments attempts and rejects invalid codes", async () => {
    const repository = createTestRepository();
    await repository.createMfaChallenge({
      adminEmail: "admin@example.com",
      adminUserId: "admin_1",
      codeHash: "hashed:123456",
      expiresAt: new Date("2026-04-28T12:10:00.000Z"),
      id: "challenge_2",
      sentAt: baseNow,
    });
    const useCase = createVerifyMfaChallengeUseCase({
      clock: {
        now: () => baseNow,
      },
      mfaCodeHasher: {
        verify: async () => false,
      },
      repository,
      sessionMaxAgeSeconds: 3600,
      sessionTokenHasher: createTokenHasher(),
    });

    await expect(
      useCase.execute({
        challengeId: "challenge_2",
        code: "000000",
      }),
    ).rejects.toBeInstanceOf(InvalidAuthCredentialsError);
    await expect(repository.findMfaChallengeById("challenge_2")).resolves.toMatchObject({
      attempts: 1,
      status: "pending",
    });
  });
});

describe("auth session lifecycle use cases", () => {
  it("resolves, refreshes, and logs out an active admin session", async () => {
    const repository = createTestRepository();

    const login = createLoginWithCredentialsUseCase({
      clock: {
        now: () => baseNow,
      },
      mfaCodeMaxAgeSeconds: 600,
      mfaEnabled: false,
      mfaCodeHasher: {
        hash: async () => "unused",
      },
      mfaMessage: {
        sendMfaChallenge: async () => {},
      },
      passwordHasher: {
        verify: async () => true,
      },
      repository,
      sessionMaxAgeSeconds: 3600,
      sessionTokenGenerator: {
        create: () => "session-token-current",
      },
      sessionTokenHasher: createTokenHasher(),
    });

    await login.execute({
      email: "admin@example.com",
      password: "correct-password",
    });

    const resolve = createResolveAdminSessionUseCase({
      clock: {
        now: () => baseNow,
      },
      repository,
      sessionTokenHasher: createTokenHasher(),
    });

    await expect(
      resolve.execute({
        sessionToken: "session-token-current",
      }),
    ).resolves.toEqual({
      admin: {
        email: "admin@example.com",
        id: "admin_1",
      },
      session: {
        expiresAt: "2026-04-28T13:00:00.000Z",
        id: expect.stringContaining("session_"),
      },
    });

    const refresh = createRefreshAdminSessionUseCase({
      clock: {
        now: () => baseNow,
      },
      repository,
      sessionMaxAgeSeconds: 3600,
      sessionTokenGenerator: {
        create: () => "session-token-next",
      },
      sessionTokenHasher: createTokenHasher(),
    });

    await expect(
      refresh.execute({
        sessionToken: "session-token-current",
      }),
    ).resolves.toEqual({
      admin: {
        email: "admin@example.com",
        id: "admin_1",
      },
      session: {
        expiresAt: "2026-04-28T13:00:00.000Z",
        id: expect.stringContaining("session_"),
      },
      sessionToken: "session-token-next",
      state: "ready",
    });

    const logout = createLogoutAdminSessionUseCase({
      clock: {
        now: () => baseNow,
      },
      repository,
      sessionTokenHasher: createTokenHasher(),
    });

    await expect(
      logout.execute({
        sessionToken: "session-token-next",
      }),
    ).resolves.toEqual({
      status: "revoked",
    });
  });

  it("rejects missing or invalid session tokens", async () => {
    const repository = createTestRepository();
    const resolve = createResolveAdminSessionUseCase({
      repository,
      sessionTokenHasher: createTokenHasher(),
    });

    await expect(resolve.execute({ sessionToken: "" })).rejects.toBeInstanceOf(
      InvalidAuthSessionError,
    );
    await expect(
      resolve.execute({ sessionToken: "missing-token" }),
    ).rejects.toBeInstanceOf(InvalidAuthSessionError);
  });
});
