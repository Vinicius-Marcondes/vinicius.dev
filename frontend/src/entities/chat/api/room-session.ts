import { ApiRequestError, getJson, postJson } from '../../../shared/api'
import type { ChatRoomJoinResult } from '../model/types'

export type ChatRoomErrorPayload = Readonly<{
  error: 'invalid_request' | 'denied' | 'not_found'
  field?: string
  reason?: 'handle_banned'
  resource?: 'chat'
}>

const isChatRoomErrorPayload = (value: unknown): value is ChatRoomErrorPayload => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>
  return (
    candidate.error === 'invalid_request' ||
    candidate.error === 'denied' ||
    candidate.error === 'not_found'
  )
}

export const parseChatRoomError = (error: unknown): ChatRoomErrorPayload | null => {
  if (!(error instanceof ApiRequestError) || !error.payload) {
    return null
  }

  return isChatRoomErrorPayload(error.payload) ? error.payload : null
}

export const joinChatRoom = (slug: string, input: Readonly<{ handle: string; password: string }>) =>
  postJson<Readonly<{ handle: string; password: string }>, ChatRoomJoinResult>(
    `/chat/rooms/${slug}/join`,
    input,
  )

export const resolveChatRoomSession = (slug: string, roomSessionId: string, signal?: AbortSignal) =>
  getJson<ChatRoomJoinResult>(`/chat/rooms/${slug}/session`, {
    headers: {
      'x-chat-room-session-id': roomSessionId,
    },
    signal,
  })
