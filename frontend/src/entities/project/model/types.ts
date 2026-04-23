export type ProjectStatus = 'live' | 'archived' | 'in-progress'

export type ProjectRecord = {
  id: string
  channel: string
  title: string
  year: number
  status: ProjectStatus
  description: string
  tags: string[]
}
