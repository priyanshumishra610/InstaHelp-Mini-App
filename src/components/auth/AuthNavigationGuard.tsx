import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";

const PROTECTED_ROOTS = new Set(["(tabs)", "booking", "request"]);

/**
 * Redirects based on Firebase auth state (phone → OTP → profile → home).
 */
export function AuthNavigationGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { isReady } = useAuth();
  const destination = useAuthDestination();
  const lastReplace = useRef<string | null>(null);

  useEffect(() => {
    if (!isReady || !destination) return;

    const root = segments[0];
    if (!root) return;

    const isProtected = PROTECTED_ROOTS.has(root);
    const isAuthGroup = root === "(auth)";

    if (isProtected && destination !== "/(tabs)") {
      const target = destination;
      if (lastReplace.current === target) return;
      lastReplace.current = target;
      router.replace(target);
      return;
    }

    if (isAuthGroup && destination === "/(tabs)") {
      const target = "/(tabs)";
      if (lastReplace.current === target) return;
      lastReplace.current = target;
      router.replace(target);
      return;
    }

    if (destination.startsWith("/(auth)/") && root !== "(auth)") {
      const target = destination;
      if (lastReplace.current === target) return;
      lastReplace.current = target;
      router.replace(target);
    }
  }, [destination, isReady, router, segments]);

  return null;
}
