import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChatComposer } from './ChatComposer'

afterEach(() => {
  cleanup()
})

describe('ChatComposer', () => {
  it('shows upload preview/progress and emits draft, image, clear, and submit events', async () => {
    const onDraftChange = vi.fn()
    const onImageChange = vi.fn()
    const onImageClear = vi.fn()
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(
      <ChatComposer
        draft="hello"
        imageName="photo.png"
        imagePreviewUrl="blob:photo"
        notice="ready"
        onDraftChange={onDraftChange}
        onImageChange={onImageChange}
        onImageClear={onImageClear}
        onSubmit={onSubmit}
        uploadProgress={42}
      />,
    )

    await user.click(screen.getByRole('button', { name: ':)' }))
    await user.click(screen.getByRole('button', { name: 'remove' }))
    await user.click(screen.getByRole('button', { name: 'send' }))
    await user.upload(screen.getByLabelText('image'), new File(['x'], 'next.png', { type: 'image/png' }))

    expect(screen.getByText('42% uploaded')).toBeInTheDocument()
    expect(screen.getByAltText('photo.png')).toHaveAttribute('src', 'blob:photo')
    expect(onDraftChange).toHaveBeenCalledWith('hello:) ')
    expect(onImageClear).toHaveBeenCalled()
    expect(onSubmit).toHaveBeenCalled()
    expect(onImageChange).toHaveBeenCalledWith(expect.objectContaining({ name: 'next.png' }))
  })
})
