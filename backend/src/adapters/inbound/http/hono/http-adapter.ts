import { extname } from "node:path";

import { Hono } from "hono";

import {
  InvalidChatUploadAccessError,
  InvalidChatUploadActorError,
} from "@/modules/chat/application";
import { InvalidThoughtCursorError } from "@/modules/content/application";
import type { ChatUploadMimeType } from "@/modules/chat/ports/inbound";
import type { BootstrapContainer } from "@/bootstrap/container";

import { presentThoughtsRssFeed } from "./rss-presenter";
import { presentSitemapXml } from "./sitemap-presenter";

const serviceName = "vinicius.dev-backend";
const defaultMediaContentType = "application/octet-stream";
const mediaContentTypeByExtension: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".webp": "image/webp",
};

type NotImplementedResponse = {
  family: string;
  method: string;
  route: string;
  service: string;
  status: "not_implemented";
};

const createNotImplementedFamily = (family: string) => {
  const familyApp = new Hono();

  familyApp.all("*", (c) =>
    c.json<NotImplementedResponse>(
      {
        family,
        method: c.req.method,
        route: c.req.path,
        service: serviceName,
        status: "not_implemented",
      },
      501,
    ),
  );

  return familyApp;
};

const mountPlaceholderFamily = (app: Hono, path: string, family: string) => {
  app.route(path, createNotImplementedFamily(family));
};

const parsePositiveInteger = (value: string | undefined): number | undefined => {
  if (typeof value === "undefined") {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
};

const inferMediaContentType = (absolutePath: string): string =>
  mediaContentTypeByExtension[extname(absolutePath).toLowerCase()] ?? defaultMediaContentType;

const parseThoughtQuery = (query: Record<string, string | undefined>) => {
  const type = query.type;

  if (type && type !== "essay" && type !== "note") {
    return {
      error: {
        error: "invalid_query",
        field: "type",
      },
    } as const;
  }

  const limit = parsePositiveInteger(query.limit);

  if (typeof query.limit !== "undefined" && typeof limit === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "limit",
      },
    } as const;
  }

  const tags = [query.tag, query.tags]
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  const normalizedType: "essay" | "note" | undefined =
    type === "essay" || type === "note" ? type : undefined;

  return {
    value: {
      cursor: query.cursor,
      limit,
      search: query.search,
      tags,
      type: normalizedType,
    },
  } as const;
};

const createThoughtsFamily = (container: BootstrapContainer) => {
  const thoughtsApp = new Hono();

  thoughtsApp.get("/", async (c) => {
    const parsed = parseThoughtQuery(c.req.query());

    if ("error" in parsed) {
      return c.json(parsed.error, 400);
    }

    try {
      const response = await container.content.listPublishedThoughts.execute(parsed.value);

      return c.json(response);
    } catch (error) {
      if (error instanceof InvalidThoughtCursorError) {
        return c.json(
          {
            error: "invalid_query",
            field: "cursor",
          },
          400,
        );
      }

      throw error;
    }
  });

  thoughtsApp.get("/:slug", async (c) => {
    const slug = c.req.param("slug")?.trim();

    if (!slug) {
      return c.json(
        {
          error: "invalid_path",
          field: "slug",
        },
        400,
      );
    }

    const thought = await container.content.getPublishedThoughtBySlug.execute({ slug });

    if (!thought) {
      return c.json(
        {
          error: "not_found",
          resource: "thought",
        },
        404,
      );
    }

    return c.json({ item: thought });
  });

  return thoughtsApp;
};

