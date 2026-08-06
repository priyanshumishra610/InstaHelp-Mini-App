import { LoginHeroVisual } from "@/components/auth/LoginHeroVisual";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import {
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
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const BRAND_DELAY_MS = 120;
const TAGLINE_DELAY_MS = 380;
const HERO_DELAY_MS = 280;
const EXIT_MS = 0;

type Props = {
  onFinish?: () => void;
  onExitStart?: () => void;
  minDurationMs?: number;
  readyToExit?: boolean;
  exitImmediately?: boolean;
};

export function AnimatedSplash({
  onFinish,
  onExitStart,
  minDurationMs = SPLASH_MIN_DURATION_MS,
  readyToExit = true,
  exitImmediately = false,
}: Props) {
  const screenOpacity = useSharedValue(1);
  const brandOpacity = useSharedValue(0);
  const brandTranslateY = useSharedValue(10);
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(14);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(8);
  const barProgress = useSharedValue(0);

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
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    brandTranslateY.value = withDelay(
      BRAND_DELAY_MS,
      withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );

    heroOpacity.value = withDelay(
      HERO_DELAY_MS,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );
    heroTranslateY.value = withDelay(
      HERO_DELAY_MS,
      withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );

    taglineOpacity.value = withDelay(
      TAGLINE_DELAY_MS,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );
    taglineTranslateY.value = withDelay(
      TAGLINE_DELAY_MS,
      withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }),
    );

    barProgress.value = withDelay(
      TAGLINE_DELAY_MS + 80,
      withTiming(1, {
        duration: Math.max(minDurationMs - TAGLINE_DELAY_MS - 200, 900),
        easing: Easing.inOut(Easing.cubic),
      }),
    );

    return () => {
      cancelAnimation(brandOpacity);
      cancelAnimation(brandTranslateY);
      cancelAnimation(heroOpacity);
      cancelAnimation(heroTranslateY);
      cancelAnimation(taglineOpacity);
      cancelAnimation(taglineTranslateY);
      cancelAnimation(barProgress);
      cancelAnimation(screenOpacity);
    };
  }, [
    barProgress,
    brandOpacity,
    brandTranslateY,
    exiting,
    fontsLoaded,
    heroOpacity,
    heroTranslateY,
    minDurationMs,
    screenOpacity,
    taglineOpacity,
    taglineTranslateY,
  ]);

  useEffect(() => {
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
      screenOpacity.value = 0;
      safeFinish();
      return;
    }

    taglineOpacity.value = withTiming(0, { duration: EXIT_MS * 0.55 });
    taglineTranslateY.value = withTiming(-6, { duration: EXIT_MS * 0.55 });
    barProgress.value = withTiming(1, { duration: EXIT_MS * 0.35 });
    brandOpacity.value = withTiming(0, { duration: EXIT_MS * 0.75 });
    heroOpacity.value = withTiming(0, { duration: EXIT_MS * 0.75 });
    screenOpacity.value = withTiming(
      0,
      { duration: EXIT_MS, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        "worklet";
        if (finished) runOnJS(safeFinish)();
      },
    );
    const fallback = setTimeout(safeFinish, EXIT_MS + 220);

    return () => {
      clearTimeout(fallback);
    };
  }, [
    barProgress,
    brandOpacity,
    exitImmediately,
    heroOpacity,
    minElapsed,
    readyToExit,
    screenOpacity,
    taglineOpacity,
    taglineTranslateY,
  ]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ translateY: brandTranslateY.value }],
  }));

  const heroStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: 72 * Math.max(barProgress.value, 0.04),
    opacity: 0.45 + barProgress.value * 0.45,
  }));

  if (!fontsLoaded) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.root, screenStyle]}>
      <StatusBar style="dark" />

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

        <Animated.View style={[styles.heroWrap, heroStyle]}>
          <LoginHeroVisual />
        </Animated.View>

        {!exiting ? (
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, barStyle]} />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    width: "100%",
    maxWidth: 440,
  },
  brandBlock: {
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    color: "#111827",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  tagline: {
    marginTop: 6,
    fontSize: 14,
    letterSpacing: 0.2,
    color: "#6B7280",
    textAlign: "center",
  },
  heroWrap: {
    marginTop: 8,
    width: "100%",
    alignItems: "center",
  },
  progressTrack: {
    marginTop: 28,
    width: 72,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(23,23,23,0.12)",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 2,
    backgroundColor: AUTH_PRIMARY,
  },
});

export { SPLASH_BRAND_TITLE };
