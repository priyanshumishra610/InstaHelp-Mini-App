import { useAppAuth } from "@/hooks/auth/useAppAuth";
import { useProfileStore } from "@/store/profileStore";
import {
  resolveAuthDestination,
  type AuthDestination,
} from "@/utils/auth/session";
import { useMemo } from "react";

export function useAuthDestination(): AuthDestination | null {
  const { isLoaded, isSignedIn, isGuest } = useAppAuth();
  const profile = useProfileStore((s) => s.profile);

  return useMemo(() => {
    if (!isLoaded) return null;
    return resolveAuthDestination({
      isSignedIn,
      isGuest,
      profile,
    });
  }, [isGuest, isLoaded, isSignedIn, profile]);
}
