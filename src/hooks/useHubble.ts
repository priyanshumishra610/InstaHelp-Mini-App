import {
  HUBBLE_ANALYTICS_ENABLED,
  HUBBLE_APP_SECRET,
  HUBBLE_CLIENT_ID,
  HUBBLE_ENV,
  HUBBLE_IS_CONFIGURED,
  HUBBLE_WRAP_PLATFORM,
} from "@/constants/hubble";
import {
  buildHubbleSdkUrl,
  isHubbleSdkNavigationAllowed,
  parseHubbleHostMessage,
} from "@/services/hubble";
import type { HubbleHostEvent } from "@/services/hubble/types";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import type { ComponentRef, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Platform } from "react-native";
import WebView, { type WebViewMessageEvent, type WebViewProps } from "react-native-webview";

type ShouldStartLoadEvent = Parameters<
  NonNullable<WebViewProps["onShouldStartLoadWithRequest"]>
>[0];

export type HubbleWebViewController = {
  sourceUri: string;
  environment: typeof HUBBLE_ENV;
  isConfigured: boolean;
  sdkReady: boolean;
  loadError: boolean;
  canGoBack: boolean;
  setCanGoBack: (v: boolean) => void;
  webViewRef: RefObject<ComponentRef<typeof WebView> | null>;
  onMessage: (e: WebViewMessageEvent) => void;
  onShouldStartLoadWithRequest: (e: ShouldStartLoadEvent) => boolean;
  resetSessionFlags: () => void;
};

export type UseHubbleInput = {
  token?: string | null;
  sdkPath?: string;
  extraQuery?: Record<string, string | number | boolean | undefined | null>;
  onAction?: (event: HubbleHostEvent) => void;
  onCloseRequest?: () => void;
  /** When the WebView has no history, Android hardware back calls this then consumes the event. */
  onHardwareBackExit?: () => void;
};

export function useHubble(input: UseHubbleInput): HubbleWebViewController {
  const webViewRef = useRef<ComponentRef<typeof WebView> | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const onHardwareBackExitRef = useRef(input.onHardwareBackExit);
  onHardwareBackExitRef.current = input.onHardwareBackExit;

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const deviceId = useMemo(() => {
    const sid = Constants.sessionId;
    if (sid) return `${Platform.OS}:${sid}`;
    return undefined;
  }, []);

  const sourceUri = useMemo(() => {
    if (!HUBBLE_IS_CONFIGURED) return "";
    return buildHubbleSdkUrl({
      environment: HUBBLE_ENV,
      clientId: HUBBLE_CLIENT_ID,
      appSecret: HUBBLE_APP_SECRET,
      token: input.token,
      wrapPlt: HUBBLE_WRAP_PLATFORM,
      appVersion,
      deviceId,
      sdkPath: input.sdkPath,
      extraQuery: input.extraQuery,
    });
  }, [
    appVersion,
    deviceId,
    input.extraQuery,
    input.sdkPath,
    input.token,
  ]);

  const resetSessionFlags = useCallback(() => {
    setSdkReady(false);
    setLoadError(false);
  }, []);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      const event = parseHubbleHostMessage(e.nativeEvent.data);
      if (!event) return;
      input.onAction?.(event);
      if (event.type === "action") {
        if (event.action === "app_ready") {
          setSdkReady(true);
          setLoadError(false);
        } else if (event.action === "error") {
          setLoadError(true);
        } else if (event.action === "close") {
          input.onCloseRequest?.();
        }
      } else if (event.type === "analytics" && HUBBLE_ANALYTICS_ENABLED) {
        if (__DEV__) {
          console.log("[Gift cards analytics]", event.event, event.properties);
        }
      }
    },
    [input],
  );

  const onShouldStartLoadWithRequest = useCallback((e: ShouldStartLoadEvent) => {
    const url = e.url;
    if (!url) return false;
    if (isHubbleSdkNavigationAllowed(url, HUBBLE_ENV)) return true;
    void Linking.openURL(url);
    return false;
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      const exit = onHardwareBackExitRef.current;
      if (exit) {
        exit();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [canGoBack]);

  return {
    sourceUri,
    environment: HUBBLE_ENV,
    isConfigured: HUBBLE_IS_CONFIGURED,
    sdkReady,
    loadError,
    canGoBack,
    setCanGoBack,
    webViewRef,
    onMessage,
    onShouldStartLoadWithRequest,
    resetSessionFlags,
  };
}
