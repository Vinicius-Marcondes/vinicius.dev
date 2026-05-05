import { describe, expect, it } from 'vitest'

import { filterProjects } from './filters'
import { toProjectRecord } from './mappers'
import type { ProjectRecord } from '../model/types'

const projects: ProjectRecord[] = [
  {
    channel: '02',
    description: 'Second project',
    id: 'project_2',
    links: { github: null, site: null },
    status: 'archived',
    tags: ['archive'],
    thumbnail: { hue: 'cyan', kind: 'grid' },
    title: 'Zeta',
    year: 2024,
  },
  {
    channel: '01',
    description: 'First project',
    id: 'project_1',
    links: { github: null, site: null },
    status: 'live',
    tags: ['graphics'],
    thumbnail: { hue: 'amber', kind: 'bars' },
    title: 'Alpha',
    year: 2026,
  },
]

describe('project entity helpers', () => {
  it('filters by status/tag/query and sorts by channel', () => {
    const mapped = toProjectRecord(projects[0]!)
    expect(mapped.tags).not.toBe(projects[0]!.tags)
    expect(
      filterProjects(projects, {
        query: 'project',
        sort: 'channel',
        status: 'all',
        tag: 'all',
      }).map((project) => project.channel),
    ).toEqual(['01', '02'])
    expect(
      filterProjects(projects, {
        query: 'alpha',
        sort: 'recent',
        status: 'live',
        tag: 'graphics',
      }),
    ).toEqual([projects[1]])
  })
})
