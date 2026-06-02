import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useAuth } from "@/providers/AuthProvider";

/** @deprecated Use `useAuth()` — kept for gradual migration. */
export function useAppAuth() {
  const { status, isReady } = useAuth();
  const sessionPhone = useAuthPhone();

  return {
    isLoaded: isReady,
    isSignedIn: status === "authenticated" || status === "needs-profile",
    isGuest: false,
    isAuthenticated: status === "authenticated",
    sessionPhone,
  };
}
