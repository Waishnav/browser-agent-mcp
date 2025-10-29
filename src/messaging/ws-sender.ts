import { WebSocket } from "ws";
import type {
  MessageType,
  MessagePayload,
  SocketMessageMap,
} from "@/types/messages";

type SocketMessage<T extends MessageType<SocketMessageMap>> = {
  id: string;
  type: T;
  payload: MessagePayload<SocketMessageMap, T>;
};

type SocketResponse<T extends MessageType<SocketMessageMap>> = {
  id: string;
  response: SocketMessageMap[T] extends { response: infer R } ? R : never;
  error?: string;
};

export function createSocketMessageSender<
  T extends Record<string, any> = SocketMessageMap,
>(ws: WebSocket) {
  return {
    sendSocketMessage: async <K extends MessageType<T>>(
      type: K,
      payload: MessagePayload<T, K>,
      options: { timeoutMs?: number } = {},
    ): Promise<T[K] extends { response: infer R } ? R : void> => {
      const { timeoutMs = 30000 } = options;
      const id = Math.random().toString(36).substring(7);

      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Socket message timeout after ${timeoutMs}ms`));
        }, timeoutMs);

        const messageHandler = (data: Buffer) => {
          try {
            const response = JSON.parse(data.toString()) as SocketResponse<
              K & MessageType<SocketMessageMap>
            >;
            if (response.id === id) {
              clearTimeout(timer);
              ws.off("message", messageHandler);

              if (response.error) {
                reject(new Error(response.error));
              } else {
                resolve(response.response as any);
              }
            }
          } catch (e) {
            // Ignore parse errors for messages not meant for us
          }
        };

        ws.on("message", messageHandler);

        const message: SocketMessage<K & MessageType<SocketMessageMap>> = {
          id,
          type: type as K & MessageType<SocketMessageMap>,
          payload: payload as any,
        };
        ws.send(JSON.stringify(message));
      });
    },
  };
}

export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
