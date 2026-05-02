import { useMemo, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import { rotateChatRoomPassword } from '../../../../entities/chat'
import { InlineLabel, ScreenFrame, Stack } from '../../../../shared/ui'
import type { AdminDashboardRoomAccess, AdminDashboardViewModel } from '../model/types'

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

const formatRotationTime = (value: string | null) => {
  if (!value) return 'not generated yet'

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function AdminDashboardPage() {
  const data = useLoaderData() as AdminDashboardViewModel
  const queues = data.queues.length > 0 ? data.queues : staticQueues
  const [roomAccess, setRoomAccess] = useState<AdminDashboardRoomAccess | null>(data.roomAccess)
  const [isRotating, setIsRotating] = useState(false)
  const [rotationError, setRotationError] = useState<string>()

  const roomAccessStatus = useMemo(() => {
    if (!roomAccess) {
      return 'generate the first room password to bring the public gate online.'
    }

    const revokedLabel = typeof roomAccess.revokedSessionCount === 'number'
      ? ` // revoked ${roomAccess.revokedSessionCount} live session${roomAccess.revokedSessionCount === 1 ? '' : 's'}`
      : ''

    return `rotated ${formatRotationTime(roomAccess.passwordRotatedAt)} // ttl ${roomAccess.sessionTtlHours}h${revokedLabel}`
  }, [roomAccess])

  const handleRotatePassword = async () => {
    setIsRotating(true)
    setRotationError(undefined)

    try {
      const response = await rotateChatRoomPassword('night-shift', {})
      setRoomAccess({
        currentPassword: response.generatedPassword,
        passwordRotatedAt: response.room.passwordRotatedAt,
        passwordVersion: response.room.passwordVersion,
        revokedSessionCount: response.revokedSessionCount,
        rotationMessage: `rotation ${response.rotation.id} completed`,
        sessionTtlHours: response.room.sessionTtlHours,
        slug: response.room.slug,
      })
    } catch {
      setRotationError('unable to rotate the room password right now. try again in a moment.')
    } finally {
      setIsRotating(false)
    }
  }

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
          <InlineLabel>chat room access</InlineLabel>
          <div className="admin-status-editor">
            <label className="admin-field">
              <span>room</span>
              <input value={roomAccess?.slug ?? 'night-shift'} readOnly />
            </label>
            <label className="admin-field">
              <span>current password</span>
              <input value={roomAccess?.currentPassword ?? 'not generated yet'} readOnly />
            </label>
            <label className="admin-field">
              <span>rotation status</span>
              <input value={roomAccessStatus} readOnly />
            </label>
            {roomAccess?.rotationMessage ? <p>{roomAccess.rotationMessage}</p> : null}
            {rotationError ? <p className="admin-login__error">{rotationError}</p> : null}
            <div className="admin-moderation">
              <button type="button" onClick={handleRotatePassword} disabled={isRotating}>
                {isRotating ? 'rotating…' : roomAccess ? 'rotate room password' : 'generate room password'}
              </button>
            </div>
          </div>
        </ScreenFrame>
      </div>
    </Stack>
  )
}
