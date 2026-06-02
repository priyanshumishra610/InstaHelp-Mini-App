import { useAuth } from "@/providers/AuthProvider";
import { useOnboardingStore } from "@/store/onboardingStore";
import { authStatusToDestination, type AuthDestination } from "@/utils/auth/session";
import { useMemo } from "react";

export function useAuthDestination(): AuthDestination | null {
  const { status, isReady } = useAuth();
  const isGuest = useOnboardingStore((s) => s.isGuest);
  const deferProfile = useOnboardingStore((s) => s.deferProfile);

  return useMemo(() => {
    if (!isReady) return null;
    return authStatusToDestination(status, { isGuest, deferProfile });
  }, [deferProfile, isGuest, isReady, status]);
}
