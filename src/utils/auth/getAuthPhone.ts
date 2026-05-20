import { useAuthSessionStore } from "@/store/authSessionStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";

/** Sync phone for services (session, profile store; guest uses placeholder). */
export function getAuthPhone(): string | null {
  const sessionPhone = useAuthSessionStore.getState().phone;
  if (sessionPhone) return sessionPhone;

  const profilePhone = useProfileStore.getState().profile?.phone;
  if (profilePhone && profilePhone !== "guest") return profilePhone;

  if (useOnboardingStore.getState().isGuest) return "guest";
  return null;
}
