import { afterAll, beforeEach, describe, expect, it } from "bun:test";

import {
  ChatUploadMimeType,
  PhotoTone,
  ProjectStatus,
} from "../../../../../generated/prisma/client";

import { createPrismaAdminRepository } from "./admin-repository";
import { createPrismaChatRepository } from "./chat-repository";
import { createPrismaContentRepository } from "./content-repository";
import { createPrismaClient } from "./prisma-client";

const prefix = "qa010_";
const now = new Date("2026-05-05T12:00:00.000Z");
const older = new Date("2026-05-04T12:00:00.000Z");
const prisma = createPrismaClient();

const cleanup = async () => {
  await prisma.chatModerationAuditRecord.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { actorAdminUserId: { startsWith: prefix } },
        { roomId: { startsWith: prefix } },
      ],
    },
  });
  await prisma.chatRoomPasswordRotation.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { actorAdminUserId: { startsWith: prefix } },
        { roomId: { startsWith: prefix } },
      ],
    },
  });
  await prisma.chatBan.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { actorAdminUserId: { startsWith: prefix } },
        { roomId: { startsWith: prefix } },
      ],
    },
  });
  await prisma.chatUpload.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { roomId: { startsWith: prefix } },
        { storageKey: { startsWith: prefix } },
      ],
    },
  });
  await prisma.chatMessage.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { roomId: { startsWith: prefix } },
      ],
    },
  });
  await prisma.chatRoomSession.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { roomId: { startsWith: prefix } },
        { sessionTokenHash: { startsWith: prefix } },
      ],
    },
  });
  await prisma.chatHandle.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { roomId: { startsWith: prefix } },
      ],
    },
  });
  await prisma.chatRoom.deleteMany({
    where: {
      id: { startsWith: prefix },
    },
  });
  await prisma.adminSession.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { adminUserId: { startsWith: prefix } },
        { tokenHash: { startsWith: prefix } },
      ],
    },
  });
  await prisma.adminMfaChallenge.deleteMany({
    where: {
      OR: [
        { id: { startsWith: prefix } },
        { adminUserId: { startsWith: prefix } },
      ],
    },
  });
  await prisma.adminUser.deleteMany({
    where: {
      id: { startsWith: prefix },
    },
  });
  await prisma.statusStripEntry.deleteMany({
    where: {
      id: { startsWith: prefix },
    },
  });
  await prisma.photo.deleteMany({
    where: {
      id: { startsWith: prefix },
    },
  });
  await prisma.project.deleteMany({
    where: {
      id: { startsWith: prefix },
    },
  });
  await prisma.thought.deleteMany({
    where: {
      id: { startsWith: prefix },
    },
  });
};

