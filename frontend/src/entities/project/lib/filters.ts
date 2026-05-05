import type { ProjectRecord, ProjectStatus } from '../model/types'

type ProjectFilterInput = {
  query: string
  sort: 'alpha' | 'channel' | 'recent'
  status: 'all' | ProjectStatus
  tag: string
}

export function filterProjects(
  projects: ProjectRecord[],
  { query, sort, status, tag }: ProjectFilterInput,
) {
  const normalizedQuery = query.trim().toLowerCase()

  const filtered = projects.filter((project) => {
    const statusMatches = status === 'all' || project.status === status
    const tagMatches = tag === 'all' || project.tags.includes(tag)
    const queryMatches =
      normalizedQuery.length === 0 ||
      project.title.toLowerCase().includes(normalizedQuery) ||
      project.description.toLowerCase().includes(normalizedQuery) ||
      project.channel.includes(normalizedQuery) ||
      project.tags.some((projectTag) => projectTag.toLowerCase().includes(normalizedQuery))

    return statusMatches && tagMatches && queryMatches
  })

  return filtered.toSorted((left, right) => {
    if (sort === 'alpha') {
      return left.title.localeCompare(right.title)
    }

    if (sort === 'channel') {
      return Number(left.channel) - Number(right.channel)
    }

    return right.year - left.year
  })
}
