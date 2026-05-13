import * as Linking from "expo-linking";
import { useEffect, useRef } from "react";

import { pushHubbleWebView } from "@/navigation/hubbleNavigation";

function firstQueryValue(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? "");
  if (value == null) return "";
  return String(value);
}

function compactParams(params: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v) out[k] = v;
  }
  return out;
}

function isHubbleWebViewUrl(url: string) {
  const parsed = Linking.parse(url);
  const host = parsed.hostname ?? "";
  const path = (parsed.path ?? "").replace(/^\/+/, "");
  return (
    host === "hubble-webview" ||
    path === "hubble-webview" ||
    url.includes("://hubble-webview")
  );
}

/**
 * Handles `instahelpmobileapp://hubble-webview?...` (and legacy host shapes)
 * so notification / web-to-app flows can open the embedded Hubble store.
 */
export function useHubbleDeepLinks(enabled: boolean) {
  const lastHandled = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handle = (url: string | null) => {
      if (!url) return;
      if (lastHandled.current === url) return;
      if (!isHubbleWebViewUrl(url)) return;

      const parsed = Linking.parse(url);
      const qp = parsed.queryParams ?? {};

      lastHandled.current = url;
      pushHubbleWebView(
        compactParams({
          sdkPath: firstQueryValue(qp.sdkPath),
          category: firstQueryValue(qp.category),
          showBackButton: firstQueryValue(qp.showBackButton),
          amount: firstQueryValue(qp.amount),
          coupon: firstQueryValue(qp.coupon),
          brandId: firstQueryValue(qp.brandId),
        }),
      );
    };

    void Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener("url", (e) => handle(e.url));
    return () => sub.remove();
  }, [enabled]);
}
