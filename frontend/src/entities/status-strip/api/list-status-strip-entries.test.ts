import { afterEach, describe, expect, it, vi } from 'vitest'

import { listStatusStripEntries } from './list-status-strip-entries'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('status strip API helper', () => {
  it('maps /api/status-strip payload entries and normalizes unknown accents', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              accent: 'pink',
              label: 'current focus',
              value: 'cluster 3',
            },
            {
              accent: null,
              label: 'location',
              value: 'Sao Paulo',
            },
            {
              accent: 'invalid-tone',
              label: 'signal',
              value: 'projects + photos',
            },
          ],
        }),
        {
          headers: { 'content-type': 'application/json' },
          status: 200,
        },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = await listStatusStripEntries()

    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/status-strip')
    expect(result).toEqual({
      items: [
        {
          accent: 'pink',
          label: 'current focus',
          value: 'cluster 3',
        },
        {
          label: 'location',
          value: 'Sao Paulo',
        },
        {
          label: 'signal',
          value: 'projects + photos',
        },
      ],
    })
  })
})
