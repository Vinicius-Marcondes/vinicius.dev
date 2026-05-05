import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ChatMessageBubble } from './ChatMessageBubble'

afterEach(() => {
  cleanup()
})

describe('ChatMessageBubble', () => {
  it('renders image attachments and opens the viewer callback', async () => {
    const onAttachmentOpen = vi.fn()

    render(
      <ChatMessageBubble
        attachmentStatus="ready"
        attachmentUrl="blob:upload"
        message={{
          attachment: {
            byteSize: 128,
            fileName: 'photo.png',
            id: 'upload_1',
            kind: 'image',
            mimeType: 'image/png',
          },
          author: 'runner',
          body: 'see this',
          id: 'message_1',
          sentAt: '2026-05-05T12:00:00.000Z',
          tone: 'cyan',
        }}
        onAttachmentOpen={onAttachmentOpen}
      />,
    )

    expect(screen.getByText('runner')).toBeInTheDocument()
    expect(screen.getByText('see this')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button'))
    expect(onAttachmentOpen).toHaveBeenCalled()
  })
})
