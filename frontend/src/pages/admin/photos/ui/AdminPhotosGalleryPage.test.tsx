import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { AdminPhotoDetailPage } from './AdminPhotoDetailPage'
import { AdminPhotosGalleryPage } from './AdminPhotosGalleryPage'
import { AdminPhotoUploadPage } from './AdminPhotoUploadPage'

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

afterEach(() => {
  cleanup()
})

describe('admin photo split screens', () => {
  it('renders private gallery cards and upload navigation', async () => {
    const router = createMemoryRouter([
      {
        element: <AdminPhotosGalleryPage />,
        loader: () => ({
          filters: {
            featured: 'all',
            search: '',
            status: 'all',
          },
          items: [photoItem],
          pageInfo: {
            page: 1,
            pageSize: 20,
            totalItems: 1,
            totalPages: 1,
          },
        }),
        path: '/admin/photos',
      },
    ], {
      initialEntries: ['/admin/photos'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'private gallery' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'upload photo' })).toHaveAttribute('href', '/admin/photos/upload')
    expect(screen.getByRole('link', { name: /paulista at 02:14/i })).toHaveAttribute('href', '/admin/photos/photo_1')
    expect(screen.getByAltText('paulista at 02:14')).toHaveAttribute('src', '/api/admin/photos/photo_1/original')
  })

  it('renders the upload form as its own screen', async () => {
    const router = createMemoryRouter([
      {
        element: <AdminPhotoUploadPage />,
        path: '/admin/photos/upload',
      },
    ], {
      initialEntries: ['/admin/photos/upload'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'upload original' })).toBeInTheDocument()
    expect(screen.getByLabelText('file')).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp')
    expect(screen.getByRole('button', { name: 'upload draft' })).toBeInTheDocument()
  })

  it('renders the detail editor with protected image and visibility controls', async () => {
    const router = createMemoryRouter([
      {
        element: <AdminPhotoDetailPage />,
        loader: () => ({
          item: photoItem,
          originalUrl: '/api/admin/photos/photo_1/original',
        }),
        path: '/admin/photos/:id',
      },
    ], {
      initialEntries: ['/admin/photos/photo_1'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'paulista at 02:14' })).toBeInTheDocument()
    expect(screen.getByAltText('paulista at 02:14')).toHaveAttribute('src', '/api/admin/photos/photo_1/original')
    expect(screen.getByRole('button', { name: 'publish' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'feature' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'save metadata' })).toBeInTheDocument()
  })
})
