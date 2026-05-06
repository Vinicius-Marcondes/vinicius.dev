export type PhotoTone = 'amber' | 'cyan' | 'mono' | 'sunset' | 'violet'

export type PhotoRecord = {
  id: string
  frame: string
  title: string
  date: string
  location: string
  originalUrl: string
  tags: string[]
  tone: PhotoTone
}

export type PhotoPageInfo = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type PhotoFacets = {
  years: string[]
  locations: string[]
}

export type PhotosCatalogResult = {
  items: PhotoRecord[]
  pageInfo: PhotoPageInfo
  facets?: PhotoFacets
}
