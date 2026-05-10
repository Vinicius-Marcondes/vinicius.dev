import type { AdminDashboardSummary } from '../../../../entities/admin-session'
import type { ChatRoomAccess } from '../../../../entities/chat'
import type { AdminDashboardViewModel } from './types'

const padCounter = (value: number) => String(value).padStart(2, '0')

export const mapDashboardSummary = (
  dto: AdminDashboardSummary,
  roomAccess: ChatRoomAccess | null,
): AdminDashboardViewModel => ({
  panels: [
    {
      accent: 'pink',
      detail: 'two notes and one essay waiting for polish',
      label: 'draft thoughts',
      value: padCounter(dto.panels.draftThoughts),
    },
    {
      accent: 'cyan',
      detail: 'home previews are manually pinned',
      label: 'featured slots',
      value: padCounter(dto.panels.featuredSlots),
    },
    {
      accent: 'lime',
      detail: 'metadata only; originals live on the VPS later',
      label: 'photo records',
      value: padCounter(dto.panels.photoRecords),
    },
    {
      accent: 'amber',
      detail: 'moderation queue for backend contracts',
      label: 'chat flags',
      value: padCounter(dto.panels.chatFlags),
    },
  ],
  queues: dto.queues.content.map((item) => ({
    id: item.id,
    action: item.suggestedActions.join(' / '),
    actions: item.suggestedActions,
    channel: item.channel,
    title: item.title,
  })),
  roomAccess: roomAccess
    ? {
        currentPassword: roomAccess.currentPassword,
        passwordRotatedAt: roomAccess.room.passwordRotatedAt,
        passwordVersion: roomAccess.room.passwordVersion,
        sessionTtlHours: roomAccess.room.sessionTtlHours,
        slug: roomAccess.room.slug,
      }
    : null,
})
