export type ChatAttachment = {
  fileName: string
  id: string
  kind: 'image'
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp'
  byteSize: number
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

export type ChatRoomIdentity = Readonly<{
  id: string
  slug: string
}>

export type ChatRoomSession = Readonly<{
  expiresAt: string | null
  handleId: string
  id: string
  joinedAt: string
  roomId: string
  status: 'active' | 'revoked' | 'expired'
}>

export type ChatRoomJoinResult = Readonly<{
  participant: Readonly<{
    handle: string
    id: string
    status: 'online'
  }>
  room: ChatRoomIdentity
  session: ChatRoomSession
}>

export type ChatRoomAccess = Readonly<{
  currentPassword: string
  room: Readonly<{
    id: string
    passwordRotatedAt: string | null
    passwordVersion: number
    sessionTtlHours: number
    slug: string
  }>
}>

export type ChatMessagesPage = Readonly<{
  items: readonly ChatMessage[]
  pageInfo: Readonly<{
    nextCursor: string | null
  }>
}>

export type ChatParticipantsSnapshot = Readonly<{
  items: readonly ChatParticipant[]
}>

export type ChatSendMessageResult = Readonly<{
  item: ChatMessage
}>

export type ChatLiveEvent =
  | Readonly<{
      item: ChatMessage
      type: 'message.created'
    }>
  | Readonly<{
      items: readonly ChatParticipant[]
      type: 'participant.snapshot'
    }>
  | Readonly<{
      reason: 'room_password_rotation'
      type: 'session.revoked'
    }>
