import type { StatusStripEntry } from '../model/types'

export function toStatusStripEntry(input: StatusStripEntry): StatusStripEntry {
  return { ...input }
}
