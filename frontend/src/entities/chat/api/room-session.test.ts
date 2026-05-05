import { describe, expect, it } from 'vitest'

import { ApiRequestError } from '../../../shared/api'
import { parseChatRoomError } from './room-session'

describe('chat room session API helpers', () => {
  it('parses known room errors and ignores unrelated payloads', () => {
    expect(
      parseChatRoomError(
        new ApiRequestError(403, {
          error: 'denied',
          reason: 'handle_banned',
          resource: 'chat',
        }),
      ),
    ).toEqual({
      error: 'denied',
      reason: 'handle_banned',
      resource: 'chat',
    })
    expect(parseChatRoomError(new ApiRequestError(500, { error: 'server_error' }))).toBeNull()
    expect(parseChatRoomError(new Error('nope'))).toBeNull()
  })
})
