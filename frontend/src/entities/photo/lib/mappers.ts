import type { PhotoFacets, PhotoRecord, PhotosCatalogResult } from '../model/types'

type PhotoRecordDto = {
  id: string
  frame: string
  title: string
  date: string
  location: string
  originalUrl: string
  tags: string[]
  tone: PhotoRecord['tone']
}

type PhotoPageInfoDto = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type PhotosCatalogDto = {
  items: PhotoRecordDto[]
  pageInfo: PhotoPageInfoDto
  facets?: {
    years?: Array<number | string>
    locations?: string[]
  }
}

export function toPhotoRecord(input: PhotoRecord): PhotoRecord {
  return {
    ...input,
    tags: [...input.tags],
  }
}

const mapFacets = (facets: PhotosCatalogDto['facets']): PhotoFacets | undefined => {
  if (!facets) {
    return undefined
  }

  const years = Array.isArray(facets.years)
    ? facets.years
        .map((year) => String(year).trim())
        .filter((year) => year.length > 0)
    : []
  const locations = Array.isArray(facets.locations)
    ? facets.locations.map((location) => location.trim()).filter((location) => location.length > 0)
    : []

  if (years.length === 0 && locations.length === 0) {
    return undefined
  }

  return {
    locations: Array.from(new Set(locations)).sort((left, right) => left.localeCompare(right)),
    years: Array.from(new Set(years)).sort((left, right) => right.localeCompare(left)),
  }
}

export function mapPhotosCatalog(input: PhotosCatalogDto): PhotosCatalogResult {
  return {
    facets: mapFacets(input.facets),
    items: input.items.map((item) =>
      toPhotoRecord({
        date: item.date,
        frame: item.frame,
        id: item.id,
        location: item.location,
        originalUrl: item.originalUrl,
        tags: item.tags,
        title: item.title,
        tone: item.tone,
      }),
    ),
    pageInfo: {
      page: input.pageInfo.page,
      pageSize: input.pageInfo.pageSize,
      totalItems: input.pageInfo.totalItems,
      totalPages: input.pageInfo.totalPages,
    },
  }
}
