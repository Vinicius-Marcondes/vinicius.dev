import { nowPlayingItems } from '../../../shared/config'

const separator = '   //   '

const buildMarqueeText = (items: readonly string[]) => `${items.join(separator)}${separator}`

export function NowPlayingStrip() {
  const text = buildMarqueeText(nowPlayingItems)

  return (
    <div className="now-playing-strip" aria-label="Now playing marquee">
      <div className="now-playing-strip__inner" aria-hidden="true">
        <span>{text}{text}</span>
      </div>
      <span className="sr-only">{text}</span>
      <div className="now-playing-strip__fade now-playing-strip__fade--left" aria-hidden="true" />
      <div className="now-playing-strip__fade now-playing-strip__fade--right" aria-hidden="true" />
    </div>
  )
}
