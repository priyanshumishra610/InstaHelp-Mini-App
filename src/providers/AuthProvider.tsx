import { isFirebaseConfigured } from "@/firebase/config";
import { sendPhoneOtp, signOutFirebase, verifyPhoneOtp } from "@/firebase/auth";
import {
  createUserDocument,
  fetchUserDocument,
  syncFirestoreUserToLocalProfile,
} from "@/firebase/users";
import { useAuthUiStore } from "@/stores/authUiStore";
import type { FirestoreUser } from "@/types/firestoreUser";
import { isProfileComplete } from "@/types/firestoreUser";
import { mapFirebaseAuthError } from "@/utils/auth/firebaseErrors";
import type { ApplicationVerifier } from "firebase/auth";
import type { ConfirmationResult, User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

import { getFirebaseAuth } from "@/firebase/auth";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";

export type AuthStatus =
  | "loading"
  | "unauthenticated"
  | "needs-profile"
  | "authenticated";

type AuthContextValue = {
  status: AuthStatus;
  isReady: boolean;
  firebaseUser: User | null;
  firestoreUser: FirestoreUser | null;
  sendOtp: (
    digits10: string,
    verifier: ApplicationVerifier,
  ) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshFirestoreUser: () => Promise<FirestoreUser | null>;
  getConfirmation: () => ConfirmationResult | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  const applyUserState = useCallback(async (user: User | null) => {
    if (!user) {
      setFirebaseUser(null);
      setFirestoreUser(null);
      useProfileStore.getState().setProfile(null);
      setStatus("unauthenticated");
      return;
    }

    useOnboardingStore.getState().clearGuest();

    setFirebaseUser(user);
    let doc = await fetchUserDocument(user.uid);
    if (!doc) {
      const phone = user.phoneNumber ?? "";
      doc = await createUserDocument(user.uid, phone);
    }
    setFirestoreUser(doc);
    syncFirestoreUserToLocalProfile(doc);
    setStatus(isProfileComplete(doc) ? "authenticated" : "needs-profile");
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setStatus("unauthenticated");
      setIsReady(true);
      return;
    }

    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          await applyUserState(user);
        } finally {
          setIsReady(true);
        }
      },
      () => {
        setStatus("unauthenticated");
        setIsReady(true);
      },
    );

    return unsub;
  }, [applyUserState]);

  const sendOtp = useCallback(
    async (digits10: string, verifier: ApplicationVerifier) => {
      const confirmation = await sendPhoneOtp(digits10, verifier);
      confirmationRef.current = confirmation;
      useAuthUiStore.getState().setPendingPhoneDigits(digits10.replace(/\D/g, "").slice(0, 10));
    },
    [],
  );

  const verifyOtp = useCallback(
    async (code: string) => {
      const confirmation = confirmationRef.current;
      if (!confirmation) {
        throw new Error("Request OTP first");
      }
      try {
        const user = await verifyPhoneOtp(confirmation, code);
        confirmationRef.current = null;
        const phone = user.phoneNumber ?? "";
        const doc = await createUserDocument(user.uid, phone);
        setFirestoreUser(doc);
        syncFirestoreUserToLocalProfile(doc);
        setFirebaseUser(user);
        setStatus(isProfileComplete(doc) ? "authenticated" : "needs-profile");
      } catch (error) {
        throw new Error(mapFirebaseAuthError(error));
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    confirmationRef.current = null;
    useAuthUiStore.getState().resetOtpUi();
    await signOutFirebase();
    useOnboardingStore.getState().clearGuest();
    useProfileStore.getState().setProfile(null);
    setFirebaseUser(null);
    setFirestoreUser(null);
    setStatus("unauthenticated");
  }, []);

  const refreshFirestoreUser = useCallback(async () => {
    if (!firebaseUser) return null;
    const doc = await fetchUserDocument(firebaseUser.uid);
    if (doc) {
      setFirestoreUser(doc);
      syncFirestoreUserToLocalProfile(doc);
      setStatus(isProfileComplete(doc) ? "authenticated" : "needs-profile");
    }
    return doc;
  }, [firebaseUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isReady,
      firebaseUser,
      firestoreUser,
      sendOtp,
      verifyOtp,
      signOut,
      refreshFirestoreUser,
      getConfirmation: () => confirmationRef.current,
    }),
    [
      firestoreUser,
      firebaseUser,
      isReady,
      refreshFirestoreUser,
      sendOtp,
      signOut,
      status,
      verifyOtp,
    ],
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
