import { getPublicEnv } from "@/config/env";
import type { HubbleEnvironment } from "@/integrations/hubble/hubbleTypes";

export const HUBBLE_WRAP_PLATFORM = "rn" as const;

export const HUBBLE_SDK_BASE: Record<HubbleEnvironment, string> = {
  development: "https://sdk.dev.myhubble.money/",
  production: "https://sdk.myhubble.money/",
};

export const HUBBLE_CONFIG = {
  clientId: getPublicEnv("EXPO_PUBLIC_HUBBLE_CLIENT_ID"),
  appSecret: getPublicEnv("EXPO_PUBLIC_HUBBLE_APP_SECRET"),
  environment:
    getPublicEnv("EXPO_PUBLIC_HUBBLE_ENV") === "development"
      ? ("development" as const)
      : ("production" as const),
  analyticsEnabled: getPublicEnv("EXPO_PUBLIC_HUBBLE_ANALYTICS_LOG") === "1",
  demoBrandIds: getPublicEnv("EXPO_PUBLIC_HUBBLE_DEMO_BRAND_IDS")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
} as const;

export const HUBBLE_IS_CONFIGURED = Boolean(
  HUBBLE_CONFIG.clientId && HUBBLE_CONFIG.appSecret,
);
