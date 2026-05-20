import { HUBBLE_IS_CONFIGURED } from "@/constants/hubble";
import { ACCENT } from "@/constants/theme";
import { useHubble } from "@/hooks/useHubble";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

/** Official Hubble RN WebView parameters (for your integration / Hubble support). */
const HUBBLE_RN_DOCS =
  "https://docs.myhubble.money/sdk/platform-guides/react-native";

function normalizeSdkPath(parts: { sdkPath?: string; brandId?: string }) {
  if (parts.brandId) return `buy/${parts.brandId}`;
  const raw = (parts.sdkPath ?? "").trim();
  if (!raw) return "";
  return raw.replace(/^\/+/, "");
}

export function HubbleWebViewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sdkPath?: string;
    category?: string;
    showBackButton?: string;
    amount?: string;
    coupon?: string;
    brandId?: string;
  }>();

  const sdkPath = useMemo(
    () =>
      normalizeSdkPath({
        sdkPath: typeof params.sdkPath === "string" ? params.sdkPath : undefined,
        brandId: typeof params.brandId === "string" ? params.brandId : undefined,
      }),
    [params.brandId, params.sdkPath],
  );

  const extraQuery = useMemo(() => {
    const category = typeof params.category === "string" ? params.category : undefined;
    const showBackButton =
      typeof params.showBackButton === "string" ? params.showBackButton : undefined;
    const amountRaw = typeof params.amount === "string" ? params.amount : undefined;
    const coupon = typeof params.coupon === "string" ? params.coupon : undefined;

    const amount =
      amountRaw && !Number.isNaN(Number(amountRaw)) ? Number(amountRaw) : undefined;

    return {
      category,
      showBackButton: showBackButton === "true" || showBackButton === "1" ? true : undefined,
      amount,
      coupon,
    };
  }, [params.amount, params.category, params.coupon, params.showBackButton]);

  const [reloadNonce, setReloadNonce] = useState(0);
  const [tipsOpen, setTipsOpen] = useState(true);

  const exitStore = useCallback(() => router.back(), [router]);

  const {
    sourceUri,
    webViewRef,
    onMessage,
    onShouldStartLoadWithRequest,
    setCanGoBack,
    resetSessionFlags,
    sdkReady,
    loadError,
  } = useHubble({
    sdkPath,
    extraQuery,
    sessionKey: reloadNonce,
    onCloseRequest: exitStore,
    onHardwareBackExit: exitStore,
  });

  const onRetry = useCallback(() => {
    resetSessionFlags();
    setReloadNonce((n) => n + 1);
  }, [resetSessionFlags]);

  const openDocs = useCallback(() => {
    void Linking.openURL(HUBBLE_RN_DOCS);
  }, []);

  if (!HUBBLE_IS_CONFIGURED || !sourceUri) {
    return (
      <SafeAreaView className="flex-1 bg-white px-5" edges={["top", "left", "right"]}>
        <View className="mt-10 gap-3">
          <Text className="text-2xl font-extrabold text-brand-ink">Gift cards unavailable</Text>
          <Text className="text-sm leading-6 text-gray-600">
            Add the gift card client credentials from your integration pack to your environment, then
            rebuild. For production builds, store secrets in EAS environment variables, not in source
            code.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={exitStore}
          className="mt-8 self-center rounded-full bg-accent px-6 py-3 active:opacity-90"
        >
          <Text className="text-sm font-extrabold text-white">Close</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <View className="relative flex-1 bg-white">
        <View className="border-b border-gray-100 bg-slate-50 px-3 py-2">
          <Pressable
            onPress={() => setTipsOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityState={{ expanded: tipsOpen }}
            className="flex-row items-center justify-between gap-2 py-1.5"
          >
            <View className="flex-1 flex-row items-center gap-2">
              <Ionicons name="information-circle" size={20} color={ACCENT} />
              <Text className="flex-1 text-xs font-semibold leading-4 text-slate-700">
                Seeing “Access Denied” or a Hubble sign-in? Tap for fixes.
              </Text>
            </View>
            <Ionicons
              name={tipsOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#64748b"
            />
          </Pressable>
          {tipsOpen ? (
            <View className="mt-1 gap-2 pb-2">
              <Text className="text-[11px] leading-4 text-slate-600">
                The store runs inside Hubble&apos;s WebView. “Access Denied” usually means your
                gift-card Client ID and App Secret don&apos;t match the environment (dev vs production
                SDK URL), or Hubble must enable <Text className="font-bold">lazy login</Text> for your app
                so browsing works without a separate token. Check the same keys in your Expo production
                profile that you use for store builds.
              </Text>
              <Pressable
                onPress={openDocs}
                accessibilityRole="link"
                accessibilityLabel="Open Hubble React Native documentation"
                className="self-start rounded-lg bg-white px-3 py-2 active:opacity-90"
                style={{
                  borderWidth: 1,
                  borderColor: "rgba(0,74,173,0.2)",
                }}
              >
                <Text className="text-[11px] font-bold text-accent">
                  Open Hubble RN integration guide ↗
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View className="relative flex-1">
        {!sdkReady ? (
          <View className="absolute inset-0 z-10 items-center justify-center bg-white/80">
            <ActivityIndicator size="large" color={ACCENT} />
            <Text className="mt-3 text-xs font-semibold text-gray-600">Loading gift store…</Text>
          </View>
        ) : null}

        {loadError ? (
          <View className="absolute inset-0 z-20 items-center justify-center bg-white px-6">
            <Ionicons name="alert-circle" size={34} color="#b45309" />
            <Text className="mt-3 text-center text-lg font-extrabold text-brand-ink">
              We couldn’t load the gift store
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-gray-600">
              Check your connection and try again. If this continues, contact InstaHelp support.
            </Text>
            <Pressable
              onPress={onRetry}
              className="mt-5 rounded-full bg-accent px-5 py-3 active:opacity-90"
            >
              <Text className="text-sm font-extrabold text-white">Retry</Text>
            </Pressable>
            <Pressable onPress={exitStore} className="mt-4 active:opacity-80">
              <Text className="text-sm font-semibold text-accent">Close</Text>
            </Pressable>
          </View>
        ) : null}

        <WebView
          key={`${sourceUri}-${reloadNonce}`}
          ref={webViewRef}
          source={{ uri: sourceUri }}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          webviewDebuggingEnabled={__DEV__}
          cacheEnabled
          setSupportMultipleWindows
          javaScriptCanOpenWindowsAutomatically
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onMessage={onMessage}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          style={{ flex: 1 }}
        />
        </View>
      </View>
    </SafeAreaView>
  );
}
