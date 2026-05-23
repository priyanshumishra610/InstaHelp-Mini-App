import { useAuth } from "@/providers/AuthProvider";
import { useOnboardingStore } from "@/store/onboardingStore";
import { authStatusToDestination, type AuthDestination } from "@/utils/auth/session";
import { useMemo } from "react";

export function useAuthDestination(): AuthDestination | null {
  const { status, isReady } = useAuth();
  const isGuest = useOnboardingStore((s) => s.isGuest);

  return useMemo(() => {
    if (!isReady) return null;
    return authStatusToDestination(status, { isGuest });
  }, [isGuest, isReady, status]);
}
