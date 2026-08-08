import { useEffect, useRef } from "react";
import { CMS_API_URL, CMS_IS_CONFIGURED } from "@/config/env";

type ContentUpdateMessage = {
  type: string;
  module?: string;
  timestamp?: number;
};

/**
 * Subscribe to CMS WebSocket for real-time content updates.
 * Invalidates React Query caches when admin publishes changes.
 */
export function useCmsRealtime(
  onUpdate?: (module: string) => void,
  enabled = true,
): void {
  const wsRef = useRef<WebSocket | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled || !CMS_IS_CONFIGURED) return;

    const wsUrl = CMS_API_URL.replace(/^http/, "ws") + "/ws/content";

    let reconnectTimer: ReturnType<typeof setTimeout>;

    function connect() {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data as string) as ContentUpdateMessage;
            if (msg.type === "content_updated" && msg.module) {
              onUpdateRef.current?.(msg.module);
            }
          } catch {
            // ignore malformed messages
          }
        };

        ws.onclose = () => {
          reconnectTimer = setTimeout(connect, 5000);
        };
      } catch {
        reconnectTimer = setTimeout(connect, 10000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [enabled]);
}
