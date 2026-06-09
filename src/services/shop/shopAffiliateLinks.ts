import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

import type { AffiliateTapLog, ShopPlatform } from "@/types/shopCatalog";

const TAP_LOG_KEY = "instahelp-shop-affiliate-taps";
const MAX_TAPS = 200;

export async function openAffiliateLink(
  url: string,
  productId: string,
  platform: ShopPlatform,
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { ok: false, error: "empty" };
  }

  try {
    await logAffiliateTap(productId, platform);
    await WebBrowser.openBrowserAsync(trimmed, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      enableBarCollapsing: true,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "open_failed" };
  }
}

async function logAffiliateTap(
  productId: string,
  platform: ShopPlatform,
): Promise<void> {
  const entry: AffiliateTapLog = {
    product_id: productId,
    platform,
    timestamp: new Date().toISOString(),
  };

  try {
    const raw = await AsyncStorage.getItem(TAP_LOG_KEY);
    const list: AffiliateTapLog[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    await AsyncStorage.setItem(
      TAP_LOG_KEY,
      JSON.stringify(list.slice(0, MAX_TAPS)),
    );
  } catch {
    // Analytics log is best-effort only.
  }
}
