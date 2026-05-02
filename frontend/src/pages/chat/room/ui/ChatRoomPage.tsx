import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  type ChatMessage,
  type ChatParticipant,
  type ChatRoomJoinResult,
  createChatLiveSocket,
  getChatAttachmentObjectUrl,
  joinChatRoom,
  listChatMessages,
  listChatParticipants,
  parseChatRoomError,
  resolveChatRoomSession,
  sendChatMessage,
  uploadChatImageMessage,
} from '../../../../entities/chat'
import { ApiRequestError } from '../../../../shared/api'
import { PageBanner } from '../../../../widgets/page-banner'
import { Container, InlineLabel, ScreenFrame, Section } from '../../../../shared/ui'
import { ChatComposer } from './ChatComposer'
import { ChatGate } from './ChatGate'
import { ChatMessageBubble } from './ChatMessageBubble'

const roomSlug = 'night-shift'
const storageKey = 'vinicius-dev-chat-room-session'
const pageSize = 30
const uploadMaxBytes = 5 * 1024 * 1024
const allowedUploadMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

type PersistedChatSession = Readonly<{
  handle: string
  room: ChatRoomJoinResult['room']
  session: ChatRoomJoinResult['session']
}>

type ChatRoomPhase = 'bootstrapping' | 'gate' | 'joining' | 'room'
type LiveStatus = 'connecting' | 'live' | 'offline'
type AttachmentMediaState = Readonly<{
  objectUrl?: string
  status: 'error' | 'loading' | 'ready'
}>

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

