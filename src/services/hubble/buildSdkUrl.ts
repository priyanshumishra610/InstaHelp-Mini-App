import { HUBBLE_SDK_BASE } from "@/constants/hubble";
import type { BuildHubbleUrlInput } from "@/services/hubble/types";

function trimTrailingSlash(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function joinSdkPath(base: string, sdkPath?: string) {
  const normalizedBase = trimTrailingSlash(base);
  const path = (sdkPath ?? "").replace(/^\/+/, "");
  if (!path) return `${normalizedBase}/`;
  return `${normalizedBase}/${path}`;
}

/**
 * Hubble WebView URL. Does not set `token` — this integration uses **lazy login**
 * on Hubble’s side (`token` optional per [React Native parameters](https://docs.myhubble.money/sdk/platform-guides/react-native)).
 * See HUBBLE_SETUP.md.
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
