import type { LoaderFunctionArgs } from 'react-router-dom'
import {
  allPhotoLocations,
  allPhotoYears,
  listPublishedPhotos,
  type PhotoFacets,
} from '../../../entities/photo'
import type { PhotosFilterState } from '../../../features/filter-photos'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 24

const asPositiveInteger = (value: string | null) => {
  if (!value) {
    return undefined
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return undefined
  }

  return parsed
}

const parseLocation = (value: string | null) => {
  const normalized = value?.trim()

  if (!normalized || normalized === 'all') {
    return undefined
  }

  return normalized
}

const parseSearchQuery = (value: string | null) => {
  const normalized = value?.trim()

  if (!normalized) {
    return undefined
  }

  return normalized
}

const parseYear = (value: string | null) => {
  if (!value || value === 'all') {
    return undefined
  }

  const parsed = asPositiveInteger(value)

  if (!parsed) {
    return undefined
  }

  return String(parsed)
}

const mergeFacetValues = (items: string[], selected?: string, direction: 'asc' | 'desc' = 'asc') => {
  const merged = selected ? [selected, ...items] : items
  const unique = Array.from(new Set(merged))

  return unique.toSorted((left, right) =>
    direction === 'asc' ? left.localeCompare(right) : right.localeCompare(left),
  )
}

const buildFallbackFacets = (
  filters: Readonly<{ location?: string; year?: string }>,
  photos: Parameters<typeof allPhotoYears>[0],
): PhotoFacets => ({
  locations: mergeFacetValues(allPhotoLocations(photos), filters.location, 'asc'),
  years: mergeFacetValues(allPhotoYears(photos), filters.year, 'desc'),
})

export type PhotosGalleryLoaderData = {
  filters: PhotosFilterState
  facets: PhotoFacets
  items: Awaited<ReturnType<typeof listPublishedPhotos>>['items']
  pageInfo: Awaited<ReturnType<typeof listPublishedPhotos>>['pageInfo']
}

export const photosGalleryLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const location = parseLocation(url.searchParams.get('location'))
  const page = asPositiveInteger(url.searchParams.get('page')) ?? DEFAULT_PAGE
  const search = parseSearchQuery(url.searchParams.get('search'))
  const year = parseYear(url.searchParams.get('year'))

  const response = await listPublishedPhotos({
    location,
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    search,
    signal: request.signal,
    year,
  })

  return {
    facets: response.facets ?? buildFallbackFacets({ location, year }, response.items),
    filters: {
      location: location ?? 'all',
      query: search ?? '',
      year: year ?? 'all',
    },
    items: response.items,
    pageInfo: response.pageInfo,
  } satisfies PhotosGalleryLoaderData
}
