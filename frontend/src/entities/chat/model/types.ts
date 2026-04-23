export type ChatAttachment = {
  fileName: string
  kind: 'image'
}

export type ChatMessage = {
  attachment?: ChatAttachment
  author: string
  body: string
  id: string
  sentAt: string
  tone?: 'cyan' | 'pink' | 'system'
}

export type ChatParticipant = {
  handle: string
  status: 'idle' | 'online'
}
