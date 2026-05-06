import type { AdminPhotoCurationItem } from '../../../../entities/photo'

export type AdminPhotosStatusFilter = 'all' | 'draft' | 'published'
export type AdminPhotosFeaturedFilter = 'all' | 'featured' | 'not_featured'

export type AdminPhotosFilters = Readonly<{
  status: AdminPhotosStatusFilter
  featured: AdminPhotosFeaturedFilter
  search: string
}>

export type AdminPhotosLoaderData = Readonly<{
  items: readonly AdminPhotoCurationItem[]
  filters: AdminPhotosFilters
  pageInfo: Readonly<{
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }>
}>

export type AdminPhotosActionIntent = 'upload_photo' | 'update_curation' | 'update_metadata'
export type AdminPhotoDetailActionIntent = 'update_curation' | 'update_metadata'

export type AdminPhotosActionData = Readonly<{
  intent: AdminPhotosActionIntent
  status: 'success' | 'error'
  message: string
  field?: string
  rowId?: string
}>

export type AdminPhotoDetailLoaderData = Readonly<{
  item: AdminPhotoCurationItem
  originalUrl: string
}>
