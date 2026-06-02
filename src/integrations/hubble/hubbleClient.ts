import { HUBBLE_SDK_BASE } from "@/integrations/hubble/hubbleConfig";
import type {
  BuildHubbleUrlInput,
  HubbleEnvironment,
  HubbleHostEvent,
} from "@/integrations/hubble/hubbleTypes";

const RAZORPAY_HOSTS = new Set([
  "api.razorpay.com",
  "checkout.razorpay.com",
  "lumberjack.razorpay.com",
]);

const HUBBLE_HOSTS: Record<HubbleEnvironment, Set<string>> = {
  development: new Set(["sdk.dev.myhubble.money"]),
  production: new Set(["sdk.myhubble.money"]),
};

function trimTrailingSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function joinSdkPath(base: string, sdkPath?: string) {
  const normalizedBase = trimTrailingSlash(base);
  const path = (sdkPath ?? "").replace(/^\/+/, "");
  if (!path) return `${normalizedBase}/`;
  return `${normalizedBase}/${path}`;
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Initializes Hubble for React Native by constructing the WebView SDK URL with
 * app credentials, device context, and the target catalog route only.
 * No user identity, SSO token, or auth hint is sent so Hubble opens as guest.
 */
export function buildHubbleSdkUrl(input: BuildHubbleUrlInput): string {
  const base = HUBBLE_SDK_BASE[input.environment];
  const target = joinSdkPath(base, input.sdkPath);
  const url = new URL(target);

  url.searchParams.set("clientId", input.clientId);
  url.searchParams.set("appSecret", input.appSecret);
  url.searchParams.set("wrap-plt", input.wrapPlt);

  if (input.appVersion) url.searchParams.set("appVersion", input.appVersion);
  if (input.deviceId) url.searchParams.set("deviceId", input.deviceId);

  for (const [key, raw] of Object.entries(input.extraQuery ?? {})) {
    if (raw === undefined || raw === null) continue;
    url.searchParams.set(key, String(raw));
  }

  return url.toString();
}

export function isHubbleSdkNavigationAllowed(url: string, environment: HubbleEnvironment) {
  const host = hostnameOf(url);
  if (!host) return false;
  if (HUBBLE_HOSTS[environment].has(host)) return true;
  if (RAZORPAY_HOSTS.has(host)) return true;
  return false;
}

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
