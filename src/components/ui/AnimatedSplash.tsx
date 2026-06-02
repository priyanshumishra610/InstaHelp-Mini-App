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

const BRAND_DELAY_MS = 120;
const LETTER_STAGGER_MS = 52;
const LETTER_IN_MS = 400;
const TAGLINE_DELAY_MS = BRAND_DELAY_MS + SPLASH_BRAND_TITLE.length * LETTER_STAGGER_MS + 80;
const TAGLINE_IN_MS = 420;
const TITLE_PULSE_MS = 1400;
const EXIT_MS = 560;

const LETTERS = SPLASH_BRAND_TITLE.split("");

type Props = {
  onFinish?: () => void;
  onExitStart?: () => void;
  minDurationMs?: number;
  /** Wait until auth/storage is ready before fade-out */
  readyToExit?: boolean;
  /** Skip min-duration wait and run exit immediately (overlay handoff). */
  exitImmediately?: boolean;
};

function AnimatedLetter({
  char,
  index,
  exiting,
}: {
  char: string;
  index: number;
  exiting: boolean;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    if (exiting) return;
    const delay = BRAND_DELAY_MS + index * LETTER_STAGGER_MS;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: LETTER_IN_MS, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: LETTER_IN_MS, easing: Easing.out(Easing.cubic) }),
    );
    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
    };
  }, [exiting, index, opacity, translateY]);

  useEffect(() => {
    if (!exiting) return;
    opacity.value = withTiming(0, {
      duration: EXIT_MS * 0.85,
      easing: Easing.in(Easing.cubic),
    });
    translateY.value = withTiming(-6, { duration: EXIT_MS * 0.85 });
  }, [exiting, opacity, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[styles.titleLetter, style]}>{char}</Animated.Text>
  );
}

export function AnimatedSplash({
  onFinish,
  onExitStart,
  minDurationMs = SPLASH_MIN_DURATION_MS,
  readyToExit = true,
  exitImmediately = false,
}: Props) {
  const screenOpacity = useSharedValue(1);
  const titlePulse = useSharedValue(1);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(6);

  const onFinishRef = useRef(onFinish);
  const onExitStartRef = useRef(onExitStart);
  const [minElapsed, setMinElapsed] = useState(exitImmediately);
  const [exiting, setExiting] = useState(exitImmediately);
  const exitStarted = useRef(exitImmediately);

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
    if (exiting) return;

    const pulseStart =
      BRAND_DELAY_MS + LETTERS.length * LETTER_STAGGER_MS + LETTER_IN_MS;
    titlePulse.value = withDelay(
      pulseStart,
      withRepeat(
        withSequence(
          withTiming(1.025, {
            duration: TITLE_PULSE_MS,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, {
            duration: TITLE_PULSE_MS,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        false,
      ),
    );

    taglineOpacity.value = withDelay(
      TAGLINE_DELAY_MS,
      withTiming(1, { duration: TAGLINE_IN_MS, easing: Easing.out(Easing.cubic) }),
    );
    taglineTranslateY.value = withDelay(
      TAGLINE_DELAY_MS,
      withTiming(0, { duration: TAGLINE_IN_MS, easing: Easing.out(Easing.cubic) }),
    );

    return () => {
      cancelAnimation(titlePulse);
      cancelAnimation(taglineOpacity);
      cancelAnimation(taglineTranslateY);
      cancelAnimation(screenOpacity);
    };
  }, [exiting, screenOpacity, taglineOpacity, taglineTranslateY, titlePulse]);

  useEffect(() => {
    const canExit =
      exitImmediately || (minElapsed && readyToExit);
    if (!canExit || exitStarted.current) return;
    exitStarted.current = true;
    setExiting(true);
    onExitStartRef.current?.();

    let didFinish = false;
    let fallback: ReturnType<typeof setTimeout> | null = null;

    const safeFinish = () => {
      if (didFinish) return;
      didFinish = true;
      onFinishRef.current?.();
    };

    cancelAnimation(titlePulse);
    titlePulse.value = withTiming(1, { duration: 120 });

    taglineOpacity.value = withTiming(0, { duration: EXIT_MS * 0.85 });
    taglineTranslateY.value = withTiming(-4, { duration: EXIT_MS * 0.85 });
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
  }, [
    exitImmediately,
    minElapsed,
    readyToExit,
    screenOpacity,
    taglineOpacity,
    taglineTranslateY,
    titlePulse,
  ]);

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const titleRowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titlePulse.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  return (
    <Animated.View style={[styles.root, screenStyle]}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0A0A1A", "#0f1028", "#12122a"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.center}>
        <Animated.View style={[styles.brandBlock, titleRowStyle]}>
          <View style={styles.titleRow}>
            {LETTERS.map((char, index) => (
              <AnimatedLetter
                key={`${char}-${index}`}
                char={char}
                index={index}
                exiting={exiting}
              />
            ))}
          </View>
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
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  brandBlock: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  titleLetter: {
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
