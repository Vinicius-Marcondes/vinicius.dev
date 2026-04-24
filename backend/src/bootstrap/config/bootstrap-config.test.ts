import { describe, expect, it } from "bun:test";

import { loadBootstrapConfig } from "./bootstrap-config";

describe("bootstrap config", () => {
  it("loads defaults for runtime placeholders", () => {
    const config = loadBootstrapConfig({});

    expect(config).toEqual({
      auth: {
        mfaCodeMaxAgeSeconds: 600,
        roomPasswordSecret: "development-room-password-secret",
        sessionCookieName: "vinicius.dev-session",
        sessionMaxAgeSeconds: 604800,
        sessionSecret: "development-session-secret",
      },
      cors: {
        allowCredentials: true,
        allowedOrigins: [],
      },
      media: {
        chatRoot: "/var/lib/vinicius.dev/media/chat",
        chatUploadAllowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
        ],
        chatUploadMaxBytes: 5 * 1024 * 1024,
        chatUploadMaxFilesPerMessage: 1,
        photosRoot: "/var/lib/vinicius.dev/media/photos",
        publicUrlBase: "/media",
      },
      server: {
        apiBasePath: "/api",
        mediaPhotoOriginalPath: "/media/photos/:id/original",
        nodeEnv: "development",
        port: 3000,
      },
    });
  });

  it("applies environment overrides for runtime config", () => {
    const config = loadBootstrapConfig({
      AUTH_MFA_CODE_MAX_AGE_SECONDS: "120",
      AUTH_ROOM_PASSWORD_SECRET: "room-secret",
      AUTH_SESSION_COOKIE_NAME: "session-cookie",
      AUTH_SESSION_MAX_AGE_SECONDS: "3600",
      AUTH_SESSION_SECRET: "session-secret",
      CHAT_UPLOAD_ALLOWED_MIME_TYPES: "image/jpeg,image/png",
      CHAT_UPLOAD_MAX_BYTES: "1048576",
      CHAT_UPLOAD_MAX_FILES_PER_MESSAGE: "1",
      CORS_ALLOW_CREDENTIALS: "false",
      CORS_ALLOWED_ORIGINS: "http://localhost:5173, https://example.com",
      MEDIA_CHAT_ROOT: "/tmp/chat",
      MEDIA_PHOTOS_ROOT: "/tmp/photos",
      MEDIA_PUBLIC_URL_BASE: "https://media.example.com",
      NODE_ENV: "production",
      PORT: "4321",
    });

    expect(config.server.port).toBe(4321);
    expect(config.server.nodeEnv).toBe("production");
    expect(config.media.photosRoot).toBe("/tmp/photos");
    expect(config.media.chatRoot).toBe("/tmp/chat");
    expect(config.media.chatUploadMaxBytes).toBe(1048576);
    expect(config.media.chatUploadAllowedMimeTypes).toEqual([
      "image/jpeg",
      "image/png",
    ]);
    expect(config.auth.sessionSecret).toBe("session-secret");
    expect(config.auth.sessionCookieName).toBe("session-cookie");
    expect(config.auth.sessionMaxAgeSeconds).toBe(3600);
    expect(config.auth.mfaCodeMaxAgeSeconds).toBe(120);
    expect(config.auth.roomPasswordSecret).toBe("room-secret");
    expect(config.cors.allowCredentials).toBe(false);
    expect(config.cors.allowedOrigins).toEqual([
      "http://localhost:5173",
      "https://example.com",
    ]);
    expect(config.media.publicUrlBase).toBe("https://media.example.com");
  });

  it("rejects overlapping media roots", () => {
    expect(() =>
      loadBootstrapConfig({
        MEDIA_CHAT_ROOT: "/tmp/media",
        MEDIA_PHOTOS_ROOT: "/tmp/media",
      }),
    ).toThrow("MEDIA_PHOTOS_ROOT and MEDIA_CHAT_ROOT must be different");

    expect(() =>
      loadBootstrapConfig({
        MEDIA_CHAT_ROOT: "/tmp/media/",
        MEDIA_PHOTOS_ROOT: "/tmp/media",
      }),
    ).toThrow("MEDIA_PHOTOS_ROOT and MEDIA_CHAT_ROOT must be different");
  });
});
