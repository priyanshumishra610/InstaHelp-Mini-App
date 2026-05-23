import { FIREBASE_CONFIG, getFirebaseApp, isFirebaseConfigured } from "@/firebase/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  type ApplicationVerifier,
  type Auth,
  type ConfirmationResult,
  type User,
  getAuth,
  initializeAuth,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
} from "firebase/auth";

let authInstance: Auth | null = null;

function getReactNativePersistence(): import("firebase/auth").Persistence {
  // Metro resolves the React Native auth bundle in Expo.
  const rn = require("@firebase/auth/dist/rn/index.js") as {
    getReactNativePersistence: (
      storage: typeof AsyncStorage,
    ) => import("firebase/auth").Persistence;
  };
  return rn.getReactNativePersistence(AsyncStorage);
}

export function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* to .env");
  }
  if (!authInstance) {
    const app = getFirebaseApp();
    try {
      authInstance = initializeAuth(app, {
        persistence: getReactNativePersistence(),
      });
    } catch {
      authInstance = getAuth(app);
    }
  }
  return authInstance;
}

export function toE164IndianPhone(digits10: string): string {
  const digits = digits10.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    throw new Error("Enter a valid 10-digit mobile number");
  }
  return `+91${digits}`;
}

export async function sendPhoneOtp(
  digits10: string,
  applicationVerifier: ApplicationVerifier,
): Promise<ConfirmationResult> {
  const phone = toE164IndianPhone(digits10);
  return signInWithPhoneNumber(getFirebaseAuth(), phone, applicationVerifier);
}

export async function verifyPhoneOtp(
  confirmation: ConfirmationResult,
  code: string,
): Promise<User> {
  const trimmed = code.replace(/\D/g, "");
  if (trimmed.length !== 6) {
    throw new Error("Enter the 6-digit OTP");
  }
  const result = await confirmation.confirm(trimmed);
  return result.user;
}

export async function signOutFirebase(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export { FIREBASE_CONFIG };
