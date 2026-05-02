import type { ChangeEvent, FormEvent } from 'react'
import { ActionButton } from '../../../../shared/ui'

type ChatComposerProps = {
  draft: string
  imageName?: string
  imagePreviewUrl?: string | null
  isSubmitting?: boolean
  notice?: string
  onDraftChange: (draft: string) => void
  onImageChange: (file: File | null) => void
  onImageClear?: () => void
  onSubmit: () => void
  uploadProgress?: number | null
  uploadsEnabled?: boolean
}

const quickEmoji = [':) ', '<3 ', '!!! ']

export function ChatComposer({
  draft,
  imageName,
  imagePreviewUrl,
  isSubmitting = false,
  notice,
  onDraftChange,
  onImageChange,
  onImageClear,
  onSubmit,
  uploadProgress,
  uploadsEnabled = true,
}: ChatComposerProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    onImageChange(event.target.files?.[0] ?? null)
    event.target.value = ''
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
      {imagePreviewUrl ? (
        <div className="chat-composer__preview">
          <img src={imagePreviewUrl} alt={imageName ?? 'selected upload preview'} className="chat-composer__preview-image" />
          <div className="chat-composer__preview-meta">
            <span>{imageName ?? 'selected image'}</span>
            <button type="button" className="chat-composer__clear glitch-hover" onClick={onImageClear}>
              remove
            </button>
          </div>
        </div>
      ) : null}
      {typeof uploadProgress === 'number' ? (
        <div className="chat-composer__progress" aria-live="polite">
          <div className="chat-composer__progress-bar">
            <span style={{ width: `${uploadProgress}%` }} />
          </div>
          <span>{uploadProgress}% uploaded</span>
        </div>
      ) : null}
      {notice ? <p className="chat-composer__notice">{notice}</p> : null}
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
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
            image
          </label>
        ) : null}
        {imageName && !imagePreviewUrl ? <span className="chat-composer__image">{imageName}</span> : null}
        <ActionButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'sending…' : 'send'}
        </ActionButton>
      </div>
    </form>
  )
}
