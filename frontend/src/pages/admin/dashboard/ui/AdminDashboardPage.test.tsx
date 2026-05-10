import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AdminDashboardViewModel } from '../model/types'
import { AdminDashboardPage } from './AdminDashboardPage'

const rotateChatRoomPassword = vi.fn()
let loaderData: AdminDashboardViewModel
type RotationResponse = Readonly<{
  generatedPassword: string
  revokedSessionCount: number
  room: Readonly<{
    passwordRotatedAt: string
    passwordVersion: number
    sessionTtlHours: number
    slug: string
  }>
  rotation: Readonly<{
    id: string
  }>
}>

vi.mock('react-router-dom', () => ({
  Link: ({ children, className, to }: { children: ReactNode; className?: string; to: string }) => (
    <a className={className} href={to}>
      {children}
    </a>
  ),
  useLoaderData: () => loaderData,
}))

vi.mock('../../../../entities/chat', () => ({
  rotateChatRoomPassword: (...args: unknown[]) => rotateChatRoomPassword(...args),
}))

beforeEach(() => {
  rotateChatRoomPassword.mockReset()
  loaderData = {
    panels: [
      {
        accent: 'pink',
        detail: 'two notes and one essay waiting for polish',
        label: 'draft thoughts',
        value: '02',
      },
      {
        accent: 'cyan',
        detail: 'home previews are manually pinned',
        label: 'featured slots',
        value: '03',
      },
    ],
    queues: [
      {
        action: 'publish / edit',
        actions: ['publish', 'edit'],
        channel: 'TH-01',
        id: 'thought_1',
        title: 'Night Cable Interfaces',
      },
      {
        action: 'caption / tag / feature',
        actions: ['caption', 'tag', 'feature'],
        channel: 'PH-014',
        id: 'photo_14',
        title: 'paulista at 02:14',
      },
    ],
    roomAccess: {
      currentPassword: 'night-runner-42',
      passwordRotatedAt: '2026-05-05T12:00:00.000Z',
      passwordVersion: 1,
      sessionTtlHours: 24,
      slug: 'night-shift',
    },
  }
})

afterEach(() => {
  cleanup()
})

describe('AdminDashboardPage', () => {
  it('renders dashboard panel values and content queue rows from loader data', () => {
    render(<AdminDashboardPage />)

    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'content queue' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'now playing strip' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'chat room access' })).toBeInTheDocument()
    expect(screen.getByText('draft thoughts')).toBeInTheDocument()
    expect(screen.getByText('two notes and one essay waiting for polish')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(screen.getByText('featured slots')).toBeInTheDocument()
    expect(screen.getByText('Night Cable Interfaces')).toBeInTheDocument()
    expect(screen.getByText('TH-01')).toBeInTheDocument()
    expect(screen.getByText('publish / edit')).toBeInTheDocument()
    expect(screen.getByText('paulista at 02:14')).toBeInTheDocument()
    expect(screen.getByText('PH-014')).toBeInTheDocument()
    expect(screen.getByText('caption / tag / feature')).toBeInTheDocument()
    expect(screen.getByLabelText('content queue record count')).toHaveTextContent('2 records')
  })

  it('renders room access details from loader data', () => {
    render(<AdminDashboardPage />)

    expect(screen.getByLabelText('room')).toHaveTextContent('night-shift')
    expect(screen.getByLabelText('current password')).toHaveTextContent('night-runner-42')
    expect(screen.getByLabelText('rotation status')).toHaveTextContent(/ttl 24h/)
  })

  it('renders the generated-empty room access state', () => {
    loaderData = {
      ...loaderData,
      roomAccess: null,
    }

    render(<AdminDashboardPage />)

    expect(screen.getByLabelText('room')).toHaveTextContent('night-shift')
    expect(screen.getByLabelText('current password')).toHaveTextContent('not generated yet')
    expect(screen.getByLabelText('rotation status')).toHaveTextContent(
      'generate the first room password to bring the public gate online.',
    )
    expect(screen.getByRole('button', { name: 'generate room password' })).toBeEnabled()
  })

  it('indicates pending state while password rotation is in flight', async () => {
    const user = userEvent.setup()
    let resolveRotation!: (value: RotationResponse) => void
    const rotationPromise = new Promise<RotationResponse>((resolve) => {
      resolveRotation = resolve
    })
    rotateChatRoomPassword.mockReturnValueOnce(rotationPromise)

    render(<AdminDashboardPage />)
    await user.click(screen.getByRole('button', { name: 'rotate room password' }))

    expect(screen.getByRole('button', { name: 'rotating room password' })).toBeDisabled()
    expect(rotateChatRoomPassword).toHaveBeenCalledWith('night-shift', {})

    resolveRotation({
      generatedPassword: 'new-password-99',
      revokedSessionCount: 1,
      room: {
        passwordRotatedAt: '2026-05-05T13:00:00.000Z',
        passwordVersion: 2,
        sessionTtlHours: 24,
        slug: 'night-shift',
      },
      rotation: {
        id: 'rotation_pending',
      },
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'rotate room password' })).toBeEnabled()
    })
  })

  it('updates room access after password rotation', async () => {
    const user = userEvent.setup()
    rotateChatRoomPassword.mockResolvedValueOnce({
      generatedPassword: 'new-password-99',
      revokedSessionCount: 2,
      room: {
        passwordRotatedAt: '2026-05-05T13:00:00.000Z',
        passwordVersion: 2,
        sessionTtlHours: 24,
        slug: 'night-shift',
      },
      rotation: {
        id: 'rotation_1',
      },
    })

    render(<AdminDashboardPage />)
    await user.click(screen.getByRole('button', { name: 'rotate room password' }))

    await waitFor(() => {
      expect(screen.getByLabelText('current password')).toHaveTextContent('new-password-99')
    })
    expect(screen.getByLabelText('room')).toHaveTextContent('night-shift')
    expect(screen.getByLabelText('rotation status')).toHaveTextContent(/revoked 2 live sessions/)
    expect(screen.getByText('rotation rotation_1 completed')).toBeInTheDocument()
    expect(rotateChatRoomPassword).toHaveBeenCalledWith('night-shift', {})
  })

  it('surfaces rotation error feedback after password rotation fails', async () => {
    const user = userEvent.setup()
    rotateChatRoomPassword.mockRejectedValueOnce(new Error('network unavailable'))

    render(<AdminDashboardPage />)
    await user.click(screen.getByRole('button', { name: 'rotate room password' }))

    expect(
      await screen.findByText('unable to rotate the room password right now. try again in a moment.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('current password')).toHaveTextContent('night-runner-42')
    expect(screen.getByRole('button', { name: 'rotate room password' })).toBeEnabled()
  })
})
