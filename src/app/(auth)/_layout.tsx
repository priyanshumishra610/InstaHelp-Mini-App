import { AuthLoadingSkeleton } from "@/components/auth/AuthLoadingSkeleton";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuth } from "@/providers/AuthProvider";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isReady } = useAuth();
  const destination = useAuthDestination();

  useEffect(() => {
    if (!isReady || !destination) return;
    const leaf = segments[segments.length - 1];
    if (!leaf) return;

    if (destination === "/(tabs)") {
      router.replace("/(tabs)");
      return;
    }

    const targetLeaf = destination.replace("/(auth)/", "");
    if (leaf !== targetLeaf && destination.startsWith("/(auth)/")) {
      router.replace(destination);
    }
  }, [destination, isReady, router, segments]);

  if (!isReady) {
    return <AuthLoadingSkeleton />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0A0A1A" },
      }}
    >
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
