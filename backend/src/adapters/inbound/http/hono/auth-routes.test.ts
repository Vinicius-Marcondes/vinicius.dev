import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";
import {
  InvalidAuthCredentialsError,
  MfaChallengeNotPendingError,
} from "@/modules/auth/application";

import { createHonoHttpAdapter } from "./http-adapter";

const createDefaultAuth = (): NonNullable<BootstrapContainer["auth"]> => ({
  loginWithCredentials: {
    execute: async () => ({
      challenge: {
        delivery: "email",
        expiresAt: "2026-04-28T12:10:00.000Z",
        id: "challenge_1",
        maskedEmail: "ad***@example.com",
      },
      state: "mfa_required",
    }),
  },
  logoutAdminSession: {
    execute: async () => ({
      status: "revoked",
    }),
  },
  refreshAdminSession: {
    execute: async () => ({
      admin: {
        email: "admin@example.com",
        id: "admin_1",
      },
      session: {
        expiresAt: "2026-04-28T12:10:00.000Z",
        id: "session_1",
      },
      sessionToken: "session-token-1",
      state: "ready",
    }),
  },
  resolveAdminSession: {
    execute: async () => ({
      admin: {
        email: "admin@example.com",
        id: "admin_1",
      },
      session: {
        expiresAt: "2026-04-28T12:10:00.000Z",
        id: "session_1",
      },
    }),
  },
  verifyMfaChallenge: {
    execute: async () => ({
      admin: {
        email: "admin@example.com",
        id: "admin_1",
      },
      session: {
        expiresAt: "2026-04-28T12:10:00.000Z",
        id: "session_1",
      },
      sessionToken: "session-token-1",
      state: "ready",
    }),
  },
});

const createTestContainer = (
  auth?: Partial<NonNullable<BootstrapContainer["auth"]>>,
): BootstrapContainer => {
  const base: BootstrapContainer = {
    chat: {
      moderateUploadRetention: {
        execute: async () => null,
      },
      openUploadMedia: {
        execute: async () => null,
      },
      uploadMessageWithImage: {
        execute: async () => ({
          attachment: {
            byteSize: 0,
            fileName: "upload.webp",
            id: "upload_1",
            kind: "image",
            mimeType: "image/webp",
          },
          authorHandleId: "handle_1",
          body: "uploaded an image without a caption",
          id: "message_1",
          sentAt: "2026-04-24T00:00:00.000Z",
          tone: null,
        }),
      },
    },
    config: {
      auth: {
        mfaCodeMaxAgeSeconds: 600,
        roomPasswordSecret: "test-room-secret",
        sessionCookieName: "vinicius.dev-session",
        sessionMaxAgeSeconds: 604800,
        sessionSecret: "test-session-secret",
      },
      cors: {
        allowCredentials: true,
        allowedOrigins: [],
      },
      media: {
        chatRoot: "/tmp/chat",
        chatUploadAllowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
        chatUploadMaxBytes: 5 * 1024 * 1024,
        chatUploadMaxFilesPerMessage: 1,
        photosRoot: "/tmp/photos",
        publicUrlBase: "/media",
      },
      server: {
        apiBasePath: "/api",
        mediaPhotoOriginalPath: "/media/photos/:id/original",
        nodeEnv: "test",
        port: 4000,
      },
    },
    content: {
      getPublishedProjectBySlug: {
        execute: async () => null,
      },
      getPublishedPhotoById: {
        execute: async () => null,
      },
      getPublishedThoughtBySlug: {
        execute: async () => null,
      },
      listPublishedPhotos: {
        execute: async () => ({
          items: [],
          pageInfo: {
            page: 1,
            pageSize: 24,
            totalItems: 0,
            totalPages: 1,
          },
        }),
      },
      listPublishedProjects: {
        execute: async () => ({
          items: [],
          pageInfo: {
            page: 1,
            pageSize: 12,
            totalItems: 0,
            totalPages: 1,
          },
        }),
      },
      listPublishedThoughts: {
        execute: async () => ({
          items: [],
          pageInfo: {
            nextCursor: null,
          },
        }),
      },
      listStatusStripEntries: {
        execute: async () => ({
          items: [],
        }),
      },
    },
    media: {
      repository: {
        findChatUploadMediaById: async () => null,
        findPhotoMediaById: async () => null,
      },
      storage: {
        chatUploads: {
          deleteUpload: async () => {},
          openUpload: async () => null,
          writeUpload: async () => ({
            byteSize: 0,
            storageKey: "test-upload",
            storagePath: "test-upload",
          }),
        },
        photos: {
          openOriginal: async () => null,
        },
      },
    },
  };

  const mergedAuth = auth
    ? {
        ...createDefaultAuth(),
        ...auth,
      }
    : undefined;

  return mergedAuth
    ? {
        ...base,
        auth: mergedAuth,
      }
    : base;
};

