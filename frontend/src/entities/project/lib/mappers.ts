import type { ProjectRecord } from '../model/types'

export function toProjectRecord(input: ProjectRecord): ProjectRecord {
  return {
    ...input,
    tags: [...input.tags],
  }
}