const parseProjectsQuery = (query: Record<string, string | undefined>) => {
  const status = query.status;

  if (status && status !== "live" && status !== "archived" && status !== "in-progress") {
    return {
      error: {
        error: "invalid_query",
        field: "status",
      },
    } as const;
  }

  const sort = query.sort;

  if (sort && sort !== "recent" && sort !== "alpha" && sort !== "channel") {
    return {
      error: {
        error: "invalid_query",
        field: "sort",
      },
    } as const;
  }

  const page = parsePositiveInteger(query.page);

  if (typeof query.page !== "undefined" && typeof page === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "page",
      },
    } as const;
  }

  const pageSize = parsePositiveInteger(query.pageSize);

  if (typeof query.pageSize !== "undefined" && typeof pageSize === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "pageSize",
      },
    } as const;
  }

  const tags = [query.tag, query.tags]
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  const normalizedStatus: "live" | "archived" | "in-progress" | undefined =
    status === "live" || status === "archived" || status === "in-progress"
      ? status
      : undefined;
  const normalizedSort: "recent" | "alpha" | "channel" | undefined =
    sort === "recent" || sort === "alpha" || sort === "channel" ? sort : undefined;

  return {
    value: {
      page,
      pageSize,
      search: query.search,
      sort: normalizedSort,
      status: normalizedStatus,
      tags,
    },
  } as const;
};

const createProjectsFamily = (container: BootstrapContainer) => {
  const projectsApp = new Hono();

  projectsApp.get("/", async (c) => {
    const parsed = parseProjectsQuery(c.req.query());

    if ("error" in parsed) {
      return c.json(parsed.error, 400);
    }

    const response = await container.content.listPublishedProjects.execute(parsed.value);

    return c.json(response);
  });

  projectsApp.get("/:slug", async (c) => {
    const slug = c.req.param("slug")?.trim();

    if (!slug) {
      return c.json(
        {
          error: "invalid_path",
          field: "slug",
        },
        400,
      );
    }

    const project = await container.content.getPublishedProjectBySlug.execute({ slug });

    if (!project) {
      return c.json(
        {
          error: "not_found",
          resource: "project",
        },
        404,
      );
    }

    return c.json({ item: project });
  });

  return projectsApp;
};

const parsePhotosQuery = (query: Record<string, string | undefined>) => {
  const page = parsePositiveInteger(query.page);

  if (typeof query.page !== "undefined" && typeof page === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "page",
      },
    } as const;
  }

  const pageSize = parsePositiveInteger(query.pageSize);

  if (typeof query.pageSize !== "undefined" && typeof pageSize === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "pageSize",
      },
    } as const;
  }

  const year = parsePositiveInteger(query.year);

  if (typeof query.year !== "undefined" && typeof year === "undefined") {
    return {
      error: {
        error: "invalid_query",
        field: "year",
      },
    } as const;
  }

  return {
    value: {
      location: query.location,
      page,
      pageSize,
      search: query.search,
      year,
    },
  } as const;
};

const createPhotosFamily = (container: BootstrapContainer) => {
  const photosApp = new Hono();

  photosApp.get("/", async (c) => {
    const parsed = parsePhotosQuery(c.req.query());

    if ("error" in parsed) {
      return c.json(parsed.error, 400);
    }

    const response = await container.content.listPublishedPhotos.execute(parsed.value);

    return c.json(response);
  });

  photosApp.get("/:id", async (c) => {
    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json(
        {
          error: "invalid_path",
          field: "id",
        },
        400,
      );
    }

    const photo = await container.content.getPublishedPhotoById.execute({ id });

    if (!photo) {
      return c.json(
        {
          error: "not_found",
          resource: "photo",
        },
        404,
      );
    }

    return c.json({ item: photo });
  });

  return photosApp;
};

const createRssFamily = (container: BootstrapContainer) => {
  const rssApp = new Hono();

  rssApp.get("/", async (c) => {
    const response = await container.content.listPublishedThoughts.execute({
      limit: 24,
    });
    const feed = presentThoughtsRssFeed({
      baseUrl: new URL(c.req.url).origin,
      thoughts: response.items,
    });

    return c.body(feed, 200, {
      "Content-Type": "application/rss+xml; charset=utf-8",
    });
  });

  return rssApp;
};

const createStatusStripFamily = (container: BootstrapContainer) => {
  const statusStripApp = new Hono();

  statusStripApp.get("/", async (c) => {
    const response = await container.content.listStatusStripEntries.execute();

    return c.json(response);
  });

  return statusStripApp;
};

