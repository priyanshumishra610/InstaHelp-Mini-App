import { getFirebaseAuth } from "@/firebase/auth";
import { isFirebaseConfigured } from "@/firebase/config";

/** Active signed-in phone from Firebase Auth session. */
export function getAuthPhone(): string | null {
  if (!isFirebaseConfigured()) return null;
  try {
    return getFirebaseAuth().currentUser?.phoneNumber ?? null;
  } catch {
    return null;
  }
}
