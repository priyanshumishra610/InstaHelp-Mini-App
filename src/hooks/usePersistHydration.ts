import { useAuthSessionStore } from "@/store/authSessionStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { useEffect, useState } from "react";

function useZustandHydrated(store: {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
}) {
  const [ready, setReady] = useState(() => store.persist.hasHydrated());

  useEffect(() => {
    setReady(store.persist.hasHydrated());
    const unsub = store.persist.onFinishHydration(() => setReady(true));
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [store]);

  return ready;
}

/** Wait for persisted auth, onboarding, and profile before routing. */
export function useAuthHydration() {
  const sessionReady = useZustandHydrated(useAuthSessionStore);
  const onboardingReady = useZustandHydrated(useOnboardingStore);
  const profileReady = useZustandHydrated(useProfileStore);
  return sessionReady && onboardingReady && profileReady;
}
