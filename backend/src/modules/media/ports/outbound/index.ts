export type PhotoMediaRepositoryRow = Readonly<{
  id: string;
  title: string;
  originalReferencePolicy: "backend_media_route" | "filesystem_reference";
  originalReference: string;
  createdAt: Date;
  updatedAt: Date;
}>;

export type ChatUploadMediaRepositoryRow = Readonly<{
  id: string;
  displayFilename: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  storageKey: string;
  byteSize: number;
  createdAt: Date;
  updatedAt: Date;
}>;

export interface MediaRepositoryPort {
  findPhotoMediaById(photoId: string): Promise<PhotoMediaRepositoryRow | null>;
  findChatUploadMediaById(uploadId: string): Promise<ChatUploadMediaRepositoryRow | null>;
}

export type MediaStorageObject = Readonly<{
  absolutePath: string;
  byteSize: number;
  stream: ReadableStream<Uint8Array>;
}>;

export type ChatUploadStorageWriteRequest = Readonly<{
  body: Uint8Array;
  storageKey: string;
}>;

export type ChatUploadStorageWriteResult = Readonly<{
  byteSize: number;
  storageKey: string;
  storagePath: string;
}>;

export interface PhotoMediaStoragePort {
  openOriginal(reference: string): Promise<MediaStorageObject | null>;
}

export interface ChatUploadStoragePort {
  deleteUpload(storagePath: string): Promise<void>;
  openUpload(storagePath: string): Promise<MediaStorageObject | null>;
  writeUpload(input: ChatUploadStorageWriteRequest): Promise<ChatUploadStorageWriteResult>;
}
