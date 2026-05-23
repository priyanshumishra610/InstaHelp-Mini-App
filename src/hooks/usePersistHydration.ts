import { useAuth } from "@/providers/AuthProvider";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useEffect, useState } from "react";

/** App routing waits for Firebase auth restore + persisted guest flag hydration. */
export function useAuthHydration(): boolean {
  const { isReady } = useAuth();
  const [onboardingHydrated, setOnboardingHydrated] = useState(() =>
    useOnboardingStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (useOnboardingStore.persist.hasHydrated()) {
      setOnboardingHydrated(true);
    }
    return useOnboardingStore.persist.onFinishHydration(() => {
      setOnboardingHydrated(true);
    });
  }, []);

  return isReady && onboardingHydrated;
}