beforeEach(cleanup);

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe("prisma DB contract tests", () => {
  it("persists and maps admin curation list/update flows", async () => {
    const repository = createPrismaAdminRepository(prisma);

    await prisma.thought.createMany({
      data: [
        {
          body: "Draft body",
          bodyPreview: "Draft preview",
          excerpt: "Draft excerpt",
          featured: false,
          id: `${prefix}thought_draft`,
          slug: `${prefix}thought-draft`,
          status: "draft",
          tags: ["qa010"],
          title: "QA Draft Thought",
          type: "essay",
        },
        {
          body: "Published body",
          bodyPreview: "Published preview",
          excerpt: "Published excerpt",
          featured: true,
          id: `${prefix}thought_published`,
          publishedAt: older,
          slug: `${prefix}thought-published`,
          status: "published",
          tags: ["qa010"],
          title: "QA Published Thought",
          type: "note",
        },
      ],
    });
    await prisma.project.create({
      data: {
        body: "Project body",
        channel: "QA",
        description: "A DB contract project.",
        featured: false,
        id: `${prefix}project`,
        slug: `${prefix}project`,
        status: ProjectStatus.live,
        tags: ["qa010"],
        thumbnailHue: 180,
        thumbnailKind: "grid",
        title: "QA Project",
        year: 2026,
      },
    });
    await prisma.photo.create({
      data: {
        date: older,
        featured: false,
        frame: "QA-01",
        id: `${prefix}photo`,
        location: "Sao Paulo",
        originalPath: "qa010/photo.jpg",
        status: "draft",
        tags: ["qa010"],
        title: "QA Photo",
        tone: PhotoTone.cyan,
      },
    });

    await expect(
      repository.listThoughtsForCuration({
        featured: false,
        page: 1,
        pageSize: 5,
        search: "draft",
        status: "draft",
        type: "essay",
      }),
    ).resolves.toMatchObject({
      items: [
        {
          id: `${prefix}thought_draft`,
          status: "draft",
          title: "QA Draft Thought",
        },
      ],
      totalItems: 1,
    });
    await expect(
      repository.updateThoughtCuration({
        featured: true,
        id: `${prefix}thought_draft`,
        status: "published",
      }),
    ).resolves.toMatchObject({
      featured: true,
      id: `${prefix}thought_draft`,
      status: "published",
    });
    await expect(
      repository.updateProjectCuration({
        featured: true,
        id: `${prefix}project`,
        status: "in-progress",
      }),
    ).resolves.toMatchObject({
      featured: true,
      id: `${prefix}project`,
      status: "in-progress",
    });
    await expect(
      repository.updatePhotoMetadata({
        camera: "Canon",
        id: `${prefix}photo`,
        location: "Rio",
        tags: ["qa010", "updated"],
        title: "QA Photo Updated",
      }),
    ).resolves.toMatchObject({
      camera: "Canon",
      id: `${prefix}photo`,
      location: "Rio",
      tags: ["qa010", "updated"],
      title: "QA Photo Updated",
    });
  });

  it("persists and maps public content list/detail contracts", async () => {
    const repository = createPrismaContentRepository(prisma);

    await prisma.thought.createMany({
      data: [
        {
          body: "Newest body",
          bodyPreview: "Newest preview",
          excerpt: "Newest excerpt",
          id: `${prefix}thought_new`,
          publishedAt: now,
          slug: `${prefix}thought-new`,
          status: "published",
          tags: ["qa010", "new"],
          title: "QA New Thought",
          type: "essay",
        },
        {
          body: "Older body",
          bodyPreview: "Older preview",
          excerpt: "Older excerpt",
          id: `${prefix}thought_old`,
          publishedAt: older,
          slug: `${prefix}thought-old`,
          status: "published",
          tags: ["qa010", "old"],
          title: "QA Old Thought",
          type: "note",
        },
      ],
    });
    await prisma.project.create({
      data: {
        body: "Project body",
        channel: "QA",
        description: "Searchable project contract.",
        githubUrl: "https://github.example/qa",
        id: `${prefix}project`,
        siteUrl: null,
        slug: `${prefix}project`,
        status: ProjectStatus.live,
        tags: ["qa010"],
        thumbnailHue: 45,
        thumbnailKind: "bars",
        title: "QA Public Project",
        year: 2026,
      },
    });
    await prisma.photo.create({
      data: {
        date: now,
        frame: "QA-02",
        id: `${prefix}photo`,
        location: "Sao Paulo",
        originalPath: "qa010/photo.jpg",
        status: "published",
        tags: ["qa010"],
        title: "QA Public Photo",
        tone: PhotoTone.amber,
      },
    });
    await prisma.statusStripEntry.create({
      data: {
        accent: "cyan",
        displayOrder: 9010,
        id: `${prefix}strip`,
        label: "qa",
        value: "db",
      },
    });

    const firstPage = await repository.findPublishedThoughts({
      limit: 1,
      tags: ["qa010"],
    });
    expect(firstPage.items).toMatchObject([
      {
        id: `${prefix}thought_new`,
        title: "QA New Thought",
      },
    ]);
    expect(firstPage.nextCursor).toEqual({
      id: `${prefix}thought_old`,
      publishedAt: older,
    });
    await expect(
      repository.findPublishedThoughtBySlug(`${prefix}thought-new`),
    ).resolves.toMatchObject({
      body: "Newest body",
      id: `${prefix}thought_new`,
    });
    await expect(
      repository.findPublishedProjects({
        page: 1,
        pageSize: 5,
        search: "contract",
      }),
    ).resolves.toMatchObject({
      items: [
        {
          id: `${prefix}project`,
          status: "live",
        },
      ],
      totalItems: 1,
    });
    await expect(
      repository.findPublishedPhotos({
        location: "Sao Paulo",
        page: 1,
        pageSize: 5,
        year: 2026,
      }),
    ).resolves.toMatchObject({
      items: [
        {
          id: `${prefix}photo`,
        },
      ],
      totalItems: 1,
    });
    await expect(repository.listStatusStripEntries()).resolves.toContainEqual(
      expect.objectContaining({
        id: `${prefix}strip`,
        label: "qa",
        value: "db",
      }),
    );
  });

  it("persists and maps chat message upload and moderation contracts", async () => {
    const adminUserId = `${prefix}admin`;
    const roomId = `${prefix}room`;
    const handleId = `${prefix}handle`;
    const sessionId = `${prefix}session`;
    const messageId = `${prefix}message`;
    const uploadId = `${prefix}upload`;
    const repository = createPrismaChatRepository(prisma);

    await prisma.adminUser.create({
      data: {
        email: "qa010@example.com",
        id: adminUserId,
        passwordHash: "hash",
        passwordHashAlgorithm: "test",
      },
    });
    await prisma.chatRoom.create({
      data: {
        id: roomId,
        passwordHash: "hash",
        slug: `${prefix}room`,
      },
    });
    await prisma.chatHandle.create({
      data: {
        handle: "QA",
        id: handleId,
        normalizedHandle: "qa",
        roomId,
      },
    });
    await prisma.chatRoomSession.create({
      data: {
        handleId,
        id: sessionId,
        roomId,
        sessionTokenHash: `${prefix}session_hash`,
      },
    });

    await expect(
      repository.createMessageWithUpload({
        authorHandleId: handleId,
        body: "image attached",
        byteSize: 128,
        displayFilename: "qa.png",
        messageId,
        mimeType: "image/png",
        roomId,
        roomSessionId: sessionId,
        sentAt: now,
        storageKey: `${prefix}upload-key`,
        storagePath: "qa010/upload.png",
        tone: "cyan",
        uploadId,
      }),
    ).resolves.toMatchObject({
      message: {
        id: messageId,
        moderationState: "visible",
      },
      upload: {
        id: uploadId,
        mimeType: "image/png",
      },
    });
    await expect(
      repository.listMessages({
        limit: 10,
        roomId,
      }),
    ).resolves.toMatchObject({
      items: [
        {
          attachment: {
            fileName: "qa.png",
            id: uploadId,
            mimeType: "image/png",
          },
          author: "QA",
          id: messageId,
        },
      ],
      nextCursor: null,
    });
    await expect(
      repository.moderateMessage({
        action: "delete_message",
        actorAdminUserId: adminUserId,
        messageId,
        occurredAt: now,
        reason: "contract test",
      }),
    ).resolves.toMatchObject({
      message: {
        id: messageId,
        moderationState: "deleted",
      },
      upload: {
        id: uploadId,
        moderationState: "hidden",
      },
    });
    await expect(
      repository.listModerationAudits({
        actorAdminUserId: adminUserId,
        limit: 5,
        roomId,
      }),
    ).resolves.toMatchObject({
      items: [
        {
          action: "delete_message",
          actorAdminUserId: adminUserId,
          roomId,
          targetMessageId: messageId,
          targetUploadId: uploadId,
        },
      ],
      nextCursor: null,
    });
    const upload = await prisma.chatUpload.findUnique({
      select: {
        mimeType: true,
      },
      where: {
        id: uploadId,
      },
    });

    expect(upload).toEqual({
      mimeType: ChatUploadMimeType.image_png,
    });
  });
});