const supportedChatUploadMimeTypes: readonly ChatUploadMimeType[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const isSupportedChatUploadMimeType = (value: string): value is ChatUploadMimeType => {
  return supportedChatUploadMimeTypes.includes(value as ChatUploadMimeType);
};

const getRequiredFormText = (
  formData: FormData,
  field: string,
): { error: { error: "invalid_request"; field: string } } | { value: string } => {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return {
      error: {
        error: "invalid_request",
        field,
      },
    };
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return {
      error: {
        error: "invalid_request",
        field,
      },
    };
  }

  return {
    value: trimmed,
  };
};

const getOptionalFormText = (formData: FormData, field: string): string | undefined => {
  const value = formData.get(field);

  if (typeof value !== "string") {
    return undefined;
  }

  return value;
};

const collectUploadFiles = (formData: FormData): File[] => {
  const files: File[] = [];

  for (const value of formData.values()) {
    if (typeof value !== "string") {
      files.push(value);
    }
  }

  return files;
};

const createChatFamily = (container: BootstrapContainer) => {
  const chatApp = new Hono();

  chatApp.get("/uploads/:id/media", async (c) => {
    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json(
        {
          error: "invalid_path",
          field: "id",
        },
        400,
      );
    }

    const roomSessionId = c.req.header("x-chat-room-session-id")?.trim();

    if (!roomSessionId) {
      return c.json(
        {
          error: "invalid_request",
          field: "x-chat-room-session-id",
        },
        400,
      );
    }

    let upload;

    try {
      upload = await container.chat.openUploadMedia.execute({
        roomSessionId,
        uploadId: id,
      });
    } catch (error) {
      if (error instanceof InvalidChatUploadAccessError) {
        return c.json(
          {
            error: "denied",
            resource: "chat",
          },
          403,
        );
      }

      throw error;
    }

    if (!upload) {
      return c.json(
        {
          error: "not_found",
          resource: "chat_upload",
        },
        404,
      );
    }

    return c.body(upload.stream, 200, {
      "Cache-Control": "private, no-store",
      "Content-Length": String(upload.byteSize),
      "Content-Type": upload.mimeType,
      Vary: "x-chat-room-session-id",
    });
  });

  chatApp.post("/messages/upload", async (c) => {
    let formData: FormData;

    try {
      formData = await c.req.formData();
    } catch (_error) {
      return c.json(
        {
          error: "invalid_request",
          field: "formData",
        },
        400,
      );
    }

    const roomId = getRequiredFormText(formData, "roomId");

    if ("error" in roomId) {
      return c.json(roomId.error, 400);
    }

    const roomSessionId = getRequiredFormText(formData, "roomSessionId");

    if ("error" in roomSessionId) {
      return c.json(roomSessionId.error, 400);
    }

    const authorHandleId = getRequiredFormText(formData, "authorHandleId");

    if ("error" in authorHandleId) {
      return c.json(authorHandleId.error, 400);
    }

    const toneInput = getOptionalFormText(formData, "tone")?.trim();

    if (
      toneInput &&
      toneInput !== "cyan" &&
      toneInput !== "pink" &&
      toneInput !== "system"
    ) {
      return c.json(
        {
          error: "invalid_request",
          field: "tone",
        },
        400,
      );
    }

    const tone: "cyan" | "pink" | "system" | null =
      toneInput === "cyan" || toneInput === "pink" || toneInput === "system"
        ? toneInput
        : null;

    const files = collectUploadFiles(formData);

    if (files.length === 0) {
      return c.json(
        {
          error: "invalid_upload",
          field: "file",
          reason: "missing_file",
        },
        400,
      );
    }

    if (files.length > container.config.media.chatUploadMaxFilesPerMessage) {
      return c.json(
        {
          error: "invalid_upload",
          field: "file",
          reason: "too_many_files",
        },
        400,
      );
    }

    const uploadFile = files[0];
    const mimeType = uploadFile.type.trim().toLowerCase();

    if (!isSupportedChatUploadMimeType(mimeType)) {
      return c.json(
        {
          error: "invalid_upload",
          field: "file",
          reason: "unsupported_mime_type",
        },
        400,
      );
    }

    if (!container.config.media.chatUploadAllowedMimeTypes.includes(mimeType)) {
      return c.json(
        {
          error: "invalid_upload",
          field: "file",
          reason: "unsupported_mime_type",
        },
        400,
      );
    }

    if (uploadFile.size > container.config.media.chatUploadMaxBytes) {
      return c.json(
        {
          error: "invalid_upload",
          field: "file",
          reason: "file_too_large",
        },
        413,
      );
    }

    let result;

    try {
      result = await container.chat.uploadMessageWithImage.execute({
        authorHandleId: authorHandleId.value,
        body: getOptionalFormText(formData, "body"),
        image: {
          body: new Uint8Array(await uploadFile.arrayBuffer()),
          displayFilename: uploadFile.name.trim() || "upload",
          mimeType,
        },
        roomId: roomId.value,
        roomSessionId: roomSessionId.value,
        tone,
      });
    } catch (error) {
      if (error instanceof InvalidChatUploadActorError) {
        return c.json(
          {
            error: "denied",
            resource: "chat",
          },
          403,
        );
      }

      throw error;
    }

    return c.json(
      {
        item: result,
      },
      201,
    );
  });

  chatApp.all("*", (c) =>
    c.json<NotImplementedResponse>(
      {
        family: "chat",
        method: c.req.method,
        route: c.req.path,
        service: serviceName,
        status: "not_implemented",
      },
      501,
    ),
  );

  return chatApp;
};

