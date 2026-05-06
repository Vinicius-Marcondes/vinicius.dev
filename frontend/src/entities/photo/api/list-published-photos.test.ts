import { afterEach, describe, expect, it, vi } from 'vitest'

import { listPublishedPhotos } from './list-published-photos'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('photo catalog API helper', () => {
  it('builds /api/photos queries and maps list responses with optional facets', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          facets: {
            locations: ['Tokyo', 'Sao Paulo'],
            years: [2025, 2026],
          },
          items: [
            {
              date: '2026-03-22',
              frame: '014',
              id: 'p-2026-014',
              location: 'Sao Paulo',
              originalUrl: '/media/photos/p-2026-014/original',
              tags: ['night', 'street'],
              title: 'paulista at 02:14',
              tone: 'sunset',
            },
          ],
          pageInfo: {
            page: 2,
            pageSize: 8,
            totalItems: 14,
            totalPages: 2,
          },
        }),
        {
          headers: { 'content-type': 'application/json' },
          status: 200,
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await listPublishedPhotos({
      location: 'Sao Paulo',
      page: 2,
      pageSize: 8,
      search: 'night',
      year: '2026',
    })

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      '/api/photos?page=2&pageSize=8&location=Sao+Paulo&search=night&year=2026',
    )
    expect(result).toEqual({
      facets: {
        locations: ['Sao Paulo', 'Tokyo'],
        years: ['2026', '2025'],
      },
      items: [
        {
          date: '2026-03-22',
          frame: '014',
          id: 'p-2026-014',
          location: 'Sao Paulo',
          originalUrl: '/media/photos/p-2026-014/original',
          tags: ['night', 'street'],
          title: 'paulista at 02:14',
          tone: 'sunset',
        },
      ],
      pageInfo: {
        page: 2,
        pageSize: 8,
        totalItems: 14,
        totalPages: 2,
      },
    })
  })
})
