import { createPrismaPersistenceAdapter } from "@/adapters/outbound/persistence";
import { createFilesystemMediaStorageAdapter } from "@/adapters/outbound/storage/filesystem";
import {
  createGetAdminDashboardSummaryUseCase,
  createListAdminPhotosUseCase,
  createListAdminProjectsUseCase,
  createListAdminStatusStripEntriesUseCase,
  createListAdminThoughtsUseCase,
  createReplaceAdminStatusStripEntriesUseCase,
  createUpdateAdminPhotoCurationUseCase,
  createUpdateAdminPhotoMetadataUseCase,
  createUpdateAdminProjectCurationUseCase,
  createUpdateAdminThoughtCurationUseCase,
} from "@/modules/admin/application";
import type {
  GetAdminDashboardSummaryPort,
  ListAdminPhotosPort,
  ListAdminProjectsPort,
  ListAdminStatusStripEntriesPort,
  ListAdminThoughtsPort,
  ReplaceAdminStatusStripEntriesPort,
  UpdateAdminPhotoCurationPort,
  UpdateAdminPhotoMetadataPort,
  UpdateAdminProjectCurationPort,
  UpdateAdminThoughtCurationPort,
} from "@/modules/admin/ports/inbound";
import {
  createBunMfaCodeHashPort,
  createBunPasswordHashPort,
  createCryptoAuthIdGenerator,
  createCryptoSessionTokenGenerator,
  createHmacSessionTokenHashPort,
  createLoginWithCredentialsUseCase,
  createNoopAuthMfaMessagePort,
  createRandomDigitMfaCodeGenerator,
  createRefreshAdminSessionUseCase,
  createResolveAdminSessionUseCase,
  createLogoutAdminSessionUseCase,
  createSystemAuthClock,
  createVerifyMfaChallengeUseCase,
} from "@/modules/auth/application";
import type {
  LoginWithCredentialsPort,
  LogoutAdminSessionPort,
  RefreshAdminSessionPort,
  ResolveAdminSessionPort,
  VerifyMfaChallengePort,
} from "@/modules/auth/ports/inbound";
import {
  createBanChatRoomHandleUseCase,
  createGetChatRoomAccessUseCase,
  createJoinChatRoomSessionUseCase,
  createListChatModerationAuditsUseCase,
  createListChatRoomMessagesUseCase,
  createListChatRoomParticipantsUseCase,
  createModerateChatRoomMessageUseCase,
  createModerateChatUploadRetentionUseCase,
  createOpenChatUploadMediaUseCase,
  createResolveChatRoomSessionUseCase,
  createRotateChatRoomPasswordUseCase,
  createSendChatRoomTextMessageUseCase,
  createUploadChatMessageWithImageUseCase,
} from "@/modules/chat/application";
import type {
  BanChatRoomHandlePort,
  GetChatRoomAccessPort,
  JoinChatRoomSessionPort,
  ListChatModerationAuditsPort,
  ListChatRoomMessagesPort,
  ListChatRoomParticipantsPort,
  ModerateChatRoomMessagePort,
  ModerateChatUploadRetentionPort,
  OpenChatUploadMediaPort,
  ResolveChatRoomSessionPort,
  RotateChatRoomPasswordPort,
  SendChatRoomTextMessagePort,
  UploadChatMessageWithImagePort,
} from "@/modules/chat/ports/inbound";
import {
  createGetPublishedProjectBySlugUseCase,
  createGetPublishedPhotoByIdUseCase,
  createGetPublishedThoughtBySlugUseCase,
  createListPublishedPhotosUseCase,
  createListPublishedProjectsUseCase,
  createListPublishedThoughtsUseCase,
  createListStatusStripEntriesUseCase,
} from "@/modules/content/application";
import type {
  GetPublishedProjectBySlugPort,
  GetPublishedPhotoByIdPort,
  GetPublishedThoughtBySlugPort,
  ListPublishedPhotosPort,
  ListPublishedProjectsPort,
  ListPublishedThoughtsPort,
  ListStatusStripEntriesPort,
} from "@/modules/content/ports/inbound";

import { loadBootstrapConfig, type BootstrapConfig } from "../config";

