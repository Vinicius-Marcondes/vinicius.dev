import { apiBaseUrl, getJson, postJson } from '../../../shared/api'
import type {
  ChatLiveEvent,
  ChatMessagesPage,
  ChatParticipantsSnapshot,
  ChatSendMessageResult,
} from '../model/types'

export const listChatParticipants = (slug: string, roomSessionId: string, signal?: AbortSignal) =>
  getJson<ChatParticipantsSnapshot>(`/chat/rooms/${slug}/participants`, {
    headers: {
      'x-chat-room-session-id': roomSessionId,
    },
    signal,
  })

export const listChatMessages = (
  slug: string,
  roomSessionId: string,
  options: Readonly<{ cursor?: string; limit?: number; signal?: AbortSignal }> = {},
) => {
  const searchParams = new URLSearchParams()

  if (options.cursor) {
    searchParams.set('cursor', options.cursor)
  }

  if (typeof options.limit === 'number') {
    searchParams.set('limit', String(options.limit))
  }

  const query = searchParams.toString()
  return getJson<ChatMessagesPage>(`/chat/rooms/${slug}/messages${query ? `?${query}` : ''}`, {
    headers: {
      'x-chat-room-session-id': roomSessionId,
    },
    signal: options.signal,
  })
}

export const sendChatMessage = (
  slug: string,
  roomSessionId: string,
  input: Readonly<{ body: string; tone?: 'cyan' | 'pink' | 'system' }>,
) =>
  postJson<Readonly<{ body: string; tone?: 'cyan' | 'pink' | 'system' }>, ChatSendMessageResult>(
    `/chat/rooms/${slug}/messages`,
    input,
    {
      headers: {
        'x-chat-room-session-id': roomSessionId,
      },
    },
  )

const trimTrailingSlash = (value: string) => value.replace(/\/$/, '')

export const createChatLiveSocket = (
  slug: string,
  roomSessionId: string,
  handlers: Readonly<{
    onClose?: (event: CloseEvent) => void
    onError?: (event: Event) => void
    onEvent: (event: ChatLiveEvent) => void
    onOpen?: (event: Event) => void
  }>,
) => {
  const url = new URL(
    `${trimTrailingSlash(apiBaseUrl)}/chat/rooms/${slug}/live`,
    window.location.origin,
  )
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  url.searchParams.set('sessionId', roomSessionId)

  const socket = new WebSocket(url)

  socket.addEventListener('open', (event) => {
    handlers.onOpen?.(event)
  })

  socket.addEventListener('message', (event) => {
    try {
      handlers.onEvent(JSON.parse(event.data) as ChatLiveEvent)
    } catch {
      // ignore malformed live payloads
    }
  })

  socket.addEventListener('error', (event) => {
    handlers.onError?.(event)
  })

  socket.addEventListener('close', (event) => {
    handlers.onClose?.(event)
  })

  return socket
}
