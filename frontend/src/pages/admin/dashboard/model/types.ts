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

export type AdminDashboardViewModel = Readonly<{
  panels: readonly AdminDashboardPanel[]
  queues: readonly AdminDashboardQueueItem[]
}>

