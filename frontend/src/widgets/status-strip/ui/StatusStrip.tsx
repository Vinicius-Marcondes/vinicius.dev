import { useEffect, useState } from 'react'
import { type StatusStripEntry, toStatusStripEntry } from '../../../entities/status-strip'
import { cx } from '../../../shared/lib'
import { ScreenFrame } from '../../../shared/ui'

const seedEntries: StatusStripEntry[] = [
  toStatusStripEntry({ accent: 'pink', label: 'Now Building', value: 'frontend migration wave 1' }),
  toStatusStripEntry({ label: 'Location', value: 'sao paulo // gmt-3' }),
  toStatusStripEntry({ accent: 'cyan', label: 'Status', value: 'route tree and shells online' }),
]

type StatusStripProps = {
  className?: string
  entries?: StatusStripEntry[]
  label?: string
}

function toneClassName(accent?: StatusStripEntry['accent']) {
  switch (accent) {
    case 'amber':
      return 'status-strip__value--amber'
    case 'cyan':
      return 'status-strip__value--cyan'
    case 'pink':
      return 'status-strip__value--pink'
    default:
      return undefined
  }
}

export function StatusStrip({
  className,
  entries = seedEntries,
  label = 'REC // now playing',
}: StatusStripProps) {
  const [now, setNow] = useState(() => new Date())
  const [cursor, setCursor] = useState(0)

  useEffect(() => {
    const timeTicker = window.setInterval(() => setNow(new Date()), 1000)
    const cursorTicker = window.setInterval(() => {
      setCursor((current) => (entries.length > 0 ? (current + 1) % entries.length : 0))
    }, 2200)

    return () => {
      window.clearInterval(timeTicker)
      window.clearInterval(cursorTicker)
    }
  }, [entries.length])

  const timestamp = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <ScreenFrame className={cx('status-strip-panel', className)}>
      <div className="status-strip__header">
        <span className="status-strip__header-label">
          <span className="status-strip__header-dot" aria-hidden="true" />
          {label}
        </span>
        <span className="status-strip__header-meta">vhs-a // {timestamp}</span>
      </div>
      <div className="status-strip">
        {entries.map((entry, index) => (
          <div key={entry.label} className={cx('status-strip__row', cursor === index && 'is-active')}>
            <span className="status-strip__label">
              <span className="status-strip__indicator" aria-hidden="true" />
              {entry.label}
            </span>
            <span className={cx('status-strip__value', toneClassName(entry.accent))}>
              <span className="status-strip__chevron" aria-hidden="true">
                &gt;
              </span>
              {entry.value}
            </span>
          </div>
        ))}
        <span className="status-strip__rewind" aria-hidden="true" />
      </div>
    </ScreenFrame>
  )
}
