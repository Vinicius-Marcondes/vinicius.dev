import { useLoaderData } from 'react-router-dom'
import { InlineLabel, ScreenFrame, Stack } from '../../../../shared/ui'
import type { AdminDashboardViewModel } from '../model/types'

const staticQueues: AdminDashboardViewModel['queues'] = [
  {
    id: 'fallback-th-17',
    channel: 'TH-17',
    title: 'Against Frictionless Publishing',
    action: 'publish / edit / unpin',
  },
  {
    id: 'fallback-pr-99',
    channel: 'PR-99',
    title: 'vinicius.dev',
    action: 'feature / archive / inspect links',
  },
  {
    id: 'fallback-ph-014',
    channel: 'PH-014',
    title: 'paulista at 02:14',
    action: 'caption / tag / feature',
  },
]

export function AdminDashboardPage() {
  const data = useLoaderData() as AdminDashboardViewModel
  const queues = data.queues.length > 0 ? data.queues : staticQueues

  return (
    <Stack gap={20}>
      <InlineLabel>admin dashboard</InlineLabel>
      <h2 className="page-heading fx-crt-title">control deck</h2>
      <p className="page-copy">
        Live dashboard summary from backend auth session. Panels and queues stay mapped to the current
        admin shell contracts.
      </p>
      <div className="dashboard-grid">
        {data.panels.map((panel) => (
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
              <div key={item.id} className="admin-table__row">
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
