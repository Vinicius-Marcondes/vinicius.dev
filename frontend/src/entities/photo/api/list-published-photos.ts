import { getJson } from '../../../shared/api'
import { mapPhotosCatalog, type PhotosCatalogDto } from '../lib/mappers'

type ListPublishedPhotosInput = Readonly<{
  location?: string
  page?: number
  pageSize?: number
  search?: string
  signal?: AbortSignal
  year?: string
}>

export const listPublishedPhotos = async ({
  location,
  page,
  pageSize,
  search,
  signal,
  year,
}: ListPublishedPhotosInput = {}) => {
  const searchParams = new URLSearchParams()

  if (typeof page === 'number') {
    searchParams.set('page', String(page))
  }

  if (typeof pageSize === 'number') {
    searchParams.set('pageSize', String(pageSize))
  }

  if (location) {
    searchParams.set('location', location)
  }

  if (search) {
    searchParams.set('search', search)
  }

  if (year) {
    searchParams.set('year', year)
  }

  const query = searchParams.toString()
  const response = await getJson<PhotosCatalogDto>(`/photos${query ? `?${query}` : ''}`, {
    signal,
  })

  return mapPhotosCatalog(response)
}
