import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

const createGalleryLoaderData = (request: Request) => {
  const url = new URL(request.url)

  return {
    filters: {
      featured: url.searchParams.get('featured') ?? 'all',
      search: url.searchParams.get('search') ?? '',
      status: url.searchParams.get('status') ?? 'all',
    },
    items: [photoItem],
    pageInfo: {
      page: Number(url.searchParams.get('page') ?? '1'),
      pageSize: 20,
      totalItems: 42,
      totalPages: 3,
    },
  }
}

afterEach(() => {
  cleanup()
})

describe('admin photo split screens', () => {
  it('renders private gallery cards and upload navigation', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter([
      {
        element: <AdminPhotosGalleryPage />,
        loader: ({ request }) => createGalleryLoaderData(request),
        path: '/admin/photos',
      },
      {
        element: <div>photo detail route</div>,
        path: '/admin/photos/:id',
      },
    ], {
      initialEntries: ['/admin/photos?page=2&status=draft'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'private gallery' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /upload photo/i })).toHaveAttribute('href', '/admin/photos/upload')
    const photoLink = screen.getByRole('link', { name: /paulista at 02:14/i })
    expect(photoLink).toHaveAttribute('href', '/admin/photos/photo_1')
    expect(screen.getByAltText('paulista at 02:14')).toHaveAttribute('src', '/api/admin/photos/photo_1/original')

    const gridView = screen.getByRole('button', { name: /grid view/i })
    const listView = screen.getByRole('button', { name: /list view/i })
    expect(gridView).toHaveAttribute('aria-pressed', 'true')
    expect(listView).toHaveAttribute('aria-pressed', 'false')

    await user.click(listView)

    expect(gridView).toHaveAttribute('aria-pressed', 'false')
    expect(listView).toHaveAttribute('aria-pressed', 'true')
    expect(router.state.location.search).toBe('?page=2&status=draft')

    await user.click(photoLink)

    expect(router.state.location.pathname).toBe('/admin/photos/photo_1')
    expect(router.state.location.state).toEqual({ from: '/admin/photos?page=2&status=draft' })
  })

  it('keeps filters backed by query string state and resets page', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter([
      {
        element: <AdminPhotosGalleryPage />,
        loader: ({ request }) => createGalleryLoaderData(request),
        path: '/admin/photos',
      },
    ], {
      initialEntries: ['/admin/photos?page=3'],
    })

    render(<RouterProvider router={router} />)

    await user.type(await screen.findByLabelText('search'), 'neon')

    expect(router.state.location.search).toContain('search=neon')
    expect(router.state.location.search).toContain('page=1')

    await user.selectOptions(screen.getByLabelText('status'), 'published')

    expect(router.state.location.search).toContain('status=published')
    expect(router.state.location.search).toContain('page=1')

    await user.selectOptions(screen.getByLabelText('featured'), 'featured')

    expect(router.state.location.search).toContain('featured=featured')
    expect(router.state.location.search).toContain('page=1')
  })

  it('keeps pagination backed by existing page query behavior', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter([
      {
        element: <AdminPhotosGalleryPage />,
        loader: ({ request }) => createGalleryLoaderData(request),
        path: '/admin/photos',
      },
    ], {
      initialEntries: ['/admin/photos?page=2&status=draft'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findAllByText('page 2 / 3')).toHaveLength(2)
    await user.click(screen.getByRole('button', { name: /next/i }))

    expect(router.state.location.search).toContain('page=3')
    expect(router.state.location.search).toContain('status=draft')

    await user.click(screen.getByRole('button', { name: /previous/i }))

    expect(router.state.location.search).toContain('page=2')
    expect(router.state.location.search).toContain('status=draft')
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
