import { useAuth } from "@/providers/AuthProvider";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSheetAuthStore } from "@/store/sheetAuthStore";
import { useEffect, useState } from "react";

/** App routing waits for auth + persisted onboarding/auth phone hydration. */
export function useAuthHydration(): boolean {
  const { isReady } = useAuth();
  const [onboardingHydrated, setOnboardingHydrated] = useState(() =>
    useOnboardingStore.persist.hasHydrated(),
  );
  const [sheetAuthHydrated, setSheetAuthHydrated] = useState(() =>
    useSheetAuthStore.persist.hasHydrated(),
  );

  useEffect(() => {
    if (useOnboardingStore.persist.hasHydrated()) {
      setOnboardingHydrated(true);
    }
    return useOnboardingStore.persist.onFinishHydration(() => {
      setOnboardingHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (useSheetAuthStore.persist.hasHydrated()) {
      setSheetAuthHydrated(true);
    }
    return useSheetAuthStore.persist.onFinishHydration(() => {
      setSheetAuthHydrated(true);
    });
  }, []);

  return isReady && onboardingHydrated && sheetAuthHydrated;
}
