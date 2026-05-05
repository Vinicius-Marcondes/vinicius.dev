import { lstat, mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

import type {
  ChatUploadStoragePort,
  ChatUploadStorageWriteRequest,
  ChatUploadStorageWriteResult,
  MediaStorageObject,
  PhotoMediaStoragePort,
} from "@/modules/media/ports/outbound";

export type FilesystemMediaStorageAdapter = Readonly<{
  chatUploads: ChatUploadStoragePort;
  photos: PhotoMediaStoragePort;
}>;

export type FilesystemMediaStorageConfig = Readonly<{
  chatRoot: string;
  photosRoot: string;
}>;

const normalizeStoragePath = (value: string) => value.replaceAll("\\", "/");

const createSafeStoragePathResolver = (root: string) => {
  const resolvedRoot = resolve(root);

  const assertNoSymlinkSegments = async (normalizedStoragePath: string) => {
    const segments = normalizedStoragePath.split("/").filter(Boolean);
    let currentPath = resolvedRoot;

    for (const segment of segments) {
      currentPath = resolve(currentPath, segment);

      try {
        const entryStats = await lstat(currentPath);

        if (entryStats.isSymbolicLink()) {
          throw new Error(`Storage path references a symbolic link: ${normalizedStoragePath}`);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          break;
        }

        throw error;
      }
    }
  };

  return async (storagePath: string) => {
    const normalizedStoragePath = normalizeStoragePath(storagePath).trim();

    if (normalizedStoragePath.length === 0) {
      throw new Error("Storage path must not be empty");
    }

    if (isAbsolute(normalizedStoragePath)) {
      throw new Error(`Storage path must be relative: ${storagePath}`);
    }

    const resolvedPath = resolve(resolvedRoot, normalizedStoragePath);
    const relativePath = relative(resolvedRoot, resolvedPath);

    if (
      relativePath.length === 0 ||
      relativePath === ".." ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      throw new Error(`Storage path escapes configured root: ${storagePath}`);
    }

    await assertNoSymlinkSegments(normalizedStoragePath);

    return {
      absolutePath: resolvedPath,
      storagePath: normalizeStoragePath(relativePath),
    };
  };
};

const openStorageObject = async (absolutePath: string): Promise<MediaStorageObject | null> => {
  try {
    const fileStats = await stat(absolutePath);

    if (!fileStats.isFile()) {
      return null;
    }

    return {
      absolutePath,
      byteSize: fileStats.size,
      stream: Bun.file(absolutePath).stream(),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
};

const createPhotoMediaStorage = (photosRoot: string): PhotoMediaStoragePort => {
  const resolvePhotoPath = createSafeStoragePathResolver(photosRoot);

  return {
    openOriginal: async (reference) => {
      const { absolutePath } = await resolvePhotoPath(reference);

      return openStorageObject(absolutePath);
    },
  };
};

const createChatUploadStorage = (chatRoot: string): ChatUploadStoragePort => {
  const resolveChatPath = createSafeStoragePathResolver(chatRoot);

  return {
    deleteUpload: async (storagePath) => {
      const { absolutePath } = await resolveChatPath(storagePath);

      try {
        await unlink(absolutePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    },
    openUpload: async (storagePath) => {
      const { absolutePath } = await resolveChatPath(storagePath);

      return openStorageObject(absolutePath);
    },
    writeUpload: async (
      input: ChatUploadStorageWriteRequest,
    ): Promise<ChatUploadStorageWriteResult> => {
      const { absolutePath, storagePath } = await resolveChatPath(input.storageKey);

      await mkdir(dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, input.body);

      return {
        byteSize: input.body.byteLength,
        storageKey: input.storageKey,
        storagePath,
      };
    },
  };
};

export const createFilesystemMediaStorageAdapter = (
  config: FilesystemMediaStorageConfig,
): FilesystemMediaStorageAdapter => ({
  chatUploads: createChatUploadStorage(config.chatRoot),
  photos: createPhotoMediaStorage(config.photosRoot),
});
