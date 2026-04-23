import { InlineLabel, ScreenFrame, Stack } from '../../../../shared/ui'

type AdminPanel = {
  detail: string
  label: string
  value: string
}

type AdminQueueItem = {
  action: string
  channel: string
  title: string
}

const panels: AdminPanel[] = [
  { label: 'draft thoughts', value: '03', detail: 'two notes and one essay waiting for polish' },
  { label: 'featured slots', value: '05', detail: 'home previews are manually pinned' },
  { label: 'photo records', value: '24', detail: 'metadata only; originals live on the VPS later' },
  { label: 'chat flags', value: '02', detail: 'mock moderation queue for backend contracts' },
]

const queues: AdminQueueItem[] = [
  { channel: 'TH-17', title: 'Against Frictionless Publishing', action: 'publish / edit / unpin' },
  { channel: 'PR-99', title: 'vinicius.dev', action: 'feature / archive / inspect links' },
  { channel: 'PH-014', title: 'paulista at 02:14', action: 'caption / tag / feature' },
]

export function AdminDashboardPage() {
  return (
    <Stack gap={20}>
      <InlineLabel>admin dashboard</InlineLabel>
      <h2 className="page-heading fx-crt-title">control deck</h2>
      <p className="page-copy">
        Mock panels for the private CMS: content queues, manual curation, status-strip edits,
        and chat moderation. These are frontend contracts only until backend tasks begin.
      </p>
      <div className="dashboard-grid">
        {panels.map((panel) => (
          <ScreenFrame key={panel.label} className="admin-stat">
            <span className="admin-stat__value">{panel.value}</span>
            <span className="admin-stat__label">{panel.label}</span>
            <p>{panel.detail}</p>
          </ScreenFrame>
        ))}
      </div>
      <div className="admin-dashboard">
        <ScreenFrame className="admin-panel admin-panel--wide">
          <InlineLabel>content queue</InlineLabel>
          <div className="admin-table">
            {queues.map((item) => (
              <div key={item.channel} className="admin-table__row">
                <span>{item.channel}</span>
                <strong>{item.title}</strong>
                <span>{item.action}</span>
              </div>
            ))}
          </div>
        </ScreenFrame>
        <ScreenFrame className="admin-panel">
          <InlineLabel>now playing strip</InlineLabel>
          <div className="admin-status-editor">
            <label className="admin-field">
              <span>current focus</span>
              <input value="frontend migration wave" readOnly />
            </label>
            <label className="admin-field">
              <span>location</span>
              <input value="sao paulo // gmt-3" readOnly />
            </label>
            <label className="admin-field">
              <span>building</span>
              <input value="typed personal site shell" readOnly />
            </label>
          </div>
        </ScreenFrame>
        <ScreenFrame className="admin-panel">
          <InlineLabel>chat moderation</InlineLabel>
          <div className="admin-moderation">
            <button type="button">delete message</button>
            <button type="button">ban handle</button>
            <button type="button">rotate room password</button>
          </div>
        </ScreenFrame>
      </div>
    </Stack>
  )
}
