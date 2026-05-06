import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";
import type {
  JoinChatRoomSessionInput,
  JoinChatRoomSessionOutput,
  ListChatRoomMessagesInput,
  ResolveChatRoomSessionInput,
  ResolveChatRoomSessionOutput,
  ListChatRoomMessagesOutput,
  ListChatRoomParticipantsInput,
  ListChatRoomParticipantsOutput,
  SendChatRoomTextMessageInput,
  SendChatRoomTextMessageOutput,
  UploadChatMessageWithImageInput,
  UploadChatMessageWithImageOutput,
} from "@/modules/chat/ports/inbound";
import {
  BannedChatHandleError,
  InvalidChatMessageAccessError,
  InvalidChatMessageCursorError,
  InvalidChatParticipantAccessError,
  InvalidChatRoomCredentialsError,
  InvalidChatRoomSessionError,
  InvalidChatUploadActorError,
} from "@/modules/chat/application";

import { createHonoHttpAdapter } from "./http-adapter";
import {
  buildChatLiveRoomSessionProtocol,
  chatLiveTransportProtocol,
} from "./chat-live-contract";

let testServerPort = 38_710;

const nextTestServerPort = () => {
  testServerPort += 1;
  return testServerPort;
};

const defaultUploadResponse: UploadChatMessageWithImageOutput = {
  attachment: {
    byteSize: 4,
    fileName: "scan.png",
    id: "upload_1",
    kind: "image",
    mimeType: "image/png",
  },
  author: "vinicius",
  body: "message body",
  id: "message_1",
  sentAt: "2026-04-24T12:00:00.000Z",
  tone: "cyan",
};

const defaultParticipantsResponse: ListChatRoomParticipantsOutput = {
  items: [
    {
      handle: "vinicius",
      status: "online",
    },
  ],
};

const defaultMessagesResponse: ListChatRoomMessagesOutput = {
  items: [
    {
      author: "vinicius",
      body: "late-night check-in",
      id: "message_1",
      sentAt: "2026-04-24T12:00:00.000Z",
      tone: "pink",
    },
  ],
  pageInfo: {
    nextCursor: null,
  },
};

const defaultTextMessageResponse: SendChatRoomTextMessageOutput = {
  author: "vinicius",
  body: "message body",
  id: "message_2",
  sentAt: "2026-04-24T12:01:00.000Z",
  tone: "cyan",
};

