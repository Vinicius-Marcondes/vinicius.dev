import { useMemo, useState, type ReactNode } from 'react'
import { Link, useLoaderData } from 'react-router-dom'
import { rotateChatRoomPassword } from '../../../../entities/chat'
import { InlineLabel } from '../../../../shared/ui'
import type {
  AdminDashboardPanel,
  AdminDashboardQueueItem,
  AdminDashboardRoomAccess,
  AdminDashboardViewModel,
} from '../model/types'

const staticQueues: AdminDashboardViewModel['queues'] = [
  {
    actions: ['publish', 'edit', 'unpin'],
    id: 'fallback-th-17',
    action: 'publish / edit / unpin',
    channel: 'TH-17',
    title: 'Against Frictionless Publishing',
  },
  {
    actions: ['feature', 'archive', 'inspect links'],
    id: 'fallback-pr-99',
    action: 'feature / archive / inspect links',
    channel: 'PR-99',
    title: 'vinicius.dev',
  },
  {
    actions: ['caption', 'tag', 'feature'],
    id: 'fallback-ph-014',
    action: 'caption / tag / feature',
    channel: 'PH-014',
    title: 'paulista at 02:14',
  },
]

const nowPlayingRows = [
  {
    label: 'current focus',
    tone: 'highlight',
    value: 'frontend migration wave',
  },
  {
    label: 'location',
    tone: undefined,
    value: 'sao paulo // gmt-3',
  },
  {
    label: 'building',
    tone: undefined,
    value: 'typed personal site shell',
  },
] as const

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

type DashboardPanelProps = Readonly<{
  action?: ReactNode
  children: ReactNode
  className?: string
  eyebrow?: ReactNode
  title: string
  titleId: string
}>

function DashboardPanel({ action, children, className, eyebrow, title, titleId }: DashboardPanelProps) {
  return (
    <section className={['admin-control-panel', className].filter(Boolean).join(' ')} aria-labelledby={titleId}>
      <header className="admin-control-panel__header">
        <div>
          {eyebrow ? <span className="admin-control-panel__eyebrow">{eyebrow}</span> : null}
          <h3 id={titleId} className="admin-control-panel__title">
            <span aria-hidden="true">// </span>
            {title}
          </h3>
        </div>
        {action ? <div className="admin-control-panel__action">{action}</div> : null}
      </header>
      {children}
    </section>
  )
}

function DashboardHeader() {
  return (
    <header className="admin-dashboard-page__header">
      <InlineLabel>// admin dashboard</InlineLabel>
      <h2 id="admin-dashboard-title" className="page-heading">
        control deck
      </h2>
      <p className="page-copy">
        Live dashboard summary from backend auth session. Panels and queues stay mapped to the current
        admin shell contracts.
      </p>
    </header>
  )
}

function StatCard({ panel }: Readonly<{ panel: AdminDashboardPanel }>) {
  return (
    <article className={`admin-stat-card admin-stat-card--${panel.accent}`} aria-label={panel.label}>
      <span className="admin-stat-card__value">{panel.value}</span>
      <h3 className="admin-stat-card__label">{panel.label}</h3>
      <p className="admin-stat-card__detail">{panel.detail}</p>
    </article>
  )
}

