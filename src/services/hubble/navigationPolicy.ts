import type { HubbleEnvironment } from "@/services/hubble/types";

const RAZORPAY_HOSTS = new Set([
  "api.razorpay.com",
  "checkout.razorpay.com",
  "lumberjack.razorpay.com",
]);

const HUBBLE_HOSTS: Record<HubbleEnvironment, Set<string>> = {
  development: new Set(["sdk.dev.myhubble.money"]),
  production: new Set(["sdk.myhubble.money"]),
};

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function isHubbleSdkNavigationAllowed(url: string, environment: HubbleEnvironment) {
  const host = hostnameOf(url);
  if (!host) return false;
  if (HUBBLE_HOSTS[environment].has(host)) return true;
  if (RAZORPAY_HOSTS.has(host)) return true;
  return false;
}
