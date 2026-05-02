import { ApiRequestError, apiBaseUrl, getJson, postJson } from '../../../shared/api'
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

const parseResponsePayload = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return undefined
  }

  try {
    return await response.json()
  } catch {
    return undefined
  }
}

export const uploadChatImageMessage = (
  input: Readonly<{
    authorHandleId: string
    body?: string
    file: File
    roomId: string
    roomSessionId: string
    tone?: 'cyan' | 'pink' | 'system'
  }>,
  options: Readonly<{
    onProgress?: (progress: number) => void
    signal?: AbortSignal
  }> = {},
) =>
  new Promise<ChatSendMessageResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const endpoint = `${trimTrailingSlash(apiBaseUrl)}/chat/messages/upload`
    xhr.open('POST', endpoint)
    xhr.withCredentials = true
    xhr.responseType = 'text'
    xhr.setRequestHeader('accept', 'application/json')

    const abort = () => {
      xhr.abort()
      reject(new DOMException('The upload was aborted.', 'AbortError'))
    }

    options.signal?.addEventListener('abort', abort, { once: true })

    xhr.upload.addEventListener('progress', (event) => {
      if (!event.lengthComputable) {
        return
      }

      options.onProgress?.(Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100))))
    })

    xhr.addEventListener('error', () => {
      reject(new Error('chat upload request failed'))
    })

    xhr.addEventListener('abort', () => {
      reject(new DOMException('The upload was aborted.', 'AbortError'))
    })

    xhr.addEventListener('load', () => {
      void (async () => {
        options.signal?.removeEventListener('abort', abort)

        const response = new Response(xhr.responseText, {
          headers: {
            'content-type': xhr.getResponseHeader('content-type') ?? 'application/json',
          },
          status: xhr.status,
        })

        const payload = await parseResponsePayload(response)

        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new ApiRequestError(xhr.status, payload as never))
          return
        }

        if (typeof payload === 'undefined') {
          reject(new ApiRequestError(xhr.status))
          return
        }

        options.onProgress?.(100)
        resolve(payload as ChatSendMessageResult)
      })().catch(reject)
    })

    const formData = new FormData()
    formData.append('roomId', input.roomId)
    formData.append('roomSessionId', input.roomSessionId)
    formData.append('authorHandleId', input.authorHandleId)

    if (input.body) {
      formData.append('body', input.body)
    }

    if (input.tone) {
      formData.append('tone', input.tone)
    }

    formData.append('file', input.file)
    xhr.send(formData)
  })

export const getChatAttachmentObjectUrl = async (
  uploadId: string,
  roomSessionId: string,
  signal?: AbortSignal,
) => {
  const response = await fetch(`${trimTrailingSlash(apiBaseUrl)}/chat/uploads/${uploadId}/media`, {
    credentials: 'include',
    headers: {
      accept: '*/*',
      'x-chat-room-session-id': roomSessionId,
    },
    signal,
  })

  if (!response.ok) {
    throw new ApiRequestError(response.status, (await parseResponsePayload(response)) as never)
  }

  return URL.createObjectURL(await response.blob())
}

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
