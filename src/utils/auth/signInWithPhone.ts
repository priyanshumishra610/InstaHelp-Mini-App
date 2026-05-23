import { apiGetUserProfile } from "@/api/appsScriptClient";
import { APPS_SCRIPT_URL } from "@/config/env";
import { useAuthSessionStore } from "@/store/authSessionStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { ensureProfile, useProfileStore } from "@/store/profileStore";
import { toE164Phone } from "@/utils/auth/phone";
import {
  resolveAuthDestination,
  resolveProfileDisplayName,
  type AuthDestination,
} from "@/utils/auth/session";

export type SignInResult =
  | { ok: true; destination: AuthDestination }
  | { ok: false; error: string };

/** Sign in with phone — profile loaded from Google Sheet via Apps Script. */
export async function signInWithPhone(rawPhone: string): Promise<SignInResult> {
  const phone = toE164Phone(rawPhone);
  if (!phone || phone.length < 11) {
    return { ok: false, error: "Enter a valid 10-digit mobile number" };
  }

  useOnboardingStore.getState().clearGuest();

  if (APPS_SCRIPT_URL) {
    const res = await apiGetUserProfile(phone);
    if (!res.ok) {
      return {
        ok: false,
        error: res.error || "Could not reach InstaHelp servers. Try again.",
      };
    }
    const prev = useProfileStore.getState().profile;
    const sheetPhone = res.data.phone || phone;
    const samePhone = prev?.phone === sheetPhone;
    useProfileStore.getState().setProfile({
      phone: sheetPhone,
      name:
        res.data.name?.trim() ||
        (samePhone ? prev?.name?.trim() : undefined) ||
        resolveProfileDisplayName(prev, sheetPhone),
      addresses: res.data.addresses?.length
        ? res.data.addresses
        : prev?.addresses?.length
          ? prev.addresses
          : [
              {
                id: "home",
                label: "Home",
                line: "Add your home address in Profile",
              },
            ],
      favorites: res.data.favorites ?? prev?.favorites ?? [],
      avatarUri: samePhone ? prev?.avatarUri : undefined,
      role: res.data.role ?? (samePhone ? prev?.role : undefined),
      preferredContact:
        res.data.preferredContact ??
        (samePhone ? prev?.preferredContact : undefined),
    });
  } else {
    ensureProfile(phone);
  }

  useAuthSessionStore.getState().setPhone(phone);

  const profile = useProfileStore.getState().profile;
  return {
    ok: true,
    destination: resolveAuthDestination({
      isSignedIn: true,
      isGuest: false,
      profile,
    }),
  };
}
