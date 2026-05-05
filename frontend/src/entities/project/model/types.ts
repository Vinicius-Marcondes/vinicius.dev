export type ProjectStatus = 'live' | 'archived' | 'in-progress'

export type ProjectThumbnailKind = 'bars' | 'grid' | 'noise' | 'sig'

export type ProjectThumbnailHue = 'amber' | 'cyan' | 'pink'

export type ProjectRecord = {
  id: string
  channel: string
  title: string
  year: number
  status: ProjectStatus
  description: string
  tags: string[]
  links: {
    github?: string | null
    site?: string | null
  }
  thumbnail: {
    hue: ProjectThumbnailHue
    kind: ProjectThumbnailKind
  }
}
