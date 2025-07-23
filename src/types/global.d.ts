export {};

declare global {
  interface Window {
    global: typeof globalThis;
  }
}

// src/global.d.ts
declare module "sockjs-client/dist/sockjs" {
  import { EventEmitter } from "events";

  interface SockJS extends EventEmitter {
    readyState: number;
    protocol: string;
    url: string;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    onopen?: (e: Event) => void;
    onclose?: (e: CloseEvent) => void;
    onmessage?: (e: MessageEvent) => void;
    onerror?: (e: Event) => void;
  }

  const SockJS: {
    new (url: string): SockJS;
  };

  export default SockJS;
}
