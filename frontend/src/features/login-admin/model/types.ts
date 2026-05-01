export type AuthReadyState = Readonly<{
  state: 'ready'
  admin: Readonly<{
    id: string
    email: string
  }>
  session: Readonly<{
    id: string
    expiresAt: string
  }>
}>

export type MfaChallenge = Readonly<{
  id: string
  delivery: 'email'
  maskedEmail: string
  expiresAt: string
}>

export type LoginWithCredentialsResponse =
  | AuthReadyState
  | Readonly<{
      state: 'mfa_required'
      challenge: MfaChallenge
    }>

export type VerifyMfaResponse = AuthReadyState
