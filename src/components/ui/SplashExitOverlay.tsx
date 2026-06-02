import { AnimatedSplash } from "@/components/ui/AnimatedSplash";
import { SPLASH_MIN_DURATION_MS } from "@/constants/splash";
import { useSplashTransitionStore } from "@/store/splashTransitionStore";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

/** Safety net if auth hydration or destination never resolves. */
const SPLASH_WATCHDOG_MS = 8000;

/**
 * Full-screen splash that stays above the stack during exit so navigation
 * to phone auth can cross-fade underneath.
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

  const handleExitStart = () => {
    if (navigated.current || !destination) return;
    navigated.current = true;
    if (destination === "/(auth)/phone") {
      router.replace({
        pathname: "/(auth)/phone",
        params: { fromSplash: "1" },
      });
      return;
    }
    router.replace(destination);
  };

  const handleFinish = () => {
    navigated.current = false;
    finish();
  };

  if (!active) return null;

  return (
    <View style={styles.overlay} pointerEvents={exitStarted ? "none" : "auto"}>
      <AnimatedSplash
        minDurationMs={SPLASH_MIN_DURATION_MS}
        readyToExit={readyToExit || exitStarted}
        exitImmediately={exitStarted}
        onExitStart={handleExitStart}
        onFinish={handleFinish}
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
