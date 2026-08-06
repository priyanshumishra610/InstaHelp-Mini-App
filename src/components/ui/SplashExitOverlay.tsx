import { AnimatedSplash } from "@/components/ui/AnimatedSplash";
import { SPLASH_MIN_DURATION_MS } from "@/constants/splash";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSplashTransitionStore } from "@/store/splashTransitionStore";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

/** Safety net if auth hydration or destination never resolves. */
const SPLASH_WATCHDOG_MS = 8000;

/** Hard cap so a stuck exit never leaves a translucent splash over the app. */
const EXIT_TEARDOWN_MS = 700;

function navigateAfterSplash(
  router: ReturnType<typeof useRouter>,
  destination: NonNullable<
    ReturnType<typeof useSplashTransitionStore.getState>["destination"]
  >,
) {
  const tutorialDone = useOnboardingStore.getState().appTutorialCompleted;
  if (!tutorialDone) {
    useOnboardingStore.getState().setPendingInAppTutorial(true);
    const goesToAuth =
      destination === "/(auth)/phone" ||
      destination === "/(auth)/otp" ||
      destination === "/(auth)/profile";
    if (goesToAuth) {
      router.replace("/(auth)/tutorial");
      return;
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
}

/**
 * Full-screen splash on cold start only. Tears down immediately after navigation
 * so the white fade layer cannot stick over the app as a translucent overlay.
 */
export function SplashExitOverlay() {
  const router = useRouter();
  const active = useSplashTransitionStore((s) => s.active);
  const exitStarted = useSplashTransitionStore((s) => s.exitStarted);
  const minElapsed = useSplashTransitionStore((s) => s.minElapsed);
  const destination = useSplashTransitionStore((s) => s.destination);
  const beginExit = useSplashTransitionStore((s) => s.beginExit);
  const finish = useSplashTransitionStore((s) => s.finish);
  const navigated = useRef(false);

  const readyToExit = minElapsed && destination != null && !exitStarted;

  useEffect(() => {
    if (!readyToExit) return;
    beginExit();
  }, [beginExit, readyToExit]);

  useEffect(() => {
    if (!exitStarted || !destination || navigated.current) return;
    navigated.current = true;
    navigateAfterSplash(router, destination);
    finish();
  }, [destination, exitStarted, finish, router]);

  useEffect(() => {
    if (!active) return;
    const watchdog = setTimeout(() => {
      const state = useSplashTransitionStore.getState();
      if (!state.active || state.exitStarted) return;
      if (!state.destination) {
        state.setDestination("/(auth)/phone");
      }
      if (!state.minElapsed) {
        state.markMinElapsed();
      }
      state.beginExit();
    }, SPLASH_WATCHDOG_MS);
    return () => clearTimeout(watchdog);
  }, [active]);

  useEffect(() => {
    if (!active || !exitStarted) return;
    const failSafe = setTimeout(() => {
      if (useSplashTransitionStore.getState().active) {
        useSplashTransitionStore.getState().finish();
      }
    }, EXIT_TEARDOWN_MS);
    return () => clearTimeout(failSafe);
  }, [active, exitStarted]);

  if (!active) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <AnimatedSplash
        minDurationMs={SPLASH_MIN_DURATION_MS}
        readyToExit={readyToExit || exitStarted}
        exitImmediately={exitStarted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
});
