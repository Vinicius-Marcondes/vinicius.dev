import type { ChatMessage, ChatParticipant } from '../model/types'

export const chatParticipants: ChatParticipant[] = [
  { handle: 'vinicius', status: 'online' },
  { handle: 'ghost-operator', status: 'idle' },
  { handle: 'channel-03', status: 'online' },
]

export const chatMessages: ChatMessage[] = [
  {
    id: 'm-001',
    author: 'system',
    body: 'room booted in local mock mode // backend handshake pending',
    sentAt: '22:41',
    tone: 'system',
  },
  {
    id: 'm-002',
    author: 'vinicius',
    body: 'password gate visible, archive persistent later. keep the CRT tasteful.',
    sentAt: '22:43',
    tone: 'pink',
  },
  {
    id: 'm-003',
    author: 'ghost-operator',
    body: 'copy. image uploads should feel like dropping a polaroid into the terminal.',
    sentAt: '22:46',
    attachment: { fileName: 'scanline-polaroid.png', kind: 'image' },
    tone: 'cyan',
  },
]
