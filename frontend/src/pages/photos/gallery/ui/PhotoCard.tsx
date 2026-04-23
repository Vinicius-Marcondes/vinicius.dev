import type { PhotoRecord } from '../../../../entities/photo'
import { FilmFrame } from './FilmFrame'

type PhotoCardProps = {
  onOpen: () => void
  photo: PhotoRecord
}

export function PhotoCard({ onOpen, photo }: PhotoCardProps) {
  return (
    <button type="button" className="photo-card glitch-hover" onClick={onOpen}>
      <span className="photo-card__frame">
        <FilmFrame tone={photo.tone} label={photo.frame} small />
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
