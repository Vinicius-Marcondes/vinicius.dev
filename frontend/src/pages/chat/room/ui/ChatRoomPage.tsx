import { useEffect, useMemo, useState } from 'react'
import {
  type ChatRoomJoinResult,
  joinChatRoom,
  parseChatRoomError,
  resolveChatRoomSession,
} from '../../../../entities/chat'
import { PageBanner } from '../../../../widgets/page-banner'
import { Container, InlineLabel, ScreenFrame, Section } from '../../../../shared/ui'
import { ChatGate } from './ChatGate'

const roomSlug = 'night-shift'
const storageKey = 'vinicius-dev-chat-room-session'

type PersistedChatSession = Readonly<{
  handle: string
  room: ChatRoomJoinResult['room']
  session: ChatRoomJoinResult['session']
}>

type ChatRoomPhase = 'bootstrapping' | 'gate' | 'joining' | 'room'

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
        setPhase('room')
      } catch (error) {
        if (cancelled) return

        clearStoredSession()
        const chatError = parseChatRoomError(error)
        if (chatError?.reason === 'handle_banned') {
          setGateError('this handle has been banned from the room.')
        } else {
          setGateError('your room session expired or was revoked. enter the latest password again.')
        }
        setPhase('gate')
      }
    }

    void rehydrate()

    return () => {
      cancelled = true
    }
  }, [storedSession])

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

      setPhase('gate')
    }
  }

  const roomStatus = useMemo(() => {
    if (!session) return 'auth handshake pending'

    return `session live until ${formatExpiry(session.session.expiresAt)}`
  }, [session])

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
                <div className="chat-room__messages" aria-live="polite">
                  <div className="chat-message chat-message--system">
                    <header className="chat-message__meta">
                      <span>system</span>
                      <span>live backend</span>
                    </header>
                    <p className="chat-message__body">
                      room gate verified. message archive and live traffic plug in on the next step.
                    </p>
                  </div>
                </div>
              </ScreenFrame>
              <aside className="chat-room__sidecar">
                <ScreenFrame>
                  <InlineLabel>session</InlineLabel>
                  <div className="chat-room__operators">
                    <span className="chat-room__operator">
                      <span className="chat-room__operator-dot" aria-hidden="true" />
                      {session.participant.handle}
                      <small>online</small>
                    </span>
                  </div>
                </ScreenFrame>
                <ScreenFrame>
                  <InlineLabel>house rules</InlineLabel>
                  <ul className="chat-room__rules">
                    <li>room password rotates from the admin dashboard</li>
                    <li>sessions last for 24 hours, then you knock again</li>
                    <li>messages and live traffic arrive in the next implementation slice</li>
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
