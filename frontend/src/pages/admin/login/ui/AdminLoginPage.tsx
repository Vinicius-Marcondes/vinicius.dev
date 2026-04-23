import { useState } from 'react'
import { ActionButton, InlineLabel, Stack } from '../../../../shared/ui'

export function AdminLoginPage() {
  const [email, setEmail] = useState('vinicius@example.com')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'credentials' | 'mfa' | 'ready'>('credentials')
  const [error, setError] = useState<string>()

  const submitCredentials = () => {
    if (!email.trim() || !password.trim()) {
      setError('email and password are required for the mocked admin gate.')
      return
    }

    setError(undefined)
    setStep('mfa')
  }

  const submitMfa = () => {
    if (code.trim().length < 6) {
      setError('enter a six digit email code to finish the mocked MFA flow.')
      return
    }

    setError(undefined)
    setStep('ready')
  }

  return (
    <Stack gap={20}>
      <InlineLabel>admin login</InlineLabel>
      <h2 className="page-heading fx-crt-title">private control room</h2>
      <p className="page-copy">
        Frontend-only auth surface for the future email/password plus optional email-code MFA flow.
        No session is created in this migration wave.
      </p>
      <div className="admin-login">
        <div className="admin-login__meter" aria-hidden="true">
          <span className={step === 'credentials' ? 'is-active' : ''}>credentials</span>
          <span className={step === 'mfa' ? 'is-active' : ''}>email code</span>
          <span className={step === 'ready' ? 'is-active' : ''}>ready</span>
        </div>
        {step === 'credentials' ? (
          <form className="admin-login__form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-field">
              <span>email</span>
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
            </label>
            <label className="admin-field">
              <span>password</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
            </label>
            {error ? <p className="admin-login__error">{error}</p> : null}
            <ActionButton onClick={submitCredentials}>request code</ActionButton>
          </form>
        ) : null}
        {step === 'mfa' ? (
          <form className="admin-login__form" onSubmit={(event) => event.preventDefault()}>
            <label className="admin-field">
              <span>email code</span>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                inputMode="numeric"
                placeholder="000000"
              />
            </label>
            {error ? <p className="admin-login__error">{error}</p> : null}
            <div className="action-row">
              <ActionButton onClick={submitMfa}>verify</ActionButton>
              <ActionButton onClick={() => setStep('credentials')}>back</ActionButton>
            </div>
          </form>
        ) : null}
        {step === 'ready' ? (
          <div className="admin-login__ready">
            <p>mock admin session ready. backend auth will replace this local state later.</p>
            <ActionButton to="/admin/dashboard">open dashboard</ActionButton>
          </div>
        ) : null}
      </div>
    </Stack>
  )
}
