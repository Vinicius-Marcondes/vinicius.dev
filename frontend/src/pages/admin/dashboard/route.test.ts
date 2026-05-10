import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiRequestError } from '../../../shared/api'
import { adminDashboardLoader } from './route'

const mocks = vi.hoisted(() => ({
  getAdminDashboardSummary: vi.fn(),
  getChatRoomAccess: vi.fn(),
}))

vi.mock('../../../entities/admin-session', () => ({
  getAdminDashboardSummary: mocks.getAdminDashboardSummary,
}))

vi.mock('../../../entities/chat', () => ({
  getChatRoomAccess: mocks.getChatRoomAccess,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

const loaderArgs = (request: Request): Parameters<typeof adminDashboardLoader>[0] =>
  ({
    params: {},
    request,
  }) as Parameters<typeof adminDashboardLoader>[0]

describe('admin dashboard route', () => {
  it('maps summary and room access loader data', async () => {
    const request = new Request('http://localhost/admin/dashboard')
    mocks.getAdminDashboardSummary.mockResolvedValueOnce({
      moderationCommands: [],
      panels: {
        chatFlags: 1,
        draftThoughts: 2,
        featuredSlots: 3,
        photoRecords: 4,
        statusStripEntries: 5,
      },
      queues: {
        content: [],
      },
    })
    mocks.getChatRoomAccess.mockResolvedValueOnce({
      currentPassword: 'night-runner-42',
      room: {
        id: 'room_1',
        passwordRotatedAt: null,
        passwordVersion: 1,
        sessionTtlHours: 24,
        slug: 'night-shift',
      },
    })

    const result = await adminDashboardLoader(loaderArgs(request))
    expect(result).toMatchObject({
      roomAccess: {
        currentPassword: 'night-runner-42',
      },
    })
    expect(
      (result as unknown as { panels: ReadonlyArray<{ label: string; value: string }> }).panels[0],
    ).toMatchObject({
      label: 'draft thoughts',
      value: '02',
    })
    expect(mocks.getAdminDashboardSummary).toHaveBeenCalledWith(request.signal)
    expect(mocks.getChatRoomAccess).toHaveBeenCalledWith('night-shift', request.signal)
  })

  it('redirects unauthorized dashboard sessions to admin login', async () => {
    mocks.getAdminDashboardSummary.mockRejectedValueOnce(new ApiRequestError(401, { error: 'denied' }))
    mocks.getChatRoomAccess.mockResolvedValueOnce(null)

    const redirectResponse = await adminDashboardLoader(
      loaderArgs(new Request('http://localhost/admin/dashboard')),
    )

    expect((redirectResponse as Response).headers.get('location')).toBe('/admin/login')
  })

  it('tolerates missing room access while preserving dashboard loader data', async () => {
    mocks.getAdminDashboardSummary.mockResolvedValueOnce({
      moderationCommands: [],
      panels: {
        chatFlags: 0,
        draftThoughts: 0,
        featuredSlots: 0,
        photoRecords: 0,
        statusStripEntries: 0,
      },
      queues: {
        content: [],
      },
    })
    mocks.getChatRoomAccess.mockRejectedValueOnce(new ApiRequestError(404, { error: 'not_found' }))

    const result = await adminDashboardLoader(loaderArgs(new Request('http://localhost/admin/dashboard')))

    expect(result).toMatchObject({ roomAccess: null })
    expect(
      (result as unknown as { panels: ReadonlyArray<{ label: string; value: string }> }).panels[0],
    ).toMatchObject({
      label: 'draft thoughts',
      value: '00',
    })
  })
})
