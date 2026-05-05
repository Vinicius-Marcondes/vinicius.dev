import { Form, useActionData, useNavigation } from 'react-router-dom'
import { ActionButton, InlineLabel, Stack } from '../../../../shared/ui'
import type { AdminLoginActionData } from '../model/types'

export function AdminLoginPage() {
  const actionData = useActionData() as AdminLoginActionData | undefined
  const navigation = useNavigation()
  const step = actionData?.step ?? 'credentials'
  const challenge = actionData?.step === 'mfa' ? actionData.challenge : undefined
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Stack gap={20}>
      <InlineLabel>admin login</InlineLabel>
      <h2 className="page-heading fx-crt-title">private control room</h2>
      <p className="page-copy">
        Credentials are now verified by backend auth. MFA is required only when the server requests
        an email challenge.
      </p>
      <div className="admin-login">
        <div className="admin-login__meter" aria-hidden="true">
          <span className={step === 'credentials' ? 'is-active' : ''}>credentials</span>
          <span className={step === 'mfa' ? 'is-active' : ''}>email code</span>
          <span>ready</span>
        </div>
        {step === 'credentials' ? (
          <Form className="admin-login__form" method="post" replace>
            <input type="hidden" name="intent" value="login" />
            <label className="admin-field">
              <span>email</span>
              <input name="email" type="email" placeholder="you@example.com" autoComplete="email" />
            </label>
            <label className="admin-field">
              <span>password</span>
              <input name="password" type="password" autoComplete="current-password" />
            </label>
            {actionData?.error ? <p className="admin-login__error">{actionData.error}</p> : null}
            <ActionButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'checking…' : 'continue'}
            </ActionButton>
          </Form>
        ) : null}
        {step === 'mfa' && challenge ? (
          <Form className="admin-login__form" method="post" replace>
            <input type="hidden" name="intent" value="verify_mfa" />
            <input type="hidden" name="challengeId" value={challenge.id} />
            <input type="hidden" name="challengeDelivery" value={challenge.delivery} />
            <input type="hidden" name="challengeMaskedEmail" value={challenge.maskedEmail} />
            <input type="hidden" name="challengeExpiresAt" value={challenge.expiresAt} />
            <p className="page-copy">verification code sent to {challenge.maskedEmail}</p>
            <label className="admin-field">
              <span>email code</span>
              <input name="code" inputMode="numeric" placeholder="000000" autoComplete="one-time-code" />
            </label>
            {actionData?.error ? <p className="admin-login__error">{actionData.error}</p> : null}
            <div className="action-row">
              <ActionButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'verifying…' : 'verify'}
              </ActionButton>
              <ActionButton to="/admin/login">restart</ActionButton>
            </div>
          </Form>
        ) : null}
      </div>
    </Stack>
  )
}
