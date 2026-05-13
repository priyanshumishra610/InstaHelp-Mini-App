import type { HubbleHostEvent } from "@/services/hubble/types";

export function parseHubbleHostMessage(raw: string): HubbleHostEvent | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as { type?: unknown };
    if (obj.type === "action") {
      const action = (parsed as { action?: unknown }).action;
      if (action === "close" || action === "app_ready" || action === "error") {
        return { type: "action", action };
      }
      return null;
    }
    if (obj.type === "analytics") {
      const event = (parsed as { event?: unknown }).event;
      const properties = (parsed as { properties?: unknown }).properties;
      if (typeof event !== "string") return null;
      const safeProps =
        properties && typeof properties === "object" && !Array.isArray(properties)
          ? (properties as Record<string, unknown>)
          : {};
      return { type: "analytics", event, properties: safeProps };
    }
    return null;
  } catch {
    return null;
  }
}
