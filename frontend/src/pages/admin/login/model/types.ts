import type { MfaChallenge } from '../../../../features/login-admin'

export type AdminLoginActionData =
  | Readonly<{
      step: 'credentials'
      error?: string
    }>
  | Readonly<{
      step: 'mfa'
      challenge: MfaChallenge
      error?: string
    }>
