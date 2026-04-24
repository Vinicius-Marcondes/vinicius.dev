import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";

import { createHonoHttpAdapter } from "./http-adapter";
import { presentThoughtsRssFeed } from "./rss-presenter";

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
      execute: async ({ limit }) => ({
        items: [
          {
            bodyPreview: "A homepage does not need to convert anyone.",
            excerpt: "The best personal websites feel less like products.",
            id: "thought_1",
            publishedAt: "2026-03-28",
            readingTime: "7 min",
            slug: "night-cable-interfaces",
            status: "published",
            tags: ["interface", "nostalgia"],
            title: `Night Cable Interfaces (${limit ?? 0})`,
            type: "essay",
          },
        ],
        pageInfo: {
          nextCursor: null,
        },
      }),
    },
  },
});

describe("rss routes", () => {
  it("serves an RSS XML feed from published Thoughts", async () => {
    const app = createHonoHttpAdapter(createTestContainer());
    const response = await app.request("https://vinicius.dev/api/rss");
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/rss+xml");
    expect(body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(body).toContain("<rss version=\"2.0\">");
    expect(body).toContain("<title>vinicius.dev Thoughts</title>");
    expect(body).toContain("<link>https://vinicius.dev/thoughts</link>");
    expect(body).toContain("<title>Night Cable Interfaces (24)</title>");
    expect(body).toContain("<link>https://vinicius.dev/thoughts/night-cable-interfaces</link>");
    expect(body).toContain("<pubDate>Sat, 28 Mar 2026 00:00:00 GMT</pubDate>");
    expect(body).toContain("<category>interface</category>");
  });

  it("escapes XML-sensitive values in feed fields", () => {
    const feed = presentThoughtsRssFeed({
      baseUrl: "https://vinicius.dev/",
      thoughts: [
        {
          bodyPreview: "preview",
          excerpt: "Use <tags> & quoted \"text\" safely.",
          id: "thought_1",
          publishedAt: "2026-04-01",
          readingTime: null,
          slug: "xml & feeds",
          status: "published",
          tags: ["rss & xml"],
          title: "RSS <Thoughts> & \"Notes\"",
          type: "note",
        },
      ],
    });

    expect(feed).toContain("RSS &lt;Thoughts&gt; &amp; &quot;Notes&quot;");
    expect(feed).toContain("Use &lt;tags&gt; &amp; quoted &quot;text&quot; safely.");
    expect(feed).toContain("rss &amp; xml");
    expect(feed).toContain("https://vinicius.dev/thoughts/xml%20%26%20feeds");
  });
});
