import type { AuthStatus } from "@/providers/AuthProvider";
import type { UserProfile } from "@/types/user";

export function resolveProfileDisplayName(
  profile: UserProfile | null | undefined,
  phone?: string,
): string {
  const trimmed = profile?.name?.trim();
  if (trimmed) return trimmed;
  const digits = (phone ?? profile?.phone ?? "").replace(/\D/g, "");
  if (digits.length >= 4) return `User ····${digits.slice(-4)}`;
  return "User";
}

export type AuthDestination =
  | "/(auth)/phone"
  | "/(auth)/otp"
  | "/(auth)/profile"
  | "/(tabs)";

export type AuthRoutingOptions = {
  /** Persisted browsing session without phone sign-in (Skip on login screen). */
  isGuest?: boolean;
};

export function authStatusToDestination(
  status: AuthStatus,
  options?: AuthRoutingOptions,
): AuthDestination | null {
  const isGuest = options?.isGuest ?? false;
  switch (status) {
    case "loading":
      return null;
    case "unauthenticated":
      return isGuest ? "/(tabs)" : "/(auth)/phone";
    case "needs-profile":
      return "/(auth)/profile";
    case "authenticated":
      return "/(tabs)";
    default:
      return "/(auth)/phone";
  }
}
