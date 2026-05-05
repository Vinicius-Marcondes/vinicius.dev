import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiRequestError } from '../../../shared/api'
import {
  loginWithCredentials,
  logoutAdminSession,
  parseAuthError,
  verifyMfaChallenge,
} from './login-admin'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('login admin API helpers', () => {
  it('parses known auth errors only', () => {
    expect(parseAuthError(new ApiRequestError(401, { error: 'denied' }))).toEqual({
      error: 'denied',
    })
    expect(parseAuthError(new ApiRequestError(500, { error: 'unknown' }))).toBeNull()
    expect(parseAuthError(new Error('nope'))).toBeNull()
  })

  it('posts login, MFA, and logout payloads through shared API', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(
      new Response(JSON.stringify({ state: 'ready' }), {
        headers: { 'content-type': 'application/json' },
        status: 200,
      }),
    ))
    vi.stubGlobal('fetch', fetchMock)

    await loginWithCredentials({ email: 'admin@example.com', password: 'secret' })
    await verifyMfaChallenge({ challengeId: 'challenge_1', code: '123456' })
    await logoutAdminSession()

    expect(fetchMock.mock.calls.map((call) => [call[0], JSON.parse(String(call[1]?.body))])).toEqual([
      ['/api/auth/login', { email: 'admin@example.com', password: 'secret' }],
      ['/api/auth/mfa/verify', { challengeId: 'challenge_1', code: '123456' }],
      ['/api/auth/logout', {}],
    ])
  })
})
