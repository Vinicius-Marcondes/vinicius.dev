import type { ChangeEvent, FormEvent } from 'react'
import { ActionButton } from '../../../../shared/ui'

type ChatComposerProps = {
  draft: string
  imageName?: string
  isSubmitting?: boolean
  onDraftChange: (draft: string) => void
  onImageChange: (fileName?: string) => void
  onSubmit: () => void
  uploadsEnabled?: boolean
}

const quickEmoji = [':) ', '<3 ', '!!! ']

export function ChatComposer({
  draft,
  imageName,
  isSubmitting = false,
  onDraftChange,
  onImageChange,
  onSubmit,
  uploadsEnabled = true,
}: ChatComposerProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    onImageChange(event.target.files?.[0]?.name)
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <label className="chat-composer__input">
        <span className="sr-only">Message</span>
        <textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="type a signal..."
          rows={3}
        />
      </label>
      <div className="chat-composer__tools">
        <div className="chat-composer__quick">
          {quickEmoji.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="chat-composer__tool glitch-hover"
              onClick={() => onDraftChange(`${draft}${emoji}`)}
            >
              {emoji.trim()}
            </button>
          ))}
        </div>
        {uploadsEnabled ? (
          <label className="chat-composer__upload glitch-hover">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            image
          </label>
        ) : null}
        {imageName ? <span className="chat-composer__image">{imageName}</span> : null}
        <ActionButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'sending…' : 'send'}</ActionButton>
      </div>
    </form>
  )
}
