import { clerkErrorMessage } from "@/utils/auth/clerkErrors";
import { syncClerkUserToProfile } from "@/utils/auth/syncClerkProfile";
import { useSSO, useUser } from "@clerk/expo";
import * as Haptics from "expo-haptics";
import { useCallback, useState } from "react";

export function useGoogleSignIn() {
  const { startSSOFlow } = useSSO();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await startSSOFlow({ strategy: "oauth_google" });

      if (result.authSessionResult?.type === "cancel") {
        return false;
      }

      if (result.authSessionResult?.type !== "success") {
        setError("Google sign-in was not completed");
        return false;
      }

      const sessionId = result.createdSessionId;
      if (sessionId && result.setActive) {
        await result.setActive({ session: sessionId });
        syncClerkUserToProfile(user);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return true;
      }

      setError("Could not complete Google sign-in");
      return false;
    } catch (err) {
      setError(clerkErrorMessage(err, "Google sign-in failed"));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow, user]);

  return { signInWithGoogle, loading, error, setError };
}
