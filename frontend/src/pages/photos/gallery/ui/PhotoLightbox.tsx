import { useEffect, useEffectEvent } from 'react'
import type { PhotoRecord } from '../../../../entities/photo'
import { FilmFrame } from './FilmFrame'

type PhotoLightboxProps = {
  index: number
  onClose: () => void
  onNavigate: (direction: -1 | 1) => void
  open: boolean
  photos: PhotoRecord[]
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${isoDate}T00:00:00`))
}

export function PhotoLightbox({ index, onClose, onNavigate, open, photos }: PhotoLightboxProps) {
  const handleClose = useEffectEvent(onClose)
  const handleNavigate = useEffectEvent(onNavigate)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }

      if (event.key === 'ArrowLeft') {
        handleNavigate(-1)
      }

      if (event.key === 'ArrowRight') {
        handleNavigate(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  const photo = photos[index]

  if (!open || !photo) {
    return null
  }

  return (
    <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label={photo.title}>
      <header className="photo-lightbox__header">
        <span>
          <span className="photo-lightbox__rec" aria-hidden="true">
            ●
          </span>{' '}
          viewing // frame {index + 1} of {photos.length}
        </span>
        <button type="button" className="photo-lightbox__button glitch-hover" onClick={onClose}>
          [ esc // close ]
        </button>
      </header>
      <div className="photo-lightbox__stage">
        <button type="button" className="photo-lightbox__nav" onClick={() => onNavigate(-1)} aria-label="Previous photo">
          &lt;
        </button>
        <div className="photo-lightbox__frame">
          <FilmFrame tone={photo.tone} label={photo.frame} />
        </div>
        <button type="button" className="photo-lightbox__nav" onClick={() => onNavigate(1)} aria-label="Next photo">
          &gt;
        </button>
      </div>
      <footer className="photo-lightbox__meta">
        <section>
          <span className="photo-lightbox__label">// title</span>
          <strong>{photo.title}</strong>
          <span>frame {photo.frame}</span>
        </section>
        <section>
          <span className="photo-lightbox__label">// exposed</span>
          <strong>{formatDate(photo.date)}</strong>
          <span>Canon T7+</span>
        </section>
        <section>
          <span className="photo-lightbox__label">// signal</span>
          <strong>{photo.location}</strong>
          <span>{photo.tags.join(' / ')}</span>
        </section>
      </footer>
    </div>
  )
}
