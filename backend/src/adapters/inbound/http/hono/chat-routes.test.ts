import { describe, expect, it } from "bun:test";

import type { BootstrapContainer } from "@/bootstrap/container";
import type {
  JoinChatRoomSessionInput,
  JoinChatRoomSessionOutput,
  ListChatRoomMessagesInput,
  ListChatRoomMessagesOutput,
  ListChatRoomParticipantsInput,
  ListChatRoomParticipantsOutput,
  UploadChatMessageWithImageInput,
  UploadChatMessageWithImageOutput,
} from "@/modules/chat/ports/inbound";
import {
  BannedChatHandleError,
  InvalidChatMessageAccessError,
  InvalidChatMessageCursorError,
  InvalidChatParticipantAccessError,
  InvalidChatRoomCredentialsError,
  InvalidChatUploadActorError,
} from "@/modules/chat/application";

import { createHonoHttpAdapter } from "./http-adapter";

const defaultUploadResponse: UploadChatMessageWithImageOutput = {
  attachment: {
    byteSize: 4,
    fileName: "scan.png",
    id: "upload_1",
    kind: "image",
    mimeType: "image/png",
  },
  authorHandleId: "handle_1",
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
  executeUpload = async (): Promise<UploadChatMessageWithImageOutput> => defaultUploadResponse,
}: Readonly<{
  executeJoin?: (
    input: JoinChatRoomSessionInput,
  ) => JoinChatRoomSessionOutput | Promise<JoinChatRoomSessionOutput>;
  executeParticipants?: (
    input: ListChatRoomParticipantsInput,
  ) => ListChatRoomParticipantsOutput | Promise<ListChatRoomParticipantsOutput>;
  executeMessages?: (
    input: ListChatRoomMessagesInput,
  ) => ListChatRoomMessagesOutput | Promise<ListChatRoomMessagesOutput>;
  executeUpload?: (
    input: UploadChatMessageWithImageInput,
  ) => UploadChatMessageWithImageOutput | Promise<UploadChatMessageWithImageOutput>;
}> = {}): BootstrapContainer => ({
  chat: {
    joinRoomSession: {
      execute: executeJoin,
    },
    listRoomParticipants: {
      execute: executeParticipants,
    },
    listRoomMessages: {
      execute: executeMessages,
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

const createUploadFormData = ({
  body = "message body",
  bytes = new Uint8Array([1, 2, 3, 4]),
  fileName = "scan.png",
  mimeType = "image/png",
  tone = "cyan",
}: {
  body?: string;
  bytes?: Uint8Array;
  fileName?: string;
  mimeType?: string;
  tone?: string;
} = {}): FormData => {
  const formData = new FormData();
  const fileBytes = new Uint8Array(bytes.byteLength);
  fileBytes.set(bytes);
  formData.append("roomId", "room_1");
  formData.append("roomSessionId", "session_1");
  formData.append("authorHandleId", "handle_1");
  formData.append("body", body);
  formData.append("tone", tone);
  formData.append("file", new File([fileBytes.buffer], fileName, { type: mimeType }));

  return formData;
};

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

  it("maps a valid upload request into the chat upload use case", async () => {
    let capturedAuthorHandleId: string | undefined;
    let capturedMimeType: string | undefined;
    let capturedRoomId: string | undefined;
    let capturedRoomSessionId: string | undefined;
    let capturedTone: "cyan" | "pink" | "system" | null | undefined;
    const app = createHonoHttpAdapter(
      createTestContainer({
        executeUpload: async (input) => {
          capturedAuthorHandleId = input.authorHandleId;
          capturedMimeType = input.image.mimeType;
          capturedRoomId = input.roomId;
          capturedRoomSessionId = input.roomSessionId;
          capturedTone = input.tone;

          return defaultUploadResponse;
        },
      }),
    );

    const response = await app.request("/api/chat/messages/upload", {
      body: createUploadFormData(),
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
        authorHandleId: "handle_1",
        body: "message body",
        id: "message_1",
        sentAt: "2026-04-24T12:00:00.000Z",
        tone: "cyan",
      },
    });
    expect(capturedRoomId).toBe("room_1");
    expect(capturedRoomSessionId).toBe("session_1");
    expect(capturedAuthorHandleId).toBe("handle_1");
    expect(capturedTone).toBe("cyan");
    expect(capturedMimeType).toBe("image/png");
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

  it("returns denied when the room session and author ids do not match", async () => {
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
});
