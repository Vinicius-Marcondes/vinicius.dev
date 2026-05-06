import { redirect, type ActionFunctionArgs } from 'react-router-dom'
import {
  parseAdminPhotoApiError,
  updateAdminPhotoCuration,
  updateAdminPhotoMetadata,
  uploadAdminPhoto,
  type PhotoTone,
} from '../../../../entities/photo'
import { ApiRequestError } from '../../../../shared/api'
import type { AdminPhotosActionData } from './types'

const photoTones: readonly PhotoTone[] = ['amber', 'cyan', 'mono', 'sunset', 'violet']

const readFormField = (formData: FormData, field: string) => {
  const value = formData.get(field)
  if (typeof value !== 'string') {
    return ''
  }

  return value.trim()
}

const readOptionalFormField = (formData: FormData, field: string) => {
  const value = readFormField(formData, field)
  return value.length > 0 ? value : undefined
}

const readRequiredFile = (formData: FormData, field: string): File | null => {
  const value = formData.get(field)

  if (!(value instanceof File) || value.size <= 0) {
    return null
  }

  return value
}

const parseTags = (value: string | undefined) => {
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

const parseFeaturedField = (value: string | null): boolean | undefined => {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return undefined
}

const parsePhotoTone = (value: string): PhotoTone | null => {
  return photoTones.includes(value as PhotoTone) ? (value as PhotoTone) : null
}

const formatFieldError = (field?: string) =>
  field ? `invalid value for ${field}.` : 'invalid request. check the submitted values.'

const mapActionError = (
  error: unknown,
  fallback: string,
): Pick<AdminPhotosActionData, 'field' | 'message'> => {
  const apiError = parseAdminPhotoApiError(error)

  if (!apiError) {
    return {
      message: fallback,
    }
  }

  if (apiError.error === 'not_found') {
    return {
      message: apiError.resource === 'photo' ? 'photo record was not found.' : 'resource not found.',
    }
  }

  if (apiError.error === 'invalid_query' || apiError.error === 'invalid_request' || apiError.error === 'invalid_upload') {
    return {
      field: apiError.field,
      message: formatFieldError(apiError.field),
    }
  }

  return {
    message: fallback,
  }
}

const resolvePhotoId = (formData: FormData, params: ActionFunctionArgs['params']) => {
  const routeId = typeof params.id === 'string' ? params.id.trim() : ''
  const payloadId = readFormField(formData, 'photoId')

  if (payloadId && routeId && payloadId !== routeId) {
    return null
  }

  return payloadId || routeId
}

const submitAdminPhotoCuration = async ({
  formData,
  params,
}: Readonly<{
  formData: FormData
  params: ActionFunctionArgs['params']
}>): Promise<AdminPhotosActionData | Response> => {
  const rowId = resolvePhotoId(formData, params)
  const statusValue = readFormField(formData, 'status')
  const featuredValue = parseFeaturedField(formData.get('featured')?.toString() ?? null)
  const nextStatus = statusValue === 'draft' || statusValue === 'published' ? statusValue : undefined

  if (!rowId || (typeof nextStatus === 'undefined' && typeof featuredValue === 'undefined')) {
    return {
      intent: 'update_curation',
      message: 'invalid curation request.',
      rowId: rowId || undefined,
      status: 'error',
    } satisfies AdminPhotosActionData
  }

  try {
    await updateAdminPhotoCuration({
      featured: featuredValue,
      id: rowId,
      status: nextStatus,
    })

    return {
      intent: 'update_curation',
      message: 'curation updated.',
      rowId,
      status: 'success',
    } satisfies AdminPhotosActionData
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return redirect('/admin/login')
    }

    const mapped = mapActionError(error, 'unable to update curation right now.')

    return {
      ...mapped,
      intent: 'update_curation',
      rowId,
      status: 'error',
    } satisfies AdminPhotosActionData
  }
}

