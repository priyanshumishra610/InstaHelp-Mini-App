import { apiRegisterPhone } from "@/api/appsScriptClient";
import { APPS_SCRIPT_URL } from "@/api/env";
import { refreshProfile } from "@/services/profileService";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { useSheetAuthStore } from "@/store/sheetAuthStore";
import { isSheetProfileComplete } from "@/utils/auth/profileComplete";
import { toE164IndianPhone } from "@/utils/auth/phoneFormat";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "needs-profile"
  | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  isReady: boolean;
  /** Sign in with 10-digit mobile; stores phone + row in the backend. */
  signInWithPhone: (digits10: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-read profile from the backend and update auth status. */
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applyStatusFromProfile() {
  const deferProfile = useOnboardingStore.getState().deferProfile;
  const profile = useProfileStore.getState().profile;
  const phone = useSheetAuthStore.getState().phone;
  if (!phone) {
    return "unauthenticated" as const;
  }
  const complete = isSheetProfileComplete(profile);
  if (complete) useOnboardingStore.getState().setDeferProfile(false);
  if (!complete && !deferProfile) return "needs-profile" as const;
  if (!complete && deferProfile) return "authenticated" as const;
  return "authenticated" as const;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [isReady, setIsReady] = useState(false);
  const sheetPhone = useSheetAuthStore((s) => s.phone);

  const refreshSession = useCallback(async () => {
    const phone = useSheetAuthStore.getState().phone;
    if (!phone) {
      setStatus("unauthenticated");
      return;
    }
    if (APPS_SCRIPT_URL) {
      await refreshProfile();
    } else {
      useProfileStore.getState().setProfile({
        phone,
        addresses: [],
        favorites: [],
      });
    }
    setStatus(applyStatusFromProfile());
  }, []);

  useEffect(() => {
    let cancelled = false;

    const phone = useSheetAuthStore.getState().phone;
    if (!phone) {
      setStatus("unauthenticated");
      setIsReady(true);
      return;
    }

    // Never block app entry on network — use cached profile, refresh in background.
    setStatus(applyStatusFromProfile());
    setIsReady(true);

    void (async () => {
      try {
        await refreshSession();
      } catch {
        // Offline / slow Apps Script — keep cached session.
      } finally {
        if (!cancelled) setStatus(applyStatusFromProfile());
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshSession, sheetPhone]);

  const signInWithPhone = useCallback(
    async (digits10: string) => {
      const phone = toE164IndianPhone(digits10);
      useOnboardingStore.getState().clearGuest();

      if (!APPS_SCRIPT_URL) {
        throw new Error("Missing EXPO_PUBLIC_APPS_SCRIPT_URL in .env");
      }

      const res = await apiRegisterPhone(phone);
      if (!res.ok) {
        throw new Error(res.error);
      }

      useSheetAuthStore.getState().setPhone(phone);
      useProfileStore.getState().setProfile({
        ...res.data,
        phone,
      });

      // Fresh login: show profile setup once when incomplete; Skip persists via defer.
      const complete = isSheetProfileComplete(res.data);
      useOnboardingStore.getState().setDeferProfile(false);
      setStatus(complete ? "authenticated" : "needs-profile");
    },
    [],
  );

  const signOut = useCallback(async () => {
    useSheetAuthStore.getState().clearPhone();
    useOnboardingStore.getState().clearGuest();
    useOnboardingStore.getState().setDeferProfile(false);
    useProfileStore.getState().setProfile(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isReady,
      signInWithPhone,
      signOut,
      refreshSession,
    }),
    [isReady, refreshSession, signInWithPhone, signOut, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
