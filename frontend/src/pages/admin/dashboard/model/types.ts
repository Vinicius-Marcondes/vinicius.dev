export type AdminDashboardPanel = Readonly<{
  detail: string
  label: string
  value: string
}>

export type AdminDashboardQueueItem = Readonly<{
  id: string
  action: string
  channel: string
  title: string
}>

export type AdminDashboardRoomAccess = Readonly<{
  currentPassword: string
  passwordRotatedAt: string | null
  passwordVersion: number
  revokedSessionCount?: number
  rotationMessage?: string
  sessionTtlHours: number
  slug: string
}>

export type AdminDashboardViewModel = Readonly<{
  panels: readonly AdminDashboardPanel[]
  queues: readonly AdminDashboardQueueItem[]
  roomAccess: AdminDashboardRoomAccess | null
}>

