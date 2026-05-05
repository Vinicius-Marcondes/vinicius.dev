import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiRequestError } from '../../../shared/api'
import { adminLoginAction, adminLoginLoader, adminLogoutAction } from './route'

const mocks = vi.hoisted(() => ({
  getAdminDashboardSummary: vi.fn(),
  loginWithCredentials: vi.fn(),
  logoutAdminSession: vi.fn(),
  parseAuthError: vi.fn(),
  verifyMfaChallenge: vi.fn(),
}))

vi.mock('../../../entities/admin-session', () => ({
  getAdminDashboardSummary: mocks.getAdminDashboardSummary,
}))

vi.mock('../../../features/login-admin', () => ({
  loginWithCredentials: mocks.loginWithCredentials,
  logoutAdminSession: mocks.logoutAdminSession,
  parseAuthError: mocks.parseAuthError,
  verifyMfaChallenge: mocks.verifyMfaChallenge,
}))

const formRequest = (entries: Record<string, string>) => {
  const formData = new FormData()
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value)
  }

  return new Request('http://localhost/admin/login', {
    body: formData,
    method: 'POST',
  })
}

const loaderArgs = (request: Request): Parameters<typeof adminLoginLoader>[0] =>
  ({
    params: {},
    request,
  }) as Parameters<typeof adminLoginLoader>[0]

const actionArgs = (request: Request): Parameters<typeof adminLoginAction>[0] =>
  ({
    params: {},
    request,
  }) as Parameters<typeof adminLoginAction>[0]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('admin login route', () => {
  it('redirects authenticated users away from login and allows 401 sessions through', async () => {
    mocks.getAdminDashboardSummary.mockResolvedValueOnce({})

    const redirectResponse = await adminLoginLoader(loaderArgs(new Request('http://localhost/admin/login')))
    expect(redirectResponse).toBeInstanceOf(Response)
    expect((redirectResponse as Response).headers.get('location')).toBe('/admin/dashboard')

    mocks.getAdminDashboardSummary.mockRejectedValueOnce(new ApiRequestError(401, { error: 'denied' }))
    await expect(
      adminLoginLoader(loaderArgs(new Request('http://localhost/admin/login'))),
    ).resolves.toBeNull()
  })

  it('handles credential validation, ready login, MFA login, and denied errors', async () => {
    await expect(
      adminLoginAction(actionArgs(formRequest({ email: '', intent: 'login', password: '' }))),
    ).resolves.toEqual({
      error: 'email and password are required.',
      step: 'credentials',
    })

    mocks.loginWithCredentials.mockResolvedValueOnce({ state: 'ready' })
    const readyResponse = await adminLoginAction(
      actionArgs(formRequest({ email: 'admin@example.com', intent: 'login', password: 'secret' })),
    )
    expect((readyResponse as Response).headers.get('location')).toBe('/admin/dashboard')

    mocks.loginWithCredentials.mockResolvedValueOnce({
      challenge: {
        delivery: 'email',
        expiresAt: '2026-05-05T13:00:00.000Z',
        id: 'challenge_1',
        maskedEmail: 'a***@example.com',
      },
      state: 'mfa_required',
    })
    await expect(
      adminLoginAction(
        actionArgs(formRequest({ email: 'admin@example.com', intent: 'login', password: 'secret' })),
      ),
    ).resolves.toMatchObject({
      step: 'mfa',
    })

    mocks.loginWithCredentials.mockRejectedValueOnce(new ApiRequestError(401, { error: 'denied' }))
    mocks.parseAuthError.mockReturnValueOnce({ error: 'denied' })
    await expect(
      adminLoginAction(actionArgs(formRequest({ email: 'admin@example.com', intent: 'login', password: 'bad' }))),
    ).resolves.toEqual({
      error: 'access denied. check your credentials and try again.',
      step: 'credentials',
    })
  })

  it('handles MFA validation, success, expired challenge, and logout redirect', async () => {
    const challengeFields = {
      challengeDelivery: 'email',
      challengeExpiresAt: '2026-05-05T13:00:00.000Z',
      challengeId: 'challenge_1',
      challengeMaskedEmail: 'a***@example.com',
      intent: 'verify_mfa',
    }

    await expect(
      adminLoginAction(actionArgs(formRequest({ ...challengeFields, code: '12' }))),
    ).resolves.toMatchObject({
      error: 'enter the six-digit verification code.',
      step: 'mfa',
    })

    mocks.verifyMfaChallenge.mockResolvedValueOnce({ state: 'ready' })
    const readyResponse = await adminLoginAction(actionArgs(formRequest({ ...challengeFields, code: '123456' })))
    expect((readyResponse as Response).headers.get('location')).toBe('/admin/dashboard')

    mocks.verifyMfaChallenge.mockRejectedValueOnce(new ApiRequestError(409, { error: 'challenge_not_pending' }))
    mocks.parseAuthError.mockReturnValueOnce({ error: 'challenge_not_pending' })
    await expect(
      adminLoginAction(actionArgs(formRequest({ ...challengeFields, code: '123456' }))),
    ).resolves.toEqual({
      error: 'your verification window expired. start again.',
      step: 'credentials',
    })

    const logoutResponse = await adminLogoutAction()
    expect(logoutResponse.headers.get('location')).toBe('/admin/login')
  })
})
