import { ApiRequestError, postJson } from '../../../shared/api'
import type {
  LoginWithCredentialsResponse,
  VerifyMfaResponse,
} from '../model/types'

export type AuthErrorPayload = Readonly<{
  error: 'invalid_request' | 'denied' | 'challenge_not_pending'
  field?: string
  resource?: string
}>

const isAuthErrorPayload = (value: unknown): value is AuthErrorPayload => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    candidate.error === 'invalid_request' ||
    candidate.error === 'denied' ||
    candidate.error === 'challenge_not_pending'
  )
}

export const parseAuthError = (error: unknown): AuthErrorPayload | null => {
  if (!(error instanceof ApiRequestError) || !error.payload) {
    return null
  }

  return isAuthErrorPayload(error.payload) ? error.payload : null
}

export const loginWithCredentials = (input: Readonly<{ email: string; password: string }>) =>
  postJson<Readonly<{ email: string; password: string }>, LoginWithCredentialsResponse>(
    '/auth/login',
    input,
  )

export const verifyMfaChallenge = (input: Readonly<{ challengeId: string; code: string }>) =>
  postJson<Readonly<{ challengeId: string; code: string }>, VerifyMfaResponse>('/auth/mfa/verify', input)

export const logoutAdminSession = () => postJson<Record<string, never>, Readonly<{ status: 'revoked' }>>('/auth/logout', {})
