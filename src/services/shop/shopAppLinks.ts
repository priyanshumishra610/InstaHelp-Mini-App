import {
  initializeCuelinks,
  openCuelinksTrackedUrl,
} from "@/services/cuelinksService";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

/**
 * Opens an app/store URL through CueLinks tracking (channel id 284356).
 * Falls back to a direct browser open if tracking fails.
 */
export async function openAppLink(
  url: string,
  appId: string,
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { ok: false, error: "empty" };
  }

  initializeCuelinks();

  try {
    const result = await openCuelinksTrackedUrl(trimmed, {
      subid: appId,
      subid2: Platform.OS,
      subid3: "shop",
      source: "app",
      analyticsId: `shop-${appId}`,
    });
    if (result.ok) return { ok: true };
  } catch {
    // Fall through to direct open.
  }

  try {
    await WebBrowser.openBrowserAsync(trimmed, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      enableBarCollapsing: true,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "open_failed" };
  }
}
