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

const listResponse = {
  items: [photoItem],
  pageInfo: {
    page: 2,
    pageSize: 20,
    totalItems: 21,
    totalPages: 2,
  },
}

const createUploadRequest = (fields: Map<string, string | File>) =>
  ({
    formData: async () => ({
      get: (field: string) => fields.get(field) ?? null,
    }),
    signal: new AbortController().signal,
    url: 'http://localhost/admin/photos/upload',
  }) as unknown as Request

const createUploadFields = (file?: File) => {
  const fields = new Map<string, string | File>([
    ['intent', 'upload_photo'],
    ['title', photoItem.title],
    ['frame', photoItem.frame],
    ['date', photoItem.date],
    ['location', photoItem.location],
    ['tone', photoItem.tone],
  ])

  if (file) {
    fields.set('file', file)
  }

  return fields
}

const createJpegFile = () =>
  new File([new Uint8Array([0xff, 0xd8, 0xff])], 'photo.jpg', { type: 'image/jpeg' })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('admin photo routes', () => {
  it('maps private gallery query values into listAdminPhotos', async () => {
    mocks.listAdminPhotos.mockResolvedValueOnce(listResponse)

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

    mocks.listAdminPhotos.mockResolvedValueOnce(listResponse)

    const hiddenResult = await adminPhotosLoader(
      routeArgs(
        new Request('http://localhost/admin/photos?status=published&featured=not_featured&search=%20street%20&page=3'),
      ),
    )

    expect(mocks.listAdminPhotos).toHaveBeenLastCalledWith(
      {
        featured: false,
        page: 3,
        search: 'street',
        status: 'published',
      },
      expect.any(AbortSignal),
    )
    expect(hiddenResult).toMatchObject({
      filters: {
        featured: 'not_featured',
        search: 'street',
        status: 'published',
      },
      items: [photoItem],
    })
  })

  it('redirects unauthorized gallery loads to admin login', async () => {
    mocks.listAdminPhotos.mockRejectedValueOnce(new ApiRequestError(401, { error: 'denied' }))

    const result = await adminPhotosLoader(routeArgs(new Request('http://localhost/admin/photos')))

    expect((result as Response).headers.get('location')).toBe('/admin/login')
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
    const file = createJpegFile()
    const fields = createUploadFields(file)
    fields.set('tags', 'night, street, ')
    fields.set('caption', photoItem.caption)
    fields.set('camera', photoItem.camera)
    fields.set('film', photoItem.film)

    const result = await adminPhotoUploadAction(
      routeArgs(createUploadRequest(fields)),
    )

    expect(mocks.uploadAdminPhoto).toHaveBeenCalledWith({
      camera: photoItem.camera,
      caption: photoItem.caption,
      date: photoItem.date,
      file,
      film: photoItem.film,
      frame: photoItem.frame,
      location: photoItem.location,
      tags: ['night', 'street'],
      title: photoItem.title,
      tone: photoItem.tone,
    })
    expect((result as Response).headers.get('location')).toBe('/admin/photos/photo_1')
  })

  it('returns upload validation errors before calling the backend', async () => {
    const fields = createUploadFields()

    await expect(adminPhotoUploadAction(routeArgs(createUploadRequest(fields)))).resolves.toMatchObject({
      field: 'file',
      intent: 'upload_photo',
      message: 'image file is required.',
      status: 'error',
    })
    expect(mocks.uploadAdminPhoto).not.toHaveBeenCalled()

    const invalidTone = createUploadFields(createJpegFile())
    invalidTone.set('tone', 'blue')

    await expect(adminPhotoUploadAction(routeArgs(createUploadRequest(invalidTone)))).resolves.toMatchObject({
      field: 'metadata',
      intent: 'upload_photo',
      message: 'title, frame, date, location, and tone are required.',
      status: 'error',
    })
    expect(mocks.uploadAdminPhoto).not.toHaveBeenCalled()
  })

  it('redirects unauthorized uploads to admin login', async () => {
    mocks.uploadAdminPhoto.mockRejectedValueOnce(new ApiRequestError(401, { error: 'denied' }))
    const fields = createUploadFields(createJpegFile())

    const result = await adminPhotoUploadAction(routeArgs(createUploadRequest(fields)))

    expect((result as Response).headers.get('location')).toBe('/admin/login')
  })

  it('submits detail metadata actions through the existing handler', async () => {
    mocks.updateAdminPhotoMetadata.mockResolvedValueOnce({ item: photoItem })
    const metadata = new FormData()
    metadata.set('intent', 'update_metadata')
    metadata.set('photoId', photoItem.id)
    metadata.set('title', photoItem.title)
    metadata.set('frame', photoItem.frame)
    metadata.set('date', photoItem.date)
    metadata.set('location', photoItem.location)
    metadata.set('tone', photoItem.tone)
    metadata.set('tags', 'night, street, ')
    metadata.set('caption', photoItem.caption)
    metadata.set('camera', photoItem.camera)
    metadata.set('film', photoItem.film)

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

    expect(mocks.updateAdminPhotoMetadata).toHaveBeenCalledWith({
      camera: photoItem.camera,
      caption: photoItem.caption,
      date: photoItem.date,
      film: photoItem.film,
      frame: photoItem.frame,
      id: photoItem.id,
      location: photoItem.location,
      tags: ['night', 'street'],
      title: photoItem.title,
      tone: photoItem.tone,
    })
  })

  it('submits detail curation actions through the existing handler', async () => {
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

    expect(mocks.updateAdminPhotoCuration).toHaveBeenLastCalledWith({
      featured: undefined,
      id: photoItem.id,
      status: 'published',
    })

    mocks.updateAdminPhotoCuration.mockResolvedValueOnce({ item: photoItem })
    const feature = new FormData()
    feature.set('intent', 'update_curation')
    feature.set('photoId', photoItem.id)
    feature.set('featured', 'true')

    await expect(
      adminPhotoDetailAction(
        routeArgs(
          new Request('http://localhost/admin/photos/photo_1', {
            body: feature,
            method: 'POST',
          }),
          { id: photoItem.id },
        ),
      ),
    ).resolves.toMatchObject({
      intent: 'update_curation',
      status: 'success',
    })

    expect(mocks.updateAdminPhotoCuration).toHaveBeenLastCalledWith({
      featured: true,
      id: photoItem.id,
      status: undefined,
    })
  })
})
