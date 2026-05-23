import { useAuthSessionStore } from "@/store/authSessionStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useSignOut() {
  const clearGuest = useOnboardingStore((s) => s.clearGuest);
  const clearSession = useAuthSessionStore((s) => s.clearSession);
  const setProfile = useProfileStore((s) => s.setProfile);
  const queryClient = useQueryClient();

  return useCallback(async () => {
    clearGuest();
    clearSession();
    setProfile(null);
    queryClient.clear();

    try {
      useAuthSessionStore.persist.clearStorage();
      useProfileStore.persist.clearStorage();
      useOnboardingStore.persist.clearStorage();
    } catch {
      // Best-effort — in-memory session is already cleared.
    }
  }, [clearGuest, clearSession, queryClient, setProfile]);
}
