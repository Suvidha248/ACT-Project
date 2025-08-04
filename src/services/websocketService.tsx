import { Client, IMessage } from "@stomp/stompjs";
import { ChatMessage } from "../types";

let stompClient: Client | null = null;

/**
 * Connect to WebSocket and listen to a specific chat topic
 */
export const connectWebSocket = (
  chatId: string,
  onMessageReceived: (message: ChatMessage) => void,
  onConnected?: () => void
): void => {
  if (!stompClient) {
    stompClient = new Client({
      brokerURL: "wss://act-backend-103082948076.us-central1.run.app/ws",
      reconnectDelay: 5000,
      debug: (str: string) => console.log("[WebSocket]", str),

      onConnect: () => {
        console.log("✅ WebSocket connected (chat)");

        stompClient?.subscribe(`/topic/messages/${chatId}`, (msg: IMessage) => {
          try {
            const message: ChatMessage = JSON.parse(msg.body);
            onMessageReceived(message);
          } catch (error) {
            console.error("❌ Failed to parse incoming chat message:", error);
          }
        });

        if (onConnected) onConnected();
      },

      onStompError: (frame) => {
        console.error("❌ STOMP error (chat):", frame.headers["message"]);
        console.error("❌ Details:", frame.body);
      },

      onWebSocketError: (event) => {
        console.error("❌ WebSocket error (chat):", event);
      },

      onDisconnect: () => {
        console.warn("⚠️ Chat WebSocket disconnected");
      },
    });

    stompClient.activate();
  }
};

/**
 * Send a WebSocket chat message
 */
export const sendWebSocketMessage = (
  // chatId: string,
  message: ChatMessage
): void => {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(message),
    });
  } else {
    console.warn("❌ WebSocket not connected. Message not sent.");
  }
};

/**
 * Disconnect WebSocket (both chat and notifications)
 */
export const disconnectWebSocket = (): void => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
