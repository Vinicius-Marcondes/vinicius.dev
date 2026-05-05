import type { PhotoRecord } from '../model/types'

type PhotosFilterInput = {
  location: string
  query: string
  year: string
}

export type PhotoMonthGroup = {
  items: PhotoRecord[]
  month: string
}

export function filterPhotos(
  photos: PhotoRecord[],
  { location, query, year }: PhotosFilterInput,
) {
  const normalizedQuery = query.trim().toLowerCase()

  return photos
    .filter((photo) => {
      const yearMatches = year === 'all' || photo.date.startsWith(year)
      const locationMatches = location === 'all' || photo.location === location
      const queryMatches =
        normalizedQuery.length === 0 ||
        photo.title.toLowerCase().includes(normalizedQuery) ||
        photo.location.toLowerCase().includes(normalizedQuery) ||
        photo.frame.toLowerCase().includes(normalizedQuery) ||
        photo.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))

      return yearMatches && locationMatches && queryMatches
    })
    .toSorted((left, right) => right.date.localeCompare(left.date))
}

export function groupPhotosByMonth(photos: PhotoRecord[]) {
  const groups = new Map<string, PhotoRecord[]>()

  for (const photo of photos) {
    const month = photo.date.slice(0, 7)
    groups.set(month, [...(groups.get(month) ?? []), photo])
  }

  return Array.from(groups.entries()).map<PhotoMonthGroup>(([month, items]) => ({
    items,
    month,
  }))
}
