import type { FormEvent } from 'react'
import { ActionButton, ScreenFrame } from '../../../../shared/ui'

type ChatGateProps = {
  error?: string
  handle: string
  onHandleChange: (handle: string) => void
  onPasswordChange: (password: string) => void
  onSubmit: () => void
  password: string
}

export function ChatGate({
  error,
  handle,
  onHandleChange,
  onPasswordChange,
  onSubmit,
  password,
}: ChatGateProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <ScreenFrame className="chat-gate">
      <form className="chat-gate__form" onSubmit={handleSubmit}>
        <div>
          <p className="chat-gate__eyebrow">restricted broadcast // local mock</p>
          <h2 className="chat-gate__title fx-crt-title">ENTER ROOM CODE</h2>
          <p className="chat-gate__copy">
            The room is public in the menu but private at the door. Backend auth arrives later; this
            surface models the shared password and persistent handle flow.
          </p>
        </div>
        <label className="chat-field">
          <span>handle</span>
          <input
            value={handle}
            onChange={(event) => onHandleChange(event.target.value)}
            placeholder="night-runner"
            autoComplete="nickname"
          />
        </label>
        <label className="chat-field">
          <span>room password</span>
          <input
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="ask vinicius"
            type="password"
          />
        </label>
        {error ? <p className="chat-gate__error">{error}</p> : null}
        <ActionButton type="submit">[ knock knock ]</ActionButton>
      </form>
    </ScreenFrame>
  )
}
