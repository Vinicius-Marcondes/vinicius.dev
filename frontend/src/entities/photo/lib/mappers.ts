import type { PhotoRecord } from '../model/types'

export function toPhotoRecord(input: PhotoRecord): PhotoRecord {
  return {
    ...input,
    tags: [...input.tags],
  }
}
