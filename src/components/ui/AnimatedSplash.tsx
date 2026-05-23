import {
  SPLASH_BACKGROUND,
  SPLASH_BRAND_TAGLINE,
  SPLASH_BRAND_TITLE,
  SPLASH_MIN_DURATION_MS,
} from "@/constants/splash";
import { LinearGradient } from "expo-linear-gradient";
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
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const BRAND_IN_MS = 560;
const BRAND_DELAY_MS = 120;
const EXIT_MS = 500;

type Props = {
  onFinish?: () => void;
  minDurationMs?: number;
  /** Wait until auth/storage is ready before fade-out */
  readyToExit?: boolean;
};

export function AnimatedSplash({
  onFinish,
  minDurationMs = SPLASH_MIN_DURATION_MS,
  readyToExit = true,
}: Props) {
  const screenOpacity = useSharedValue(1);
  const brandOpacity = useSharedValue(0);
  const brandScale = useSharedValue(0.94);
  const taglineOpacity = useSharedValue(0);
  const glowScale = useSharedValue(1);

  const onFinishRef = useRef(onFinish);
  const [minElapsed, setMinElapsed] = useState(false);
  const exitStarted = useRef(false);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const t = setTimeout(() => setMinElapsed(true), minDurationMs);
    return () => clearTimeout(t);
  }, [minDurationMs]);

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    brandOpacity.value = withDelay(
      BRAND_DELAY_MS,
      withTiming(1, { duration: BRAND_IN_MS, easing: Easing.out(Easing.cubic) }),
    );
    brandScale.value = withDelay(
      BRAND_DELAY_MS,
      withTiming(1, { duration: BRAND_IN_MS, easing: Easing.out(Easing.cubic) }),
    );
    taglineOpacity.value = withDelay(
      BRAND_DELAY_MS + 220,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );

    return () => {
      cancelAnimation(brandOpacity);
      cancelAnimation(brandScale);
      cancelAnimation(taglineOpacity);
      cancelAnimation(screenOpacity);
      cancelAnimation(glowScale);
    };
  }, [brandOpacity, brandScale, glowScale, screenOpacity, taglineOpacity]);

  useEffect(() => {
    if (!minElapsed || !readyToExit || exitStarted.current) return;
    exitStarted.current = true;

    let didFinish = false;
    let fallback: ReturnType<typeof setTimeout> | null = null;

    const safeFinish = () => {
      if (didFinish) return;
      didFinish = true;
      onFinishRef.current?.();
    };

    brandOpacity.value = withTiming(0, {
      duration: EXIT_MS,
      easing: Easing.in(Easing.cubic),
    });
    taglineOpacity.value = withTiming(0, { duration: EXIT_MS * 0.85 });
    screenOpacity.value = withTiming(
      0,
      { duration: EXIT_MS, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        "worklet";
        if (finished) runOnJS(safeFinish)();
      },
    );
    fallback = setTimeout(safeFinish, EXIT_MS + 220);

    return () => {
      if (fallback) clearTimeout(fallback);
    };
  }, [minElapsed, brandOpacity, readyToExit, screenOpacity, taglineOpacity]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ scale: brandScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.5 + (glowScale.value - 1) * 2,
  }));

  return (
    <Animated.View style={[styles.root, screenStyle]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0A0A1A", "#0f1028", "#12122a"]}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.glow, glowStyle]} />
      <View style={styles.center}>
        <Animated.View style={[styles.brandBlock, brandStyle]}>
          <Animated.Text style={styles.title}>{SPLASH_BRAND_TITLE}</Animated.Text>
          <Animated.Text style={[styles.tagline, taglineStyle]}>
            {SPLASH_BRAND_TAGLINE}
          </Animated.Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(124,58,237,0.22)",
    top: "38%",
    alignSelf: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  brandBlock: {
    alignItems: "center",
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  tagline: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.58)",
    letterSpacing: 0.2,
    textAlign: "center",
  },
});
