import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminDashboardPage } from './AdminDashboardPage'

const rotateChatRoomPassword = vi.fn()
let loaderData: unknown

vi.mock('react-router-dom', () => ({
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
        detail: 'two notes and one essay waiting for polish',
        label: 'draft thoughts',
        value: '02',
      },
    ],
    queues: [
      {
        action: 'publish / edit',
        channel: 'TH-01',
        id: 'thought_1',
        title: 'Night Cable Interfaces',
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
  it('renders dashboard panels, queue rows, and room access', () => {
    render(<AdminDashboardPage />)

    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('Night Cable Interfaces')).toBeInTheDocument()
    expect(screen.getByDisplayValue('night-runner-42')).toBeInTheDocument()
  })

  it('updates room access after password rotation', async () => {
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
    await userEvent.click(screen.getByRole('button', { name: 'rotate room password' }))

    await waitFor(() => {
      expect(screen.getByDisplayValue('new-password-99')).toBeInTheDocument()
    })
    expect(screen.getByText('rotation rotation_1 completed')).toBeInTheDocument()
    expect(rotateChatRoomPassword).toHaveBeenCalledWith('night-shift', {})
  })
})
