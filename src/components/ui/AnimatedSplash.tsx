import { AUTH_FONT } from "@/constants/authPremium";
import {
  SPLASH_BACKGROUND,
  SPLASH_BRAND_TAGLINE,
  SPLASH_BRAND_TITLE,
  SPLASH_MIN_DURATION_MS,
} from "@/constants/splash";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const BRAND_DELAY_MS = 80;
const TAGLINE_DELAY_MS = 320;
const EXIT_MS = 0;

type Props = {
  onFinish?: () => void;
  onExitStart?: () => void;
  minDurationMs?: number;
  readyToExit?: boolean;
  exitImmediately?: boolean;
};

/**
 * Uber-style splash: full-bleed black canvas + large white wordmark.
 */
export function AnimatedSplash({
  onFinish,
  onExitStart,
  minDurationMs = SPLASH_MIN_DURATION_MS,
  readyToExit = true,
  exitImmediately = false,
}: Props) {
  const brandOpacity = useSharedValue(0);
  const brandScale = useSharedValue(0.94);
  const taglineOpacity = useSharedValue(0);

  const onFinishRef = useRef(onFinish);
  const onExitStartRef = useRef(onExitStart);
  const [minElapsed, setMinElapsed] = useState(exitImmediately);
  const [exiting, setExiting] = useState(exitImmediately);
  const exitStarted = useRef(exitImmediately);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    onFinishRef.current = onFinish;
    onExitStartRef.current = onExitStart;
  }, [onFinish, onExitStart]);

  useEffect(() => {
    if (exitImmediately) return;
    const t = setTimeout(() => setMinElapsed(true), minDurationMs);
    return () => clearTimeout(t);
  }, [exitImmediately, minDurationMs]);

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (exiting || !fontsLoaded) return;

    brandOpacity.value = withDelay(
      BRAND_DELAY_MS,
      withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }),
    );
    brandScale.value = withDelay(
      BRAND_DELAY_MS,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
    taglineOpacity.value = withDelay(
      TAGLINE_DELAY_MS,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );

    return () => {
      cancelAnimation(brandOpacity);
      cancelAnimation(brandScale);
      cancelAnimation(taglineOpacity);
    };
  }, [
    brandOpacity,
    brandScale,
    exiting,
    fontsLoaded,
    taglineOpacity,
  ]);

  useEffect(() => {
    if (!onFinish && !onExitStart) return;
    const canExit = exitImmediately || (minElapsed && readyToExit);
    if (!canExit || exitStarted.current) return;
    exitStarted.current = true;
    setExiting(true);
    onExitStartRef.current?.();

    let didFinish = false;
    const safeFinish = () => {
      if (didFinish) return;
      didFinish = true;
      onFinishRef.current?.();
    };

    if (EXIT_MS <= 0) {
      safeFinish();
      return;
    }

    brandOpacity.value = withTiming(0, { duration: EXIT_MS * 0.75 });
    taglineOpacity.value = withTiming(0, { duration: EXIT_MS * 0.55 });
    const fallback = setTimeout(safeFinish, EXIT_MS + 220);

    return () => {
      clearTimeout(fallback);
    };
  }, [
    brandOpacity,
    exitImmediately,
    minElapsed,
    onExitStart,
    onFinish,
    readyToExit,
    taglineOpacity,
  ]);

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ scale: brandScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  if (!fontsLoaded) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.center}>
        <Animated.View style={[styles.brandBlock, brandStyle]}>
          <Animated.Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>
            {SPLASH_BRAND_TITLE}
          </Animated.Text>
          <Animated.Text
            style={[styles.tagline, taglineStyle, { fontFamily: AUTH_FONT.medium }]}
          >
            {SPLASH_BRAND_TAGLINE}
          </Animated.Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    width: "100%",
  },
  brandBlock: {
    alignItems: "center",
  },
  title: {
    fontSize: 44,
    color: "#FFFFFF",
    letterSpacing: -1.2,
    textAlign: "center",
  },
  tagline: {
    marginTop: 10,
    fontSize: 14,
    letterSpacing: 0.3,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },
});

export { SPLASH_BRAND_TITLE };