export type BootstrapContainer = Readonly<{
  admin?: Readonly<{
    getDashboardSummary: GetAdminDashboardSummaryPort;
    listPhotos: ListAdminPhotosPort;
    listProjects: ListAdminProjectsPort;
    listStatusStripEntries: ListAdminStatusStripEntriesPort;
    listThoughts: ListAdminThoughtsPort;
    replaceStatusStripEntries: ReplaceAdminStatusStripEntriesPort;
    updatePhotoCuration: UpdateAdminPhotoCurationPort;
    updatePhotoMetadata: UpdateAdminPhotoMetadataPort;
    updateProjectCuration: UpdateAdminProjectCurationPort;
    updateThoughtCuration: UpdateAdminThoughtCurationPort;
  }>;
  auth?: Readonly<{
    loginWithCredentials: LoginWithCredentialsPort;
    logoutAdminSession: LogoutAdminSessionPort;
    refreshAdminSession: RefreshAdminSessionPort;
    resolveAdminSession: ResolveAdminSessionPort;
    verifyMfaChallenge: VerifyMfaChallengePort;
  }>;
  chat: Readonly<{
    banRoomHandle?: BanChatRoomHandlePort;
    getRoomAccess?: GetChatRoomAccessPort;
    joinRoomSession?: JoinChatRoomSessionPort;
    listModerationAudits?: ListChatModerationAuditsPort;
    listRoomMessages?: ListChatRoomMessagesPort;
    listRoomParticipants?: ListChatRoomParticipantsPort;
    moderateRoomMessage?: ModerateChatRoomMessagePort;
    moderateUploadRetention: ModerateChatUploadRetentionPort;
    openUploadMedia: OpenChatUploadMediaPort;
    resolveRoomSession?: ResolveChatRoomSessionPort;
    rotateRoomPassword?: RotateChatRoomPasswordPort;
    sendRoomTextMessage?: SendChatRoomTextMessagePort;
    uploadMessageWithImage: UploadChatMessageWithImagePort;
  }>;
  config: BootstrapConfig;
  content: Readonly<{
    getPublishedProjectBySlug: GetPublishedProjectBySlugPort;
    getPublishedPhotoById: GetPublishedPhotoByIdPort;
    getPublishedThoughtBySlug: GetPublishedThoughtBySlugPort;
    listPublishedPhotos: ListPublishedPhotosPort;
    listPublishedProjects: ListPublishedProjectsPort;
    listPublishedThoughts: ListPublishedThoughtsPort;
    listStatusStripEntries: ListStatusStripEntriesPort;
  }>;
  media: Readonly<{
    repository: ReturnType<typeof createPrismaPersistenceAdapter>["media"];
    storage: ReturnType<typeof createFilesystemMediaStorageAdapter>;
  }>;
}>;

type BootstrapEnv = Readonly<Record<string, string | undefined>>;

const parseAuthMfaEnabled = (value: string | undefined): boolean => {
  if (!value) {
    return true;
  }

  return value !== "false";
};

