import { AuthNavigationGuard } from "@/components/auth/AuthNavigationGuard";
import { HubbleLinkingBridge } from "@/components/system/HubbleLinkingBridge";
import { AuthProvider } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import "../../global.css";

void SplashScreen.preventAutoHideAsync().catch(() => {});

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

const SURFACE = "#0A0A1A";
const HEADER_TINT = "#171717";

const headerOptions = (title: string) => ({
  headerShown: true,
  title,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: SURFACE },
  headerTintColor: HEADER_TINT,
  headerTitleStyle: { fontWeight: "700" as const, fontSize: 17 },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider value={DefaultTheme}>
            <View style={{ flex: 1, backgroundColor: SURFACE }} className="flex-1">
              <StatusBar style="dark" />
              <AuthNavigationGuard />
              <HubbleLinkingBridge />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: SURFACE },
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="support"
                  options={headerOptions("Help & support")}
                />
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
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
