import type { ThoughtRecord } from '../model/types'
import { toThoughtRecord } from './mappers'

export const thoughtFixtures: ThoughtRecord[] = [
  toThoughtRecord({
    id: 'night-cable-interfaces',
    title: 'Night Cable Interfaces',
    type: 'essay',
    status: 'published',
    publishedAt: '2026-03-28',
    readingTime: '7 min',
    tags: ['interface', 'nostalgia', 'design'],
    excerpt: 'The best personal websites feel less like products and more like a channel you accidentally tuned into.',
    bodyPreview: 'A homepage does not need to convert anyone. It can just broadcast a little weather from the inside of your head.',
  }),
  toThoughtRecord({
    id: 'runbook-for-small-tools',
    title: 'Runbook for Small Tools',
    type: 'note',
    status: 'published',
    publishedAt: '2026-03-16',
    readingTime: '3 min',
    tags: ['tools', 'ops'],
    excerpt: 'A small tool should have an exit ramp, a reset switch, and a boring README.',
    bodyPreview: 'If I cannot reinstall it during coffee, it is not a small tool anymore. It is infrastructure wearing a fake mustache.',
  }),
  toThoughtRecord({
    id: 'photography-as-debugging',
    title: 'Photography as Debugging',
    type: 'essay',
    status: 'published',
    publishedAt: '2026-02-11',
    readingTime: '6 min',
    tags: ['photography', 'process'],
    excerpt: 'The camera is a logging device with better vibes and much worse search.',
    bodyPreview: 'Every frame is a trace statement from a place I thought I understood. The good ones tell me where my assumptions were wrong.',
  }),
  toThoughtRecord({
    id: 'tabs-vs-rooms',
    title: 'Tabs vs Rooms',
    type: 'note',
    status: 'published',
    publishedAt: '2026-01-21',
    readingTime: '2 min',
    tags: ['web', 'architecture'],
    excerpt: 'Routes are rooms. Tabs are drawers. Most broken information architecture starts by confusing the two.',
    bodyPreview: 'A room changes your context. A drawer reveals more of the same context. Design starts getting easier after that distinction.',
  }),
  toThoughtRecord({
    id: 'against-frictionless-publishing',
    title: 'Against Frictionless Publishing',
    type: 'essay',
    status: 'published',
    publishedAt: '2025-12-02',
    readingTime: '8 min',
    tags: ['writing', 'web'],
    excerpt: 'A little ceremony before publishing is useful. It lets the draft get one last chance to embarrass itself privately.',
    bodyPreview: 'Friction is not always a product bug. Sometimes it is the only thing standing between a thought and a noisy little mistake.',
  }),
  toThoughtRecord({
    id: 'ship-the-weird-version',
    title: 'Ship the Weird Version',
    type: 'note',
    status: 'published',
    publishedAt: '2025-10-17',
    readingTime: '4 min',
    tags: ['craft', 'personal-site'],
    excerpt: 'If every personal site looks employable, the internet gets measurably worse.',
    bodyPreview: 'A personal website can be a little impractical. That is where the signal leaks through.',
  }),
]

export function allThoughtTags(thoughts: ThoughtRecord[]) {
  return Array.from(new Set(thoughts.flatMap((thought) => thought.tags))).sort()
}
