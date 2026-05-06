-- PHOTO-001: store nullable original upload metadata for admin-managed photo records.
ALTER TABLE "Photo"
ADD COLUMN "originalDisplayFilename" TEXT,
ADD COLUMN "originalMimeType" TEXT,
ADD COLUMN "originalByteSize" INTEGER;