function ContentQueuePanel({
  isFallbackQueue,
  queues,
}: Readonly<{
  isFallbackQueue: boolean
  queues: readonly AdminDashboardQueueItem[]
}>) {
  return (
    <DashboardPanel
      action={<span aria-label="content queue record count">{queues.length} records</span>}
      className="admin-control-panel--queue"
      eyebrow={isFallbackQueue ? 'fallback queue' : 'backend queue'}
      title="content queue"
      titleId="admin-content-queue-title"
    >
      <div className="admin-queue" aria-label="content queue">
        {queues.map((item) => (
          <article key={item.id} className="admin-queue__row" aria-label={`${item.title} queue item`}>
            <div className="admin-queue__thumb" aria-hidden="true">
              ▒
            </div>
            <div className="admin-queue__meta">
              <span className="admin-queue__channel">{item.channel}</span>
              <h4 className="admin-queue__title">{item.title}</h4>
              <ul className="admin-queue__actions" aria-label={`${item.title} suggested actions`}>
                {item.actions.map((action) => (
                  <li key={action}>
                    <button
                      aria-label={`${action} ${item.title}`}
                      className="admin-queue__action-button glitch-hover"
                      type="button"
                    >
                      {action}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <span className="admin-queue__status">{item.action}</span>
          </article>
        ))}
      </div>
      <footer className="admin-control-panel__footer">
        <span>{isFallbackQueue ? 'sample queue visible until backend rows arrive' : 'backend rows displayed'}</span>
        <Link className="admin-control-panel__link" to="/admin/photos/upload">
          ► new upload
        </Link>
      </footer>
    </DashboardPanel>
  )
}

function InfoField({
  label,
  tone,
  value,
}: Readonly<{
  label: string
  tone?: 'highlight' | 'warn'
  value: string
}>) {
  return (
    <div className="admin-info-field">
      <span className="admin-info-field__label">{label}</span>
      <output
        aria-label={label}
        className={['admin-info-field__value', tone && `is-${tone}`].filter(Boolean).join(' ')}
        tabIndex={0}
      >
        <span className="admin-info-field__prompt" aria-hidden="true">
          &gt;
        </span>
        <span>{value}</span>
      </output>
    </div>
  )
}

function NowPlayingPanel() {
  return (
    <DashboardPanel
      action={
        <span className="admin-live-indicator">
          <span aria-hidden="true" />
          live
        </span>
      }
      title="now playing strip"
      titleId="admin-now-playing-title"
    >
      <div className="admin-info-section">
        {nowPlayingRows.map((row) => (
          <InfoField key={row.label} label={row.label} tone={row.tone} value={row.value} />
        ))}
      </div>
    </DashboardPanel>
  )
}

function ChatRoomAccessPanel({
  isRotating,
  onRotatePassword,
  roomAccess,
  roomAccessStatus,
  rotationError,
}: Readonly<{
  isRotating: boolean
  onRotatePassword: () => void
  roomAccess: AdminDashboardRoomAccess | null
  roomAccessStatus: string
  rotationError?: string
}>) {
  const rotationButtonLabel = isRotating
    ? 'rotating room password'
    : roomAccess
      ? 'rotate room password'
      : 'generate room password'

  return (
    <DashboardPanel title="chat room access" titleId="admin-chat-access-title">
      <div className="admin-info-section">
        <InfoField label="room" value={roomAccess?.slug ?? 'night-shift'} />
        <InfoField
          label="current password"
          tone="warn"
          value={roomAccess?.currentPassword ?? 'not generated yet'}
        />
        <InfoField label="rotation status" value={roomAccessStatus} />
        {roomAccess?.rotationMessage ? (
          <p className="admin-room-access__message" role="status">
            {roomAccess.rotationMessage}
          </p>
        ) : null}
        {rotationError ? (
          <p className="admin-login__error" role="alert">
            {rotationError}
          </p>
        ) : null}
        <button
          aria-label={rotationButtonLabel}
          className="admin-room-access__rotate"
          type="button"
          onClick={onRotatePassword}
          disabled={isRotating}
        >
          <span aria-hidden="true">{isRotating ? '▌' : '►'}</span>
          {isRotating ? 'rotating...' : roomAccess ? 'rotate room password' : 'generate room password'}
        </button>
      </div>
    </DashboardPanel>
  )
}

export function AdminDashboardPage() {
  const data = useLoaderData() as AdminDashboardViewModel
  const isFallbackQueue = data.queues.length === 0
  const queues = isFallbackQueue ? staticQueues : data.queues
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
    <div className="admin-dashboard-page" aria-labelledby="admin-dashboard-title">
      <DashboardHeader />
      <section className="admin-dashboard-page__stats" aria-label="dashboard summary">
        {data.panels.map((panel) => (
          <StatCard key={panel.label} panel={panel} />
        ))}
      </section>
      <div className="admin-dashboard-page__lower-grid">
        <ContentQueuePanel isFallbackQueue={isFallbackQueue} queues={queues} />
        <div className="admin-dashboard-page__side">
          <NowPlayingPanel />
          <ChatRoomAccessPanel
            isRotating={isRotating}
            onRotatePassword={handleRotatePassword}
            roomAccess={roomAccess}
            roomAccessStatus={roomAccessStatus}
            rotationError={rotationError}
          />
        </div>
      </div>
    </div>
  )
}
