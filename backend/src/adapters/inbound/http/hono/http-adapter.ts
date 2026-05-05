import { extname } from "node:path";

import { Hono, type Context } from "hono";
import { upgradeWebSocket } from "hono/bun";
import { cors } from "hono/cors";

import {
  InvalidAuthCredentialsError,
  InvalidAuthSessionError,
  MfaChallengeNotPendingError,
} from "@/modules/auth/application";
import { InvalidAdminPhotoMetadataDateError } from "@/modules/admin/application";
import {
  BannedChatHandleError,
  InvalidChatMessageAccessError,
  InvalidChatModerationAuditCursorError,
  InvalidChatMessageCursorError,
  InvalidChatParticipantAccessError,
  InvalidChatRoomCredentialsError,
  InvalidChatRoomSessionError,
  InvalidChatUploadAccessError,
  InvalidChatUploadActorError,
} from "@/modules/chat/application";
import { InvalidThoughtCursorError } from "@/modules/content/application";
import type {
  BanChatRoomHandlePort,
  ChatRoomMessageOutput,
  ChatRoomParticipantOutput,
  ChatUploadMimeType,
  GetChatRoomAccessPort,
  ListChatModerationAuditsPort,
  ListChatRoomMessagesPort,
  ModerateChatRoomMessagePort,
  ResolveChatRoomSessionPort,
  RotateChatRoomPasswordPort,
  SendChatRoomTextMessagePort,
} from "@/modules/chat/ports/inbound";
import type { ReplaceAdminStatusStripEntriesInput } from "@/modules/admin/ports/inbound";
import type { BootstrapContainer } from "@/bootstrap/container";

import { presentThoughtsRssFeed } from "./rss-presenter";
import { presentSitemapXml } from "./sitemap-presenter";
import { parseChatLiveWebSocketHandshake } from "./chat-live-contract";

const serviceName = "vinicius.dev-backend";
const defaultMediaContentType = "application/octet-stream";
const corsAllowMethods = [
  "GET",
  "POST",
  "PATCH",
  "PUT",
  "DELETE",
  "OPTIONS",
] as const;
const corsAllowHeaders = ["Content-Type", "x-chat-room-session-id"] as const;
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

type ChatLiveSocket = Readonly<{
  close: (code?: number, reason?: string) => void;
  send: (data: string) => void;
}>;

type ChatLiveEvent =
  | Readonly<{
      item: ChatRoomMessageOutput;
      type: "message.created";
    }>
  | Readonly<{
      items: readonly ChatRoomParticipantOutput[];
      type: "participant.snapshot";
    }>
  | Readonly<{
      reason: "room_password_rotation";
      type: "session.revoked";
    }>;

type ChatLiveConnection = Readonly<{
  roomId: string;
  roomSessionId: string;
  roomSlug: string;
  socket: ChatLiveSocket;
}>;

type RateLimitRule = Readonly<{
  maxRequests: number;
  windowMs: number;
}>;

type RateLimitWindow = Readonly<{
  count: number;
  resetAt: number;
}>;

