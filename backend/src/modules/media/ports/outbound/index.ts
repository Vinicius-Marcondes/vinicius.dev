export type PhotoMediaRepositoryRow = Readonly<{
  id: string;
  title: string;
  slug: string;
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
