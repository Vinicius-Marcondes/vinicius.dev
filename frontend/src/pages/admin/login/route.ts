import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router-dom'
import { getAdminDashboardSummary } from '../../../entities/admin-session'
import {
  loginWithCredentials,
  logoutAdminSession,
  parseAuthError,
  verifyMfaChallenge,
} from '../../../features/login-admin'
import type { MfaChallenge } from '../../../features/login-admin'
import { ApiRequestError } from '../../../shared/api'
import type { AdminLoginActionData } from './model/types'

const readFormField = (formData: FormData, field: string) => {
  const value = formData.get(field)
  return typeof value === 'string' ? value.trim() : ''
}

const readChallengeFromForm = (formData: FormData): MfaChallenge | null => {
  const id = readFormField(formData, 'challengeId')
  const delivery = readFormField(formData, 'challengeDelivery')
  const maskedEmail = readFormField(formData, 'challengeMaskedEmail')
  const expiresAt = readFormField(formData, 'challengeExpiresAt')

  if (!id || delivery !== 'email' || !maskedEmail || !expiresAt) {
    return null
  }

  return {
    id,
    delivery: 'email',
    maskedEmail,
    expiresAt,
  }
}

export const adminLoginLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await getAdminDashboardSummary(request.signal)
    return redirect('/admin/dashboard')
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return null
    }

    throw error
  }
}

export const adminLogoutAction = async () => {
  try {
    await logoutAdminSession()
  } catch {
    // best effort logout: always return user to login screen
  }

  return redirect('/admin/login')
}

export const adminLoginAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const intent = readFormField(formData, 'intent')

  if (intent === 'login') {
    const email = readFormField(formData, 'email')
    const password = readFormField(formData, 'password')

    if (!email || !password) {
      return {
        error: 'email and password are required.',
        step: 'credentials',
      } satisfies AdminLoginActionData
    }

    try {
      const response = await loginWithCredentials({ email, password })

      if (response.state === 'ready') {
        return redirect('/admin/dashboard')
      }

      return {
        challenge: response.challenge,
        step: 'mfa',
      } satisfies AdminLoginActionData
    } catch (error) {
      const authError = parseAuthError(error)

      if (authError?.error === 'denied' || authError?.error === 'invalid_request') {
        return {
          error: 'access denied. check your credentials and try again.',
          step: 'credentials',
        } satisfies AdminLoginActionData
      }

      return {
        error: 'unable to sign in right now. try again in a moment.',
        step: 'credentials',
      } satisfies AdminLoginActionData
    }
  }

  if (intent === 'verify_mfa') {
    const challenge = readChallengeFromForm(formData)
    const code = readFormField(formData, 'code')

    if (!challenge) {
      return {
        error: 'your verification window expired. start again.',
        step: 'credentials',
      } satisfies AdminLoginActionData
    }

    if (!code) {
      return {
        challenge,
        error: 'enter the six-digit verification code.',
        step: 'mfa',
      } satisfies AdminLoginActionData
    }

    try {
      const response = await verifyMfaChallenge({
        challengeId: challenge.id,
        code,
      })

      if (response.state === 'ready') {
        return redirect('/admin/dashboard')
      }

      return {
        challenge,
        step: 'mfa',
      } satisfies AdminLoginActionData
    } catch (error) {
      const authError = parseAuthError(error)

      if (authError?.error === 'challenge_not_pending') {
        return {
          error: 'your verification window expired. start again.',
          step: 'credentials',
        } satisfies AdminLoginActionData
      }

      if (authError?.error === 'denied' || authError?.error === 'invalid_request') {
        return {
          challenge,
          error: 'invalid or expired code. try again.',
          step: 'mfa',
        } satisfies AdminLoginActionData
      }

      return {
        challenge,
        error: 'unable to verify right now. try again in a moment.',
        step: 'mfa',
      } satisfies AdminLoginActionData
    }
  }

  return {
    error: 'invalid auth action. start again.',
    step: 'credentials',
  } satisfies AdminLoginActionData
}
