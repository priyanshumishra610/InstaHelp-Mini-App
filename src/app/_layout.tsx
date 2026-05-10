import { QueryProvider } from "@/providers/QueryProvider";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import "../../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  const navTheme = dark ? DarkTheme : DefaultTheme;

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider value={navTheme}>
          <View style={{ flex: 1 }} className={`flex-1 ${dark ? "dark" : ""}`}>
            <StatusBar style={dark ? "light" : "dark"} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: dark ? "#0B0B0C" : "#FAFAF7",
                },
              }}
            >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="request/[slug]"
              options={{
                headerShown: true,
                title: "New request",
                headerShadowVisible: false,
                headerStyle: { backgroundColor: dark ? "#0B0B0C" : "#FAFAF7" },
                headerTintColor: dark ? "#fafaf9" : "#171717",
                headerTitleStyle: { fontWeight: "700", fontSize: 17 },
              }}
            />
            <Stack.Screen
              name="booking/[id]"
              options={{
                headerShown: true,
                title: "Tracking",
                headerShadowVisible: false,
                headerStyle: { backgroundColor: dark ? "#0B0B0C" : "#FAFAF7" },
                headerTintColor: dark ? "#fafaf9" : "#171717",
                headerTitleStyle: { fontWeight: "700", fontSize: 17 },
              }}
            />
            </Stack>
          </View>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
