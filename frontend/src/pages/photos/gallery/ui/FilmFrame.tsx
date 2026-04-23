import type { PhotoTone } from '../../../../entities/photo'
import { cx } from '../../../../shared/lib'

type FilmFrameProps = {
  label?: string
  small?: boolean
  tone: PhotoTone
}

export function FilmFrame({ label, small = false, tone }: FilmFrameProps) {
  return (
    <div className={cx('film-frame', `film-frame--${tone}`, small && 'film-frame--small')}>
      <div className="film-frame__grain" aria-hidden="true" />
      <div className="film-frame__vignette" aria-hidden="true" />
      {label ? <span className="film-frame__label">{label}</span> : null}
    </div>
  )
}
