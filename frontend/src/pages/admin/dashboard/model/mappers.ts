import type { AdminDashboardSummary } from '../../../../entities/admin-session'
import type { AdminDashboardViewModel } from './types'

const padCounter = (value: number) => String(value).padStart(2, '0')

export const mapDashboardSummary = (dto: AdminDashboardSummary): AdminDashboardViewModel => ({
  panels: [
    {
      detail: 'two notes and one essay waiting for polish',
      label: 'draft thoughts',
      value: padCounter(dto.panels.draftThoughts),
    },
    {
      detail: 'home previews are manually pinned',
      label: 'featured slots',
      value: padCounter(dto.panels.featuredSlots),
    },
    {
      detail: 'metadata only; originals live on the VPS later',
      label: 'photo records',
      value: padCounter(dto.panels.photoRecords),
    },
    {
      detail: 'moderation queue for backend contracts',
      label: 'chat flags',
      value: padCounter(dto.panels.chatFlags),
    },
  ],
  queues: dto.queues.content.map((item) => ({
    action: item.suggestedActions.join(' / '),
    channel: item.channel,
    title: item.title,
  })),
})
