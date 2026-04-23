import { type StatusStripEntry, toStatusStripEntry } from '../../../entities/status-strip'
import { InlineLabel, ScreenFrame, Stack } from '../../../shared/ui'

const seedEntries: StatusStripEntry[] = [
  toStatusStripEntry({ label: 'Now playing', value: 'frontend migration wave 1' }),
  toStatusStripEntry({ label: 'Location', value: 'sao paulo // gmt-3' }),
  toStatusStripEntry({ label: 'Status', value: 'route tree and shells online' }),
]

export function StatusStrip() {
  return (
    <ScreenFrame>
      <Stack gap={16}>
        <InlineLabel>status strip</InlineLabel>
        <div className="status-strip">
          {seedEntries.map((entry) => (
            <div key={entry.label} className="status-strip__row">
              <span className="status-strip__label">{entry.label}</span>
              <span className="status-strip__value">{entry.value}</span>
            </div>
          ))}
        </div>
      </Stack>
    </ScreenFrame>
  )
}
