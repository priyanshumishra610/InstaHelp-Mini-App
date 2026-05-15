import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { useAuth, useClerk } from "@clerk/expo";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useSignOut() {
  const { signOut: clerkSignOut } = useClerk();
  const { isSignedIn } = useAuth();
  const clearGuest = useOnboardingStore((s) => s.clearGuest);
  const setProfile = useProfileStore((s) => s.setProfile);
  const queryClient = useQueryClient();

  return useCallback(async () => {
    clearGuest();
    setProfile(null);
    queryClient.clear();
    if (isSignedIn) {
      await clerkSignOut();
    }
  }, [clearGuest, clerkSignOut, isSignedIn, queryClient, setProfile]);
}
