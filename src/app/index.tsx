import { SPLASH_MIN_DURATION_MS } from "@/constants/splash";
import { TUTORIAL_ENABLED } from "@/constants/tutorialFeature";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuthHydration } from "@/hooks/usePersistHydration";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

/**
 * Cold start: native splash only (no white React overlay). Navigating away
 * unmounts this route so nothing can stick above the app.
 */
export default function Index() {
  const router = useRouter();
  const hydrated = useAuthHydration();
  const destination = useAuthDestination();
  const navigated = useRef(false);
  const [minElapsed, setMinElapsed] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  const readyToExit = hydrated && destination != null && minElapsed;

  useEffect(() => {
    if (!readyToExit || navigated.current || !destination) return;
    navigated.current = true;
    void SplashScreen.hideAsync().catch(() => {});

    /* TUTORIAL_DISABLED — re-enable via src/constants/tutorialFeature.ts */
    if (TUTORIAL_ENABLED) {
      const tutorialDone = useOnboardingStore.getState().appTutorialCompleted;
      if (!tutorialDone) {
        useOnboardingStore.getState().setPendingInAppTutorial(true);
      }
    }

    if (destination === "/(auth)/phone") {
      router.replace({
        pathname: "/(auth)/phone",
        params: { fromSplash: "1" },
      });
      return;
    }

    router.replace(destination);
  }, [destination, readyToExit, router]);

  return <View style={{ flex: 1, backgroundColor: "#000000" }} />;
}
