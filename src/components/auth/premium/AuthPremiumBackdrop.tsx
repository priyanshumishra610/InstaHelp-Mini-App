import {
  AUTH_ACCENT_TEAL,
  AUTH_PRIMARY,
  AUTH_PRIMARY_DEEP,
} from "@/constants/authPremium";
import { AnimatedParticles } from "@/components/auth/premium/AnimatedParticles";
import { AuthLightStreaks } from "@/components/auth/premium/AuthLightStreaks";
import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

function AnimatedBlob({
  style,
  color,
  duration = 7000,
  drift = 12,
}: {
  style: object;
  color: string;
  duration?: number;
  drift?: number;
}) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(-drift, { duration: duration * 1.1, easing: Easing.inOut(Easing.ease) }),
        withTiming(drift * 0.6, { duration: duration * 1.1, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [drift, duration, scale, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, animStyle, { backgroundColor: color }]}
    />
  );
}

function GradientWave() {
  const shift = useSharedValue(0);

  useEffect(() => {
    shift.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [shift]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -40 + shift.value * 80 }],
    opacity: 0.35 + shift.value * 0.2,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.waveWrap, waveStyle]}>
      <LinearGradient
        colors={[`${AUTH_ACCENT_TEAL}55`, "transparent", `${AUTH_PRIMARY}33`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.wave}
      />
    </Animated.View>
  );
}

export function AuthPremiumBackdrop({ children }: PropsWithChildren) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[AUTH_PRIMARY_DEEP, AUTH_PRIMARY, "#3B82F6", AUTH_PRIMARY_DEEP]}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.05, y: 0 }}
        end={{ x: 0.95, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <GradientWave />
      <AuthLightStreaks />
      <AnimatedParticles count={32} />
      <AnimatedBlob
        color="rgba(255,255,255,0.14)"
        duration={8200}
        drift={16}
        style={styles.blobTop}
      />
      <AnimatedBlob
        color={`${AUTH_ACCENT_TEAL}40`}
        duration={9600}
        drift={20}
        style={styles.blobLeft}
      />
      <AnimatedBlob
        color="rgba(255,255,255,0.08)"
        duration={11000}
        style={styles.blobRight}
      />
      <View
        pointerEvents="none"
        style={[styles.radial, { backgroundColor: "rgba(255,255,255,0.1)" }]}
      />
      <View
        pointerEvents="none"
        style={[styles.blobRing, { borderColor: "rgba(255,255,255,0.1)" }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0)", "rgba(0,18,60,0.25)", "rgba(0,12,40,0.62)"]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  waveWrap: {
    position: "absolute",
    top: "8%",
    left: "-30%",
    width: "160%",
    height: "42%",
  },
  wave: {
    flex: 1,
    borderRadius: 200,
    transform: [{ rotate: "-8deg" }],
  },
  blobTop: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  blobLeft: {
    position: "absolute",
    bottom: "14%",
    left: -100,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  blobRight: {
    position: "absolute",
    top: "38%",
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  radial: {
    position: "absolute",
    top: "28%",
    alignSelf: "center",
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.5,
  },
  blobRing: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 32,
  },
});
