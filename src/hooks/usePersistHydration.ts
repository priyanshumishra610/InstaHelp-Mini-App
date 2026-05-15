import { useAppAuth } from "@/hooks/auth/useAppAuth";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useEffect, useState } from "react";

/** Wait for Clerk session restore and onboarding persist before routing. */
export function useAuthHydration() {
  const { isLoaded: clerkLoaded } = useAppAuth();
  const [onboardingReady, setOnboardingReady] = useState(() =>
    useOnboardingStore.persist.hasHydrated(),
  );

  useEffect(() => {
    try {
      setOnboardingReady(useOnboardingStore.persist.hasHydrated());
      const unsub = useOnboardingStore.persist.onFinishHydration(() =>
        setOnboardingReady(true),
      );
      return () => {
        if (typeof unsub === "function") unsub();
      };
    } catch {
      setOnboardingReady(true);
    }
  }, []);

  return clerkLoaded && onboardingReady;
}
