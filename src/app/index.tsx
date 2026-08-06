import { SPLASH_MIN_DURATION_MS } from "@/constants/splash";
import { useAuthDestination } from "@/hooks/auth/useAuthNavigation";
import { useAuthHydration } from "@/hooks/usePersistHydration";
import { useSplashTransitionStore } from "@/store/splashTransitionStore";
import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

/**
 * Cold start: root splash overlay → login (or tabs if already signed in).
 */
export default function Index() {
  const hydrated = useAuthHydration();
  const destination = useAuthDestination();
  const activate = useSplashTransitionStore((s) => s.activate);
  const setDestination = useSplashTransitionStore((s) => s.setDestination);
  const markMinElapsed = useSplashTransitionStore((s) => s.markMinElapsed);
  const activated = useRef(false);

  useEffect(() => {
    if (activated.current) return;
    activated.current = true;
    activate();
  }, [activate]);

  useEffect(() => {
    const t = setTimeout(markMinElapsed, SPLASH_MIN_DURATION_MS);
    return () => clearTimeout(t);
  }, [markMinElapsed]);

  useEffect(() => {
    if (!hydrated || !destination) return;
    setDestination(destination);
  }, [destination, hydrated, setDestination]);

  return <View style={styles.placeholder} />;
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
