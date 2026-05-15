import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { clerkPrimaryPhone } from "@/utils/auth/syncClerkProfile";
import { useUser } from "@clerk/expo";

/** Primary phone for API calls — Clerk user, profile, or guest placeholder. */
export function useAuthPhone(): string | null {
  const { user } = useUser();
  const profilePhone = useProfileStore((s) => s.profile?.phone);
  const isGuest = useOnboardingStore((s) => s.isGuest);

  const clerkPhone = clerkPrimaryPhone(user);
  if (clerkPhone) return clerkPhone;
  if (profilePhone) return profilePhone;
  if (isGuest) return "guest";
  return null;
}
