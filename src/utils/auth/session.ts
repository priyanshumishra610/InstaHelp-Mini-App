import { useAuthSessionStore } from "@/store/authSessionStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import type { UserProfile } from "@/types/user";

const PLACEHOLDER_LINE = "Add your home address in Profile";

export function hasProfileName(profile: UserProfile | null | undefined): boolean {
  return Boolean(profile?.name?.trim());
}

export function hasProfileLocation(profile: UserProfile | null | undefined): boolean {
  if (!profile?.addresses?.length) return false;
  return profile.addresses.some(
    (a) => Boolean(a.line?.trim()) && !a.line.includes(PLACEHOLDER_LINE),
  );
}

export function isOnboardingComplete(profile: UserProfile | null | undefined): boolean {
  return hasProfileName(profile) && hasProfileLocation(profile);
}

export type AuthDestination =
  | "/(auth)/phone"
  | "/(auth)/name"
  | "/(auth)/location"
  | "/(tabs)";

export function resolveAuthDestination(input: {
  isSignedIn: boolean;
  isGuest: boolean;
  profile: UserProfile | null | undefined;
}): AuthDestination {
  const { isSignedIn, isGuest, profile } = input;
  if (!isSignedIn && !isGuest) return "/(auth)/phone";
  if (!hasProfileName(profile)) return "/(auth)/name";
  if (!hasProfileLocation(profile)) return "/(auth)/location";
  return "/(tabs)";
}

/** Browse without signing in; ensures profile is sufficient to reach tabs. */
export function activateGuestSession(): AuthDestination {
  useAuthSessionStore.getState().clearSession();
  useOnboardingStore.getState().enterGuestMode();

  const { profile, setProfile } = useProfileStore.getState();
  const merged: UserProfile = {
    phone: "guest",
    name: profile?.name?.trim() || "Guest",
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
