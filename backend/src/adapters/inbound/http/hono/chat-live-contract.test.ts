import { describe, expect, it } from "bun:test";

import {
  buildChatLiveRoomSessionProtocol,
  chatLiveTransportProtocol,
  parseChatLiveWebSocketHandshake,
} from "./chat-live-contract";

describe("chat live websocket contract", () => {
  it("parses websocket auth from sec-websocket-protocol", () => {
    const parsed = parseChatLiveWebSocketHandshake(
      `${chatLiveTransportProtocol}, ${buildChatLiveRoomSessionProtocol("session_1")}`,
    );

    if ("error" in parsed) {
      throw new Error("expected websocket handshake to parse");
    }

    expect(parsed.value).toEqual({
      roomSessionId: "session_1",
      transportProtocol: chatLiveTransportProtocol,
    });
  });

  it("rejects handshakes that do not include the transport subprotocol", () => {
    const parsed = parseChatLiveWebSocketHandshake(buildChatLiveRoomSessionProtocol("session_1"));

    expect(parsed).toEqual({
      error: {
        error: "invalid_request",
        field: "sec-websocket-protocol",
        reason: "missing_transport_protocol",
      },
    });
  });

  it("rejects handshakes that omit the room session subprotocol", () => {
    const parsed = parseChatLiveWebSocketHandshake(chatLiveTransportProtocol);

    expect(parsed).toEqual({
      error: {
        error: "invalid_request",
        field: "sec-websocket-protocol",
        reason: "missing_room_session_protocol",
      },
    });
  });

  it("rejects handshakes with an empty room session id", () => {
    const parsed = parseChatLiveWebSocketHandshake(
      `${chatLiveTransportProtocol}, ${buildChatLiveRoomSessionProtocol("   ")}`,
    );

    expect(parsed).toEqual({
      error: {
        error: "invalid_request",
        field: "sec-websocket-protocol",
        reason: "invalid_room_session_protocol",
      },
    });
  });
});
