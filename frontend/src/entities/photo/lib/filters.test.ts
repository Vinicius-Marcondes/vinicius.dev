import { describe, expect, it } from 'vitest'

import { filterPhotos, groupPhotosByMonth } from './filters'
import { toPhotoRecord } from './mappers'
import type { PhotoRecord } from '../model/types'

const photos: PhotoRecord[] = [
  {
    date: '2026-05-03',
    frame: '002',
    id: 'photo_2',
    location: 'Rio',
    tags: ['beach'],
    title: 'Rio frame',
    tone: 'cyan',
  },
  {
    date: '2026-05-02',
    frame: '001',
    id: 'photo_1',
    location: 'Sao Paulo',
    tags: ['street'],
    title: 'Paulista night',
    tone: 'amber',
  },
]

describe('photo entity helpers', () => {
  it('filters, sorts, groups, and clones mapped tags', () => {
    const mapped = toPhotoRecord(photos[0]!)
    expect(mapped.tags).not.toBe(photos[0]!.tags)
    expect(
      filterPhotos(photos, {
        location: 'Sao Paulo',
        query: 'night',
        year: '2026',
      }),
    ).toEqual([photos[1]])
    expect(groupPhotosByMonth(photos)).toEqual([
      {
        items: photos,
        month: '2026-05',
      },
    ])
  })
})
