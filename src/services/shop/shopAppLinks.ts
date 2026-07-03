import * as WebBrowser from "expo-web-browser";

export async function openAppLink(
  url: string,
  appId: string,
): Promise<{ ok: boolean; error?: string }> {
  const trimmed = url.trim();
  if (!trimmed) {
    return { ok: false, error: "empty" };
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