const createTestContainer = ({
  executeJoin = async (): Promise<JoinChatRoomSessionOutput> => ({
    participant: {
      handle: "vinicius",
      id: "handle_1",
      status: "online",
    },
    room: {
      id: "room_1",
      slug: "night-shift",
    },
    session: {
      expiresAt: "2026-04-25T12:00:00.000Z",
      handleId: "handle_1",
      id: "session_1",
      joinedAt: "2026-04-24T12:00:00.000Z",
      roomId: "room_1",
      status: "active",
    },
  }),
  executeResolve = async (): Promise<ResolveChatRoomSessionOutput> => ({
    participant: {
      handle: "vinicius",
      id: "handle_1",
      status: "online",
    },
    room: {
      id: "room_1",
      slug: "night-shift",
    },
    session: {
      expiresAt: "2026-04-25T12:00:00.000Z",
      handleId: "handle_1",
      id: "session_1",
      joinedAt: "2026-04-24T12:00:00.000Z",
      roomId: "room_1",
      status: "active",
    },
  }),
  executeParticipants = async (): Promise<ListChatRoomParticipantsOutput> =>
    defaultParticipantsResponse,
  executeMessages = async (): Promise<ListChatRoomMessagesOutput> =>
    defaultMessagesResponse,
  executeSendText = async (): Promise<SendChatRoomTextMessageOutput> =>
    defaultTextMessageResponse,
  executeUpload = async (): Promise<UploadChatMessageWithImageOutput> => defaultUploadResponse,
}: Readonly<{
  executeJoin?: (
    input: JoinChatRoomSessionInput,
  ) => JoinChatRoomSessionOutput | Promise<JoinChatRoomSessionOutput>;
  executeResolve?: (
    input: ResolveChatRoomSessionInput,
  ) => ResolveChatRoomSessionOutput | Promise<ResolveChatRoomSessionOutput>;
  executeParticipants?: (
    input: ListChatRoomParticipantsInput,
  ) => ListChatRoomParticipantsOutput | Promise<ListChatRoomParticipantsOutput>;
  executeMessages?: (
    input: ListChatRoomMessagesInput,
  ) => ListChatRoomMessagesOutput | Promise<ListChatRoomMessagesOutput>;
  executeSendText?: (
    input: SendChatRoomTextMessageInput,
  ) => SendChatRoomTextMessageOutput | Promise<SendChatRoomTextMessageOutput>;
  executeUpload?: (
    input: UploadChatMessageWithImageInput,
  ) => UploadChatMessageWithImageOutput | Promise<UploadChatMessageWithImageOutput>;
}> = {}): BootstrapContainer => ({
  chat: {
    joinRoomSession: {
      execute: executeJoin,
    },
    resolveRoomSession: {
      execute: executeResolve,
    },
    listRoomParticipants: {
      execute: executeParticipants,
    },
    listRoomMessages: {
      execute: executeMessages,
    },
    sendRoomTextMessage: {
      execute: executeSendText,
    },
    moderateUploadRetention: {
      execute: async () => null,
    },
    openUploadMedia: {
      execute: async () => null,
    },
    uploadMessageWithImage: {
      execute: executeUpload,
    },
  } as BootstrapContainer["chat"] & {
    listRoomMessages: {
      execute: (
        input: ListChatRoomMessagesInput,
      ) => ListChatRoomMessagesOutput | Promise<ListChatRoomMessagesOutput>;
    };
    sendRoomTextMessage: {
      execute: (
        input: SendChatRoomTextMessageInput,
      ) => SendChatRoomTextMessageOutput | Promise<SendChatRoomTextMessageOutput>;
    };
  },
  config: {
    auth: {
      mfaCodeMaxAgeSeconds: 600,
      mfaMaxAttempts: 5,
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

const jpegSignatureBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
const pngSignatureBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const webpSignatureBytes = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
]);

const createUploadFormData = ({
  body = "message body",
  bytes = pngSignatureBytes,
  fileName = "scan.png",
  legacyAuthorHandleId,
  legacyRoomId,
  mimeType = "image/png",
  roomSessionId = "session_1",
  tone = "cyan",
}: {
  body?: string;
  bytes?: Uint8Array;
  fileName?: string;
  legacyAuthorHandleId?: string;
  legacyRoomId?: string;
  mimeType?: string;
  roomSessionId?: string;
  tone?: string;
} = {}): FormData => {
  const formData = new FormData();
  const fileBytes = new Uint8Array(bytes.byteLength);
  fileBytes.set(bytes);
  formData.append("roomSessionId", roomSessionId);

  if (legacyRoomId) {
    formData.append("roomId", legacyRoomId);
  }

  if (legacyAuthorHandleId) {
    formData.append("authorHandleId", legacyAuthorHandleId);
  }

  formData.append("body", body);
  formData.append("tone", tone);
  formData.append("file", new File([fileBytes.buffer], fileName, { type: mimeType }));

  return formData;
};

const createWebSocketUpgradeHeaders = (protocols: readonly string[]) => ({
  connection: "Upgrade",
  "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ==",
  "sec-websocket-protocol": protocols.join(", "),
  "sec-websocket-version": "13",
  upgrade: "websocket",
});

const resolveWebSocketHandler = async () => (await import("hono/bun")).websocket;

describe("chat routes", () => {
  it("maps a valid join request into the chat join use case", async () => {
    let capturedInput: JoinChatRoomSessionInput | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeJoin: async (input) => {
          capturedInput = input;

          return {
            participant: {
              handle: "vinicius",
              id: "handle_1",
              status: "online",
            },
            room: {
              id: "room_1",
              slug: "night-shift",
            },
            session: {
              expiresAt: "2026-04-25T12:00:00.000Z",
              handleId: "handle_1",
              id: "session_1",
              joinedAt: "2026-04-24T12:00:00.000Z",
              roomId: "room_1",
              status: "active",
            },
          };
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/join", {
      body: JSON.stringify({
        handle: " vinicius ",
        password: " open-sesame ",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      participant: {
        handle: "vinicius",
        id: "handle_1",
        status: "online",
      },
      room: {
        id: "room_1",
        slug: "night-shift",
      },
      session: {
        expiresAt: "2026-04-25T12:00:00.000Z",
        handleId: "handle_1",
        id: "session_1",
        joinedAt: "2026-04-24T12:00:00.000Z",
        roomId: "room_1",
        status: "active",
      },
    });
    expect(capturedInput).toEqual({
      handle: "vinicius",
      password: "open-sesame",
      slug: "night-shift",
    });
  });

  it("rejects invalid join payloads before calling the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeJoin: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/join", {
      body: JSON.stringify({
        handle: "vinicius",
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

  it("rejects join requests with a blank room slug before calling the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeJoin: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/%20/join", {
      body: JSON.stringify({
        handle: "vinicius",
        password: "open-sesame",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_path",
      field: "slug",
    });
    expect(called).toBe(false);
  });

  it("returns denied when chat room credentials are invalid", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeJoin: async () => {
          throw new InvalidChatRoomCredentialsError();
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/join", {
      body: JSON.stringify({
        handle: "vinicius",
        password: "wrong",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "chat",
    });
  });

  it("returns denied with reason when handle is banned", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeJoin: async () => {
          throw new BannedChatHandleError();
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/join", {
      body: JSON.stringify({
        handle: "vinicius",
        password: "open-sesame",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      reason: "handle_banned",
      resource: "chat",
    });
  });

  it("maps a valid room session validation request into the resolve-session use case", async () => {
    let capturedInput: ResolveChatRoomSessionInput | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeResolve: async (input) => {
          capturedInput = input;

          return {
            participant: {
              handle: "vinicius",
              id: "handle_1",
              status: "online",
            },
            room: {
              id: "room_1",
              slug: "night-shift",
            },
            session: {
              expiresAt: "2026-04-25T12:00:00.000Z",
              handleId: "handle_1",
              id: "session_1",
              joinedAt: "2026-04-24T12:00:00.000Z",
              roomId: "room_1",
              status: "active",
            },
          };
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/session", {
      headers: {
        "x-chat-room-session-id": " session_1 ",
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      participant: {
        handle: "vinicius",
        id: "handle_1",
        status: "online",
      },
      room: {
        id: "room_1",
        slug: "night-shift",
      },
      session: {
        expiresAt: "2026-04-25T12:00:00.000Z",
        handleId: "handle_1",
        id: "session_1",
        joinedAt: "2026-04-24T12:00:00.000Z",
        roomId: "room_1",
        status: "active",
      },
    });
    expect(capturedInput).toEqual({
      roomSessionId: "session_1",
      slug: "night-shift",
    });
  });

  it("returns denied when room session validation fails", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeResolve: async () => {
          throw new InvalidChatRoomSessionError();
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/session", {
      headers: {
        "x-chat-room-session-id": "session_1",
      },
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "chat",
    });
  });

  it("rejects live websocket requests that do not provide the websocket auth contract", async () => {
    const app = createHonoHttpAdapter(createTestContainer());

    const response = await app.request("/api/chat/rooms/night-shift/live");

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "sec-websocket-protocol",
      reason: "missing_transport_protocol",
    });
  });

  it("accepts websocket live auth via sec-websocket-protocol without query-string session ids", async () => {
    let capturedResolveInput: ResolveChatRoomSessionInput | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeResolve: async (input) => {
          capturedResolveInput = input;

          return {
            participant: {
              handle: "vinicius",
              id: "handle_1",
              status: "online",
            },
            room: {
              id: "room_1",
              slug: "night-shift",
            },
            session: {
              expiresAt: "2026-04-25T12:00:00.000Z",
              handleId: "handle_1",
              id: "session_1",
              joinedAt: "2026-04-24T12:00:00.000Z",
              roomId: "room_1",
              status: "active",
            },
          };
        },
      }),
    );
    const websocket = await resolveWebSocketHandler();
    const server = Bun.serve({
      fetch: (request, bunServer) => app.fetch(request, bunServer),
      port: nextTestServerPort(),
      websocket,
    });
    const protocols = [
      chatLiveTransportProtocol,
      buildChatLiveRoomSessionProtocol("session_1"),
    ];

    try {
      const negotiated = await new Promise<{
        message: unknown;
        protocol: string;
      }>((resolve, reject) => {
        const socket = new WebSocket(
          `ws://127.0.0.1:${server.port}/api/chat/rooms/night-shift/live`,
          protocols,
        );
        const timeout = setTimeout(() => {
          socket.close();
          reject(new Error("timed out waiting for websocket participant snapshot"));
        }, 2_000);
        let settled = false;

        socket.onmessage = (event) => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timeout);
          socket.close();
          resolve({
            message: JSON.parse(String(event.data)),
            protocol: socket.protocol,
          });
        };

        socket.onerror = () => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timeout);
          reject(new Error("failed to open websocket live connection"));
        };
      });

      expect(negotiated.protocol).toBe(chatLiveTransportProtocol);
      expect(negotiated.message).toEqual({
        items: [
          {
            handle: "vinicius",
            status: "online",
          },
        ],
        type: "participant.snapshot",
      });
      expect(capturedResolveInput).toEqual({
        roomSessionId: "session_1",
        slug: "night-shift",
      });
    } finally {
      await server.stop(true);
    }
  });

  it("rejects live websocket upgrades when the room session is invalid", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeResolve: async () => {
          throw new InvalidChatRoomSessionError();
        },
      }),
    );
    const websocket = await resolveWebSocketHandler();
    const server = Bun.serve({
      fetch: (request, bunServer) => app.fetch(request, bunServer),
      port: nextTestServerPort(),
      websocket,
    });

    try {
      const response = await fetch(`http://127.0.0.1:${server.port}/api/chat/rooms/night-shift/live`, {
        headers: createWebSocketUpgradeHeaders([
          chatLiveTransportProtocol,
          buildChatLiveRoomSessionProtocol("expired_session"),
        ]),
      });

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        error: "denied",
        resource: "chat",
      });
    } finally {
      await server.stop(true);
    }
  });

  it("maps a valid participants request into the participants use case", async () => {
    let capturedInput: ListChatRoomParticipantsInput | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeParticipants: async (input) => {
          capturedInput = input;

          return {
            items: [
              {
                handle: "vinicius",
                status: "online",
              },
              {
                handle: "guest",
                status: "idle",
              },
            ],
          };
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/participants", {
      headers: {
        "x-chat-room-session-id": " session_1 ",
      },
      method: "GET",
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [
        {
          handle: "vinicius",
          status: "online",
        },
        {
          handle: "guest",
          status: "idle",
        },
      ],
    });
    expect(capturedInput).toEqual({
      roomSessionId: "session_1",
      slug: "night-shift",
    });
  });

  it("rejects participants requests missing room session header", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeParticipants: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/participants", {
      method: "GET",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "x-chat-room-session-id",
    });
    expect(called).toBe(false);
  });

  it("returns denied when participants access is invalid for the room session", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeParticipants: async () => {
          throw new InvalidChatParticipantAccessError();
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/participants", {
      headers: {
        "x-chat-room-session-id": "session_1",
      },
      method: "GET",
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "chat",
    });
  });

  it("maps a valid message archive request into the chat messages use case", async () => {
    let capturedInput: ListChatRoomMessagesInput | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeMessages: async (input) => {
          capturedInput = input;

          return {
            items: [
              {
                author: "vinicius",
                body: "late-night check-in",
                id: "message_2",
                sentAt: "2026-04-24T12:02:00.000Z",
                tone: "pink",
              },
              {
                attachment: {
                  byteSize: 1234,
                  fileName: "scan.png",
                  id: "upload_1",
                  kind: "image",
                  mimeType: "image/png",
                },
                author: "ghost-operator",
                body: "drop archived",
                id: "message_1",
                sentAt: "2026-04-24T12:01:00.000Z",
              },
            ],
            pageInfo: {
              nextCursor: "cursor_1",
            },
          };
        },
      }),
    );

    const response = await app.request(
      "/api/chat/rooms/night-shift/messages?cursor=cursor_0&limit=20",
      {
        headers: {
          "x-chat-room-session-id": " session_1 ",
        },
        method: "GET",
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      items: [
        {
          author: "vinicius",
          body: "late-night check-in",
          id: "message_2",
          sentAt: "2026-04-24T12:02:00.000Z",
          tone: "pink",
        },
        {
          attachment: {
            byteSize: 1234,
            fileName: "scan.png",
            id: "upload_1",
            kind: "image",
            mimeType: "image/png",
          },
          author: "ghost-operator",
          body: "drop archived",
          id: "message_1",
          sentAt: "2026-04-24T12:01:00.000Z",
        },
      ],
      pageInfo: {
        nextCursor: "cursor_1",
      },
    });
    expect(capturedInput).toEqual({
      cursor: "cursor_0",
      limit: 20,
      roomSessionId: "session_1",
      slug: "night-shift",
    });
  });

  it("rejects message archive requests with invalid limit query before calling the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeMessages: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages?limit=0", {
      headers: {
        "x-chat-room-session-id": "session_1",
      },
      method: "GET",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_query",
      field: "limit",
    });
    expect(called).toBe(false);
  });

  it("rejects message archive requests missing room session header", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeMessages: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages", {
      method: "GET",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "x-chat-room-session-id",
    });
    expect(called).toBe(false);
  });

  it("returns denied when archive access is invalid for the room session", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeMessages: async () => {
          throw new InvalidChatMessageAccessError();
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages", {
      headers: {
        "x-chat-room-session-id": "session_1",
      },
      method: "GET",
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "chat",
    });
  });

  it("maps malformed archive cursor errors to invalid_query", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeMessages: async () => {
          throw new InvalidChatMessageCursorError();
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages?cursor=bad", {
      headers: {
        "x-chat-room-session-id": "session_1",
      },
      method: "GET",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_query",
      field: "cursor",
    });
  });

  it("maps a valid text message request into the send-text use case", async () => {
    let capturedInput: SendChatRoomTextMessageInput | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeSendText: async (input) => {
          capturedInput = input;

          return {
            author: "vinicius",
            body: "from the bunker",
            id: "message_3",
            sentAt: "2026-04-24T12:03:00.000Z",
            tone: "system",
          };
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages", {
      body: JSON.stringify({
        body: "  from the bunker  ",
        tone: "system",
      }),
      headers: {
        "content-type": "application/json",
        "x-chat-room-session-id": " session_1 ",
      },
      method: "POST",
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      item: {
        author: "vinicius",
        body: "from the bunker",
        id: "message_3",
        sentAt: "2026-04-24T12:03:00.000Z",
        tone: "system",
      },
    });
    expect(capturedInput).toEqual({
      body: "from the bunker",
      roomSessionId: "session_1",
      slug: "night-shift",
      tone: "system",
    });
  });

  it("rejects text message requests missing room session header", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeSendText: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages", {
      body: JSON.stringify({
        body: "message body",
      }),
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "x-chat-room-session-id",
    });
    expect(called).toBe(false);
  });

  it("rejects text message requests with invalid tone before calling the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeSendText: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages", {
      body: JSON.stringify({
        body: "message body",
        tone: "violet",
      }),
      headers: {
        "content-type": "application/json",
        "x-chat-room-session-id": "session_1",
      },
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "tone",
    });
    expect(called).toBe(false);
  });

  it("rejects text message requests with malformed JSON before calling the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeSendText: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages", {
      body: "{",
      headers: {
        "content-type": "application/json",
        "x-chat-room-session-id": "session_1",
      },
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "body",
    });
    expect(called).toBe(false);
  });

  it("rejects text message requests over the 2000-character limit before calling the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeSendText: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages", {
      body: JSON.stringify({
        body: "x".repeat(2001),
      }),
      headers: {
        "content-type": "application/json",
        "x-chat-room-session-id": "session_1",
      },
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "body",
    });
    expect(called).toBe(false);
  });

  it("returns denied when text message access is invalid for the room session", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeSendText: async () => {
          throw new InvalidChatMessageAccessError();
        },
      }),
    );

    const response = await app.request("/api/chat/rooms/night-shift/messages", {
      body: JSON.stringify({
        body: "message body",
      }),
      headers: {
        "content-type": "application/json",
        "x-chat-room-session-id": "session_1",
      },
      method: "POST",
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "chat",
    });
  });

  it("maps a valid upload request into the chat upload use case", async () => {
    let capturedInput: UploadChatMessageWithImageInput | undefined;
    let capturedMimeType: string | undefined;
    let capturedResolveInput: ResolveChatRoomSessionInput | undefined;
    let capturedTone: "cyan" | "pink" | "system" | null | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeResolve: async (input) => {
          capturedResolveInput = input;

          return {
            participant: {
              handle: "vinicius",
              id: "handle_1",
              status: "online",
            },
            room: {
              id: "room_1",
              slug: "night-shift",
            },
            session: {
              expiresAt: "2026-04-25T12:00:00.000Z",
              handleId: "handle_1",
              id: "session_1",
              joinedAt: "2026-04-24T12:00:00.000Z",
              roomId: "room_1",
              status: "active",
            },
          };
        },
        executeUpload: async (input) => {
          capturedInput = input;
          capturedMimeType = input.image.mimeType;
          capturedTone = input.tone;

          return defaultUploadResponse;
        },
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData({
        legacyAuthorHandleId: "forged_handle",
        legacyRoomId: "forged_room",
      }),
      method: "POST",
    });

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      item: {
        attachment: {
          byteSize: 4,
          fileName: "scan.png",
          id: "upload_1",
          kind: "image",
          mimeType: "image/png",
        },
        author: "vinicius",
        body: "message body",
        id: "message_1",
        sentAt: "2026-04-24T12:00:00.000Z",
        tone: "cyan",
      },
    });
    expect(capturedInput).toEqual({
      body: "message body",
      image: {
        body: pngSignatureBytes,
        displayFilename: "scan.png",
        mimeType: "image/png",
      },
      roomSessionId: "session_1",
      tone: "cyan",
    });
    expect(capturedResolveInput).toEqual({
      roomSessionId: "session_1",
      slug: "night-shift",
    });
    expect(capturedTone).toBe("cyan");
    expect(capturedMimeType).toBe("image/png");
  });

  it("rejects upload requests missing roomSessionId before reaching the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeUpload: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData({
        roomSessionId: "   ",
      }),
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_request",
      field: "roomSessionId",
    });
    expect(called).toBe(false);
  });

  it("rejects invalid MIME types before reaching the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeUpload: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData({
        fileName: "scan.bin",
        mimeType: "application/octet-stream",
      }),
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_upload",
      field: "file",
      reason: "unsupported_mime_type",
    });
    expect(called).toBe(false);
  });

  it("accepts jpeg, png, and webp signatures for allowed MIME types", async () => {
    const acceptedMimeTypes: string[] = [];
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeUpload: async (input) => {
          acceptedMimeTypes.push(input.image.mimeType);
          return defaultUploadResponse;
        },
      }),
    );

    const uploadCases = [
      {
        bytes: jpegSignatureBytes,
        fileName: "scan.jpg",
        mimeType: "image/jpeg",
      },
      {
        bytes: pngSignatureBytes,
        fileName: "scan.png",
        mimeType: "image/png",
      },
      {
        bytes: webpSignatureBytes,
        fileName: "scan.webp",
        mimeType: "image/webp",
      },
    ] as const;

    for (const uploadCase of uploadCases) {
      const response = await app.request("/api/chat/messages/upload", {
        body: createUploadFormData(uploadCase),
        method: "POST",
      });

      expect(response.status).toBe(201);
    }

    expect(acceptedMimeTypes).toEqual(["image/jpeg", "image/png", "image/webp"]);
  });

  it("rejects upload requests with MIME/signature mismatches", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeUpload: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData({
        bytes: jpegSignatureBytes,
        mimeType: "image/png",
      }),
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_upload",
      field: "file",
      reason: "mime_signature_mismatch",
    });
    expect(called).toBe(false);
  });

  it("rejects oversized uploads before reaching the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeUpload: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData({ bytes: new Uint8Array(5 * 1024 * 1024 + 1) }),
      method: "POST",
    });

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_upload",
      field: "file",
      reason: "file_too_large",
    });
    expect(called).toBe(false);
  });

  it("rejects multiple upload files per message", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeUpload: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );
    const formData = createUploadFormData();
    formData.append("file", new File([new Uint8Array([5, 6])], "extra.jpg", { type: "image/jpeg" }));

    const response = await app.request("/api/chat/messages/upload", {
      body: formData,
      method: "POST",
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "invalid_upload",
      field: "file",
      reason: "too_many_files",
    });
    expect(called).toBe(false);
  });

  it("returns denied when upload actor validation fails in the core", async () => {
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeUpload: async () => {
          throw new InvalidChatUploadActorError();
        },
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData(),
      method: "POST",
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "chat",
    });
  });

  it("returns denied when upload room-session validation fails before reaching the core", async () => {
    let called = false;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeResolve: async () => {
          throw new InvalidChatRoomSessionError();
        },
        executeUpload: async () => {
          called = true;
          throw new Error("should not run");
        },
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData(),
      method: "POST",
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "denied",
      resource: "chat",
    });
    expect(called).toBe(false);
  });

  it("rate limits repeated chat room join attempts", async () => {
    let callCount = 0;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeJoin: async () => {
          callCount += 1;

          return {
            participant: {
              handle: "vinicius",
              id: "handle_1",
              status: "online",
            },
            room: {
              id: "room_1",
              slug: "night-shift",
            },
            session: {
              expiresAt: "2026-04-25T12:00:00.000Z",
              handleId: "handle_1",
              id: "session_1",
              joinedAt: "2026-04-24T12:00:00.000Z",
              roomId: "room_1",
              status: "active",
            },
          };
        },
      }),
    );

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await app.request("/api/chat/rooms/night-shift/join", {
        body: JSON.stringify({
          handle: "vinicius",
          password: "open-sesame",
        }),
        headers: {
          "content-type": "application/json",
          "x-forwarded-for": "198.51.100.10",
        },
        method: "POST",
      });

      expect(response.status).toBe(200);
    }

    const limitedResponse = await app.request("/api/chat/rooms/night-shift/join", {
      body: JSON.stringify({
        handle: "vinicius",
        password: "open-sesame",
      }),
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": "198.51.100.10",
      },
      method: "POST",
    });

    expect(limitedResponse.status).toBe(429);
    await expect(limitedResponse.json()).resolves.toEqual({
      error: "rate_limited",
      resource: "api",
    });
    expect(callCount).toBe(10);
  });

  it("rate limits repeated chat message send attempts", async () => {
    let callCount = 0;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeSendText: async () => {
          callCount += 1;
          return defaultTextMessageResponse;
        },
      }),
    );

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const response = await app.request("/api/chat/rooms/night-shift/messages", {
        body: JSON.stringify({
          body: "message body",
        }),
        headers: {
          "content-type": "application/json",
          "x-chat-room-session-id": "session_1",
          "x-forwarded-for": "198.51.100.11",
        },
        method: "POST",
      });

      expect(response.status).toBe(201);
    }

    const limitedResponse = await app.request("/api/chat/rooms/night-shift/messages", {
      body: JSON.stringify({
        body: "message body",
      }),
      headers: {
        "content-type": "application/json",
        "x-chat-room-session-id": "session_1",
        "x-forwarded-for": "198.51.100.11",
      },
      method: "POST",
    });

    expect(limitedResponse.status).toBe(429);
    await expect(limitedResponse.json()).resolves.toEqual({
      error: "rate_limited",
      resource: "api",
    });
    expect(callCount).toBe(30);
  });

  it("rate limits repeated chat upload attempts", async () => {
    let callCount = 0;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeUpload: async () => {
          callCount += 1;
          return defaultUploadResponse;
        },
      }),
    );

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await app.request("/api/chat/messages/upload", {
        body: createUploadFormData(),
        headers: {
          "x-forwarded-for": "198.51.100.12",
        },
        method: "POST",
      });

      expect(response.status).toBe(201);
    }

    const limitedResponse = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData(),
      headers: {
        "x-forwarded-for": "198.51.100.12",
      },
      method: "POST",
    });

    expect(limitedResponse.status).toBe(429);
    await expect(limitedResponse.json()).resolves.toEqual({
      error: "rate_limited",
      resource: "api",
    });
    expect(callCount).toBe(10);
  });
});
