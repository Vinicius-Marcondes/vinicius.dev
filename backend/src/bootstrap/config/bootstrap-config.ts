import { resolve } from "node:path";

export const API_BASE_PATH = "/api" as const;
export const MEDIA_PHOTO_ORIGINAL_PATH = "/media/photos/:id/original" as const;

const DEFAULT_PORT = 3000;
const DEFAULT_NODE_ENV = "development";
const DEFAULT_MEDIA_PHOTOS_ROOT = "/var/lib/vinicius.dev/media/photos";
const DEFAULT_MEDIA_CHAT_ROOT = "/var/lib/vinicius.dev/media/chat";
const DEFAULT_MEDIA_PUBLIC_URL_BASE = "/media";
const DEFAULT_CHAT_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_CHAT_UPLOAD_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
const DEFAULT_CHAT_UPLOAD_MAX_FILES_PER_MESSAGE = 1;
const DEFAULT_SESSION_SECRET = "development-session-secret";
const DEFAULT_SESSION_COOKIE_NAME = "vinicius.dev-session";
const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_MFA_CODE_MAX_AGE_SECONDS = 60 * 10;
const DEFAULT_ROOM_PASSWORD_SECRET = "development-room-password-secret";

export type NodeEnv = "development" | "test" | "production";

export type BootstrapConfig = {
  auth: {
    mfaCodeMaxAgeSeconds: number;
    roomPasswordSecret: string;
    sessionCookieName: string;
    sessionMaxAgeSeconds: number;
    sessionSecret: string;
  };
  cors: {
    allowCredentials: boolean;
    allowedOrigins: string[];
  };
  media: {
    chatRoot: string;
    chatUploadAllowedMimeTypes: string[];
    chatUploadMaxBytes: number;
    chatUploadMaxFilesPerMessage: number;
    photosRoot: string;
    publicUrlBase: string;
  };
  server: {
    apiBasePath: typeof API_BASE_PATH;
    mediaPhotoOriginalPath: typeof MEDIA_PHOTO_ORIGINAL_PATH;
    nodeEnv: NodeEnv;
    port: number;
  };
};

type BootstrapEnv = Readonly<Record<string, string | undefined>>;

const parsePort = (value: string | undefined) => {
  if (value === undefined || value === "") {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
};

const parseNodeEnv = (value: string | undefined): NodeEnv => {
  if (value === undefined || value === "") {
    return DEFAULT_NODE_ENV;
  }

  if (value === "development" || value === "test" || value === "production") {
    return value;
  }

  throw new Error(`Invalid NODE_ENV value: ${value}`);
};

const parseInteger = (value: string | undefined, fallback: number, name: string) => {
  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${name} value: ${value}`);
  }

  return parsed;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined || value === "") {
    return fallback;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`Invalid boolean value: ${value}`);
};

const parseList = (value: string | undefined, fallback: string[]) => {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
};

const parseString = (value: string | undefined, fallback: string) =>
  value === undefined || value === "" ? fallback : value;

const normalizeRootPath = (value: string) => resolve(value);

export const loadBootstrapConfig = (
  env: BootstrapEnv = Bun.env,
): BootstrapConfig => {
  const media = {
    chatRoot: parseString(env.MEDIA_CHAT_ROOT, DEFAULT_MEDIA_CHAT_ROOT),
    chatUploadAllowedMimeTypes: parseList(
      env.CHAT_UPLOAD_ALLOWED_MIME_TYPES,
      DEFAULT_CHAT_UPLOAD_ALLOWED_MIME_TYPES,
    ),
    chatUploadMaxBytes: parseInteger(
      env.CHAT_UPLOAD_MAX_BYTES,
      DEFAULT_CHAT_UPLOAD_MAX_BYTES,
      "CHAT_UPLOAD_MAX_BYTES",
    ),
    chatUploadMaxFilesPerMessage: parseInteger(
      env.CHAT_UPLOAD_MAX_FILES_PER_MESSAGE,
      DEFAULT_CHAT_UPLOAD_MAX_FILES_PER_MESSAGE,
      "CHAT_UPLOAD_MAX_FILES_PER_MESSAGE",
    ),
    photosRoot: parseString(env.MEDIA_PHOTOS_ROOT, DEFAULT_MEDIA_PHOTOS_ROOT),
    publicUrlBase: parseString(
      env.MEDIA_PUBLIC_URL_BASE,
      DEFAULT_MEDIA_PUBLIC_URL_BASE,
    ),
  };

  if (normalizeRootPath(media.photosRoot) === normalizeRootPath(media.chatRoot)) {
    throw new Error("MEDIA_PHOTOS_ROOT and MEDIA_CHAT_ROOT must be different");
  }

  return {
    auth: {
      mfaCodeMaxAgeSeconds: parseInteger(
        env.AUTH_MFA_CODE_MAX_AGE_SECONDS,
        DEFAULT_MFA_CODE_MAX_AGE_SECONDS,
        "AUTH_MFA_CODE_MAX_AGE_SECONDS",
      ),
      roomPasswordSecret: parseString(
        env.AUTH_ROOM_PASSWORD_SECRET,
        DEFAULT_ROOM_PASSWORD_SECRET,
      ),
      sessionCookieName: parseString(
        env.AUTH_SESSION_COOKIE_NAME,
        DEFAULT_SESSION_COOKIE_NAME,
      ),
      sessionMaxAgeSeconds: parseInteger(
        env.AUTH_SESSION_MAX_AGE_SECONDS,
        DEFAULT_SESSION_MAX_AGE_SECONDS,
        "AUTH_SESSION_MAX_AGE_SECONDS",
      ),
      sessionSecret: parseString(env.AUTH_SESSION_SECRET, DEFAULT_SESSION_SECRET),
    },
    cors: {
      allowCredentials: parseBoolean(env.CORS_ALLOW_CREDENTIALS, true),
      allowedOrigins: parseList(env.CORS_ALLOWED_ORIGINS, []),
    },
    media,
    server: {
      apiBasePath: API_BASE_PATH,
      mediaPhotoOriginalPath: MEDIA_PHOTO_ORIGINAL_PATH,
      nodeEnv: parseNodeEnv(env.NODE_ENV),
      port: parsePort(env.PORT),
    },
  };
};
