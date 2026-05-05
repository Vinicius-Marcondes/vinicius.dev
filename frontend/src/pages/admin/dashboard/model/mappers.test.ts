import { describe, expect, it } from 'vitest'

import { mapDashboardSummary } from './mappers'

describe('admin dashboard mapper', () => {
  it('pads panel counters and maps queue actions plus chat access', () => {
    expect(
      mapDashboardSummary(
        {
          moderationCommands: ['delete_message'],
          panels: {
            chatFlags: 4,
            draftThoughts: 2,
            featuredSlots: 3,
            photoRecords: 12,
            statusStripEntries: 5,
          },
          queues: {
            content: [
              {
                channel: 'TH-01',
                id: 'thought_1',
                kind: 'thought',
                suggestedActions: ['publish', 'edit'],
                title: 'Night Cable Interfaces',
              },
            ],
          },
        },
        {
          currentPassword: 'night-runner-42',
          room: {
            id: 'room_1',
            passwordRotatedAt: '2026-05-05T12:00:00.000Z',
            passwordVersion: 3,
            sessionTtlHours: 24,
            slug: 'night-shift',
          },
        },
      ),
    ).toEqual({
      panels: [
        {
          detail: 'two notes and one essay waiting for polish',
          label: 'draft thoughts',
          value: '02',
        },
        {
          detail: 'home previews are manually pinned',
          label: 'featured slots',
          value: '03',
        },
        {
          detail: 'metadata only; originals live on the VPS later',
          label: 'photo records',
          value: '12',
        },
        {
          detail: 'moderation queue for backend contracts',
          label: 'chat flags',
          value: '04',
        },
      ],
      queues: [
        {
          action: 'publish / edit',
          channel: 'TH-01',
          id: 'thought_1',
          title: 'Night Cable Interfaces',
        },
      ],
      roomAccess: {
        currentPassword: 'night-runner-42',
        passwordRotatedAt: '2026-05-05T12:00:00.000Z',
        passwordVersion: 3,
        sessionTtlHours: 24,
        slug: 'night-shift',
      },
    })
  })
})