const readUploadErrorNotice = (error: unknown) => {
  if (!(error instanceof ApiRequestError) || !error.payload || typeof error.payload !== 'object') {
    return null
  }

  const payload = error.payload as Record<string, unknown>

  if (payload.error !== 'invalid_upload') {
    return null
  }

  if (payload.reason === 'unsupported_mime_type') {
    return 'only jpg, png, or webp images are allowed in this room.'
  }

  if (payload.reason === 'file_too_large') {
    return 'that image is over the 5 MB upload limit.'
  }

  if (payload.reason === 'too_many_files') {
    return 'one image per message only.'
  }

  return 'image upload failed validation. check the file and try again.'
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
  const [composerNotice, setComposerNotice] = useState<string | undefined>()
  const [roomNotice, setRoomNotice] = useState<string | undefined>()
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [attachmentMedia, setAttachmentMedia] = useState<Record<string, AttachmentMediaState>>({})
  const [viewerAttachmentId, setViewerAttachmentId] = useState<string | null>(null)
  const [liveStatus, setLiveStatus] = useState<LiveStatus>('offline')
  const messagesViewportRef = useRef<HTMLDivElement | null>(null)
  const liveSocketRef = useRef<WebSocket | null>(null)
  const revocationHandledRef = useRef(false)
  const attachmentRequestsRef = useRef(new Map<string, AbortController>())
  const attachmentObjectUrlsRef = useRef(new Map<string, string>())
  const uploadAbortRef = useRef<AbortController | null>(null)

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

  const clearAttachmentMedia = useCallback(() => {
    for (const controller of attachmentRequestsRef.current.values()) {
      controller.abort()
    }

    attachmentRequestsRef.current.clear()

    for (const objectUrl of attachmentObjectUrlsRef.current.values()) {
      URL.revokeObjectURL(objectUrl)
    }

    attachmentObjectUrlsRef.current.clear()
    setAttachmentMedia({})
    setViewerAttachmentId(null)
  }, [])

  const clearComposerUploadState = useCallback(() => {
    uploadAbortRef.current?.abort()
    uploadAbortRef.current = null
    setSelectedImageFile(null)
    setUploadProgress(null)
  }, [])

  const resetToGate = useCallback((error: string) => {
    clearStoredSession()
    liveSocketRef.current?.close()
    liveSocketRef.current = null
    revocationHandledRef.current = false
    clearAttachmentMedia()
    clearComposerUploadState()
    setSession(null)
    setParticipants([])
    setMessages([])
    setNextCursor(null)
    setDraft('')
    setComposerNotice(undefined)
    setRoomNotice(undefined)
    setIsRoomLoading(false)
    setGateError(error)
    setLiveStatus('offline')
    setPhase('gate')
  }, [clearAttachmentMedia, clearComposerUploadState])

  const appendMessage = useCallback((message: ChatMessage, shouldStickToBottom: boolean) => {
    setMessages((current) => mergeMessages(current, [message]))

    if (shouldStickToBottom) {
      scrollToBottom()
    }
  }, [scrollToBottom])

  useEffect(() => () => {
    clearAttachmentMedia()
    uploadAbortRef.current?.abort()
  }, [clearAttachmentMedia])

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
        setRoomNotice(undefined)
        setComposerNotice(undefined)
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
        setRoomNotice(undefined)
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

  useEffect(() => {
    const attachmentIds = new Set(
      messages.flatMap((message) => (message.attachment ? [message.attachment.id] : [])),
    )

    for (const [attachmentId, controller] of attachmentRequestsRef.current.entries()) {
      if (!attachmentIds.has(attachmentId)) {
        controller.abort()
        attachmentRequestsRef.current.delete(attachmentId)
      }
    }

    for (const [attachmentId, objectUrl] of attachmentObjectUrlsRef.current.entries()) {
      if (!attachmentIds.has(attachmentId)) {
        URL.revokeObjectURL(objectUrl)
        attachmentObjectUrlsRef.current.delete(attachmentId)
      }
    }

    if (phase !== 'room' || !session) {
      return
    }

    for (const message of messages) {
      const attachment = message.attachment

      if (!attachment) {
        continue
      }

      if (
        attachmentObjectUrlsRef.current.has(attachment.id) ||
        attachmentRequestsRef.current.has(attachment.id)
      ) {
        continue
      }

      const controller = new AbortController()
      attachmentRequestsRef.current.set(attachment.id, controller)

      void getChatAttachmentObjectUrl(attachment.id, session.session.id, controller.signal)
        .then((objectUrl) => {
          if (controller.signal.aborted) {
            URL.revokeObjectURL(objectUrl)
            return
          }

          attachmentRequestsRef.current.delete(attachment.id)
          attachmentObjectUrlsRef.current.set(attachment.id, objectUrl)
          setAttachmentMedia((current) => ({
            ...current,
            [attachment.id]: {
              objectUrl,
              status: 'ready',
            },
          }))
        })
        .catch((error) => {
          if (controller.signal.aborted) {
            return
          }

          attachmentRequestsRef.current.delete(attachment.id)
          const chatError = parseChatRoomError(error)

          if (chatError?.reason === 'handle_banned') {
            resetToGate('this handle has been banned from the room.')
            return
          }

          if (chatError?.error === 'denied') {
            resetToGate('your room session expired or was revoked. enter the latest password again.')
            return
          }

          setAttachmentMedia((current) => ({
            ...current,
            [attachment.id]: {
              status: 'error',
            },
          }))
        })
    }
  }, [messages, phase, resetToGate, session, viewerAttachmentId])

  useEffect(() => {
    if (!viewerAttachmentId) {
      return
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setViewerAttachmentId(null)
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
    }
  }, [viewerAttachmentId])

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
      setRoomNotice(undefined)
      setComposerNotice(undefined)
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
      setRoomNotice(undefined)

      window.requestAnimationFrame(() => {
        const nextViewport = messagesViewportRef.current
        if (!nextViewport) return

        nextViewport.scrollTop = nextViewport.scrollHeight - previousHeight + previousTop
      })
    } catch (error) {
      const chatError = parseChatRoomError(error)

      if (chatError?.reason === 'handle_banned') {
        resetToGate('this handle has been banned from the room.')
      } else if (chatError?.error === 'denied') {
        resetToGate('your room session expired or was revoked. enter the latest password again.')
      } else {
        setRoomNotice('unable to load older messages right now.')
      }
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

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setSelectedImageFile(null)
      setComposerNotice(undefined)
      return
    }

    if (!allowedUploadMimeTypes.has(file.type)) {
      setSelectedImageFile(null)
      setComposerNotice('only jpg, png, or webp images are allowed in this room.')
      return
    }

    if (file.size > uploadMaxBytes) {
      setSelectedImageFile(null)
      setComposerNotice('that image is over the 5 MB upload limit.')
      return
    }

    setSelectedImageFile(file)
    setComposerNotice(undefined)
  }

  const sendMessage = async () => {
    if (!session) {
      return
    }

    const trimmedDraft = draft.trim()

    if (!trimmedDraft && !selectedImageFile) {
      setComposerNotice('add a message or image before sending.')
      return
    }

    setIsSending(true)
    setComposerNotice(undefined)

    try {
      const response = selectedImageFile
        ? await (() => {
            const controller = new AbortController()
            uploadAbortRef.current = controller
            setUploadProgress(0)

            return uploadChatImageMessage(
              {
                authorHandleId: session.participant.id,
                body: trimmedDraft || undefined,
                file: selectedImageFile,
                roomId: session.room.id,
                roomSessionId: session.session.id,
              },
              {
                onProgress: setUploadProgress,
                signal: controller.signal,
              },
            )
          })()
        : await sendChatMessage(roomSlug, session.session.id, {
            body: trimmedDraft,
          })

      setDraft('')
      clearComposerUploadState()
      setComposerNotice(undefined)
      appendMessage(response.item, true)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      const uploadErrorNotice = readUploadErrorNotice(error)
      if (uploadErrorNotice) {
        setComposerNotice(uploadErrorNotice)
        return
      }

      const chatError = parseChatRoomError(error)
      if (chatError?.reason === 'handle_banned') {
        resetToGate('this handle has been banned from the room.')
      } else if (chatError?.error === 'denied') {
        resetToGate('your room session expired or was revoked. enter the latest password again.')
      } else {
        setComposerNotice('message send failed. try again in a moment.')
      }
    } finally {
      uploadAbortRef.current = null
      setIsSending(false)
      setUploadProgress(null)
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

  const selectedImagePreviewUrl = useMemo(() => {
    if (!selectedImageFile) {
      return null
    }

    return URL.createObjectURL(selectedImageFile)
  }, [selectedImageFile])

  useEffect(() => {
    return () => {
      if (selectedImagePreviewUrl) {
        URL.revokeObjectURL(selectedImagePreviewUrl)
      }
    }
  }, [selectedImagePreviewUrl])

  const viewerMessage = useMemo(
    () => messages.find((message) => message.attachment?.id === viewerAttachmentId) ?? null,
    [messages, viewerAttachmentId],
  )

  const viewerObjectUrl = viewerMessage?.attachment
    ? attachmentMedia[viewerMessage.attachment.id]?.objectUrl
    : undefined

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
            <>
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
                    {roomNotice ? (
                      <div className="chat-message chat-message--system">
                        <p className="chat-message__body">{roomNotice}</p>
                      </div>
                    ) : null}
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
                    {messages.map((message) => {
                      const attachmentId = message.attachment?.id
                      const media = attachmentId ? attachmentMedia[attachmentId] : undefined

                      return (
                        <ChatMessageBubble
                          key={message.id}
                          attachmentStatus={media?.status ?? (message.attachment ? 'loading' : undefined)}
                          attachmentUrl={media?.objectUrl}
                          message={message}
                          isOwn={message.author === session.participant.handle}
                          onAttachmentOpen={
                            message.attachment && media?.objectUrl
                              ? () => {
                                  setViewerAttachmentId(message.attachment?.id ?? null)
                                }
                              : undefined
                          }
                        />
                      )
                    })}
                  </div>
                  <ChatComposer
                    draft={draft}
                    imageName={selectedImageFile?.name}
                    imagePreviewUrl={selectedImagePreviewUrl}
                    isSubmitting={isSending}
                    notice={composerNotice}
                    onDraftChange={setDraft}
                    onImageChange={handleImageChange}
                    onImageClear={clearComposerUploadState}
                    onSubmit={() => {
                      void sendMessage()
                    }}
                    uploadProgress={uploadProgress}
                    uploadsEnabled
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
                      <li>image drops stay protected behind your room session</li>
                    </ul>
                  </ScreenFrame>
                </aside>
              </div>
              {viewerMessage?.attachment ? (
                <div className="chat-viewer" role="dialog" aria-modal="true" aria-label="chat image viewer">
                  <button
                    type="button"
                    className="chat-viewer__backdrop"
                    onClick={() => {
                      setViewerAttachmentId(null)
                    }}
                  />
                  <ScreenFrame className="chat-viewer__panel">
                    <div className="chat-viewer__header">
                      <div>
                        <InlineLabel>protected image</InlineLabel>
                        <h3 className="chat-viewer__title">{viewerMessage.attachment.fileName}</h3>
                      </div>
                      <button
                        type="button"
                        className="chat-viewer__close glitch-hover"
                        onClick={() => {
                          setViewerAttachmentId(null)
                        }}
                      >
                        close
                      </button>
                    </div>
                    <div className="chat-viewer__body">
                      {viewerObjectUrl ? (
                        <img src={viewerObjectUrl} alt={viewerMessage.attachment.fileName} className="chat-viewer__image" />
                      ) : (
                        <div className="chat-viewer__empty">recovering protected image…</div>
                      )}
                    </div>
                  </ScreenFrame>
                </div>
              ) : null}
            </>
          ) : null}
        </Container>
      </Section>
    </>
  )
}
