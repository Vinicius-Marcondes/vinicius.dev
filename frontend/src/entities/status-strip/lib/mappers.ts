import type { StatusStripEntriesSnapshot, StatusStripEntry } from '../model/types'

export type StatusStripEntryDto = Readonly<{
  accent?: string | null
  label: string
  value: string
}>

export type StatusStripEntriesSnapshotDto = Readonly<{
  items: readonly StatusStripEntryDto[]
}>

const parseAccent = (value: StatusStripEntryDto['accent']): StatusStripEntry['accent'] | undefined => {
  if (value === 'amber' || value === 'cyan' || value === 'pink') {
    return value
  }

  return undefined
}

export function toStatusStripEntry(input: StatusStripEntry): StatusStripEntry {
  return { ...input }
}

export function mapStatusStripEntries(input: StatusStripEntriesSnapshotDto): StatusStripEntriesSnapshot {
  return {
    items: input.items.map((item) =>
      toStatusStripEntry({
        accent: parseAccent(item.accent),
        label: item.label,
        value: item.value,
      }),
    ),
  }
}
