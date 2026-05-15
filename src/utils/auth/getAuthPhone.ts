import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";

/** Sync phone for services (profile store; guest uses placeholder). */
export function getAuthPhone(): string | null {
  const profilePhone = useProfileStore.getState().profile?.phone;
  if (profilePhone) return profilePhone;
  if (useOnboardingStore.getState().isGuest) return "guest";
  return null;
}
