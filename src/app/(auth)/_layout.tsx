import { useAuthStore } from "@/store/authStore";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const scheme = useColorScheme();
  const dark = scheme === "dark";

  useEffect(() => {
    if (!segments.length) return;
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, router, segments.length]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: dark ? "#0B0B0C" : "#FAFAF7" },
      }}
    >
      <Stack.Screen name="phone" />
    </Stack>
  );
}
