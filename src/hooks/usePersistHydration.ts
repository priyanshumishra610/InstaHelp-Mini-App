import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

/** Wait for persisted auth to rehydrate before trusting `isAuthenticated`. */
export function useAuthHydration() {
  const [ready, setReady] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    try {
      setReady(useAuthStore.persist.hasHydrated());
      const unsub = useAuthStore.persist.onFinishHydration(() => setReady(true));
      return () => {
        if (typeof unsub === "function") unsub();
      };
    } catch {
      setReady(true);
    }
  }, []);

  return ready;
}