describe("auth routes", () => {
  it("maps login payload to the auth use case", async () => {
    let capturedEmail: string | undefined;
    let capturedPassword: string | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        loginWithCredentials: {
          execute: async ({ email, password }) => {
            capturedEmail = email;
            capturedPassword = password;

            return {
              challenge: {
                delivery: "email",
                expiresAt: "2026-04-28T12:10:00.000Z",
                id: "challenge_1",
                maskedEmail: "ad***@example.com",
              },
              state: "mfa_required",
            };
          },
        },
        verifyMfaChallenge: {
          execute: async () => ({
            admin: {
              email: "admin@example.com",
              id: "admin_1",
            },
            session: {
              expiresAt: "2026-04-28T12:10:00.000Z",
              id: "session_1",
            },
            sessionToken: "session-token-1",
            state: "ready",
          }),
        },
      }),
    );

    const response = await app.request("/api/auth/login", {
      body: JSON.stringify({
        email: "admin@example.com",
        password: "correct-password",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      challenge: {
        delivery: "email",
        expiresAt: "2026-04-28T12:10:00.000Z",
        id: "challenge_1",
        maskedEmail: "ad***@example.com",
      },
      state: "mfa_required",
    });
    expect(capturedEmail).toBe("admin@example.com");
    expect(capturedPassword).toBe("correct-password");
  });

  it("rejects malformed login payloads before invoking auth core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        loginWithCredentials: {
          execute: async () => {
            called = true;

            return {
              admin: {
                email: "admin@example.com",
                id: "admin_1",
              },
              session: {
                expiresAt: "2026-04-28T12:10:00.000Z",
                id: "session_1",
              },
              sessionToken: "session-token-1",
              state: "ready",
            };
          },
        },
        verifyMfaChallenge: {
          execute: async () => ({
            admin: {
              email: "admin@example.com",
              id: "admin_1",
            },
            session: {
              expiresAt: "2026-04-28T12:10:00.000Z",
              id: "session_1",
            },
            sessionToken: "session-token-1",
            state: "ready",
          }),
        },
      }),
    );

    const response = await app.request("/api/auth/login", {
      body: JSON.stringify({
        email: "admin@example.com",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "password",
    });
    expect(called).toBe(false);
  });

  it("maps denied login errors to 401", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        loginWithCredentials: {
          execute: async () => {
            throw new InvalidAuthCredentialsError();
          },
        },
        verifyMfaChallenge: {
          execute: async () => ({
            admin: {
              email: "admin@example.com",
              id: "admin_1",
            },
            session: {
              expiresAt: "2026-04-28T12:10:00.000Z",
              id: "session_1",
            },
            sessionToken: "session-token-1",
            state: "ready",
          }),
        },
      }),
    );

    const response = await app.request("/api/auth/login", {
      body: JSON.stringify({
        email: "admin@example.com",
        password: "wrong-password",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "auth",
    });
  });

  it("maps MFA verify payload and returns ready state", async () => {
    let capturedChallengeId: string | undefined;
    let capturedCode: string | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        loginWithCredentials: {
          execute: async () => ({
            challenge: {
              delivery: "email",
              expiresAt: "2026-04-28T12:10:00.000Z",
              id: "challenge_1",
              maskedEmail: "ad***@example.com",
            },
            state: "mfa_required",
          }),
        },
        verifyMfaChallenge: {
          execute: async ({ challengeId, code }) => {
            capturedChallengeId = challengeId;
            capturedCode = code;

            return {
              admin: {
                email: "admin@example.com",
                id: "admin_1",
              },
              session: {
                expiresAt: "2026-04-28T12:10:00.000Z",
                id: "session_1",
              },
              sessionToken: "session-token-1",
              state: "ready",
            };
          },
        },
      }),
    );

    const response = await app.request("/api/auth/mfa/verify", {
      body: JSON.stringify({
        challengeId: "challenge_1",
        code: "123456",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      admin: {
        email: "admin@example.com",
        id: "admin_1",
      },
      session: {
        expiresAt: "2026-04-28T12:10:00.000Z",
        id: "session_1",
      },
      state: "ready",
    });
    expect(capturedChallengeId).toBe("challenge_1");
    expect(capturedCode).toBe("123456");
  });

  it("rejects malformed MFA verify payloads", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        loginWithCredentials: {
          execute: async () => ({
            challenge: {
              delivery: "email",
              expiresAt: "2026-04-28T12:10:00.000Z",
              id: "challenge_1",
              maskedEmail: "ad***@example.com",
            },
            state: "mfa_required",
          }),
        },
        verifyMfaChallenge: {
          execute: async () => {
            called = true;

            return {
              admin: {
                email: "admin@example.com",
                id: "admin_1",
              },
              session: {
                expiresAt: "2026-04-28T12:10:00.000Z",
                id: "session_1",
              },
              sessionToken: "session-token-1",
              state: "ready",
            };
          },
        },
      }),
    );

    const response = await app.request("/api/auth/mfa/verify", {
      body: JSON.stringify({
        challengeId: "challenge_1",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "code",
    });
    expect(called).toBe(false);
  });

  it("maps non-pending challenge errors to 409", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        loginWithCredentials: {
          execute: async () => ({
            challenge: {
              delivery: "email",
              expiresAt: "2026-04-28T12:10:00.000Z",
              id: "challenge_1",
              maskedEmail: "ad***@example.com",
            },
            state: "mfa_required",
          }),
        },
        verifyMfaChallenge: {
          execute: async () => {
            throw new MfaChallengeNotPendingError();
          },
        },
      }),
    );

    const response = await app.request("/api/auth/mfa/verify", {
      body: JSON.stringify({
        challengeId: "challenge_1",
        code: "123456",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "challenge_not_pending",
      resource: "mfa_challenge",
    });
  });

  it("refreshes an admin session from cookie auth", async () => {
    const app = createHonoHttpAdapter(createTestContainer({}));
    const response = await app.request("/api/auth/session/refresh", {
      headers: {
        cookie: "vinicius.dev-session=session-token-1",
      },
      method: "POST",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      admin: {
        email: "admin@example.com",
        id: "admin_1",
      },
      session: {
        expiresAt: "2026-04-28T12:10:00.000Z",
        id: "session_1",
      },
      state: "ready",
    });
    expect(response.headers.get("set-cookie")).toContain("vinicius.dev-session=");
  });

  it("rejects session refresh when cookie is missing", async () => {
    const app = createHonoHttpAdapter(createTestContainer({}));
    const response = await app.request("/api/auth/session/refresh", {
      method: "POST",
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "auth",
    });
  });

  it("logs out and clears the auth cookie", async () => {
    const app = createHonoHttpAdapter(createTestContainer({}));
    const response = await app.request("/api/auth/logout", {
      headers: {
        cookie: "vinicius.dev-session=session-token-1",
      },
      method: "POST",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "revoked",
    });
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("keeps placeholder behavior when auth wiring is absent", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/auth", {
      method: "GET",
    });

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toMatchObject({
      family: "auth",
      route: "/api/auth",
      service: "vinicius.dev-backend",
      status: "not_implemented",
    });
  });
});
