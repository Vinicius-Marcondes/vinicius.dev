import { useEffect, useEffectEvent, useState } from 'react'
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
  const photo = photos[index]
  const imageKey = photo ? `${photo.id}:${photo.originalUrl}` : 'empty'
  const [imageState, setImageState] = useState({ error: false, key: imageKey, loaded: false })
  const hasLoaded = imageState.key === imageKey && imageState.loaded
  const hasError = imageState.key === imageKey && imageState.error

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
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {!hasError ? (
              <img
                src={photo.originalUrl}
                alt={photo.title}
                loading="lazy"
                onLoad={() => setImageState({ error: false, key: imageKey, loaded: true })}
                onError={() => setImageState({ error: true, key: imageKey, loaded: false })}
                style={{
                  display: 'block',
                  height: '100%',
                  inset: 0,
                  objectFit: 'cover',
                  opacity: hasLoaded ? 1 : 0,
                  position: 'absolute',
                  transition: 'opacity 200ms ease',
                  width: '100%',
                }}
              />
            ) : null}
            {!hasLoaded || hasError ? (
              <span style={{ position: 'absolute', inset: 0 }}>
                <FilmFrame tone={photo.tone} label={photo.frame} />
              </span>
            ) : null}
          </div>
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
