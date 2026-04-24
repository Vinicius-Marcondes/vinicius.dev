import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";

import { createHonoHttpAdapter } from "./http-adapter";
import { presentSitemapXml } from "./sitemap-presenter";

const createTestContainer = (): BootstrapContainer => ({
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
    getPublishedPhotoById: {
      execute: async () => null,
    },
    getPublishedProjectBySlug: {
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

describe("sitemap routes", () => {
  it("serves an XML sitemap for the stable public pages", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("https://vinicius.dev/api/sitemap");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/xml");
    expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(body).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(body).toContain("<loc>https://vinicius.dev/</loc>");
    expect(body).toContain("<loc>https://vinicius.dev/thoughts</loc>");
    expect(body).toContain("<loc>https://vinicius.dev/projects</loc>");
    expect(body).toContain("<loc>https://vinicius.dev/photos</loc>");
    expect(body).toContain("<loc>https://vinicius.dev/chat</loc>");
    expect(body).not.toContain("/admin");
    expect(body).not.toContain("/api");
    expect(body).not.toContain("/media");
  });

  it("escapes XML-sensitive characters in sitemap URLs", () => {
    const sitemap = presentSitemapXml({
      baseUrl: "https://vinicius.dev",
      paths: ["/chat?ref=a&b=c"],
    });

    expect(sitemap).toContain("https://vinicius.dev/chat?ref=a&amp;b=c");
  });
});
