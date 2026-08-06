import { AppComicTutorial } from "@/components/onboarding/AppComicTutorial";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSplashTransitionStore } from "@/store/splashTransitionStore";
import { useRouter } from "expo-router";
import { useCallback } from "react";

type Props = {
  /** Replay from profile — return to the previous screen when done. */
  replay?: boolean;
};

/**
 * First-launch comic intro. Does not mark the interactive home tour complete —
 * that starts once the user reaches the main tabs.
 */
export function AppTutorialScreen({ replay = false }: Props) {
  const router = useRouter();
  const destination = useAuthDestination();
  const splashDestination = useSplashTransitionStore((s) => s.destination);
  const setPendingInAppTutorial = useOnboardingStore(
    (s) => s.setPendingInAppTutorial,
  );

  const finish = useCallback(() => {
    if (replay) {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/(tabs)/profile");
      }
      return;
    }

    // Keep the interactive in-app tour queued for the first home visit.
    setPendingInAppTutorial(true);

    const target = splashDestination ?? destination ?? "/(auth)/phone";
    if (target === "/(auth)/phone") {
      router.replace({ pathname: "/(auth)/phone", params: { fromSplash: "1" } });
      return;
    }
    if (target === "/(tabs)") {
      router.replace("/(tabs)");
      return;
    }
    router.replace(target);
  }, [
    destination,
    replay,
    router,
    setPendingInAppTutorial,
    splashDestination,
  ]);

  return <AppComicTutorial onComplete={finish} onSkip={finish} />;
}
