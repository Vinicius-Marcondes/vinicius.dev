import { useState } from 'react'
import { type ChatMessage, chatMessages, chatParticipants } from '../../../../entities/chat'
import { PageBanner } from '../../../../widgets/page-banner'
import { Container, InlineLabel, ScreenFrame, Section } from '../../../../shared/ui'
import { ChatComposer } from './ChatComposer'
import { ChatGate } from './ChatGate'
import { ChatMessageBubble } from './ChatMessageBubble'

function readStoredHandle() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem('vinicius-dev-chat-handle') ?? ''
}

function currentTimeLabel() {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

export function ChatRoomPage() {
  const [handle, setHandle] = useState(readStoredHandle)
  const [password, setPassword] = useState('')
  const [gateError, setGateError] = useState<string>()
  const [isInsideRoom, setIsInsideRoom] = useState(false)
  const [draft, setDraft] = useState('')
  const [imageName, setImageName] = useState<string>()
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages)

  const joinRoom = () => {
    if (!handle.trim() || !password.trim()) {
      setGateError('handle and room password are both required for this mock gate.')
      return
    }

    window.localStorage.setItem('vinicius-dev-chat-handle', handle.trim())
    setGateError(undefined)
    setIsInsideRoom(true)
  }

  const sendMessage = () => {
    if (!draft.trim() && !imageName) return

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `local-${Date.now()}`,
        author: handle.trim() || 'anonymous',
        body: draft.trim() || 'uploaded an image without a caption',
        sentAt: currentTimeLabel(),
        attachment: imageName ? { fileName: imageName, kind: 'image' } : undefined,
        tone: 'pink',
      },
    ])
    setDraft('')
    setImageName(undefined)
  }

  return (
    <>
      <PageBanner
        label="chat room"
        title="chat room. // ch.07"
        description="A visible but password-gated room for late-night signals, persistent handles, links, emoji, and image drops."
      />
      <Section>
        <Container>
          {!isInsideRoom ? (
            <ChatGate
              handle={handle}
              password={password}
              error={gateError}
              onHandleChange={setHandle}
              onPasswordChange={setPassword}
              onSubmit={joinRoom}
            />
          ) : (
            <div className="chat-room">
              <ScreenFrame className="chat-room__timeline">
                <div className="chat-room__header">
                  <div>
                    <InlineLabel>room archive</InlineLabel>
                    <h2 className="chat-room__title">signal locked // welcome {handle}</h2>
                  </div>
                  <span className="chat-room__status">local mock // no backend</span>
                </div>
                <div className="chat-room__messages" aria-live="polite">
                  {messages.map((message) => (
                    <ChatMessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.author === handle.trim()}
                    />
                  ))}
                </div>
                <ChatComposer
                  draft={draft}
                  imageName={imageName}
                  onDraftChange={setDraft}
                  onImageChange={setImageName}
                  onSubmit={sendMessage}
                />
              </ScreenFrame>
              <aside className="chat-room__sidecar">
                <ScreenFrame>
                  <InlineLabel>operators</InlineLabel>
                  <div className="chat-room__operators">
                    {[{ handle: handle.trim() || 'you', status: 'online' as const }, ...chatParticipants].map(
                      (participant) => (
                        <span key={participant.handle} className="chat-room__operator">
                          <span className="chat-room__operator-dot" aria-hidden="true" />
                          {participant.handle}
                          <small>{participant.status}</small>
                        </span>
                      ),
                    )}
                  </div>
                </ScreenFrame>
                <ScreenFrame>
                  <InlineLabel>house rules</InlineLabel>
                  <ul className="chat-room__rules">
                    <li>password rotates from admin later</li>
                    <li>handles persist after backend auth lands</li>
                    <li>images are modeled locally in this wave</li>
                    <li>moderation actions belong to FE-009/admin and backend tasks</li>
                  </ul>
                </ScreenFrame>
              </aside>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
