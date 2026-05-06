import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router-dom'
import { getAdminPhoto, getAdminPhotoOriginalUrl, listAdminPhotos } from '../../../entities/photo'
import { ApiRequestError } from '../../../shared/api'
import {
  handleAdminPhotoDetailAction,
  handleAdminPhotoUploadAction,
} from './model/actions'
import type {
  AdminPhotoDetailLoaderData,
  AdminPhotosFeaturedFilter,
  AdminPhotosLoaderData,
  AdminPhotosStatusFilter,
} from './model/types'

const parseStatusFilter = (value: string | null): AdminPhotosStatusFilter =>
  value === 'draft' || value === 'published' ? value : 'all'

const parseFeaturedFilter = (value: string | null): AdminPhotosFeaturedFilter =>
  value === 'featured' || value === 'not_featured' ? value : 'all'

const parsePositivePage = (value: string | null) => {
  if (!value) {
    return 1
  }

  const parsed = Number.parseInt(value, 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }

  return parsed
}

const redirectUnauthorized = (error: unknown) => {
  if (error instanceof ApiRequestError && error.status === 401) {
    return redirect('/admin/login')
  }

  return null
}

export const adminPhotosLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const status = parseStatusFilter(url.searchParams.get('status'))
  const featured = parseFeaturedFilter(url.searchParams.get('featured'))
  const search = (url.searchParams.get('search') ?? '').trim()
  const page = parsePositivePage(url.searchParams.get('page'))

  try {
    const response = await listAdminPhotos(
      {
        featured: featured === 'all' ? undefined : featured === 'featured',
        page,
        search: search.length > 0 ? search : undefined,
        status: status === 'all' ? undefined : status,
      },
      request.signal,
    )

    return {
      filters: {
        featured,
        search,
        status,
      },
      items: response.items,
      pageInfo: response.pageInfo,
    } satisfies AdminPhotosLoaderData
  } catch (error) {
    const unauthorized = redirectUnauthorized(error)
    if (unauthorized) {
      return unauthorized
    }

    throw error
  }
}

export const adminPhotoDetailLoader = async ({ params, request }: LoaderFunctionArgs) => {
  const id = params.id?.trim()

  if (!id) {
    throw new Response('photo not found', { status: 404 })
  }

  try {
    const response = await getAdminPhoto(id, request.signal)

    return {
      item: response.item,
      originalUrl: getAdminPhotoOriginalUrl(response.item.id),
    } satisfies AdminPhotoDetailLoaderData
  } catch (error) {
    const unauthorized = redirectUnauthorized(error)
    if (unauthorized) {
      return unauthorized
    }

    if (error instanceof ApiRequestError && error.status === 404) {
      throw new Response('photo not found', { status: 404 })
    }

    throw error
  }
}

export const adminPhotoUploadAction = async (args: ActionFunctionArgs) =>
  handleAdminPhotoUploadAction(args)

export const adminPhotoDetailAction = async (args: ActionFunctionArgs) =>
  handleAdminPhotoDetailAction(args)
