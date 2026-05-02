import type { ChatMessage } from '../../../../entities/chat'
import { cx } from '../../../../shared/lib'

const formatMessageTimestamp = (value: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
  }).format(date)
}

type ChatMessageBubbleProps = {
  isOwn?: boolean
  message: ChatMessage
}

export function ChatMessageBubble({ isOwn = false, message }: ChatMessageBubbleProps) {
  return (
    <article
      className={cx(
        'chat-message',
        isOwn && 'chat-message--own',
        message.tone === 'system' && 'chat-message--system',
      )}
    >
      <header className="chat-message__meta">
        <span>{message.author}</span>
        <span>{formatMessageTimestamp(message.sentAt)}</span>
      </header>
      <p className="chat-message__body">{message.body}</p>
      {message.attachment ? (
        <div className="chat-message__attachment">
          <span className="chat-message__attachment-frame" aria-hidden="true" />
          <span>{message.attachment.fileName}</span>
        </div>
      ) : null}
    </article>
  )
}
