import { AuthLoadingSkeleton } from "@/components/auth/AuthLoadingSkeleton";
import { useAppAuth } from "@/hooks/auth/useAppAuth";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function AuthLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoaded } = useAppAuth();
  const destination = useAuthDestination();

  useEffect(() => {
    if (!isLoaded || !destination) return;
    if (!segments.length) return;
    if (destination === "/(tabs)") {
      router.replace("/(tabs)");
    }
  }, [destination, isLoaded, router, segments.length]);

  if (!isLoaded) {
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
      <Stack.Screen name="location" />
    </Stack>
  );
}
