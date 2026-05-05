import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChatGate } from './ChatGate'

afterEach(() => {
  cleanup()
})

describe('ChatGate', () => {
  it('renders gate errors and emits form changes/submission', async () => {
    const onHandleChange = vi.fn()
    const onPasswordChange = vi.fn()
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <ChatGate
        error="wrong room password"
        handle=""
        onHandleChange={onHandleChange}
        onPasswordChange={onPasswordChange}
        onSubmit={onSubmit}
        password=""
      />,
    )

    await user.type(screen.getByLabelText('handle'), 'runner')
    await user.type(screen.getByLabelText('room password'), 'secret')
    await user.click(screen.getByRole('button', { name: '[ knock knock ]' }))

    expect(screen.getByText('wrong room password')).toBeInTheDocument()
    expect(onHandleChange).toHaveBeenLastCalledWith('r')
    expect(onPasswordChange).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalled()
  })
})
