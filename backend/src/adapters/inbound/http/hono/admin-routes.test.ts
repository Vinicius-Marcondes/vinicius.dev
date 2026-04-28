import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";
import { InvalidAdminPhotoMetadataDateError } from "@/modules/admin/application";
import { InvalidAuthSessionError } from "@/modules/auth/application";

import { createHonoHttpAdapter } from "./http-adapter";

const createAuthStub = (
  resolveSession: () => Promise<void>,
): NonNullable<BootstrapContainer["auth"]> => ({
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
    execute: async () => {
      await resolveSession();

      return {
        admin: {
          email: "admin@example.com",
          id: "admin_1",
        },
        session: {
          expiresAt: "2026-04-28T12:10:00.000Z",
          id: "session_1",
        },
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
});

const createTestContainer = (
  options: Readonly<{
    resolveDenied?: boolean;
    thoughtNotFound?: boolean;
  }> = {},
): BootstrapContainer => ({
  admin: {
    getDashboardSummary: {
      execute: async () => ({
        moderationCommands: ["delete_message", "ban_handle", "rotate_room_password"],
        panels: {
          chatFlags: 2,
          draftThoughts: 3,
          featuredSlots: 5,
          photoRecords: 24,
          statusStripEntries: 2,
        },
        queues: {
          content: [
            {
              channel: "TH-01",
              id: "thought_1",
              kind: "thought",
              suggestedActions: ["publish", "edit", "unpin"],
              title: "Night Cable Interfaces",
            },
          ],
        },
      }),
    },
    listPhotos: {
      execute: async () => ({
        items: [],
        pageInfo: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 1,
        },
      }),
    },
    listProjects: {
      execute: async () => ({
        items: [],
        pageInfo: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 1,
        },
      }),
    },
    listStatusStripEntries: {
      execute: async () => ({
        items: [
          {
            accent: "cyan",
            displayOrder: 1,
            id: "entry_1",
            label: "now",
            value: "building",
          },
        ],
      }),
    },
    listThoughts: {
      execute: async () => ({
        items: [],
        pageInfo: {
          page: 1,
          pageSize: 20,
          totalItems: 0,
          totalPages: 1,
        },
      }),
    },
    replaceStatusStripEntries: {
      execute: async () => ({
        items: [
          {
            accent: "cyan",
            displayOrder: 1,
            id: "entry_1",
            label: "now",
            value: "building",
          },
        ],
      }),
    },
    updatePhotoCuration: {
      execute: async () => null,
    },
    updatePhotoMetadata: {
      execute: async ({ date }) => {
        if (date === "not-a-date") {
          throw new InvalidAdminPhotoMetadataDateError();
        }

        return {
          item: {
            camera: "Canon",
            caption: "Night street frame.",
            date: "2026-03-22",
            featured: false,
            film: "digital",
            frame: "014",
            id: "photo_1",
            location: "Sao Paulo",
            status: "published",
            tags: ["night", "street"],
            title: "paulista at 02:14",
            tone: "sunset",
            updatedAt: "2026-04-28T12:00:00.000Z",
          },
        };
      },
    },
    updateProjectCuration: {
      execute: async () => null,
    },
    updateThoughtCuration: {
      execute: async () => {
        if (options.thoughtNotFound) {
          return null;
        }

        return {
          item: {
            featured: true,
            id: "thought_1",
            publishedAt: "2026-04-28",
            slug: "night-cable-interfaces",
            status: "published",
            title: "Night Cable Interfaces",
            type: "essay",
            updatedAt: "2026-04-28T12:00:00.000Z",
          },
        };
      },
    },
  },
  auth: createAuthStub(async () => {
    if (options.resolveDenied) {
      throw new InvalidAuthSessionError();
    }
  }),
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
});

describe("admin routes", () => {
  it("returns denied when admin session cookie is missing", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/admin/dashboard/summary");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "auth",
    });
  });

  it("returns dashboard summary for an authenticated session", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/admin/dashboard/summary", {
      headers: {
        cookie: "vinicius.dev-session=session-token-1",
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      panels: {
        chatFlags: 2,
        draftThoughts: 3,
      },
    });
  });

  it("returns denied when session resolution fails", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        resolveDenied: true,
      }),
    );

    const response = await app.request("/api/admin/dashboard/summary", {
      headers: {
        cookie: "vinicius.dev-session=bad-token",
      },
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "auth",
    });
  });

  it("rejects invalid thoughts query parameters", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request(
      "/api/admin/thoughts?status=invalid&featured=maybe&page=0",
      {
        headers: {
          cookie: "vinicius.dev-session=session-token-1",
        },
      },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_query",
      field: "page",
    });
  });

  it("returns not_found for unknown thought curation updates", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        thoughtNotFound: true,
      }),
    );

    const response = await app.request("/api/admin/thoughts/thought_1/curation", {
      body: JSON.stringify({ status: "published" }),
      headers: {
        "content-type": "application/json",
        cookie: "vinicius.dev-session=session-token-1",
      },
      method: "PATCH",
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "not_found",
      resource: "thought",
    });
  });

  it("maps invalid photo metadata date errors", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/admin/photos/photo_1/metadata", {
      body: JSON.stringify({ date: "not-a-date" }),
      headers: {
        "content-type": "application/json",
        cookie: "vinicius.dev-session=session-token-1",
      },
      method: "PATCH",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "date",
    });
  });

  it("rejects duplicate status-strip display orders", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/admin/status-strip", {
      body: JSON.stringify({
        items: [
          {
            displayOrder: 1,
            label: "now",
            value: "building",
          },
          {
            displayOrder: 1,
            label: "where",
            value: "sao paulo",
          },
        ],
      }),
      headers: {
        "content-type": "application/json",
        cookie: "vinicius.dev-session=session-token-1",
      },
      method: "PUT",
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "conflict",
      reason: "duplicate_display_order",
    });
  });

  it("replaces status-strip entries", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("/api/admin/status-strip", {
      body: JSON.stringify({
        items: [
          {
            accent: "cyan",
            displayOrder: 1,
            id: "entry_1",
            label: "now",
            value: "building",
          },
        ],
      }),
      headers: {
        "content-type": "application/json",
        cookie: "vinicius.dev-session=session-token-1",
      },
      method: "PUT",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [
        {
          accent: "cyan",
          displayOrder: 1,
          id: "entry_1",
          label: "now",
          value: "building",
        },
      ],
    });
  });
});
