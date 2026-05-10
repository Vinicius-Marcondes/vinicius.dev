import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createChatLiveSocket,
  getChatAttachmentObjectUrl,
  listChatMessages,
  listChatParticipants,
  sendChatMessage,
} from './room-runtime'

class MockWebSocket extends EventTarget {
  static instances: MockWebSocket[] = []
  readonly protocols: string | string[]
  readonly url: string

  constructor(url: string, protocols?: string | string[]) {
    super()
    this.url = url
    this.protocols = protocols ?? []
    MockWebSocket.instances.push(this)
  }

  close = vi.fn()
}

afterEach(() => {
  MockWebSocket.instances = []
  vi.unstubAllGlobals()
})

const getRequestHeader = (headers: HeadersInit | undefined, name: string) =>
  headers instanceof Headers ? headers.get(name) : (headers as Record<string, string> | undefined)?.[name]

describe('chat runtime API helpers', () => {
  it('builds participant, message, send, and protected media requests', async () => {
    const protectedMediaBlob = new Blob(['image'], { type: 'image/png' })
    const protectedMediaResponse = {
      blob: vi.fn(async () => protectedMediaBlob),
      headers: new Headers(),
      ok: true,
      status: 200,
    } satisfies Pick<Response, 'blob' | 'headers' | 'ok' | 'status'>
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          headers: { 'content-type': 'application/json' },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [], pageInfo: { nextCursor: null } }), {
          headers: { 'content-type': 'application/json' },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ item: { author: 'v', body: 'hi', id: 'msg_1', sentAt: '2026-05-05' } }), {
          headers: { 'content-type': 'application/json' },
          status: 200,
        }),
      )
      .mockResolvedValueOnce(protectedMediaResponse)
    const createObjectUrl = vi.fn(() => 'blob:chat-image')
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrl,
    })

    await listChatParticipants('night-shift', 'session_1')
    await listChatMessages('night-shift', 'session_1', { cursor: 'cursor_1', limit: 10 })
    await sendChatMessage('night-shift', 'session_1', { body: 'hi', tone: 'cyan' })
    await expect(getChatAttachmentObjectUrl('upload_1', 'session_1')).resolves.toBe('blob:chat-image')

    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      '/api/chat/rooms/night-shift/participants',
      '/api/chat/rooms/night-shift/messages?cursor=cursor_1&limit=10',
      '/api/chat/rooms/night-shift/messages',
      '/api/chat/uploads/upload_1/media',
    ])
    expect(getRequestHeader(fetchMock.mock.calls[0]?.[1]?.headers, 'x-chat-room-session-id')).toBe('session_1')
    expect(getRequestHeader(fetchMock.mock.calls[3]?.[1]?.headers, 'x-chat-room-session-id')).toBe('session_1')
    expect(createObjectUrl).toHaveBeenCalledWith(protectedMediaBlob)
  })

  it('opens live sockets with the approved subprotocol auth contract', () => {
    vi.stubGlobal('WebSocket', MockWebSocket)

    const onEvent = vi.fn()
    const socket = createChatLiveSocket('night-shift', 'session_1', { onEvent })

    expect(socket).toBe(MockWebSocket.instances[0])
    expect(MockWebSocket.instances[0]?.url).toBe('ws://localhost:3000/api/chat/rooms/night-shift/live')
    expect(MockWebSocket.instances[0]?.protocols).toEqual([
      'chat-room-live.v1',
      'chat-room-session.session_1',
    ])

    MockWebSocket.instances[0]?.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify({ type: 'participant.snapshot', items: [] }),
      }),
    )
    expect(onEvent).toHaveBeenCalledWith({ type: 'participant.snapshot', items: [] })
  })
})
