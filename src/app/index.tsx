import { AnimatedSplash } from "@/components/ui/AnimatedSplash";
import { SPLASH_MIN_DURATION_MS } from "@/constants/splash";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuthHydration } from "@/hooks/usePersistHydration";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Cold start: animated splash → login (or tabs if already signed in).
 */
export default function Index() {
  const router = useRouter();
  const hydrated = useAuthHydration();
  const destination = useAuthDestination();

  const [splashDone, setSplashDone] = useState(false);
  const navigated = useRef(false);

  const handleSplashFinish = useCallback(() => {
    setSplashDone(true);
  }, []);

  useEffect(() => {
    if (navigated.current) return;
    if (!hydrated) return;
    if (!splashDone) return;
    if (!destination) return;

    navigated.current = true;
    router.replace(destination);
  }, [destination, hydrated, router, splashDone]);

  const readyToExit = hydrated && destination != null;

  return (
    <AnimatedSplash
      onFinish={handleSplashFinish}
      minDurationMs={SPLASH_MIN_DURATION_MS}
      readyToExit={readyToExit}
    />
  );
}
