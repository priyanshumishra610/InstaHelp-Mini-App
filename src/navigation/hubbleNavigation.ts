import { router } from "expo-router";

/**
 * Typed Expo Router routes are generated from the filesystem; this screen is new
 * until the next `expo start` codegen refresh, so we keep navigation localized here.
 */
export function pushHubbleWebView(params: Record<string, string>) {
  router.push({
    pathname: "/(tabs)/giftcards",
    params,
  } as never);
}
