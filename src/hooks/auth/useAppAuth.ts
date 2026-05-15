import { useOnboardingStore } from "@/store/onboardingStore";
import { useAuth } from "@clerk/expo";

/** Clerk session or local guest mode. */
export function useAppAuth() {
  const { isLoaded, isSignedIn } = useAuth();
  const isGuest = useOnboardingStore((s) => s.isGuest);

  const isAuthenticated = Boolean(isSignedIn || isGuest);

  return {
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    isGuest,
    isAuthenticated,
  };
}
