import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type PinProps = {
  icon: keyof typeof Ionicons.glyphMap;
  size: "sm" | "lg";
  glow?: boolean;
  delay?: number;
  baseRotate?: number;
  baseTranslateY?: number;
  floatRange?: number;
};

function MapPin({
  icon,
  size,
  glow,
  delay = 0,
  baseRotate = 0,
  baseTranslateY = 0,
  floatRange = 10,
}: PinProps) {
  const isLarge = size === "lg";
  const w = isLarge ? 88 : 64;
  const h = isLarge ? 108 : 80;

  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const glowScale = useSharedValue(1);

  useEffect(() => {
    const duration = isLarge ? 2800 : 3200;

    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-floatRange, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(floatRange * 0.65, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    );

    rotate.value = withDelay(
      delay + 120,
      withRepeat(
        withSequence(
          withTiming(isLarge ? 2.5 : 4, {
            duration: duration + 400,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(isLarge ? -2.5 : -4, {
            duration: duration + 400,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    );

    if (glow) {
      glowScale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [delay, floatRange, glow, glowScale, isLarge, rotate, translateY]);

  const pinAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: baseTranslateY + translateY.value },
      { rotate: `${baseRotate + rotate.value}deg` },
    ],
  }));

  const glowAnim = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: 0.75 + (glowScale.value - 1) * 1.2,
  }));

  return (
    <Animated.View style={[styles.pinWrap, pinAnim]}>
      {glow ? (
        <Animated.View
          style={[styles.pinGlow, isLarge && styles.pinGlowLg, glowAnim]}
        />
      ) : null}
      <LinearGradient
        colors={["#7C3AED", "#5B21B6", "#4C1D95"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[
          styles.pin,
          {
            width: w,
            height: h,
            borderTopLeftRadius: w / 2,
            borderTopRightRadius: w / 2,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
          },
        ]}
      >
        <View style={[styles.pinInner, isLarge && styles.pinInnerLg]}>
          <Ionicons name={icon} size={isLarge ? 28 : 22} color="#fff" />
        </View>
      </LinearGradient>
      <View style={[styles.pinTip, { width: w * 0.22, marginTop: -2 }]} />
    </Animated.View>
  );
}

function GlowRing() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.85);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [opacity, scale]);

  const ringAnim = useAnimatedStyle(() => ({
    transform: [{ scaleX: 1.4 * scale.value }, { scaleY: scale.value }],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.ring, ringAnim]} />;
}

/** Floating home / services / packaging pins — District-style hero */
export function LoginHeroVisual() {
  return (
    <View style={styles.stage}>
      <GlowRing />
      <View style={styles.pins}>
        <MapPin
          icon="home-outline"
          size="sm"
          delay={0}
          baseRotate={-8}
          baseTranslateY={12}
          floatRange={9}
        />
        <View style={styles.pinCenter}>
          <MapPin
            icon="construct"
            size="lg"
            glow
            delay={200}
            baseTranslateY={-4}
            floatRange={12}
          />
        </View>
        <MapPin
          icon="cube-outline"
          size="sm"
          delay={400}
          baseRotate={8}
          baseTranslateY={12}
          floatRange={9}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: "center",
    justifyContent: "center",
    height: 220,
    marginTop: 8,
  },
  ring: {
    position: "absolute",
    bottom: 18,
    width: 200,
    height: 36,
    borderRadius: 100,
    backgroundColor: "rgba(124,58,237,0.35)",
    shadowColor: "#A78BFA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 8,
  },
  pins: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 28,
  },
  pinWrap: {
    alignItems: "center",
    opacity: 0.92,
  },
  pinGlow: {
    position: "absolute",
    top: 8,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(251,191,36,0.35)",
  },
  pinGlowLg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    top: 4,
  },
  pin: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  pinInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  pinInnerLg: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  pinTip: {
    height: 10,
    backgroundColor: "#4C1D95",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  pinCenter: {
    zIndex: 2,
  },
});
