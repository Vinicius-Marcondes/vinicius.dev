import { describe, expect, it } from "bun:test";

import { createPrismaMediaRepository } from "./media-repository";
import type { PrismaDatabaseClient } from "./prisma-client";

describe("prisma media repository", () => {
  it("maps photo media rows without leaking Prisma types", async () => {
    const repository = createPrismaMediaRepository({
      chatUpload: {
        findFirst: async () => null,
      },
      photo: {
        findFirst: async () => ({
          createdAt: new Date("2026-03-22T00:00:00.000Z"),
          id: "p-2026-014",
          originalPath: "published/p-2026-014.jpg",
          originalReferencePolicy: "filesystem_reference" as const,
          title: "paulista at 02:14",
          updatedAt: new Date("2026-03-23T00:00:00.000Z"),
        }),
      },
    } as unknown as PrismaDatabaseClient);

    const photo = await repository.findPhotoMediaById("p-2026-014");

    expect(photo).toEqual({
      createdAt: new Date("2026-03-22T00:00:00.000Z"),
      id: "p-2026-014",
      originalReference: "published/p-2026-014.jpg",
      originalReferencePolicy: "filesystem_reference",
      title: "paulista at 02:14",
      updatedAt: new Date("2026-03-23T00:00:00.000Z"),
    });
  });

  it("maps chat upload media rows without leaking Prisma types", async () => {
    const repository = createPrismaMediaRepository({
      chatUpload: {
        findFirst: async () => ({
          byteSize: 482113,
          createdAt: new Date("2026-03-22T00:00:00.000Z"),
          displayFilename: "scan.webp",
          id: "upload_1",
          mimeType: "image/webp" as const,
          moderationState: "visible" as const,
          roomId: "room_123",
          storagePath: "room_123/upload_1.webp",
          storageKey: "room_123/upload_1.webp",
          updatedAt: new Date("2026-03-23T00:00:00.000Z"),
        }),
      },
      photo: {
        findFirst: async () => null,
      },
    } as unknown as PrismaDatabaseClient);

    const upload = await repository.findChatUploadMediaById("upload_1");

    expect(upload).toEqual({
      byteSize: 482113,
      createdAt: new Date("2026-03-22T00:00:00.000Z"),
      displayFilename: "scan.webp",
      id: "upload_1",
      mimeType: "image/webp",
      moderationState: "visible",
      roomId: "room_123",
      storagePath: "room_123/upload_1.webp",
      storageKey: "room_123/upload_1.webp",
      updatedAt: new Date("2026-03-23T00:00:00.000Z"),
    });
  });
});
