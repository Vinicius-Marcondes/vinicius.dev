import { useState } from 'react'
import type { PhotoRecord } from '../../../../entities/photo'
import { FilmFrame } from './FilmFrame'

type PhotoCardProps = {
  onOpen: () => void
  photo: PhotoRecord
}

export function PhotoCard({ onOpen, photo }: PhotoCardProps) {
  const imageKey = `${photo.id}:${photo.originalUrl}`
  const [imageState, setImageState] = useState({ error: false, key: imageKey, loaded: false })
  const hasLoaded = imageState.key === imageKey && imageState.loaded
  const hasError = imageState.key === imageKey && imageState.error

  return (
    <button type="button" className="photo-card glitch-hover" onClick={onOpen}>
      <span className="photo-card__frame" style={{ position: 'relative' }}>
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
              objectFit: 'cover',
              opacity: hasLoaded ? 1 : 0,
              position: 'absolute',
              inset: 0,
              transition: 'opacity 160ms ease',
              width: '100%',
            }}
          />
        ) : null}
        {!hasLoaded || hasError ? (
          <span style={{ position: 'absolute', inset: 0 }}>
            <FilmFrame tone={photo.tone} label={photo.frame} small />
          </span>
        ) : null}
      </span>
      <span className="photo-card__meta">
        <span className="photo-card__title">{photo.title}</span>
        <span className="photo-card__detail">
          {photo.location} // {photo.date}
        </span>
      </span>
    </button>
  )
}
