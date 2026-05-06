import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiRequestError } from '../../../shared/api'
import {
  adminPhotoDetailAction,
  adminPhotoDetailLoader,
  adminPhotosLoader,
  adminPhotoUploadAction,
} from './route'

const mocks = vi.hoisted(() => ({
  getAdminPhoto: vi.fn(),
  listAdminPhotos: vi.fn(),
  updateAdminPhotoCuration: vi.fn(),
  updateAdminPhotoMetadata: vi.fn(),
  uploadAdminPhoto: vi.fn(),
}))

vi.mock('../../../entities/photo', async () => {
  const actual = await vi.importActual<typeof import('../../../entities/photo')>('../../../entities/photo')

  return {
    ...actual,
    getAdminPhoto: mocks.getAdminPhoto,
    getAdminPhotoOriginalUrl: (id: string) => `/api/admin/photos/${encodeURIComponent(id)}/original`,
    listAdminPhotos: mocks.listAdminPhotos,
    updateAdminPhotoCuration: mocks.updateAdminPhotoCuration,
    updateAdminPhotoMetadata: mocks.updateAdminPhotoMetadata,
    uploadAdminPhoto: mocks.uploadAdminPhoto,
  }
})

const routeArgs = (request: Request, params: Record<string, string> = {}) =>
  ({
    context: {},
    params,
    request,
  }) as Parameters<typeof adminPhotosLoader>[0]

const photoItem = {
  camera: 'Canon',
  caption: 'Night street frame.',
  date: '2026-03-22',
  featured: false,
  film: 'digital',
  frame: '014',
  id: 'photo_1',
  location: 'Sao Paulo',
  original: {
    byteSize: 1204,
    displayFilename: 'photo.jpg',
    mimeType: 'image/jpeg',
  },
  status: 'draft',
  tags: ['night', 'street'],
  title: 'paulista at 02:14',
  tone: 'sunset',
  updatedAt: '2026-04-28T12:00:00.000Z',
} as const

beforeEach(() => {
  vi.clearAllMocks()
})

describe('admin photo routes', () => {
  it('loads private gallery filters from the URL', async () => {
    mocks.listAdminPhotos.mockResolvedValueOnce({
      items: [photoItem],
      pageInfo: {
        page: 2,
        pageSize: 20,
        totalItems: 21,
        totalPages: 2,
      },
    })

    const result = await adminPhotosLoader(
      routeArgs(new Request('http://localhost/admin/photos?status=draft&featured=featured&search=night&page=2')),
    )

    expect(mocks.listAdminPhotos).toHaveBeenCalledWith(
      {
        featured: true,
        page: 2,
        search: 'night',
        status: 'draft',
      },
      expect.any(AbortSignal),
    )
    expect(result).toMatchObject({
      filters: {
        featured: 'featured',
        search: 'night',
        status: 'draft',
      },
      items: [photoItem],
    })
  })

  it('loads a private photo detail and protected original URL', async () => {
    mocks.getAdminPhoto.mockResolvedValueOnce({ item: photoItem })

    const result = await adminPhotoDetailLoader(
      routeArgs(new Request('http://localhost/admin/photos/photo_1'), { id: 'photo_1' }),
    )

    expect(mocks.getAdminPhoto).toHaveBeenCalledWith('photo_1', expect.any(AbortSignal))
    expect(result).toEqual({
      item: photoItem,
      originalUrl: '/api/admin/photos/photo_1/original',
    })
  })

  it('redirects unauthorized loaders to admin login', async () => {
    mocks.getAdminPhoto.mockRejectedValueOnce(new ApiRequestError(401, { error: 'denied' }))

    const result = await adminPhotoDetailLoader(
      routeArgs(new Request('http://localhost/admin/photos/photo_1'), { id: 'photo_1' }),
    )

    expect((result as Response).headers.get('location')).toBe('/admin/login')
  })

  it('redirects successful uploads to the new detail page', async () => {
    mocks.uploadAdminPhoto.mockResolvedValueOnce({ item: photoItem })
    const file = new File([new Uint8Array([0xff, 0xd8, 0xff])], 'photo.jpg', { type: 'image/jpeg' })
    const fields = new Map<string, string | File>([
      ['intent', 'upload_photo'],
      ['title', photoItem.title],
      ['frame', photoItem.frame],
      ['date', photoItem.date],
      ['location', photoItem.location],
      ['tone', photoItem.tone],
      ['file', file],
    ])

    const result = await adminPhotoUploadAction(
      routeArgs({
        formData: async () => ({
          get: (field: string) => fields.get(field) ?? null,
        }),
        signal: new AbortController().signal,
        url: 'http://localhost/admin/photos/upload',
      } as unknown as Request),
    )

    expect((result as Response).headers.get('location')).toBe('/admin/photos/photo_1')
  })

  it('submits detail metadata and curation actions', async () => {
    mocks.updateAdminPhotoMetadata.mockResolvedValueOnce({ item: photoItem })
    const metadata = new FormData()
    metadata.set('intent', 'update_metadata')
    metadata.set('photoId', photoItem.id)
    metadata.set('title', photoItem.title)
    metadata.set('frame', photoItem.frame)
    metadata.set('date', photoItem.date)
    metadata.set('location', photoItem.location)
    metadata.set('tone', photoItem.tone)

    await expect(
      adminPhotoDetailAction(
        routeArgs(
          new Request('http://localhost/admin/photos/photo_1', {
            body: metadata,
            method: 'POST',
          }),
          { id: photoItem.id },
        ),
      ),
    ).resolves.toMatchObject({
      intent: 'update_metadata',
      status: 'success',
    })

    mocks.updateAdminPhotoCuration.mockResolvedValueOnce({ item: photoItem })
    const curation = new FormData()
    curation.set('intent', 'update_curation')
    curation.set('photoId', photoItem.id)
    curation.set('status', 'published')

    await expect(
      adminPhotoDetailAction(
        routeArgs(
          new Request('http://localhost/admin/photos/photo_1', {
            body: curation,
            method: 'POST',
          }),
          { id: photoItem.id },
        ),
      ),
    ).resolves.toMatchObject({
      intent: 'update_curation',
      status: 'success',
    })
  })
})
