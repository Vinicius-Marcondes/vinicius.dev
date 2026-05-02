import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  type ChatMessage,
  type ChatParticipant,
  type ChatRoomJoinResult,
  createChatLiveSocket,
  joinChatRoom,
  listChatMessages,
  listChatParticipants,
  parseChatRoomError,
  resolveChatRoomSession,
  sendChatMessage,
} from '../../../../entities/chat'
import { PageBanner } from '../../../../widgets/page-banner'
import { Container, InlineLabel, ScreenFrame, Section } from '../../../../shared/ui'
import { ChatComposer } from './ChatComposer'
import { ChatGate } from './ChatGate'
import { ChatMessageBubble } from './ChatMessageBubble'

const roomSlug = 'night-shift'
const storageKey = 'vinicius-dev-chat-room-session'
const pageSize = 30

type PersistedChatSession = Readonly<{
  handle: string
  room: ChatRoomJoinResult['room']
  session: ChatRoomJoinResult['session']
}>

type ChatRoomPhase = 'bootstrapping' | 'gate' | 'joining' | 'room'
type LiveStatus = 'connecting' | 'live' | 'offline'

const readStoredSession = (): PersistedChatSession | null => {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(storageKey)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as PersistedChatSession
    if (!parsed.handle || !parsed.session?.id || !parsed.room?.slug) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

const clearStoredSession = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(storageKey)
}

const persistSession = (value: PersistedChatSession) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(value))
}

const hasSessionExpired = (expiresAt: string | null) => {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() <= Date.now()
}

const formatExpiry = (expiresAt: string | null) => {
  if (!expiresAt) return 'no expiry'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(new Date(expiresAt))
}

const sortMessagesAscending = (items: readonly ChatMessage[]) =>
  [...items].sort((left, right) => {
    const leftTime = new Date(left.sentAt).getTime()
    const rightTime = new Date(right.sentAt).getTime()

    if (leftTime !== rightTime) {
      return leftTime - rightTime
    }

    return left.id.localeCompare(right.id)
  })

const mergeMessages = (current: readonly ChatMessage[], incoming: readonly ChatMessage[]) => {
  const byId = new Map<string, ChatMessage>()

  for (const item of [...current, ...incoming]) {
    byId.set(item.id, item)
  }

  return sortMessagesAscending([...byId.values()])
}

