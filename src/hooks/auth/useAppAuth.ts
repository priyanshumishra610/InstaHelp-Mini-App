import { useAuthSessionStore } from "@/store/authSessionStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { useEffect, useRef, useState } from "react";

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

function parseRealProfilePhone(profilePhone: string | undefined): string | null {
  if (!profilePhone || profilePhone === "guest") return null;
  const digits = profilePhone.replace(/\D/g, "");
  return digits.length >= 10 ? profilePhone : null;
}

/**
 * Signed-in = active phone session only (not inferred from stale profile).
 */
export function useAppAuth() {
  const sessionPhone = useAuthSessionStore((s) => s.phone);
  const isGuest = useOnboardingStore((s) => s.isGuest);

  const sessionReady = useZustandHydrated(useAuthSessionStore);
  const onboardingReady = useZustandHydrated(useOnboardingStore);
  const profileReady = useZustandHydrated(useProfileStore);
  const storesReady = sessionReady && onboardingReady && profileReady;

  const restoredSession = useRef(false);

  /** One-time: recover session phone from persisted profile after reinstall. */
  useEffect(() => {
    if (!storesReady || isGuest || restoredSession.current) return;
    if (useAuthSessionStore.getState().phone) {
      restoredSession.current = true;
      return;
    }

    const profilePhone = parseRealProfilePhone(
      useProfileStore.getState().profile?.phone,
    );
    if (!profilePhone) return;

    useAuthSessionStore.getState().setPhone(profilePhone);
    restoredSession.current = true;
  }, [storesReady, isGuest]);

  const isSignedIn = Boolean(sessionPhone);
  const isAuthenticated = isSignedIn || isGuest;

  return {
    isLoaded: storesReady,
    isSignedIn,
    isGuest,
    isAuthenticated,
    sessionPhone,
  };
}
