import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const TAGLINE_TEXT = "We\u2019ll get it done.";

const BG_FROM = "rgba(0,74,173,0.10)";
const BG_MID = "rgba(59,130,246,0.06)";
const BG_TO = "rgba(0,74,173,0.10)";
const TAGLINE_COLOR = "#4a5b7d";

const SPLASH_LOGO = require("../../../assets/images/splash-icon.png");

const PHASE_BG_IN_MS = 360;
const PHASE_BRAND_IN_START_MS = 300;
const PHASE_BRAND_IN_DURATION_MS = 400;
const PHASE_TAGLINE_START_MS = 1100;
const PHASE_TAGLINE_DURATION_MS = 520;
const PHASE_PULSE_START_MS = 1620;
const PHASE_PULSE_UP_MS = 300;
const PHASE_PULSE_DOWN_MS = 320;
const EXIT_DURATION_MS = 520;
const EXIT_FALLBACK_PAD_MS = 220;

type Props = {
  /** Called once the splash fully animates out. */
  onFinish?: () => void;
  /** Minimum visible time before exit (ms). Default ~2400ms per brief. */
  minDurationMs?: number;
};

export function AnimatedSplash({ onFinish, minDurationMs = 2400 }: Props) {
  const containerOpacity = useSharedValue(0);
  const containerLiftY = useSharedValue(0);

  const brandOpacity = useSharedValue(0);
  const brandScale = useSharedValue(0.95);

  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(14);

  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    containerOpacity.value = withTiming(1, {
      duration: PHASE_BG_IN_MS,
      easing: Easing.out(Easing.cubic),
    });

    brandOpacity.value = withDelay(
      PHASE_BRAND_IN_START_MS,
      withTiming(1, {
        duration: PHASE_BRAND_IN_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      }),
    );
    brandScale.value = withDelay(
      PHASE_BRAND_IN_START_MS,
      withSequence(
        withTiming(1, {
          duration: PHASE_BRAND_IN_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        }),
        withDelay(
          Math.max(
            0,
            PHASE_PULSE_START_MS -
              (PHASE_BRAND_IN_START_MS + PHASE_BRAND_IN_DURATION_MS),
          ),
          withSequence(
            withTiming(1.02, {
              duration: PHASE_PULSE_UP_MS,
              easing: Easing.out(Easing.cubic),
            }),
            withTiming(1, {
              duration: PHASE_PULSE_DOWN_MS,
              easing: Easing.inOut(Easing.cubic),
            }),
          ),
        ),
      ),
    );

    taglineOpacity.value = withDelay(
      PHASE_TAGLINE_START_MS,
      withTiming(1, {
        duration: PHASE_TAGLINE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      }),
    );
    taglineY.value = withDelay(
      PHASE_TAGLINE_START_MS,
      withTiming(0, {
        duration: PHASE_TAGLINE_DURATION_MS,
        easing: Easing.out(Easing.cubic),
      }),
    );

    return () => {
      cancelAnimation(containerOpacity);
      cancelAnimation(containerLiftY);
      cancelAnimation(brandOpacity);
      cancelAnimation(brandScale);
      cancelAnimation(taglineOpacity);
      cancelAnimation(taglineY);
    };
  }, [
    brandOpacity,
    brandScale,
    containerLiftY,
    containerOpacity,
    taglineOpacity,
    taglineY,
  ]);

  useEffect(() => {
    let didFinish = false;
    let fallback: ReturnType<typeof setTimeout> | null = null;

    const safeFinish = () => {
      if (didFinish) return;
      didFinish = true;
      onFinishRef.current?.();
    };

    const exitTimer = setTimeout(() => {
      containerLiftY.value = withTiming(-6, {
        duration: EXIT_DURATION_MS,
        easing: Easing.in(Easing.cubic),
      });
      containerOpacity.value = withTiming(
        0,
        {
          duration: EXIT_DURATION_MS,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          "worklet";
          if (finished) runOnJS(safeFinish)();
        },
      );
      fallback = setTimeout(safeFinish, EXIT_DURATION_MS + EXIT_FALLBACK_PAD_MS);
    }, minDurationMs);

    return () => {
      clearTimeout(exitTimer);
      if (fallback) clearTimeout(fallback);
    };
  }, [minDurationMs, containerOpacity, containerLiftY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerLiftY.value }],
  }));

  const brandWrapperStyle = useAnimatedStyle(() => ({
    opacity: brandOpacity.value,
    transform: [{ scale: brandScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }],
  }));

  return (
    <Animated.View style={[styles.root, containerStyle]}>
      <LinearGradient
        colors={[BG_FROM, BG_MID, BG_TO]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>
        <Animated.View style={brandWrapperStyle}>
          <Animated.Image
            source={SPLASH_LOGO}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="InstaHelp"
          />
        </Animated.View>

        <Animated.Text style={[styles.tagline, taglineStyle]}>
          {TAGLINE_TEXT}
        </Animated.Text>
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
    paddingHorizontal: 32,
    overflow: "hidden",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 300,
    height: 120,
  },
  tagline: {
    marginTop: 28,
    fontSize: 14,
    fontWeight: "500",
    color: TAGLINE_COLOR,
    letterSpacing: 0.4,
    textAlign: "center",
    ...Platform.select({
      ios: { fontFamily: "System" },
      android: { fontFamily: "sans-serif" },
      default: {},
    }),
  },
});
