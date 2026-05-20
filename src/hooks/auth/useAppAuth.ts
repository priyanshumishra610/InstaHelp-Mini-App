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

/**
 * Phone session (Google Sheet) or local guest mode.
 * `isSignedIn` is true if we have a stored session phone OR a persisted profile phone
 * (recovers installs where profile rehydrates but auth session lagged).
 */
export function useAppAuth() {
  const sessionPhone = useAuthSessionStore((s) => s.phone);
  const profilePhone = useProfileStore((s) => s.profile?.phone);
  const isGuest = useOnboardingStore((s) => s.isGuest);

  const sessionReady = useZustandHydrated(useAuthSessionStore);
  const onboardingReady = useZustandHydrated(useOnboardingStore);
  const profileReady = useZustandHydrated(useProfileStore);
  const storesReady = sessionReady && onboardingReady && profileReady;

  const realProfilePhone =
    profilePhone &&
    profilePhone !== "guest" &&
    /\d/.test(profilePhone.replace(/\D/g, ""))
      ? profilePhone
      : null;

  const isSignedIn =
    Boolean(sessionPhone) ||
    Boolean(!isGuest && realProfilePhone);

  useEffect(() => {
    if (!storesReady || isGuest || !realProfilePhone) return;
    if (!useAuthSessionStore.getState().phone) {
      useAuthSessionStore.getState().setPhone(realProfilePhone);
    }
  }, [storesReady, isGuest, realProfilePhone]);

  const isAuthenticated = isSignedIn || isGuest;

  return {
    /** Wait for persisted session + profile + onboarding before auth routing. */
    isLoaded: storesReady,
    isSignedIn,
    isGuest,
    isAuthenticated,
    sessionPhone: sessionPhone ?? (!isGuest ? realProfilePhone : null),
  };
}
