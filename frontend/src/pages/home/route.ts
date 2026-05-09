import type { LoaderFunctionArgs } from 'react-router-dom'
import { listStatusStripEntries, type StatusStripEntry } from '../../entities/status-strip'

const fallbackStatusEntries: StatusStripEntry[] = [
  {
    accent: 'pink',
    label: 'Now Building',
    value: 'frontend migration wave // typed Vite shell',
  },
  {
    label: 'Location',
    value: 'sao paulo // gmt-3 // after midnight',
  },
  {
    accent: 'cyan',
    label: 'Current Focus',
    value: 'home route, shared chrome, and neon tape deck polish',
  },
  {
    accent: 'amber',
    label: 'Signal',
    value: 'projects, photos, thoughts, and chat room incoming',
  },
]

export type HomeLoaderData = {
  statusEntries: readonly StatusStripEntry[]
}

export const homeLoader = async ({ request }: LoaderFunctionArgs) => {
  const response = await listStatusStripEntries(request.signal)

  return {
    statusEntries: response.items.length > 0 ? response.items : fallbackStatusEntries,
  } satisfies HomeLoaderData
}