const rateLimitRules = {
  authLogin: { maxRequests: 5, windowMs: 60_000 },
  authMfaVerify: { maxRequests: 10, windowMs: 60_000 },
  chatJoin: { maxRequests: 10, windowMs: 60_000 },
  chatSendMessage: { maxRequests: 30, windowMs: 60_000 },
  chatUpload: { maxRequests: 10, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitRule>;

const createChatLiveManager = () => {
  const connectionsByRoomSlug = new Map<string, Map<string, ChatLiveConnection>>();
  const roomSlugByRoomId = new Map<string, string>();

  const getRoomConnections = (roomSlug: string) => {
    const existing = connectionsByRoomSlug.get(roomSlug);

    if (existing) {
      return existing;
    }

    const created = new Map<string, ChatLiveConnection>();
    connectionsByRoomSlug.set(roomSlug, created);
    return created;
  };

  const sendEvent = (socket: ChatLiveSocket, payload: ChatLiveEvent) => {
    socket.send(JSON.stringify(payload));
  };

  return {
    add(connection: ChatLiveConnection) {
      roomSlugByRoomId.set(connection.roomId, connection.roomSlug);
      getRoomConnections(connection.roomSlug).set(connection.roomSessionId, connection);
    },
    broadcast(roomSlug: string, payload: ChatLiveEvent) {
      for (const connection of getRoomConnections(roomSlug).values()) {
        sendEvent(connection.socket, payload);
      }
    },
    remove(roomSlug: string, roomSessionId: string) {
      const roomConnections = connectionsByRoomSlug.get(roomSlug);

      if (!roomConnections) {
        return;
      }

      roomConnections.delete(roomSessionId);

      if (roomConnections.size === 0) {
        connectionsByRoomSlug.delete(roomSlug);

        for (const [roomId, mappedRoomSlug] of roomSlugByRoomId.entries()) {
          if (mappedRoomSlug === roomSlug) {
            roomSlugByRoomId.delete(roomId);
          }
        }
      }
    },
    revokeRoom(roomSlug: string) {
      const roomConnections = connectionsByRoomSlug.get(roomSlug);

      if (!roomConnections) {
        return;
      }

      for (const connection of roomConnections.values()) {
        sendEvent(connection.socket, {
          reason: "room_password_rotation",
          type: "session.revoked",
        });
        connection.socket.close(4001, "room_password_rotation");
      }

      connectionsByRoomSlug.delete(roomSlug);

      for (const [roomId, mappedRoomSlug] of roomSlugByRoomId.entries()) {
        if (mappedRoomSlug === roomSlug) {
          roomSlugByRoomId.delete(roomId);
        }
      }
    },
    sendToSession(roomSlug: string, roomSessionId: string, payload: ChatLiveEvent) {
      const roomConnections = connectionsByRoomSlug.get(roomSlug);
      const connection = roomConnections?.get(roomSessionId);

      if (!connection) {
        return;
      }

      sendEvent(connection.socket, payload);
    },
    broadcastByRoomId(roomId: string, payload: ChatLiveEvent) {
      const roomSlug = roomSlugByRoomId.get(roomId);

      if (!roomSlug) {
        return;
      }

      this.broadcast(roomSlug, payload);
    },
  };
};

const parseForwardedForAddress = (value: string | undefined) =>
  value
    ?.split(",")
    .map((candidate) => candidate.trim())
    .find((candidate) => candidate.length > 0);

const resolveRateLimitClientKey = (context: Context) =>
  parseForwardedForAddress(context.req.header("x-forwarded-for")) ??
  context.req.header("x-real-ip")?.trim() ??
  context.req.header("cf-connecting-ip")?.trim() ??
  "global";

const createRateLimiter = (rule: RateLimitRule) => {
  const windows = new Map<string, RateLimitWindow>();

  return (context: Context) => {
    const now = Date.now();
    const key = resolveRateLimitClientKey(context);
    const existing = windows.get(key);

    if (!existing || now >= existing.resetAt) {
      windows.set(key, {
        count: 1,
        resetAt: now + rule.windowMs,
      });
      return null;
    }

    if (existing.count >= rule.maxRequests) {
      context.header("Retry-After", String(Math.max(1, Math.ceil((existing.resetAt - now) / 1000))));

      return context.json(
        {
          error: "rate_limited",
          resource: "api",
        },
        429,
      );
    }

    windows.set(key, {
      count: existing.count + 1,
      resetAt: existing.resetAt,
    });

    return null;
  };
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
const MAX_CHAT_MESSAGE_BODY_LENGTH = 2000;
const CHAT_UPLOAD_ROOM_SLUG = "night-shift";

const isSupportedChatUploadMimeType = (value: string): value is ChatUploadMimeType => {
  return supportedChatUploadMimeTypes.includes(value as ChatUploadMimeType);
};

const hasLeadingBytes = (input: Uint8Array, signature: readonly number[]) => {
  if (input.byteLength < signature.length) {
    return false;
  }

  for (let index = 0; index < signature.length; index += 1) {
    if (input[index] !== signature[index]) {
      return false;
    }
  }

  return true;
};

const isChatUploadMimeSignatureValid = (mimeType: ChatUploadMimeType, bytes: Uint8Array) => {
  if (mimeType === "image/jpeg") {
    return hasLeadingBytes(bytes, [0xff, 0xd8, 0xff]);
  }

  if (mimeType === "image/png") {
    return hasLeadingBytes(bytes, [0x89, 0x50, 0x4e, 0x47]);
  }

  return (
    hasLeadingBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes.byteLength >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
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

const readJsonObject = async (
  request: Request,
): Promise<{ value: Record<string, unknown> } | { error: { error: "invalid_request"; field: string } }> => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (_error) {
    return {
      error: {
        error: "invalid_request",
        field: "body",
      },
    };
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      error: {
        error: "invalid_request",
        field: "body",
      },
    };
  }

  return {
    value: payload as Record<string, unknown>,
  };
};

const readRequiredJsonString = (
  payload: Record<string, unknown>,
  field: string,
): { value: string } | { error: { error: "invalid_request"; field: string } } => {
  const value = payload[field];

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

const readOptionalJsonString = (
  payload: Record<string, unknown>,
  field: string,
): { value: string | undefined } | { error: { error: "invalid_request"; field: string } } => {
  const value = payload[field];

  if (typeof value === "undefined") {
    return {
      value: undefined,
    };
  }

  if (typeof value !== "string") {
    return {
      error: {
        error: "invalid_request",
        field,
      },
    };
  }

  const trimmed = value.trim();

  return {
    value: trimmed.length > 0 ? trimmed : undefined,
  };
};

const createChatFamily = (
  container: BootstrapContainer,
  live: ReturnType<typeof createChatLiveManager>,
) => {
  const chatApp = new Hono();
  const joinRateLimiter = createRateLimiter(rateLimitRules.chatJoin);
  const sendMessageRateLimiter = createRateLimiter(rateLimitRules.chatSendMessage);
  const uploadRateLimiter = createRateLimiter(rateLimitRules.chatUpload);
  const resolveRoomSessionUseCase = (container.chat as {
    resolveRoomSession?: ResolveChatRoomSessionPort;
  }).resolveRoomSession;
  const listRoomMessagesUseCase = (container.chat as {
    listRoomMessages?: ListChatRoomMessagesPort;
  }).listRoomMessages;
  const sendRoomTextMessageUseCase = (container.chat as {
    sendRoomTextMessage?: SendChatRoomTextMessagePort;
  }).sendRoomTextMessage;

  const broadcastParticipantSnapshot = async (
    roomSlug: string,
    roomSessionId: string,
  ) => {
    if (!container.chat.listRoomParticipants) {
      return;
    }

    try {
      const snapshot = await container.chat.listRoomParticipants.execute({
        roomSessionId,
        slug: roomSlug,
      });

      live.broadcast(roomSlug, {
        items: snapshot.items,
        type: "participant.snapshot",
      });
    } catch {
      // best effort live update; HTTP contract already handled the primary response
    }
  };

  chatApp.post("/rooms/:slug/join", async (c) => {
    const limited = joinRateLimiter(c);

    if (limited) {
      return limited;
    }

    if (!container.chat.joinRoomSession) {
      return c.json<NotImplementedResponse>(
        {
          family: "chat",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

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

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const handle = readRequiredJsonString(parsedBody.value, "handle");

    if ("error" in handle) {
      return c.json(handle.error, 400);
    }

    const password = readRequiredJsonString(parsedBody.value, "password");

    if ("error" in password) {
      return c.json(password.error, 400);
    }

    try {
      const response = await container.chat.joinRoomSession.execute({
        handle: handle.value,
        password: password.value,
        slug,
      });

      void broadcastParticipantSnapshot(slug, response.session.id);

      return c.json(response);
    } catch (error) {
      if (error instanceof InvalidChatRoomCredentialsError) {
        return c.json(
          {
            error: "denied",
            resource: "chat",
          },
          401,
        );
      }

      if (error instanceof BannedChatHandleError) {
        return c.json(
          {
            error: "denied",
            reason: "handle_banned",
            resource: "chat",
          },
          403,
        );
      }

      throw error;
    }
  });

  chatApp.get("/rooms/:slug/session", async (c) => {
    if (!resolveRoomSessionUseCase) {
      return c.json<NotImplementedResponse>(
        {
          family: "chat",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

    const slug = c.req.param("slug")?.trim();

    if (!slug) {
      return c.json({ error: "invalid_path", field: "slug" }, 400);
    }

    const roomSessionId = c.req.header("x-chat-room-session-id")?.trim();

    if (!roomSessionId) {
      return c.json({ error: "invalid_request", field: "x-chat-room-session-id" }, 400);
    }

    try {
      const response = await resolveRoomSessionUseCase.execute({
        roomSessionId,
        slug,
      });

      return c.json(response);
    } catch (error) {
      if (error instanceof InvalidChatRoomSessionError) {
        return c.json({ error: "denied", resource: "chat" }, 401);
      }

      if (error instanceof BannedChatHandleError) {
        return c.json({ error: "denied", reason: "handle_banned", resource: "chat" }, 403);
      }

      throw error;
    }
  });

  chatApp.get("/rooms/:slug/live", async (c) => {
    const slug = c.req.param("slug")?.trim();

    if (!slug) {
      return c.json({ error: "invalid_path", field: "slug" }, 400);
    }

    const parsedHandshake = parseChatLiveWebSocketHandshake(
      c.req.header("sec-websocket-protocol"),
    );

    if ("error" in parsedHandshake) {
      return c.json(parsedHandshake.error, 400);
    }

    const roomSessionId = parsedHandshake.value.roomSessionId;

    if (!resolveRoomSessionUseCase || !container.chat.listRoomParticipants) {
      return c.json<NotImplementedResponse>(
        {
          family: "chat",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

    try {
      const [resolvedSession, snapshot] = await Promise.all([
        resolveRoomSessionUseCase.execute({ roomSessionId, slug }),
        container.chat.listRoomParticipants.execute({ roomSessionId, slug }),
      ]);

      return upgradeWebSocket(
        c,
        {
          onClose: () => {
            live.remove(slug, roomSessionId);
          },
          onOpen: (_event, ws) => {
            live.add({
              roomId: resolvedSession.room.id,
              roomSessionId,
              roomSlug: slug,
              socket: ws,
            });
            live.sendToSession(slug, roomSessionId, {
              items: snapshot.items,
              type: "participant.snapshot",
            });
            void broadcastParticipantSnapshot(slug, resolvedSession.session.id);
          },
        },
        {
          headers: {
            "Sec-WebSocket-Protocol": parsedHandshake.value.transportProtocol,
          },
        },
      );
    } catch (error) {
      if (error instanceof InvalidChatRoomSessionError) {
        return c.json({ error: "denied", resource: "chat" }, 401);
      }

      if (error instanceof BannedChatHandleError) {
        return c.json({ error: "denied", reason: "handle_banned", resource: "chat" }, 403);
      }

      throw error;
    }
  });

  chatApp.get("/rooms/:slug/participants", async (c) => {
    if (!container.chat.listRoomParticipants) {
      return c.json<NotImplementedResponse>(
        {
          family: "chat",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

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

    try {
      const response = await container.chat.listRoomParticipants.execute({
        roomSessionId,
        slug,
      });

      return c.json(response);
    } catch (error) {
      if (error instanceof InvalidChatParticipantAccessError) {
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
  });

  chatApp.get("/rooms/:slug/messages", async (c) => {
    if (!listRoomMessagesUseCase) {
      return c.json<NotImplementedResponse>(
        {
          family: "chat",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

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

    const { cursor, limit: rawLimit } = c.req.query();
    const limit = parsePositiveInteger(rawLimit);

    if (typeof rawLimit !== "undefined" && typeof limit === "undefined") {
      return c.json(
        {
          error: "invalid_query",
          field: "limit",
        },
        400,
      );
    }

    try {
      const response = await listRoomMessagesUseCase.execute({
        cursor,
        limit,
        roomSessionId,
        slug,
      });

      return c.json(response);
    } catch (error) {
      if (error instanceof InvalidChatMessageAccessError) {
        return c.json(
          {
            error: "denied",
            resource: "chat",
          },
          403,
        );
      }

      if (error instanceof InvalidChatMessageCursorError) {
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

  chatApp.post("/rooms/:slug/messages", async (c) => {
    const limited = sendMessageRateLimiter(c);

    if (limited) {
      return limited;
    }

    if (!sendRoomTextMessageUseCase) {
      return c.json<NotImplementedResponse>(
        {
          family: "chat",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

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

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const body = readRequiredJsonString(parsedBody.value, "body");

    if ("error" in body) {
      return c.json(body.error, 400);
    }

    if (body.value.length > MAX_CHAT_MESSAGE_BODY_LENGTH) {
      return c.json(
        {
          error: "invalid_request",
          field: "body",
        },
        400,
      );
    }

    const toneInput = parsedBody.value.tone;

    if (
      typeof toneInput !== "undefined" &&
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

    try {
      const response = await sendRoomTextMessageUseCase.execute({
        body: body.value,
        roomSessionId,
        slug,
        tone: toneInput,
      });

      live.broadcast(slug, {
        item: response,
        type: "message.created",
      });

      return c.json(
        {
          item: response,
        },
        201,
      );
    } catch (error) {
      if (error instanceof InvalidChatMessageAccessError) {
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
  });

  chatApp.get("/uploads/:id/media", async (c) => {
    c.header("Cache-Control", "private, no-store");
    c.header("Vary", "x-chat-room-session-id");
    c.header("X-Content-Type-Options", "nosniff");

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
      "Content-Length": String(upload.byteSize),
      "Content-Type": upload.mimeType,
    });
  });

  chatApp.post("/messages/upload", async (c) => {
    const limited = uploadRateLimiter(c);

    if (limited) {
      return limited;
    }

    if (!resolveRoomSessionUseCase) {
      return c.json<NotImplementedResponse>(
        {
          family: "chat",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

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

    const roomSessionId = getRequiredFormText(formData, "roomSessionId");

    if ("error" in roomSessionId) {
      return c.json(roomSessionId.error, 400);
    }

    let resolvedSession;

    try {
      resolvedSession = await resolveRoomSessionUseCase.execute({
        roomSessionId: roomSessionId.value,
        slug: CHAT_UPLOAD_ROOM_SLUG,
      });
    } catch (error) {
      if (
        error instanceof InvalidChatRoomSessionError ||
        error instanceof BannedChatHandleError
      ) {
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

    const uploadBytes = new Uint8Array(await uploadFile.arrayBuffer());

    if (!isChatUploadMimeSignatureValid(mimeType, uploadBytes)) {
      return c.json(
        {
          error: "invalid_upload",
          field: "file",
          reason: "mime_signature_mismatch",
        },
        400,
      );
    }

    let result;

    try {
      result = await container.chat.uploadMessageWithImage.execute({
        body: getOptionalFormText(formData, "body"),
        image: {
          body: uploadBytes,
          displayFilename: uploadFile.name.trim() || "upload",
          mimeType,
        },
        roomSessionId: resolvedSession.session.id,
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

    live.broadcastByRoomId(resolvedSession.room.id, {
      item: {
        attachment: result.attachment,
        author: result.author,
        body: result.body,
        id: result.id,
        sentAt: result.sentAt,
        tone: result.tone ?? undefined,
      },
      type: "message.created",
    });

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

const parseCookieMap = (cookieHeader: string | undefined): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, pair) => {
      const separator = pair.indexOf("=");

      if (separator < 1) {
        return acc;
      }

      const key = pair.slice(0, separator).trim();
      const value = pair.slice(separator + 1).trim();

      if (!key) {
        return acc;
      }

      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
};

const readSessionTokenFromCookie = (
  request: Request,
  sessionCookieName: string,
): string | null => {
  const cookies = parseCookieMap(request.headers.get("cookie") ?? undefined);
  const value = cookies[sessionCookieName];

  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
};

const buildSessionCookieHeader = (
  input: Readonly<{
    cookieName: string;
    maxAgeSeconds: number;
    secure: boolean;
    token: string;
  }>,
) => {
  const secureFlag = input.secure ? "; Secure" : "";

  return `${input.cookieName}=${encodeURIComponent(input.token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${input.maxAgeSeconds}${secureFlag}`;
};

const buildClearedSessionCookieHeader = (
  input: Readonly<{
    cookieName: string;
    secure: boolean;
  }>,
) => {
  const secureFlag = input.secure ? "; Secure" : "";

  return `${input.cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}`;
};

const presentAuthReadyState = (input: Readonly<{
  state: "ready";
  admin: Readonly<{
    id: string;
    email: string;
  }>;
  session: Readonly<{
    id: string;
    expiresAt: string;
  }>;
}>) => ({
  admin: input.admin,
  session: input.session,
  state: "ready" as const,
});

const createAuthFamily = (container: BootstrapContainer) => {
  const auth = container.auth;

  if (!auth) {
    return createNotImplementedFamily("auth");
  }

  const authApp = new Hono();
  const loginRateLimiter = createRateLimiter(rateLimitRules.authLogin);
  const mfaVerifyRateLimiter = createRateLimiter(rateLimitRules.authMfaVerify);

  authApp.post("/login", async (c) => {
    const limited = loginRateLimiter(c);

    if (limited) {
      return limited;
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const email = readRequiredJsonString(parsedBody.value, "email");

    if ("error" in email) {
      return c.json(email.error, 400);
    }

    const password = readRequiredJsonString(parsedBody.value, "password");

    if ("error" in password) {
      return c.json(password.error, 400);
    }

    try {
      const result = await auth.loginWithCredentials.execute({
        email: email.value,
        password: password.value,
      });

      if (result.state === "ready") {
        c.header(
          "Set-Cookie",
          buildSessionCookieHeader({
            cookieName: container.config.auth.sessionCookieName,
            maxAgeSeconds: container.config.auth.sessionMaxAgeSeconds,
            secure: container.config.server.nodeEnv === "production",
            token: result.sessionToken,
          }),
        );

        return c.json(presentAuthReadyState(result));
      }

      return c.json(result);
    } catch (error) {
      if (error instanceof InvalidAuthCredentialsError) {
        return c.json(
          {
            error: "denied",
            resource: "auth",
          },
          401,
        );
      }

      throw error;
    }
  });

  authApp.post("/mfa/verify", async (c) => {
    const limited = mfaVerifyRateLimiter(c);

    if (limited) {
      return limited;
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const challengeId = readRequiredJsonString(parsedBody.value, "challengeId");

    if ("error" in challengeId) {
      return c.json(challengeId.error, 400);
    }

    const code = readRequiredJsonString(parsedBody.value, "code");

    if ("error" in code) {
      return c.json(code.error, 400);
    }

    try {
      const result = await auth.verifyMfaChallenge.execute({
        challengeId: challengeId.value,
        code: code.value,
      });

      c.header(
        "Set-Cookie",
        buildSessionCookieHeader({
          cookieName: container.config.auth.sessionCookieName,
          maxAgeSeconds: container.config.auth.sessionMaxAgeSeconds,
          secure: container.config.server.nodeEnv === "production",
          token: result.sessionToken,
        }),
      );

      return c.json(presentAuthReadyState(result));
    } catch (error) {
      if (error instanceof InvalidAuthCredentialsError) {
        return c.json(
          {
            error: "denied",
            resource: "auth",
          },
          401,
        );
      }

      if (error instanceof MfaChallengeNotPendingError) {
        return c.json(
          {
            error: "challenge_not_pending",
            resource: "mfa_challenge",
          },
          409,
        );
      }

      if (error instanceof InvalidAuthSessionError) {
        return c.json(
          {
            error: "denied",
            resource: "auth",
          },
          401,
        );
      }

      throw error;
    }
  });

  authApp.post("/session/refresh", async (c) => {
    const sessionToken = readSessionTokenFromCookie(
      c.req.raw,
      container.config.auth.sessionCookieName,
    );

    if (!sessionToken) {
      return c.json(
        {
          error: "denied",
          resource: "auth",
        },
        401,
      );
    }

    try {
      const result = await auth.refreshAdminSession.execute({ sessionToken });

      c.header(
        "Set-Cookie",
        buildSessionCookieHeader({
          cookieName: container.config.auth.sessionCookieName,
          maxAgeSeconds: container.config.auth.sessionMaxAgeSeconds,
          secure: container.config.server.nodeEnv === "production",
          token: result.sessionToken,
        }),
      );

      return c.json(presentAuthReadyState(result));
    } catch (error) {
      if (error instanceof InvalidAuthSessionError) {
        return c.json(
          {
            error: "denied",
            resource: "auth",
          },
          401,
        );
      }

      throw error;
    }
  });

  authApp.post("/logout", async (c) => {
    const sessionToken = readSessionTokenFromCookie(
      c.req.raw,
      container.config.auth.sessionCookieName,
    );

    if (!sessionToken) {
      return c.json(
        {
          error: "denied",
          resource: "auth",
        },
        401,
      );
    }

    try {
      const result = await auth.logoutAdminSession.execute({ sessionToken });

      c.header(
        "Set-Cookie",
        buildClearedSessionCookieHeader({
          cookieName: container.config.auth.sessionCookieName,
          secure: container.config.server.nodeEnv === "production",
        }),
      );

      return c.json(result);
    } catch (error) {
      if (error instanceof InvalidAuthSessionError) {
        return c.json(
          {
            error: "denied",
            resource: "auth",
          },
          401,
        );
      }

      throw error;
    }
  });

  authApp.all("*", (c) =>
    c.json<NotImplementedResponse>(
      {
        family: "auth",
        method: c.req.method,
        route: c.req.path,
        service: serviceName,
        status: "not_implemented",
      },
      501,
    ),
  );

  return authApp;
};

const parseBooleanQuery = (value: string | undefined): boolean | undefined => {
  if (typeof value === "undefined") {
    return undefined;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
};

const createAdminFamily = (
  container: BootstrapContainer,
  live: ReturnType<typeof createChatLiveManager>,
) => {
  const admin = container.admin;
  const auth = container.auth;

  if (!admin || !auth) {
    return createNotImplementedFamily("admin");
  }

  const adminApp = new Hono();
  const moderateRoomMessageUseCase = (container.chat as {
    moderateRoomMessage?: ModerateChatRoomMessagePort;
  }).moderateRoomMessage;
  const listModerationAuditsUseCase = (container.chat as {
    listModerationAudits?: ListChatModerationAuditsPort;
  }).listModerationAudits;
  const banRoomHandleUseCase = (container.chat as {
    banRoomHandle?: BanChatRoomHandlePort;
  }).banRoomHandle;
  const getRoomAccessUseCase = (container.chat as {
    getRoomAccess?: GetChatRoomAccessPort;
  }).getRoomAccess;
  const rotateRoomPasswordUseCase = (container.chat as {
    rotateRoomPassword?: RotateChatRoomPasswordPort;
  }).rotateRoomPassword;

  const resolveSession = async (c: Context) => {
    const sessionToken = readSessionTokenFromCookie(
      c.req.raw,
      container.config.auth.sessionCookieName,
    );

    if (!sessionToken) {
      return {
        error: c.json(
          {
            error: "denied",
            resource: "auth",
          },
          401,
        ),
      } as const;
    }

    try {
      const resolved = await auth.resolveAdminSession.execute({
        sessionToken,
      });

      return {
        adminUserId: resolved.admin.id,
        ok: true,
      } as const;
    } catch (error) {
      if (error instanceof InvalidAuthSessionError) {
        return {
          error: c.json(
            {
              error: "denied",
              resource: "auth",
            },
            401,
          ),
        } as const;
      }

      throw error;
    }
  };

  adminApp.get("/dashboard/summary", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const response = await admin.getDashboardSummary.execute();
    return c.json(response);
  });

  adminApp.get("/thoughts", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const query = c.req.query();
    const page = parsePositiveInteger(query.page);
    const pageSize = parsePositiveInteger(query.pageSize);
    const featured = parseBooleanQuery(query.featured);

    if (typeof query.page !== "undefined" && typeof page === "undefined") {
      return c.json({ error: "invalid_query", field: "page" }, 400);
    }

    if (typeof query.pageSize !== "undefined" && typeof pageSize === "undefined") {
      return c.json({ error: "invalid_query", field: "pageSize" }, 400);
    }

    if (typeof query.featured !== "undefined" && typeof featured === "undefined") {
      return c.json({ error: "invalid_query", field: "featured" }, 400);
    }

    if (query.status && query.status !== "draft" && query.status !== "published") {
      return c.json({ error: "invalid_query", field: "status" }, 400);
    }

    if (query.type && query.type !== "essay" && query.type !== "note") {
      return c.json({ error: "invalid_query", field: "type" }, 400);
    }

    const response = await admin.listThoughts.execute({
      featured,
      page,
      pageSize,
      search: query.search,
      status: query.status === "draft" || query.status === "published" ? query.status : undefined,
      type: query.type === "essay" || query.type === "note" ? query.type : undefined,
    });

    return c.json(response);
  });

  adminApp.patch("/thoughts/:id/curation", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json({ error: "invalid_path", field: "id" }, 400);
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const featuredRaw = parsedBody.value.featured;
    const statusRaw = parsedBody.value.status;

    if (typeof featuredRaw !== "undefined" && typeof featuredRaw !== "boolean") {
      return c.json({ error: "invalid_request", field: "featured" }, 400);
    }

    if (
      typeof statusRaw !== "undefined" &&
      statusRaw !== "draft" &&
      statusRaw !== "published"
    ) {
      return c.json({ error: "invalid_request", field: "status" }, 400);
    }

    const result = await admin.updateThoughtCuration.execute({
      featured: typeof featuredRaw === "boolean" ? featuredRaw : undefined,
      id,
      status: statusRaw === "draft" || statusRaw === "published" ? statusRaw : undefined,
    });

    if (!result) {
      return c.json({ error: "not_found", resource: "thought" }, 404);
    }

    return c.json(result);
  });

  adminApp.get("/projects", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const query = c.req.query();
    const page = parsePositiveInteger(query.page);
    const pageSize = parsePositiveInteger(query.pageSize);
    const featured = parseBooleanQuery(query.featured);

    if (typeof query.page !== "undefined" && typeof page === "undefined") {
      return c.json({ error: "invalid_query", field: "page" }, 400);
    }

    if (typeof query.pageSize !== "undefined" && typeof pageSize === "undefined") {
      return c.json({ error: "invalid_query", field: "pageSize" }, 400);
    }

    if (typeof query.featured !== "undefined" && typeof featured === "undefined") {
      return c.json({ error: "invalid_query", field: "featured" }, 400);
    }

    if (
      query.status &&
      query.status !== "live" &&
      query.status !== "archived" &&
      query.status !== "in-progress"
    ) {
      return c.json({ error: "invalid_query", field: "status" }, 400);
    }

    const response = await admin.listProjects.execute({
      featured,
      page,
      pageSize,
      search: query.search,
      status:
        query.status === "live" ||
        query.status === "archived" ||
        query.status === "in-progress"
          ? query.status
          : undefined,
    });

    return c.json(response);
  });

  adminApp.patch("/projects/:id/curation", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json({ error: "invalid_path", field: "id" }, 400);
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const featuredRaw = parsedBody.value.featured;
    const statusRaw = parsedBody.value.status;

    if (typeof featuredRaw !== "undefined" && typeof featuredRaw !== "boolean") {
      return c.json({ error: "invalid_request", field: "featured" }, 400);
    }

    if (
      typeof statusRaw !== "undefined" &&
      statusRaw !== "live" &&
      statusRaw !== "archived" &&
      statusRaw !== "in-progress"
    ) {
      return c.json({ error: "invalid_request", field: "status" }, 400);
    }

    const result = await admin.updateProjectCuration.execute({
      featured: typeof featuredRaw === "boolean" ? featuredRaw : undefined,
      id,
      status:
        statusRaw === "live" || statusRaw === "archived" || statusRaw === "in-progress"
          ? statusRaw
          : undefined,
    });

    if (!result) {
      return c.json({ error: "not_found", resource: "project" }, 404);
    }

    return c.json(result);
  });

  adminApp.get("/photos", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const query = c.req.query();
    const page = parsePositiveInteger(query.page);
    const pageSize = parsePositiveInteger(query.pageSize);
    const year = parsePositiveInteger(query.year);
    const featured = parseBooleanQuery(query.featured);

    if (typeof query.page !== "undefined" && typeof page === "undefined") {
      return c.json({ error: "invalid_query", field: "page" }, 400);
    }

    if (typeof query.pageSize !== "undefined" && typeof pageSize === "undefined") {
      return c.json({ error: "invalid_query", field: "pageSize" }, 400);
    }

    if (typeof query.year !== "undefined" && typeof year === "undefined") {
      return c.json({ error: "invalid_query", field: "year" }, 400);
    }

    if (typeof query.featured !== "undefined" && typeof featured === "undefined") {
      return c.json({ error: "invalid_query", field: "featured" }, 400);
    }

    if (query.status && query.status !== "draft" && query.status !== "published") {
      return c.json({ error: "invalid_query", field: "status" }, 400);
    }

    const response = await admin.listPhotos.execute({
      featured,
      location: query.location,
      page,
      pageSize,
      search: query.search,
      status: query.status === "draft" || query.status === "published" ? query.status : undefined,
      year,
    });

    return c.json(response);
  });

  adminApp.patch("/photos/:id/curation", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json({ error: "invalid_path", field: "id" }, 400);
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const featuredRaw = parsedBody.value.featured;
    const statusRaw = parsedBody.value.status;

    if (typeof featuredRaw !== "undefined" && typeof featuredRaw !== "boolean") {
      return c.json({ error: "invalid_request", field: "featured" }, 400);
    }

    if (
      typeof statusRaw !== "undefined" &&
      statusRaw !== "draft" &&
      statusRaw !== "published"
    ) {
      return c.json({ error: "invalid_request", field: "status" }, 400);
    }

    const result = await admin.updatePhotoCuration.execute({
      featured: typeof featuredRaw === "boolean" ? featuredRaw : undefined,
      id,
      status: statusRaw === "draft" || statusRaw === "published" ? statusRaw : undefined,
    });

    if (!result) {
      return c.json({ error: "not_found", resource: "photo" }, 404);
    }

    return c.json(result);
  });

  adminApp.patch("/photos/:id/metadata", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json({ error: "invalid_path", field: "id" }, 400);
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const tone = parsedBody.value.tone;
    const tags = parsedBody.value.tags;

    if (
      typeof tone !== "undefined" &&
      tone !== "amber" &&
      tone !== "cyan" &&
      tone !== "mono" &&
      tone !== "sunset" &&
      tone !== "violet"
    ) {
      return c.json({ error: "invalid_request", field: "tone" }, 400);
    }

    if (
      typeof tags !== "undefined" &&
      (!Array.isArray(tags) || tags.some((entry) => typeof entry !== "string"))
    ) {
      return c.json({ error: "invalid_request", field: "tags" }, 400);
    }

    try {
      const result = await admin.updatePhotoMetadata.execute({
        camera:
          typeof parsedBody.value.camera === "string" || parsedBody.value.camera === null
            ? parsedBody.value.camera
            : undefined,
        caption:
          typeof parsedBody.value.caption === "string" || parsedBody.value.caption === null
            ? parsedBody.value.caption
            : undefined,
        date: typeof parsedBody.value.date === "string" ? parsedBody.value.date : undefined,
        film:
          typeof parsedBody.value.film === "string" || parsedBody.value.film === null
            ? parsedBody.value.film
            : undefined,
        frame: typeof parsedBody.value.frame === "string" ? parsedBody.value.frame : undefined,
        id,
        location:
          typeof parsedBody.value.location === "string" ? parsedBody.value.location : undefined,
        tags: Array.isArray(tags) ? tags.map((entry) => entry.trim()).filter(Boolean) : undefined,
        title: typeof parsedBody.value.title === "string" ? parsedBody.value.title : undefined,
        tone:
          tone === "amber" ||
          tone === "cyan" ||
          tone === "mono" ||
          tone === "sunset" ||
          tone === "violet"
            ? tone
            : undefined,
      });

      if (!result) {
        return c.json({ error: "not_found", resource: "photo" }, 404);
      }

      return c.json(result);
    } catch (error) {
      if (error instanceof InvalidAdminPhotoMetadataDateError) {
        return c.json({ error: "invalid_request", field: "date" }, 400);
      }

      throw error;
    }
  });

  adminApp.get("/chat/moderation/audits", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    if (!listModerationAuditsUseCase) {
      return c.json<NotImplementedResponse>(
        {
          family: "admin",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

    const {
      action,
      actorAdminUserId,
      cursor,
      limit: rawLimit,
      roomId,
    } = c.req.query();
    const limit = parsePositiveInteger(rawLimit);

    if (typeof rawLimit !== "undefined" && typeof limit === "undefined") {
      return c.json({ error: "invalid_query", field: "limit" }, 400);
    }

    if (
      typeof action !== "undefined" &&
      action !== "delete_message" &&
      action !== "hide_media_metadata" &&
      action !== "ban_handle" &&
      action !== "room_password_rotation"
    ) {
      return c.json({ error: "invalid_query", field: "action" }, 400);
    }

    try {
      const response = await listModerationAuditsUseCase.execute({
        action:
          action === "delete_message" ||
          action === "hide_media_metadata" ||
          action === "ban_handle" ||
          action === "room_password_rotation"
            ? action
            : undefined,
        actorAdminUserId,
        cursor,
        limit,
        roomId,
      });

      return c.json(response);
    } catch (error) {
      if (error instanceof InvalidChatModerationAuditCursorError) {
        return c.json({ error: "invalid_query", field: "cursor" }, 400);
      }

      throw error;
    }
  });

  adminApp.post("/chat/messages/:id/moderation", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    if (!moderateRoomMessageUseCase) {
      return c.json<NotImplementedResponse>(
        {
          family: "admin",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json({ error: "invalid_path", field: "id" }, 400);
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const action = parsedBody.value.action;

    if (action !== "hide_message" && action !== "delete_message") {
      return c.json({ error: "invalid_request", field: "action" }, 400);
    }

    const reason = readOptionalJsonString(parsedBody.value, "reason");

    if ("error" in reason) {
      return c.json(reason.error, 400);
    }

    const result = await moderateRoomMessageUseCase.execute({
      action,
      actorAdminUserId: session.adminUserId,
      messageId: id,
      reason: reason.value,
    });

    if (!result) {
      return c.json({ error: "not_found", resource: "chat_message" }, 404);
    }

    return c.json(result);
  });

  adminApp.post("/chat/handles/:id/ban", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    if (!banRoomHandleUseCase) {
      return c.json<NotImplementedResponse>(
        {
          family: "admin",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

    const id = c.req.param("id")?.trim();

    if (!id) {
      return c.json({ error: "invalid_path", field: "id" }, 400);
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const reason = readOptionalJsonString(parsedBody.value, "reason");

    if ("error" in reason) {
      return c.json(reason.error, 400);
    }

    const result = await banRoomHandleUseCase.execute({
      actorAdminUserId: session.adminUserId,
      handleId: id,
      reason: reason.value,
    });

    if (!result) {
      return c.json({ error: "not_found", resource: "chat_handle" }, 404);
    }

    return c.json(result);
  });

  adminApp.get("/chat/rooms/:slug/access", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    if (!getRoomAccessUseCase) {
      return c.json<NotImplementedResponse>(
        {
          family: "admin",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

    const slug = c.req.param("slug")?.trim();

    if (!slug) {
      return c.json({ error: "invalid_path", field: "slug" }, 400);
    }

    const result = await getRoomAccessUseCase.execute({ slug });

    if (!result) {
      return c.json({ error: "not_found", resource: "chat_room" }, 404);
    }

    return c.json(result);
  });

  adminApp.post("/chat/rooms/:slug/password-rotation", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    if (!rotateRoomPasswordUseCase) {
      return c.json<NotImplementedResponse>(
        {
          family: "admin",
          method: c.req.method,
          route: c.req.path,
          service: serviceName,
          status: "not_implemented",
        },
        501,
      );
    }

    const slug = c.req.param("slug")?.trim();

    if (!slug) {
      return c.json({ error: "invalid_path", field: "slug" }, 400);
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const reason = readOptionalJsonString(parsedBody.value, "reason");

    if ("error" in reason) {
      return c.json(reason.error, 400);
    }

    const result = await rotateRoomPasswordUseCase.execute({
      actorAdminUserId: session.adminUserId,
      reason: reason.value,
      slug,
    });

    if (!result) {
      return c.json({ error: "not_found", resource: "chat_room" }, 404);
    }

    live.revokeRoom(slug);

    return c.json(result);
  });

  adminApp.get("/status-strip", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const response = await admin.listStatusStripEntries.execute();
    return c.json(response);
  });

  adminApp.put("/status-strip", async (c) => {
    const session = await resolveSession(c);

    if ("error" in session) {
      return session.error;
    }

    const parsedBody = await readJsonObject(c.req.raw);

    if ("error" in parsedBody) {
      return c.json(parsedBody.error, 400);
    }

    const items = parsedBody.value.items;

    if (!Array.isArray(items)) {
      return c.json({ error: "invalid_request", field: "items" }, 400);
    }

    type StatusStripEntryInput = ReplaceAdminStatusStripEntriesInput["items"][number];
    const normalizedItems: StatusStripEntryInput[] = [];
    const displayOrderSet = new Set<number>();

    for (const [index, item] of items.entries()) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return c.json({ error: "invalid_request", field: `items[${index}]` }, 400);
      }

      const cast = item as Record<string, unknown>;
      const label = cast.label;
      const value = cast.value;
      const displayOrderRaw = cast.displayOrder;
      const accent = cast.accent;
      const id = cast.id;

      if (typeof label !== "string" || label.trim().length === 0) {
        return c.json({ error: "invalid_request", field: `items[${index}].label` }, 400);
      }

      if (typeof value !== "string" || value.trim().length === 0) {
        return c.json({ error: "invalid_request", field: `items[${index}].value` }, 400);
      }

      if (
        typeof displayOrderRaw !== "number" ||
        !Number.isInteger(displayOrderRaw) ||
        displayOrderRaw < 1
      ) {
        return c.json({ error: "invalid_request", field: `items[${index}].displayOrder` }, 400);
      }

      if (
        typeof accent !== "undefined" &&
        accent !== "amber" &&
        accent !== "cyan" &&
        accent !== "pink"
      ) {
        return c.json({ error: "invalid_request", field: `items[${index}].accent` }, 400);
      }

      const displayOrder = displayOrderRaw;
      const normalizedAccent: StatusStripEntryInput["accent"] =
        accent === "amber" || accent === "cyan" || accent === "pink" ? accent : undefined;

      if (displayOrderSet.has(displayOrder)) {
        return c.json({ error: "conflict", reason: "duplicate_display_order" }, 409);
      }

      displayOrderSet.add(displayOrder);
      normalizedItems.push({
        accent: normalizedAccent,
        displayOrder,
        id: typeof id === "string" && id.trim().length > 0 ? id.trim() : undefined,
        label: label.trim(),
        value: value.trim(),
      });
    }

    const response = await admin.replaceStatusStripEntries.execute({
      items: normalizedItems,
    });

    return c.json(response);
  });

  adminApp.all("*", (c) =>
    c.json<NotImplementedResponse>(
      {
        family: "admin",
        method: c.req.method,
        route: c.req.path,
        service: serviceName,
        status: "not_implemented",
      },
      501,
    ),
  );

  return adminApp;
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
  const live = createChatLiveManager();

  app.use(
    "/api/*",
    cors({
      allowHeaders: [...corsAllowHeaders],
      allowMethods: [...corsAllowMethods],
      credentials: container.config.cors.allowCredentials,
      origin: container.config.cors.allowedOrigins,
    }),
  );

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
  app.route("/api/chat", createChatFamily(container, live));
  app.route("/api/auth", createAuthFamily(container));
  app.route("/api/admin", createAdminFamily(container, live));

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