const submitAdminPhotoMetadata = async ({
  formData,
  params,
}: Readonly<{
  formData: FormData
  params: ActionFunctionArgs['params']
}>): Promise<AdminPhotosActionData | Response> => {
  const rowId = resolvePhotoId(formData, params)
  const title = readFormField(formData, 'title')
  const frame = readFormField(formData, 'frame')
  const date = readFormField(formData, 'date')
  const location = readFormField(formData, 'location')
  const tone = parsePhotoTone(readFormField(formData, 'tone'))

  if (!rowId || !title || !frame || !date || !location || !tone) {
    return {
      field: 'metadata',
      intent: 'update_metadata',
      message: 'title, frame, date, location, and tone are required.',
      rowId: rowId || undefined,
      status: 'error',
    } satisfies AdminPhotosActionData
  }

  try {
    await updateAdminPhotoMetadata({
      camera: readOptionalFormField(formData, 'camera') ?? null,
      caption: readOptionalFormField(formData, 'caption') ?? null,
      date,
      film: readOptionalFormField(formData, 'film') ?? null,
      frame,
      id: rowId,
      location,
      tags: parseTags(readOptionalFormField(formData, 'tags')),
      title,
      tone,
    })

    return {
      intent: 'update_metadata',
      message: 'metadata updated.',
      rowId,
      status: 'success',
    } satisfies AdminPhotosActionData
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return redirect('/admin/login')
    }

    const mapped = mapActionError(error, 'unable to update metadata right now.')

    return {
      ...mapped,
      intent: 'update_metadata',
      rowId,
      status: 'error',
    } satisfies AdminPhotosActionData
  }
}

export const handleAdminPhotoUploadAction = async ({
  request,
}: ActionFunctionArgs): Promise<AdminPhotosActionData | Response> => {
  const formData = await request.formData()
  const intent = readFormField(formData, 'intent')

  if (intent && intent !== 'upload_photo') {
    return {
      intent: 'upload_photo',
      message: 'invalid admin photo action.',
      status: 'error',
    } satisfies AdminPhotosActionData
  }

  const title = readFormField(formData, 'title')
  const frame = readFormField(formData, 'frame')
  const date = readFormField(formData, 'date')
  const location = readFormField(formData, 'location')
  const tone = parsePhotoTone(readFormField(formData, 'tone'))
  const file = readRequiredFile(formData, 'file')

  if (!title || !frame || !date || !location || !tone || !file) {
    return {
      field: !file ? 'file' : 'metadata',
      intent: 'upload_photo',
      message: !file ? 'image file is required.' : 'title, frame, date, location, and tone are required.',
      status: 'error',
    } satisfies AdminPhotosActionData
  }

  try {
    const uploaded = await uploadAdminPhoto({
      camera: readOptionalFormField(formData, 'camera'),
      caption: readOptionalFormField(formData, 'caption'),
      date,
      file,
      film: readOptionalFormField(formData, 'film'),
      frame,
      location,
      tags: parseTags(readOptionalFormField(formData, 'tags')),
      title,
      tone,
    })

    return redirect(`/admin/photos/${encodeURIComponent(uploaded.item.id)}`)
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return redirect('/admin/login')
    }

    const mapped = mapActionError(error, 'unable to upload photo right now. try again soon.')

    return {
      ...mapped,
      intent: 'upload_photo',
      status: 'error',
    } satisfies AdminPhotosActionData
  }
}

export const handleAdminPhotoDetailAction = async ({
  params,
  request,
}: ActionFunctionArgs): Promise<AdminPhotosActionData | Response> => {
  const formData = await request.formData()
  const intent = readFormField(formData, 'intent')

  if (intent === 'update_curation') {
    return submitAdminPhotoCuration({
      formData,
      params,
    })
  }

  if (intent === 'update_metadata') {
    return submitAdminPhotoMetadata({
      formData,
      params,
    })
  }

  return {
    intent: 'update_metadata',
    message: 'invalid admin photo action.',
    rowId: readFormField(formData, 'photoId') || (typeof params.id === 'string' ? params.id : undefined),
    status: 'error',
  } satisfies AdminPhotosActionData
}
