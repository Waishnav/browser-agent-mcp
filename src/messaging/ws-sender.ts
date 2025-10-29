import { WebSocket } from "ws";
import type { MessagePayload, MessageType, SocketMessageMap } from "@/types/messages";

export function createSocketMessageSender<T extends Record<string, any>>(ws: WebSocket) {
  let messageId = 0;

  async function sendSocketMessage<K extends MessageType<T>>(
    type: K,
    payload: MessagePayload<T, K>,
    options: { timeoutMs?: number } = { timeoutMs: 30000 }
  ): Promise<any> {
    const id = ++messageId;
    const message = { id, type, payload };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for response to message ${id}`));
      }, options.timeoutMs);

      const handleMessage = (data: WebSocket.Data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.id === id) {
            clearTimeout(timeout);
            ws.off("message", handleMessage);
            
            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.result);
            }
          }
        } catch (error) {
          // Ignore parsing errors for messages not meant for us
        }
      };

      ws.on("message", handleMessage);
      ws.send(JSON.stringify(message), (error) => {
        if (error) {
          clearTimeout(timeout);
          ws.off("message", handleMessage);
          reject(error);
        }
      });
    });
  }

  return { sendSocketMessage };
}