export const createContainer = (env: BootstrapEnv = Bun.env): BootstrapContainer => {
  const config = loadBootstrapConfig(env);
  const persistence = createPrismaPersistenceAdapter(undefined, {
    roomPasswordSecret: config.auth.roomPasswordSecret,
  });
  const storage = createFilesystemMediaStorageAdapter({
    chatRoot: config.media.chatRoot,
    photosRoot: config.media.photosRoot,
  });
  const authClock = createSystemAuthClock();
  const authMfaCodeHasher = createBunMfaCodeHashPort();
  const authSessionTokenHasher = createHmacSessionTokenHashPort(config.auth.sessionSecret);
  const chatSessionTokenHasher = createHmacSessionTokenHashPort(config.auth.roomPasswordSecret);
  const chatPasswordHasher = createBunPasswordHashPort();
  const chatSessionTokenGenerator = createCryptoSessionTokenGenerator();

  return {
    admin: {
      getDashboardSummary: createGetAdminDashboardSummaryUseCase({
        repository: persistence.admin,
      }),
      listPhotos: createListAdminPhotosUseCase({
        repository: persistence.admin,
      }),
      listProjects: createListAdminProjectsUseCase({
        repository: persistence.admin,
      }),
      listStatusStripEntries: createListAdminStatusStripEntriesUseCase({
        repository: persistence.admin,
      }),
      listThoughts: createListAdminThoughtsUseCase({
        repository: persistence.admin,
      }),
      replaceStatusStripEntries: createReplaceAdminStatusStripEntriesUseCase({
        repository: persistence.admin,
      }),
      updatePhotoCuration: createUpdateAdminPhotoCurationUseCase({
        repository: persistence.admin,
      }),
      updatePhotoMetadata: createUpdateAdminPhotoMetadataUseCase({
        repository: persistence.admin,
      }),
      updateProjectCuration: createUpdateAdminProjectCurationUseCase({
        repository: persistence.admin,
      }),
      updateThoughtCuration: createUpdateAdminThoughtCurationUseCase({
        repository: persistence.admin,
      }),
    },
    auth: {
      loginWithCredentials: createLoginWithCredentialsUseCase({
        clock: authClock,
        idGenerator: createCryptoAuthIdGenerator(),
        mfaCodeGenerator: createRandomDigitMfaCodeGenerator(),
        mfaCodeHasher: authMfaCodeHasher,
        mfaCodeMaxAgeSeconds: config.auth.mfaCodeMaxAgeSeconds,
        mfaEnabled: parseAuthMfaEnabled(env.AUTH_MFA_ENABLED),
        mfaMessage: createNoopAuthMfaMessagePort(),
        passwordHasher: createBunPasswordHashPort(),
        repository: persistence.admin,
        sessionMaxAgeSeconds: config.auth.sessionMaxAgeSeconds,
        sessionTokenGenerator: createCryptoSessionTokenGenerator(),
        sessionTokenHasher: authSessionTokenHasher,
      }),
      logoutAdminSession: createLogoutAdminSessionUseCase({
        clock: authClock,
        repository: persistence.admin,
        sessionTokenHasher: authSessionTokenHasher,
      }),
      refreshAdminSession: createRefreshAdminSessionUseCase({
        clock: authClock,
        repository: persistence.admin,
        sessionMaxAgeSeconds: config.auth.sessionMaxAgeSeconds,
        sessionTokenGenerator: createCryptoSessionTokenGenerator(),
        sessionTokenHasher: authSessionTokenHasher,
      }),
      resolveAdminSession: createResolveAdminSessionUseCase({
        clock: authClock,
        repository: persistence.admin,
        sessionTokenHasher: authSessionTokenHasher,
      }),
      verifyMfaChallenge: createVerifyMfaChallengeUseCase({
        clock: authClock,
        mfaCodeHasher: authMfaCodeHasher,
        repository: persistence.admin,
        sessionMaxAgeSeconds: config.auth.sessionMaxAgeSeconds,
        sessionTokenGenerator: createCryptoSessionTokenGenerator(),
        sessionTokenHasher: authSessionTokenHasher,
      }),
    },
    chat: {
      banRoomHandle: createBanChatRoomHandleUseCase({
        repository: persistence.chat,
      }),
      getRoomAccess: createGetChatRoomAccessUseCase({
        repository: persistence.chat,
        sessionTtlHours: 24,
      }),
      joinRoomSession: createJoinChatRoomSessionUseCase({
        createSessionToken: () => chatSessionTokenGenerator.create(),
        hashSessionToken: (token) => chatSessionTokenHasher.hash(token),
        repository: persistence.chat,
        sessionMaxAgeSeconds: 60 * 60 * 24,
        verifyRoomPassword: ({ passwordHash, plainText }) =>
          chatPasswordHasher.verify({
            passwordHash,
            passwordHashAlgorithm: "bun-password",
            passwordHashParams: null,
            plainText,
          }),
      }),
      listRoomParticipants: createListChatRoomParticipantsUseCase({
        repository: persistence.chat,
      }),
      listModerationAudits: createListChatModerationAuditsUseCase({
        repository: persistence.chat,
      }),
      listRoomMessages: createListChatRoomMessagesUseCase({
        repository: persistence.chat,
      }),
      moderateRoomMessage: createModerateChatRoomMessageUseCase({
        repository: persistence.chat,
      }),
      moderateUploadRetention: createModerateChatUploadRetentionUseCase({
        repository: persistence.chat,
      }),
      openUploadMedia: createOpenChatUploadMediaUseCase({
        mediaRepository: persistence.media,
        repository: persistence.chat,
        storage: storage.chatUploads,
      }),
      resolveRoomSession: createResolveChatRoomSessionUseCase({
        repository: persistence.chat,
      }),
      sendRoomTextMessage: createSendChatRoomTextMessageUseCase({
        repository: persistence.chat,
      }),
      rotateRoomPassword: createRotateChatRoomPasswordUseCase({
        repository: persistence.chat,
        sessionTtlHours: 24,
      }),
      uploadMessageWithImage: createUploadChatMessageWithImageUseCase({
        repository: persistence.chat,
        storage: storage.chatUploads,
      }),
    },
    config,
    content: {
      getPublishedProjectBySlug: createGetPublishedProjectBySlugUseCase({
        repository: persistence.content,
      }),
      getPublishedPhotoById: createGetPublishedPhotoByIdUseCase({
        repository: persistence.content,
      }),
      getPublishedThoughtBySlug: createGetPublishedThoughtBySlugUseCase({
        repository: persistence.content,
      }),
      listPublishedPhotos: createListPublishedPhotosUseCase({
        repository: persistence.content,
      }),
      listPublishedProjects: createListPublishedProjectsUseCase({
        repository: persistence.content,
      }),
      listPublishedThoughts: createListPublishedThoughtsUseCase({
        repository: persistence.content,
      }),
      listStatusStripEntries: createListStatusStripEntriesUseCase({
        repository: persistence.content,
      }),
    },
    media: {
      repository: persistence.media,
      storage,
    },
  };
};
