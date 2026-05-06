import { ApiRequestError, apiBaseUrl, getJson } from '../../../shared/api'
import type {
  AdminPhotoApiErrorPayload,
  GetAdminPhotoOutput,
  ListAdminPhotosInput,
  ListAdminPhotosOutput,
  UpdateAdminPhotoCurationInput,
  UpdateAdminPhotoCurationOutput,
  UpdateAdminPhotoMetadataInput,
  UpdateAdminPhotoMetadataOutput,
  UploadAdminPhotoInput,
  UploadAdminPhotoOutput,
} from './types'

const isAdminPhotoApiErrorPayload = (value: unknown): value is AdminPhotoApiErrorPayload => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const error = (value as Record<string, unknown>).error

  return (
    error === 'denied' ||
    error === 'invalid_query' ||
    error === 'invalid_request' ||
    error === 'invalid_upload' ||
    error === 'not_found'
  )
}

const parseResponsePayload = async (response: Response): Promise<unknown | undefined> => {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return undefined
  }

  try {
    return await response.json()
  } catch {
    return undefined
  }
}

const requestJson = async <T>(path: string, init: RequestInit): Promise<T> => {
  const headers = new Headers(init.headers)

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json')
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers,
  })

  const payload = await parseResponsePayload(response)

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      isAdminPhotoApiErrorPayload(payload) ? payload : undefined,
    )
  }

  if (typeof payload === 'undefined') {
    throw new ApiRequestError(response.status)
  }

  return payload as T
}

const toSearchParams = (query: ListAdminPhotosInput) => {
  const params = new URLSearchParams()

  if (typeof query.page === 'number') {
    params.set('page', String(query.page))
  }

  if (typeof query.pageSize === 'number') {
    params.set('pageSize', String(query.pageSize))
  }

  if (query.status) {
    params.set('status', query.status)
  }

  if (typeof query.featured === 'boolean') {
    params.set('featured', String(query.featured))
  }

  if (typeof query.year === 'number') {
    params.set('year', String(query.year))
  }

  if (query.location) {
    params.set('location', query.location)
  }

  if (query.search) {
    params.set('search', query.search)
  }

  return params
}

export const parseAdminPhotoApiError = (error: unknown): AdminPhotoApiErrorPayload | null => {
  if (!(error instanceof ApiRequestError) || !error.payload) {
    return null
  }

  return isAdminPhotoApiErrorPayload(error.payload) ? error.payload : null
}

export const listAdminPhotos = (query: ListAdminPhotosInput, signal?: AbortSignal) => {
  const params = toSearchParams(query)
  const suffix = params.toString() ? `?${params.toString()}` : ''

  return getJson<ListAdminPhotosOutput>(`/admin/photos${suffix}`, { signal })
}

export const getAdminPhoto = (id: string, signal?: AbortSignal) =>
  getJson<GetAdminPhotoOutput>(`/admin/photos/${encodeURIComponent(id)}`, { signal })

export const getAdminPhotoOriginalUrl = (id: string) =>
  `${apiBaseUrl}/admin/photos/${encodeURIComponent(id)}/original`

export const updateAdminPhotoCuration = (input: UpdateAdminPhotoCurationInput) =>
  requestJson<UpdateAdminPhotoCurationOutput>(`/admin/photos/${encodeURIComponent(input.id)}/curation`, {
    body: JSON.stringify({
      featured: input.featured,
      status: input.status,
    }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'PATCH',
  })

export const updateAdminPhotoMetadata = (input: UpdateAdminPhotoMetadataInput) =>
  requestJson<UpdateAdminPhotoMetadataOutput>(`/admin/photos/${encodeURIComponent(input.id)}/metadata`, {
    body: JSON.stringify({
      camera: input.camera,
      caption: input.caption,
      date: input.date,
      film: input.film,
      frame: input.frame,
      location: input.location,
      tags: input.tags,
      title: input.title,
      tone: input.tone,
    }),
    headers: {
      'content-type': 'application/json',
    },
    method: 'PATCH',
  })

export const uploadAdminPhoto = (input: UploadAdminPhotoInput) => {
  const formData = new FormData()
  formData.append('file', input.file)
  formData.append('title', input.title)
  formData.append('frame', input.frame)
  formData.append('date', input.date)
  formData.append('location', input.location)
  formData.append('tone', input.tone)

  if (input.tags && input.tags.length > 0) {
    formData.append('tags', input.tags.join(','))
  }

  if (input.caption) {
    formData.append('caption', input.caption)
  }

  if (input.camera) {
    formData.append('camera', input.camera)
  }

  if (input.film) {
    formData.append('film', input.film)
  }

  return requestJson<UploadAdminPhotoOutput>('/admin/photos', {
    body: formData,
    method: 'POST',
  })
}
