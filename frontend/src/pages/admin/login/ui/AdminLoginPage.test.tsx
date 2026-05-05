import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminLoginPage } from './AdminLoginPage'

let actionData: unknown
let navigationState: 'idle' | 'loading' | 'submitting'

vi.mock('react-router-dom', () => ({
  Form: ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => (
    <form {...props}>{children}</form>
  ),
  Link: ({ children, to, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
  useActionData: () => actionData,
  useNavigation: () => ({ state: navigationState }),
}))

beforeEach(() => {
  actionData = undefined
  navigationState = 'idle'
})

afterEach(() => {
  cleanup()
})

describe('AdminLoginPage', () => {
  it('renders credential state and submitting copy', () => {
    navigationState = 'submitting'

    render(<AdminLoginPage />)

    expect(screen.getByLabelText('email')).toBeInTheDocument()
    expect(screen.getByLabelText('password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'checking…' })).toBeDisabled()
  })

  it('renders MFA challenge state with restart action', () => {
    actionData = {
      challenge: {
        delivery: 'email',
        expiresAt: '2026-05-05T13:00:00.000Z',
        id: 'challenge_1',
        maskedEmail: 'a***@example.com',
      },
      error: 'enter the six-digit verification code.',
      step: 'mfa',
    }

    render(<AdminLoginPage />)

    expect(screen.getByText('verification code sent to a***@example.com')).toBeInTheDocument()
    expect(screen.getByLabelText('email code')).toBeInTheDocument()
    expect(screen.getByText('enter the six-digit verification code.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'restart' })).toHaveAttribute('href', '/admin/login')
  })
})
