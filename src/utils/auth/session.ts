import { useAuthSessionStore } from "@/store/authSessionStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import type { UserProfile } from "@/types/user";

const PLACEHOLDER_LINE = "Add your home address in Profile";

export function hasProfileLocation(profile: UserProfile | null | undefined): boolean {
  if (!profile?.addresses?.length) return false;
  return profile.addresses.some(
    (a) => Boolean(a.line?.trim()) && !a.line.includes(PLACEHOLDER_LINE),
  );
}

/** Fallback when no name is set — name is collected on Profile, not onboarding. */
export function resolveProfileDisplayName(
  profile: UserProfile | null | undefined,
  phone?: string,
): string {
  const trimmed = profile?.name?.trim();
  if (trimmed) return trimmed;
  const digits = (phone ?? profile?.phone ?? "").replace(/\D/g, "");
  if (digits.length >= 4) return `User ····${digits.slice(-4)}`;
  return "Guest";
}

export function isOnboardingComplete(profile: UserProfile | null | undefined): boolean {
  return hasProfileLocation(profile);
}

export type AuthDestination = "/(auth)/phone" | "/(tabs)";

export function resolveAuthDestination(input: {
  isSignedIn: boolean;
  isGuest: boolean;
  profile: UserProfile | null | undefined;
}): AuthDestination {
  const { isSignedIn, isGuest } = input;
  if (!isSignedIn && !isGuest) return "/(auth)/phone";
  return "/(tabs)";
}

/** Browse without signing in; ensures profile is sufficient to reach tabs. */
export function activateGuestSession(): AuthDestination {
  useAuthSessionStore.getState().clearSession();
  useOnboardingStore.getState().enterGuestMode();

  const { profile, setProfile } = useProfileStore.getState();
  const merged: UserProfile = {
    phone: "guest",
    name: resolveProfileDisplayName(profile, "guest"),
    addresses:
      profile && hasProfileLocation(profile)
        ? profile.addresses
        : [
            {
              id: "guest-home",
              label: "Home",
              line: "Set your area in Profile",
            },
          ],
    favorites: profile?.favorites ?? [],
    avatarUri: profile?.avatarUri,
    role: profile?.role,
    preferredContact: profile?.preferredContact,
  };

  setProfile(merged);

  return resolveAuthDestination({
    isSignedIn: false,
    isGuest: true,
    profile: merged,
  });
}
