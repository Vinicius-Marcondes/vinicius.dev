const liveTransportProtocol = "chat-room-live.v1" as const;
const liveSessionProtocolPrefix = "chat-room-session." as const;
const liveProtocolHeaderField = "sec-websocket-protocol" as const;

type LiveProtocolErrorReason =
  | "missing_transport_protocol"
  | "missing_room_session_protocol"
  | "invalid_room_session_protocol";

type LiveProtocolError = Readonly<{
  error: "invalid_request";
  field: typeof liveProtocolHeaderField;
  reason: LiveProtocolErrorReason;
}>;

export type ChatLiveWebSocketHandshake = Readonly<{
  roomSessionId: string;
  transportProtocol: typeof liveTransportProtocol;
}>;

type ParseChatLiveWebSocketHandshakeResult =
  | Readonly<{ value: ChatLiveWebSocketHandshake }>
  | Readonly<{ error: LiveProtocolError }>;

export const chatLiveTransportProtocol = liveTransportProtocol;

export const buildChatLiveRoomSessionProtocol = (roomSessionId: string) =>
  `${liveSessionProtocolPrefix}${roomSessionId}`;

const parseWebSocketProtocolHeader = (value: string | undefined) =>
  value
    ?.split(",")
    .map((candidate) => candidate.trim())
    .filter((candidate) => candidate.length > 0) ?? [];

const createLiveProtocolError = (reason: LiveProtocolErrorReason) => ({
  error: {
    error: "invalid_request" as const,
    field: liveProtocolHeaderField,
    reason,
  },
});

export const parseChatLiveWebSocketHandshake = (
  protocolHeader: string | undefined,
): ParseChatLiveWebSocketHandshakeResult => {
  const offeredProtocols = parseWebSocketProtocolHeader(protocolHeader);

  if (!offeredProtocols.includes(liveTransportProtocol)) {
    return createLiveProtocolError("missing_transport_protocol");
  }

  const roomSessionProtocols = offeredProtocols.filter((protocol) =>
    protocol.startsWith(liveSessionProtocolPrefix),
  );

  if (roomSessionProtocols.length !== 1) {
    return createLiveProtocolError("missing_room_session_protocol");
  }

  const roomSessionId = roomSessionProtocols[0].slice(liveSessionProtocolPrefix.length).trim();

  if (roomSessionId.length === 0) {
    return createLiveProtocolError("invalid_room_session_protocol");
  }

  return {
    value: {
      roomSessionId,
      transportProtocol: liveTransportProtocol,
    },
  };
};
