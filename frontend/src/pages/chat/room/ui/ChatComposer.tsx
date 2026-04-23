import type { ChangeEvent, FormEvent } from 'react'
import { ActionButton } from '../../../../shared/ui'

type ChatComposerProps = {
  draft: string
  imageName?: string
  onDraftChange: (draft: string) => void
  onImageChange: (fileName?: string) => void
  onSubmit: () => void
}

const quickEmoji = [':) ', '<3 ', '!!! ']

export function ChatComposer({
  draft,
  imageName,
  onDraftChange,
  onImageChange,
  onSubmit,
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
        <label className="chat-composer__upload glitch-hover">
          <input type="file" accept="image/*" onChange={handleImageChange} />
          image
        </label>
        {imageName ? <span className="chat-composer__image">{imageName}</span> : null}
        <ActionButton type="submit">send</ActionButton>
      </div>
    </form>
  )
}
