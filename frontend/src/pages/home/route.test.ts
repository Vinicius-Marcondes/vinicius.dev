import { beforeEach, describe, expect, it, vi } from 'vitest'

import { homeLoader } from './route'

const mocks = vi.hoisted(() => ({
  listStatusStripEntries: vi.fn(),
}))

vi.mock('../../entities/status-strip', () => ({
  listStatusStripEntries: mocks.listStatusStripEntries,
}))

const loaderArgs = (request: Request): Parameters<typeof homeLoader>[0] =>
  ({
    params: {},
    request,
  }) as Parameters<typeof homeLoader>[0]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('home route', () => {
  it('loads status-strip entries from the frontend API boundary', async () => {
    mocks.listStatusStripEntries.mockResolvedValueOnce({
      items: [
        {
          accent: 'pink',
          label: 'current focus',
          value: 'cluster 3',
        },
      ],
    })

    const request = new Request('http://localhost/')
    const result = await homeLoader(loaderArgs(request))

    expect(mocks.listStatusStripEntries).toHaveBeenCalledWith(request.signal)
    expect(result).toEqual({
      statusEntries: [
        {
          accent: 'pink',
          label: 'current focus',
          value: 'cluster 3',
        },
      ],
    })
  })

  it('falls back to seeded entries when the API returns no status rows', async () => {
    mocks.listStatusStripEntries.mockResolvedValueOnce({
      items: [],
    })

    const result = await homeLoader(loaderArgs(new Request('http://localhost/')))

    expect(result.statusEntries).toHaveLength(4)
    expect(result.statusEntries[0]).toMatchObject({
      accent: 'pink',
      label: 'Now Building',
    })
  })
})
