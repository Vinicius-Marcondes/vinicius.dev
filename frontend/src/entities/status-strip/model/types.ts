export type StatusStripEntry = {
  accent?: 'amber' | 'cyan' | 'pink'
  label: string
  value: string
}

export type StatusStripEntriesSnapshot = Readonly<{
  items: readonly StatusStripEntry[]
}>
