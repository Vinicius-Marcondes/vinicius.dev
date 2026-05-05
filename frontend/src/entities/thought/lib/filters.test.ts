import { describe, expect, it } from 'vitest'

import { filterThoughts } from './filters'
import { toThoughtRecord } from './mappers'
import type { ThoughtRecord } from '../model/types'

const thoughts: ThoughtRecord[] = [
  {
    bodyPreview: 'preview',
    excerpt: 'Interfaces at night',
    id: 'thought_1',
    publishedAt: '2026-05-02',
    readingTime: '4 min',
    status: 'published',
    tags: ['interface', 'night'],
    title: 'Night Cable Interfaces',
    type: 'essay',
  },
  {
    bodyPreview: 'preview',
    excerpt: 'draft',
    id: 'thought_2',
    publishedAt: '2026-05-03',
    readingTime: '',
    status: 'draft',
    tags: ['draft'],
    title: 'Draft',
    type: 'note',
  },
]

describe('thought entity helpers', () => {
  it('filters published records and clones mapped tags', () => {
    const mapped = toThoughtRecord(thoughts[0]!)
    expect(mapped.tags).toEqual(['interface', 'night'])
    expect(mapped.tags).not.toBe(thoughts[0]!.tags)

    expect(
      filterThoughts(thoughts, {
        query: ' cable ',
        tag: 'interface',
        type: 'essay',
      }),
    ).toEqual([thoughts[0]])
  })
})
