export type PhotoTone = 'amber' | 'cyan' | 'mono' | 'sunset' | 'violet'

export type PhotoRecord = {
  id: string
  frame: string
  title: string
  date: string
  location: string
  tags: string[]
  tone: PhotoTone
}
