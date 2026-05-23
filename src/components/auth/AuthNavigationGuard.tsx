import { useAppAuth } from "@/hooks/auth/useAppAuth";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";

const PROTECTED_ROOTS = new Set(["(tabs)", "booking", "request"]);

/**
 * Redirects unauthenticated or partially onboarded users away from protected routes.
 */
export function AuthNavigationGuard() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoaded } = useAppAuth();
  const destination = useAuthDestination();
  const lastReplace = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !destination) return;

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

    if (destination === "/(auth)/phone" && root !== "(auth)") {
      const target = "/(auth)/phone";
      if (lastReplace.current === target) return;
      lastReplace.current = target;
      router.replace(target);
    }
  }, [destination, isLoaded, router, segments]);

  return null;
}
