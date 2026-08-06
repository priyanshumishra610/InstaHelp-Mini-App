import {
  HUBBLE_CONFIG,
  HUBBLE_IS_CONFIGURED,
  HUBBLE_WRAP_PLATFORM,
  buildHubbleSdkUrl,
  isHubbleSdkNavigationAllowed,
  parseHubbleHostMessage,
} from "@/integrations/hubble";
import type { HubbleHostEvent } from "@/integrations/hubble";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { fetchHubbleSsoToken } from "@/services/hubble/hubbleTokenService";
import { useProfileStore } from "@/store/profileStore";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import type { ComponentRef, RefObject } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BackHandler, Platform } from "react-native";
import WebView, { type WebViewMessageEvent, type WebViewProps } from "react-native-webview";

type ShouldStartLoadEvent = Parameters<
  NonNullable<WebViewProps["onShouldStartLoadWithRequest"]>
>[0];

export type HubbleSsoState = "idle" | "loading" | "ready" | "error";

export type HubbleWebViewController = {
  sourceUri: string;
  environment: typeof HUBBLE_CONFIG.environment;
  isConfigured: boolean;
  ssoState: HubbleSsoState;
  ssoError: string | null;
  sdkReady: boolean;
  loadError: boolean;
  canGoBack: boolean;
  setCanGoBack: (v: boolean) => void;
  webViewRef: RefObject<ComponentRef<typeof WebView> | null>;
  onMessage: (e: WebViewMessageEvent) => void;
  onShouldStartLoadWithRequest: (e: ShouldStartLoadEvent) => boolean;
  onWebViewError: () => void;
  resetSessionFlags: () => void;
};

export type UseHubbleInput = {
  sdkPath?: string;
  extraQuery?: Record<string, string | number | boolean | undefined | null>;
  /** Increment when retrying load so SSO + ready-timeout run again. */
  sessionKey?: number;
  onAction?: (event: HubbleHostEvent) => void;
  onCloseRequest?: () => void;
  /** When the WebView has no history, Android hardware back calls this then consumes the event. */
  onHardwareBackExit?: () => void;
};

export function useHubble(input: UseHubbleInput): HubbleWebViewController {
  const webViewRef = useRef<ComponentRef<typeof WebView> | null>(null);
  const sessionKey = input.sessionKey ?? 0;
  const phone = useAuthPhone();
  const profileName = useProfileStore((s) => s.profile?.name);
  const profileEmail = useProfileStore((s) => s.profile?.email);

  const [canGoBack, setCanGoBack] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [ssoToken, setSsoToken] = useState<string | null>(null);
  const [ssoState, setSsoState] = useState<HubbleSsoState>(() => {
    if (!HUBBLE_IS_CONFIGURED) return "idle";
    return phone ? "loading" : "ready";
  });
  const [ssoError, setSsoError] = useState<string | null>(null);

  const onHardwareBackExitRef = useRef(input.onHardwareBackExit);
  onHardwareBackExitRef.current = input.onHardwareBackExit;

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const deviceId = useMemo(() => {
    const sid = Constants.sessionId;
    if (sid) return `${Platform.OS}:${sid}`;
    return undefined;
  }, []);

  useEffect(() => {
    if (!HUBBLE_IS_CONFIGURED) {
      setSsoToken(null);
      setSsoState("idle");
      setSsoError(null);
      return;
    }

    if (!phone) {
      setSsoToken(null);
      setSsoState("ready");
      setSsoError(null);
      return;
    }

    let cancelled = false;
    setSsoState("loading");
    setSsoToken(null);
    setSsoError(null);

    void fetchHubbleSsoToken({
      phone,
      name: profileName,
      email: profileEmail,
    }).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setSsoToken(result.token);
        setSsoState("ready");
        setSsoError(null);
        return;
      }
      setSsoToken(null);
      setSsoState("error");
      setSsoError(result.error);
    });

    return () => {
      cancelled = true;
    };
  }, [phone, profileEmail, profileName, sessionKey]);

  const sourceUri = useMemo(() => {
    if (!HUBBLE_IS_CONFIGURED) return "";
    if (phone && ssoState !== "ready") return "";
    return buildHubbleSdkUrl({
      environment: HUBBLE_CONFIG.environment,
      clientId: HUBBLE_CONFIG.clientId,
      appSecret: HUBBLE_CONFIG.appSecret,
      wrapPlt: HUBBLE_WRAP_PLATFORM,
      token: ssoToken ?? undefined,
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
    phone,
    ssoState,
    ssoToken,
  ]);

  const resetSessionFlags = useCallback(() => {
    setSdkReady(false);
    setLoadError(false);
  }, []);

  useEffect(() => {
    if (!HUBBLE_IS_CONFIGURED || !sourceUri) return;
    const id = setTimeout(() => {
      setSdkReady(true);
    }, 12000);
    return () => clearTimeout(id);
  }, [sourceUri, sessionKey]);

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
      } else if (event.type === "analytics" && HUBBLE_CONFIG.analyticsEnabled) {
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
    if (isHubbleSdkNavigationAllowed(url, HUBBLE_CONFIG.environment)) return true;
    void Linking.openURL(url);
    return false;
  }, []);

  const onWebViewError = useCallback(() => {
    setLoadError(true);
    setSdkReady(true);
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
    environment: HUBBLE_CONFIG.environment,
    isConfigured: HUBBLE_IS_CONFIGURED,
    ssoState,
    ssoError,
    sdkReady,
    loadError,
    canGoBack,
    setCanGoBack,
    webViewRef,
    onMessage,
    onShouldStartLoadWithRequest,
    onWebViewError,
    resetSessionFlags,
  };
}
