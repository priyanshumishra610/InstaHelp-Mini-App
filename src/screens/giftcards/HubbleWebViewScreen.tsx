import { ACCENT } from "@/constants/theme";
import { useHubble } from "@/hooks/useHubble";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

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
    isConfigured,
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

  if (!isConfigured || !sourceUri) {
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
          cacheEnabled={false}
          incognito
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