const createSitemapFamily = () => {
  const sitemapApp = new Hono();

  sitemapApp.get("/", (c) => {
    const sitemap = presentSitemapXml({
      baseUrl: new URL(c.req.url).origin,
      paths: ["/", "/thoughts", "/projects", "/photos", "/chat"],
    });

    return c.body(sitemap, 200, {
      "Content-Type": "application/xml; charset=utf-8",
    });
  });

  return sitemapApp;
};

export const createHonoHttpAdapter = (container: BootstrapContainer) => {
  const app = new Hono();

  app.get("/api", (c) =>
    c.json({
      route: "/api",
      service: serviceName,
      status: "ok",
      surface: "hono-http-adapter-shell",
    }),
  );

  app.route("/api/thoughts", createThoughtsFamily(container));
  app.route("/api/projects", createProjectsFamily(container));
  app.route("/api/photos", createPhotosFamily(container));
  app.route("/api/rss", createRssFamily(container));
  app.route("/api/sitemap", createSitemapFamily());
  app.route("/api/status-strip", createStatusStripFamily(container));
  app.route("/api/chat", createChatFamily(container));
  mountPlaceholderFamily(app, "/api/admin", "admin");
  mountPlaceholderFamily(app, "/api/auth", "auth");

  app.get(container.config.server.mediaPhotoOriginalPath, async (c) => {
    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json(
        {
          error: "invalid_path",
          field: "id",
        },
        400,
      );
    }

    const photoMedia = await container.media.repository.findPhotoMediaById(id);

    if (!photoMedia) {
      return c.json(
        {
          error: "not_found",
          resource: "photo",
        },
        404,
      );
    }

    const publishedPhoto = await container.content.getPublishedPhotoById.execute({ id });

    if (!publishedPhoto) {
      return c.json(
        {
          error: "denied",
          resource: "photo",
        },
        403,
      );
    }

    const originalMedia = await container.media.storage.photos.openOriginal(
      photoMedia.originalReference,
    );

    if (!originalMedia) {
      return c.json(
        {
          error: "not_found",
          resource: "photo",
        },
        404,
      );
    }

    return c.body(originalMedia.stream, 200, {
      "Content-Length": String(originalMedia.byteSize),
      "Content-Type": inferMediaContentType(originalMedia.absolutePath),
    });
  });

  return app;
};
