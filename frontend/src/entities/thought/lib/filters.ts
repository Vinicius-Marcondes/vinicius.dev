import type { ThoughtRecord, ThoughtType } from '../model/types'

type ThoughtFilterInput = {
  query: string
  tag: string
  type: 'all' | ThoughtType
}

export function filterThoughts(
  thoughts: ThoughtRecord[],
  { query, tag, type }: ThoughtFilterInput,
) {
  const normalizedQuery = query.trim().toLowerCase()

  return thoughts
    .filter((thought) => thought.status === 'published')
    .filter((thought) => {
      const typeMatches = type === 'all' || thought.type === type
      const tagMatches = tag === 'all' || thought.tags.includes(tag)
      const queryMatches =
        normalizedQuery.length === 0 ||
        thought.title.toLowerCase().includes(normalizedQuery) ||
        thought.excerpt.toLowerCase().includes(normalizedQuery) ||
        thought.tags.some((thoughtTag) => thoughtTag.toLowerCase().includes(normalizedQuery))

      return typeMatches && tagMatches && queryMatches
    })
    .toSorted((left, right) => right.publishedAt.localeCompare(left.publishedAt))
}
