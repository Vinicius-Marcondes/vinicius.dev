import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "bun:test";

import { createFilesystemMediaStorageAdapter } from "./create-filesystem-media-storage-adapter";

const tempRoots: string[] = [];

const createTempRoot = async (name: string) => {
  const root = await mkdtemp(join(process.cwd(), `.tmp-${name}-`));
  tempRoots.push(root);
  return root;
};

const readStorageObjectText = async (stream: ReadableStream<Uint8Array>) =>
  new Response(stream).text();

afterEach(async () => {
  await Promise.all(tempRoots.splice(0).map((root) => rm(root, { force: true, recursive: true })));
});

describe("filesystem media storage adapter", () => {
  it("opens photo originals from the configured photos root", async () => {
    const photosRoot = await createTempRoot("photos");
    const chatRoot = await createTempRoot("chat");

    await mkdir(join(photosRoot, "published"), { recursive: true });
    await writeFile(join(photosRoot, "published/p-2026-014.jpg"), "photo-bytes");

    const adapter = createFilesystemMediaStorageAdapter({
      chatRoot,
      photosRoot,
    });

    const file = await adapter.photos.openOriginal("published/p-2026-014.jpg");

    expect(file?.absolutePath).toBe(join(photosRoot, "published/p-2026-014.jpg"));
    expect(file?.byteSize).toBe(11);
    await expect(readStorageObjectText(file!.stream)).resolves.toBe("photo-bytes");
  });

  it("writes chat uploads under the configured chat root and reopens them", async () => {
    const photosRoot = await createTempRoot("photos");
    const chatRoot = await createTempRoot("chat");
    const adapter = createFilesystemMediaStorageAdapter({
      chatRoot,
      photosRoot,
    });

    const written = await adapter.chatUploads.writeUpload({
      body: new TextEncoder().encode("upload-bytes"),
      storageKey: "room_123/upload_456.webp",
    });

    expect(written).toEqual({
      byteSize: 12,
      storageKey: "room_123/upload_456.webp",
      storagePath: "room_123/upload_456.webp",
    });

    const reopened = await adapter.chatUploads.openUpload(written.storagePath);

    expect(reopened?.absolutePath).toBe(join(chatRoot, "room_123/upload_456.webp"));
    await expect(readStorageObjectText(reopened!.stream)).resolves.toBe("upload-bytes");
  });

  it("rejects storage paths that escape the configured root", async () => {
    const photosRoot = await createTempRoot("photos");
    const chatRoot = await createTempRoot("chat");
    const adapter = createFilesystemMediaStorageAdapter({
      chatRoot,
      photosRoot,
    });

    await expect(adapter.photos.openOriginal("../outside.jpg")).rejects.toThrow(
      "Storage path escapes configured root",
    );
    await expect(
      adapter.chatUploads.writeUpload({
        body: new TextEncoder().encode("x"),
        storageKey: "../outside.webp",
      }),
    ).rejects.toThrow("Storage path escapes configured root");
  });
});