export function ChatRoomPage() {
  const [bootstrap] = useState(() => {
    const session = readStoredSession()

    if (!session) {
      return {
        initialError: undefined as string | undefined,
        initialPhase: 'gate' as ChatRoomPhase,
        storedSession: null as PersistedChatSession | null,
      }
    }

    if (session.room.slug !== roomSlug || hasSessionExpired(session.session.expiresAt)) {
      clearStoredSession()
      return {
        initialError: 'your room session expired. knock again with the latest password.',
        initialPhase: 'gate' as ChatRoomPhase,
        storedSession: null as PersistedChatSession | null,
      }
    }

    return {
      initialError: undefined as string | undefined,
      initialPhase: 'bootstrapping' as ChatRoomPhase,
      storedSession: session,
    }
  })

  const { storedSession } = bootstrap
  const [handle, setHandle] = useState(storedSession?.handle ?? '')
  const [password, setPassword] = useState('')
  const [gateError, setGateError] = useState<string | undefined>(bootstrap.initialError)
  const [phase, setPhase] = useState<ChatRoomPhase>(bootstrap.initialPhase)
  const [session, setSession] = useState<ChatRoomJoinResult | null>(null)
  const [participants, setParticipants] = useState<readonly ChatParticipant[]>([])
  const [messages, setMessages] = useState<readonly ChatMessage[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isRoomLoading, setIsRoomLoading] = useState(false)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [draft, setDraft] = useState('')
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('offline')
  const messagesViewportRef = useRef<HTMLDivElement | null>(null)
  const liveSocketRef = useRef<WebSocket | null>(null)
  const revocationHandledRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    window.requestAnimationFrame(() => {
      const viewport = messagesViewportRef.current
      if (!viewport) return
      viewport.scrollTop = viewport.scrollHeight
    })
  }, [])

  const isNearBottom = () => {
    const viewport = messagesViewportRef.current
    if (!viewport) return true

    return viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 96
  }

  const resetToGate = useCallback((error: string) => {
    clearStoredSession()
    liveSocketRef.current?.close()
    liveSocketRef.current = null
    revocationHandledRef.current = false
    setSession(null)
    setParticipants([])
    setMessages([])
    setNextCursor(null)
    setDraft('')
    setIsRoomLoading(false)
    setGateError(error)
    setLiveStatus('offline')
    setPhase('gate')
  }, [])

  const appendMessage = useCallback((message: ChatMessage, shouldStickToBottom: boolean) => {
    setMessages((current) => mergeMessages(current, [message]))

    if (shouldStickToBottom) {
      scrollToBottom()
    }
  }, [scrollToBottom])

  useEffect(() => {
    if (!storedSession) {
      return
    }

    let cancelled = false

    const rehydrate = async () => {
      try {
        const resolved = await resolveChatRoomSession(roomSlug, storedSession.session.id)

        if (cancelled) return

        setHandle(resolved.participant.handle)
        setSession(resolved)
        persistSession({
          handle: resolved.participant.handle,
          room: resolved.room,
          session: resolved.session,
        })
        setGateError(undefined)
        setIsRoomLoading(true)
        setLiveStatus('connecting')
        setPhase('room')
      } catch (error) {
        if (cancelled) return

        const chatError = parseChatRoomError(error)
        if (chatError?.reason === 'handle_banned') {
          resetToGate('this handle has been banned from the room.')
        } else {
          resetToGate('your room session expired or was revoked. enter the latest password again.')
        }
      }
    }

    void rehydrate()

    return () => {
      cancelled = true
    }
  }, [resetToGate, storedSession])

  useEffect(() => {
    if (phase !== 'room' || !session) {
      return
    }

    let cancelled = false

    const hydrateRoom = async () => {
      try {
        const [participantSnapshot, messagePage] = await Promise.all([
          listChatParticipants(roomSlug, session.session.id),
          listChatMessages(roomSlug, session.session.id, { limit: pageSize }),
        ])

        if (cancelled) return

        setParticipants(participantSnapshot.items)
        setMessages(sortMessagesAscending(messagePage.items))
        setNextCursor(messagePage.pageInfo.nextCursor)
        setGateError(undefined)
        scrollToBottom()
      } catch (error) {
        if (cancelled) return

        const chatError = parseChatRoomError(error)
        if (chatError?.reason === 'handle_banned') {
          resetToGate('this handle has been banned from the room.')
        } else {
          resetToGate('your room session expired or was revoked. enter the latest password again.')
        }
      } finally {
        if (!cancelled) {
          setIsRoomLoading(false)
        }
      }
    }

    void hydrateRoom()

    return () => {
      cancelled = true
    }
  }, [phase, resetToGate, scrollToBottom, session])

  useEffect(() => {
    if (phase !== 'room' || !session) {
      return
    }

    revocationHandledRef.current = false
    const socket = createChatLiveSocket(roomSlug, session.session.id, {
      onClose: () => {
        if (liveSocketRef.current === socket) {
          liveSocketRef.current = null
        }

        if (!revocationHandledRef.current) {
          setLiveStatus('offline')
        }
      },
      onError: () => {
        setLiveStatus('offline')
      },
      onEvent: (event) => {
        if (event.type === 'participant.snapshot') {
          setParticipants(event.items)
          return
        }

        if (event.type === 'message.created') {
          appendMessage(event.item, isNearBottom() || event.item.author === session.participant.handle)
          return
        }

        if (event.type === 'session.revoked') {
          revocationHandledRef.current = true
          resetToGate('the room password rotated. knock again with the latest password.')
        }
      },
      onOpen: () => {
        setLiveStatus('live')
      },
    })

    liveSocketRef.current = socket

    return () => {
      if (liveSocketRef.current === socket) {
        liveSocketRef.current = null
      }

      socket.close()
    }
  }, [appendMessage, phase, resetToGate, session])

  useEffect(() => {
    if (phase !== 'room' || !session?.session.expiresAt) {
      return
    }

    const msUntilExpiry = new Date(session.session.expiresAt).getTime() - Date.now()

    if (msUntilExpiry <= 0) {
      const timeoutId = window.setTimeout(() => {
        resetToGate('your room session expired. knock again with the latest password.')
      }, 0)

      return () => {
        window.clearTimeout(timeoutId)
      }
    }

    const timeoutId = window.setTimeout(() => {
      resetToGate('your room session expired. knock again with the latest password.')
    }, msUntilExpiry)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [phase, resetToGate, session])

  const joinRoom = async () => {
    if (!handle.trim() || !password.trim()) {
      setGateError('handle and room password are both required.')
      return
    }

    setPhase('joining')

    try {
      const joined = await joinChatRoom(roomSlug, {
        handle: handle.trim(),
        password,
      })

      persistSession({
        handle: joined.participant.handle,
        room: joined.room,
        session: joined.session,
      })
      setHandle(joined.participant.handle)
      setPassword('')
      setSession(joined)
      setGateError(undefined)
      setIsRoomLoading(true)
      setLiveStatus('connecting')
      setPhase('room')
    } catch (error) {
      const chatError = parseChatRoomError(error)

      if (chatError?.reason === 'handle_banned') {
        setGateError('this handle has been banned from the room.')
      } else if (chatError?.error === 'denied') {
        setGateError('wrong room password. ask vinicius for the current one.')
      } else {
        setGateError('unable to open the room right now. try again in a moment.')
      }

      setLiveStatus('offline')
      setPhase('gate')
    }
  }

  const loadOlderMessages = async () => {
    if (!session || !nextCursor || isLoadingOlder) {
      return
    }

    const viewport = messagesViewportRef.current
    const previousHeight = viewport?.scrollHeight ?? 0
    const previousTop = viewport?.scrollTop ?? 0
    setIsLoadingOlder(true)

    try {
      const page = await listChatMessages(roomSlug, session.session.id, {
        cursor: nextCursor,
        limit: pageSize,
      })

      setMessages((current) => mergeMessages(sortMessagesAscending(page.items), current))
      setNextCursor(page.pageInfo.nextCursor)

      window.requestAnimationFrame(() => {
        const nextViewport = messagesViewportRef.current
        if (!nextViewport) return

        nextViewport.scrollTop = nextViewport.scrollHeight - previousHeight + previousTop
      })
    } catch {
      setGateError('unable to load older messages right now.')
    } finally {
      setIsLoadingOlder(false)
    }
  }

  const handleMessagesScroll = () => {
    const viewport = messagesViewportRef.current
    if (!viewport || viewport.scrollTop > 96) {
      return
    }

    void loadOlderMessages()
  }

  const sendMessage = async () => {
    if (!session || !draft.trim()) {
      return
    }

    setIsSending(true)

    try {
      const response = await sendChatMessage(roomSlug, session.session.id, {
        body: draft.trim(),
      })

      setDraft('')
      appendMessage(response.item, true)
    } catch (error) {
      const chatError = parseChatRoomError(error)
      if (chatError?.reason === 'handle_banned') {
        resetToGate('this handle has been banned from the room.')
      } else if (chatError?.error === 'denied') {
        resetToGate('your room session expired or was revoked. enter the latest password again.')
      } else {
        setGateError('message send failed. try again in a moment.')
      }
    } finally {
      setIsSending(false)
    }
  }

  const roomStatus = useMemo(() => {
    if (!session) return 'auth handshake pending'

    const liveLabel =
      liveStatus === 'live'
        ? 'live stream online'
        : liveStatus === 'connecting'
          ? 'connecting live stream…'
          : 'live stream offline'

    return `${liveLabel} // session until ${formatExpiry(session.session.expiresAt)}`
  }, [liveStatus, session])

  const visibleParticipants = useMemo(() => {
    if (participants.length > 0) {
      return participants
    }

    if (!session) {
      return []
    }

    return [{ handle: session.participant.handle, status: 'online' as const }]
  }, [participants, session])

  return (
    <>
      <PageBanner
        label="chat room"
        title="chat room. // ch.07"
        description="A visible but password-gated room for late-night signals, persistent handles, links, emoji, and image drops."
      />
      <Section>
        <Container>
          {phase === 'bootstrapping' || phase === 'joining' ? (
            <ScreenFrame className="chat-gate">
              <div className="chat-gate__form">
                <p className="chat-gate__eyebrow">restricted broadcast // backend handshake</p>
                <h2 className="chat-gate__title fx-crt-title">
                  {phase === 'joining' ? 'OPENING ROOM…' : 'RESTORING SESSION…'}
                </h2>
                <p className="chat-gate__copy">
                  {phase === 'joining'
                    ? 'the gate accepted your knock. pulling a real room session now.'
                    : 'checking your stored room session before the archive wakes up.'}
                </p>
              </div>
            </ScreenFrame>
          ) : null}
          {phase === 'gate' ? (
            <ChatGate
              handle={handle}
              password={password}
              error={gateError}
              onHandleChange={setHandle}
              onPasswordChange={setPassword}
              onSubmit={() => {
                void joinRoom()
              }}
            />
          ) : null}
          {phase === 'room' && session ? (
            <div className="chat-room">
              <ScreenFrame className="chat-room__timeline">
                <div className="chat-room__header">
                  <div>
                    <InlineLabel>room archive</InlineLabel>
                    <h2 className="chat-room__title">signal locked // welcome {session.participant.handle}</h2>
                  </div>
                  <span className="chat-room__status">{roomStatus}</span>
                </div>
                <div
                  ref={messagesViewportRef}
                  className="chat-room__messages"
                  aria-live="polite"
                  onScroll={handleMessagesScroll}
                >
                  {isLoadingOlder ? (
                    <div className="chat-message chat-message--system">
                      <p className="chat-message__body">pulling older signals…</p>
                    </div>
                  ) : null}
                  {isRoomLoading ? (
                    <div className="chat-message chat-message--system">
                      <p className="chat-message__body">loading archive and participant snapshot…</p>
                    </div>
                  ) : null}
                  {!isRoomLoading && messages.length === 0 ? (
                    <div className="chat-message chat-message--system">
                      <p className="chat-message__body">room is live, but the archive is still empty.</p>
                    </div>
                  ) : null}
                  {messages.map((message) => (
                    <ChatMessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.author === session.participant.handle}
                    />
                  ))}
                </div>
                <ChatComposer
                  draft={draft}
                  imageName={undefined}
                  isSubmitting={isSending}
                  onDraftChange={setDraft}
                  onImageChange={() => undefined}
                  onSubmit={() => {
                    void sendMessage()
                  }}
                  uploadsEnabled={false}
                />
              </ScreenFrame>
              <aside className="chat-room__sidecar">
                <ScreenFrame>
                  <InlineLabel>operators</InlineLabel>
                  <div className="chat-room__operators">
                    {visibleParticipants.map((participant) => (
                      <span key={participant.handle} className="chat-room__operator">
                        <span className="chat-room__operator-dot" aria-hidden="true" />
                        {participant.handle}
                        <small>{participant.status}</small>
                      </span>
                    ))}
                  </div>
                </ScreenFrame>
                <ScreenFrame>
                  <InlineLabel>house rules</InlineLabel>
                  <ul className="chat-room__rules">
                    <li>room password rotates from the admin dashboard</li>
                    <li>sessions last for 24 hours, then you knock again</li>
                    <li>scroll upward to pull older archived messages</li>
                    <li>image drops arrive in the next implementation slice</li>
                  </ul>
                </ScreenFrame>
              </aside>
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  )
}
