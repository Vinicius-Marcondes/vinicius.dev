import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiRequestError } from '../../../../shared/api'
import { ChatRoomPage } from './ChatRoomPage'

const chatMocks = vi.hoisted(() => ({
  createChatLiveSocket: vi.fn(),
  getChatAttachmentObjectUrl: vi.fn(),
  joinChatRoom: vi.fn(),
  listChatMessages: vi.fn(),
  listChatParticipants: vi.fn(),
  parseChatRoomError: vi.fn((error: unknown) => {
    if (error instanceof ApiRequestError) {
      return error.payload
    }

    return null
  }),
  resolveChatRoomSession: vi.fn(),
  sendChatMessage: vi.fn(),
  uploadChatImageMessage: vi.fn(),
}))

vi.mock('../../../../entities/chat', () => ({
  createChatLiveSocket: chatMocks.createChatLiveSocket,
  getChatAttachmentObjectUrl: chatMocks.getChatAttachmentObjectUrl,
  joinChatRoom: chatMocks.joinChatRoom,
  listChatMessages: chatMocks.listChatMessages,
  listChatParticipants: chatMocks.listChatParticipants,
  parseChatRoomError: chatMocks.parseChatRoomError,
  resolveChatRoomSession: chatMocks.resolveChatRoomSession,
  sendChatMessage: chatMocks.sendChatMessage,
  uploadChatImageMessage: chatMocks.uploadChatImageMessage,
}))

const createStoredSession = () => ({
  handle: 'runner',
  room: {
    id: 'room_1',
    slug: 'night-shift',
  },
  session: {
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    handleId: 'handle_1',
    id: 'session_1',
    joinedAt: '2026-05-05T12:00:00.000Z',
    roomId: 'room_1',
    status: 'active',
  },
})

beforeEach(() => {
  vi.clearAllMocks()
  window.sessionStorage.clear()
  window.requestAnimationFrame = (callback) => window.setTimeout(callback, 0)
  chatMocks.createChatLiveSocket.mockReturnValue({
    close: vi.fn(),
  })
  chatMocks.listChatParticipants.mockResolvedValue({
    items: [{ handle: 'runner', status: 'online' }],
  })
  chatMocks.listChatMessages.mockResolvedValue({
    items: [
      {
        author: 'runner',
        body: 'hello from the archive',
        id: 'message_1',
        sentAt: '2026-05-05T12:00:00.000Z',
      },
    ],
    pageInfo: {
      nextCursor: null,
    },
  })
})

afterEach(() => {
  cleanup()
  window.sessionStorage.clear()
})

describe('ChatRoomPage', () => {
  it('returns expired stored sessions to the gate', () => {
    window.sessionStorage.setItem(
      'vinicius-dev-chat-room-session',
      JSON.stringify({
        ...createStoredSession(),
        session: {
          ...createStoredSession().session,
          expiresAt: '2000-01-01T00:00:00.000Z',
        },
      }),
    )

    render(<ChatRoomPage />)

    expect(screen.getByText('your room session expired. knock again with the latest password.')).toBeInTheDocument()
    expect(window.sessionStorage.getItem('vinicius-dev-chat-room-session')).toBeNull()
  })

  it('rehydrates a valid session and loads room messages', async () => {
    const storedSession = createStoredSession()
    window.sessionStorage.setItem('vinicius-dev-chat-room-session', JSON.stringify(storedSession))
    chatMocks.resolveChatRoomSession.mockResolvedValue({
      participant: {
        handle: 'runner',
        id: 'handle_1',
        status: 'online',
      },
      room: storedSession.room,
      session: storedSession.session,
    })

    render(<ChatRoomPage />)

    expect(screen.getByText('RESTORING SESSION…')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('signal locked // welcome runner')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('hello from the archive')).toBeInTheDocument()
    })
    expect(chatMocks.resolveChatRoomSession).toHaveBeenCalledWith('night-shift', 'session_1')
    expect(chatMocks.createChatLiveSocket).toHaveBeenCalledWith(
      'night-shift',
      'session_1',
      expect.objectContaining({
        onEvent: expect.any(Function),
      }),
    )
  })
})
