import { getJson, postJson } from '../../../shared/api'
import type { ChatRoomAccess } from '../model/types'

export const getChatRoomAccess = (slug: string, signal?: AbortSignal) =>
  getJson<ChatRoomAccess>(`/admin/chat/rooms/${slug}/access`, { signal })

export const rotateChatRoomPassword = (slug: string, input: Readonly<{ reason?: string }>) =>
  postJson<Readonly<{ reason?: string }>, Readonly<{
    auditId: string
    generatedPassword: string
    revokedSessionCount: number
    room: ChatRoomAccess['room']
    rotation: Readonly<{
      id: string
      rotatedAt: string
    }>
  }>>(`/admin/chat/rooms/${slug}/password-rotation`, input)
