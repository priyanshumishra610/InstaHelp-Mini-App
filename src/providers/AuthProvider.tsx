import { apiRegisterPhone } from "@/api/appsScriptClient";
import { APPS_SCRIPT_URL } from "@/api/env";
import { USE_FIREBASE_AUTH } from "@/constants/authBackend";
import { refreshProfile } from "@/services/profileService";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { useSheetAuthStore } from "@/store/sheetAuthStore";
import type { FirestoreUser } from "@/types/firestoreUser";
import { isSheetProfileComplete } from "@/utils/auth/profileComplete";
import { toE164IndianPhone } from "@/utils/auth/phoneFormat";
import type { User } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

/* Firebase Auth (disabled — kept for reference)
import { isFirebaseConfigured } from "@/firebase/config";
import { sendPhoneOtp, signOutFirebase, verifyPhoneOtp } from "@/firebase/auth";
import {
  createUserDocument,
  fetchUserDocument,
  syncFirestoreUserToLocalProfile,
} from "@/firebase/users";
import { useAuthUiStore } from "@/stores/authUiStore";
import { isProfileComplete } from "@/types/firestoreUser";
import { mapFirebaseAuthError } from "@/utils/auth/firebaseErrors";
import type { ApplicationVerifier, ConfirmationResult } from "firebase/auth";
import { onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirebaseAuth } from "@/firebase/auth";
*/

export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "needs-profile"
  | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  isReady: boolean;
  /** Always null when Firebase auth is disabled. */
  firebaseUser: User | null;
  /** Always null when Firebase auth is disabled. */
  firestoreUser: FirestoreUser | null;
  /** Sign in with 10-digit mobile; stores phone + row in the backend. */
  signInWithPhone: (digits10: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-read profile from the backend and update auth status. */
  refreshSession: () => Promise<void>;
  /** Legacy stubs (Firebase auth disabled). */
  sendOtp: (_digits10: string, _verifier: unknown) => Promise<void>;
  verifyOtp: (_code: string) => Promise<void>;
  refreshFirestoreUser: () => Promise<FirestoreUser | null>;
  getConfirmation: () => null;
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

    if (USE_FIREBASE_AUTH) {
      setStatus("unauthenticated");
      setIsReady(true);
      return;
    }

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

  const disabledFirebase = useCallback(async () => {
    throw new Error("Firebase auth is disabled. Use phone sign-in with the backend.");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isReady,
      firebaseUser: null,
      firestoreUser: null,
      signInWithPhone,
      signOut,
      refreshSession,
      sendOtp: disabledFirebase,
      verifyOtp: disabledFirebase,
      refreshFirestoreUser: async () => null,
      getConfirmation: () => null,
    }),
    [disabledFirebase, isReady, refreshSession, signInWithPhone, signOut, status],
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
