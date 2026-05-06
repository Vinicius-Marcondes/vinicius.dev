import type { PhotoTone } from '../model/types'

export type AdminPhotoStatus = 'draft' | 'published'

export type AdminPhotoCurationItem = Readonly<{
  id: string
  frame: string
  title: string
  date: string
  location: string
  status: AdminPhotoStatus
  featured: boolean
  tone: PhotoTone
  caption: string | null
  camera: string | null
  film: string | null
  original: Readonly<{
    displayFilename: string | null
    mimeType: string | null
    byteSize: number | null
  }>
  tags: readonly string[]
  updatedAt: string
}>

export type ListAdminPhotosInput = Readonly<{
  page?: number
  pageSize?: number
  status?: AdminPhotoStatus
  featured?: boolean
  year?: number
  location?: string
  search?: string
}>

export type ListAdminPhotosOutput = Readonly<{
  items: readonly AdminPhotoCurationItem[]
  pageInfo: Readonly<{
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }>
}>

export type GetAdminPhotoOutput = Readonly<{
  item: AdminPhotoCurationItem
}>

export type UpdateAdminPhotoCurationInput = Readonly<{
  id: string
  status?: AdminPhotoStatus
  featured?: boolean
}>

export type UpdateAdminPhotoCurationOutput = Readonly<{
  item: AdminPhotoCurationItem
}>

export type UpdateAdminPhotoMetadataInput = Readonly<{
  id: string
  title?: string
  frame?: string
  date?: string
  location?: string
  tags?: readonly string[]
  tone?: PhotoTone
  caption?: string | null
  camera?: string | null
  film?: string | null
}>

export type UpdateAdminPhotoMetadataOutput = Readonly<{
  item: AdminPhotoCurationItem
}>

export type UploadAdminPhotoInput = Readonly<{
  file: File
  title: string
  frame: string
  date: string
  location: string
  tone: PhotoTone
  tags?: readonly string[]
  caption?: string
  camera?: string
  film?: string
}>

export type UploadAdminPhotoOutput = Readonly<{
  item: AdminPhotoCurationItem
}>

export type AdminPhotoApiErrorPayload = Readonly<{
  error: 'denied' | 'invalid_query' | 'invalid_request' | 'invalid_upload' | 'not_found'
  field?: string
  reason?: string
  resource?: string
}>
