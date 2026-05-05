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
  attachmentStatus?: 'error' | 'loading' | 'ready'
  attachmentUrl?: string
  isOwn?: boolean
  message: ChatMessage
  onAttachmentOpen?: () => void
}

export function ChatMessageBubble({
  attachmentStatus,
  attachmentUrl,
  isOwn = false,
  message,
  onAttachmentOpen,
}: ChatMessageBubbleProps) {
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
      {message.body ? <p className="chat-message__body">{message.body}</p> : null}
      {message.attachment ? (
        <div className="chat-message__attachment">
          {attachmentUrl ? (
            <button type="button" className="chat-message__image-button" onClick={onAttachmentOpen}>
              <img src={attachmentUrl} alt={message.attachment.fileName} className="chat-message__image" />
            </button>
          ) : (
            <span className="chat-message__attachment-frame" aria-hidden="true" />
          )}
          <div className="chat-message__attachment-meta">
            <span>{message.attachment.fileName}</span>
            <small>
              {attachmentStatus === 'loading'
                ? 'decrypting image…'
                : attachmentStatus === 'error'
                  ? 'image unavailable'
                  : 'tap to expand'}
            </small>
          </div>
        </div>
      ) : null}
    </article>
  )
}
