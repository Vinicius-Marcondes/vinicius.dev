import { getJson } from '../../../shared/api'
import { mapStatusStripEntries, type StatusStripEntriesSnapshotDto } from '../lib/mappers'

export const listStatusStripEntries = async (signal?: AbortSignal) => {
  const response = await getJson<StatusStripEntriesSnapshotDto>('/status-strip', { signal })

  return mapStatusStripEntries(response)
}
