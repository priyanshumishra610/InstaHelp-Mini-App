import { AuthNavigationGuard } from "@/components/auth/AuthNavigationGuard";
import { HubbleLinkingBridge } from "@/components/system/HubbleLinkingBridge";
import { AppThemeProvider } from "@/providers/AppThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { ExperienceSyncProvider } from "@/providers/ExperienceSyncProvider";
import { ShopSyncProvider } from "@/providers/ShopSyncProvider";
import { CmsRealtimeProvider } from "@/providers/CmsRealtimeProvider";
import { useAppTheme } from "@/hooks/useAppTheme";
import {
  initializeMobileAds,
  isMobileAdsSupported,
} from "@/services/ads/initializeMobileAds";
import { preloadRewardedInterstitial } from "@/services/ads/rewardedInterstitial";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { InteractionManager, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import "../../global.css";

void SplashScreen.preventAutoHideAsync().catch(() => {});

/** Ensures native splash never sticks after fast refresh on a nested route. */
function NativeSplashFallback() {
  useEffect(() => {
    const t = setTimeout(() => {
      void SplashScreen.hideAsync().catch(() => {});
    }, 3500);
    return () => clearTimeout(t);
  }, []);
  return null;
}

function MobileAdsBootstrap() {
  useEffect(() => {
    if (!isMobileAdsSupported()) return;

    let cancelled = false;
    let deferTimer: ReturnType<typeof setTimeout> | null = null;
    const task = InteractionManager.runAfterInteractions(() => {
      deferTimer = setTimeout(() => {
        if (cancelled) return;
        void (async () => {
          await initializeMobileAds();
          await preloadRewardedInterstitial();
        })();
      }, 2000);
    });

    return () => {
      cancelled = true;
      task.cancel();
      if (deferTimer) clearTimeout(deferTimer);
    };
  }, []);
  return null;
}

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

function RootStack() {
  const { colors, isDark } = useAppTheme();

  const headerOptions = (title: string) => ({
    headerShown: true,
    title,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.canvas },
    headerTintColor: colors.ink,
    headerTitleStyle: { fontWeight: "700" as const, fontSize: 17 },
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }} className="flex-1">
      <NativeSplashFallback />
      <MobileAdsBootstrap />
      <AuthNavigationGuard />
      <HubbleLinkingBridge />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
          headerStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.ink,
          statusBarStyle: isDark ? "light" : "dark",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            animation: "none",
            contentStyle: { backgroundColor: "transparent" },
          }}
        />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="support" options={headerOptions("Help & support")} />
        <Stack.Screen name="tutorial" options={{ animation: "fade" }} />
        <Stack.Screen
          name="request/[slug]"
          options={headerOptions("New request")}
        />
        <Stack.Screen
          name="booking/[id]"
          options={headerOptions("Tracking")}
        />
        <Stack.Screen
          name="booking/simulate/[id]"
          options={headerOptions("Status simulator")}
        />
        <Stack.Screen
          name="booking/reschedule/[id]"
          options={headerOptions("Reschedule")}
        />
        <Stack.Screen
          name="booking/rate/[id]"
          options={headerOptions("Rate booking")}
        />
        <Stack.Screen
          name="booking/receipt/[id]"
          options={headerOptions("Receipt")}
        />
        <Stack.Screen
          name="booking/assigned/[id]"
          options={headerOptions("Assigned")}
        />
        <Stack.Screen
          name="booking/on-the-way/[id]"
          options={headerOptions("On the way")}
        />
        <Stack.Screen
          name="booking/completed/[id]"
          options={headerOptions("Completed")}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryProvider>
          <CmsRealtimeProvider />
          <AuthProvider>
            <ShopSyncProvider deferStart>
              <ExperienceSyncProvider deferStart>
                <AppThemeProvider>
                  <RootStack />
                </AppThemeProvider>
              </ExperienceSyncProvider>
            </ShopSyncProvider>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
