import { HUBBLE_SDK_BASE } from "@/constants/hubble";
import { sanitizeHubblePartnerToken } from "@/services/hubble/partnerToken";
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

export function buildHubbleSdkUrl(input: BuildHubbleUrlInput): string {
  const base = HUBBLE_SDK_BASE[input.environment];
  const target = joinSdkPath(base, input.sdkPath);
  const url = new URL(target);

  url.searchParams.set("clientId", input.clientId);
  url.searchParams.set("appSecret", input.appSecret);
  url.searchParams.set("wrap-plt", input.wrapPlt);

  const partnerToken = sanitizeHubblePartnerToken(input.token);
  if (partnerToken) url.searchParams.set("token", partnerToken);
  if (input.appVersion) url.searchParams.set("appVersion", input.appVersion);
  if (input.deviceId) url.searchParams.set("deviceId", input.deviceId);

  for (const [key, raw] of Object.entries(input.extraQuery ?? {})) {
    if (raw === undefined || raw === null) continue;
    url.searchParams.set(key, String(raw));
  }

  return url.toString();
}
