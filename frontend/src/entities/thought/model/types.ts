export type ThoughtType = 'essay' | 'note'

export type ThoughtStatus = 'draft' | 'published'

export type ThoughtRecord = {
  bodyPreview: string
  excerpt: string
  id: string
  publishedAt: string
  readingTime: string
  status: ThoughtStatus
  tags: string[]
  title: string
  type: ThoughtType
}
