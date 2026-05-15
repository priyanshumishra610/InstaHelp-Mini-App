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
