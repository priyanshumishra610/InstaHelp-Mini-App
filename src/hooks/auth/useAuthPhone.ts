import { useAuthSessionStore } from "@/store/authSessionStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";

/** Primary phone for API calls — session, profile, or guest placeholder. */
export function useAuthPhone(): string | null {
  const sessionPhone = useAuthSessionStore((s) => s.phone);
  const profilePhone = useProfileStore((s) => s.profile?.phone);
  const isGuest = useOnboardingStore((s) => s.isGuest);

  if (sessionPhone) return sessionPhone;
  if (profilePhone && profilePhone !== "guest") return profilePhone;
  if (isGuest) return "guest";
  return null;
}
