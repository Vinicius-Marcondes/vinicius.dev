export type AdminDashboardSummary = Readonly<{
  panels: Readonly<{
    draftThoughts: number
    featuredSlots: number
    photoRecords: number
    chatFlags: number
    statusStripEntries: number
  }>
  queues: Readonly<{
    content: readonly Readonly<{
      id: string
      kind: string
      channel: string
      title: string
      suggestedActions: readonly string[]
    }>[]
  }>
  moderationCommands: readonly string[]
}>
