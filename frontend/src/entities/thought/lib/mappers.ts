import type { ThoughtRecord } from '../model/types'

export function toThoughtRecord(input: ThoughtRecord): ThoughtRecord {
  return {
    ...input,
    tags: [...input.tags],
  }
}
