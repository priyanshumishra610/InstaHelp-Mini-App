import {
  AUTH_ACCENT_TEAL,
  AUTH_PRIMARY,
  AUTH_PRIMARY_DEEP,
} from "@/constants/authPremium";
import { LinearGradient } from "expo-linear-gradient";
import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

function AnimatedBlob({
  style,
  color,
  duration = 7000,
}: {
  style: object;
  color: string;
  duration?: number;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [duration, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[style, animStyle, { backgroundColor: color }]}
    />
  );
}

export function AuthPremiumBackdrop({ children }: PropsWithChildren) {
  return (
    <LinearGradient
      colors={[AUTH_PRIMARY_DEEP, AUTH_PRIMARY, "#3B82F6"]}
      locations={[0, 0.45, 1]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.root}
    >
      <AnimatedBlob
        color="rgba(255,255,255,0.12)"
        duration={8000}
        style={styles.blobTop}
      />
      <AnimatedBlob
        color={`${AUTH_ACCENT_TEAL}33`}
        duration={9500}
        style={styles.blobLeft}
      />
      <View
        pointerEvents="none"
        style={[styles.blobRing, { borderColor: "rgba(255,255,255,0.08)" }]}
      />
      <View
        pointerEvents="none"
        style={[styles.lightSpot, { backgroundColor: "rgba(255,255,255,0.06)" }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(0,0,0,0)", "rgba(0,12,40,0.35)", "rgba(0,12,40,0.55)"]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  blobTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  blobLeft: {
    position: "absolute",
    bottom: "18%",
    left: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  blobRing: {
    position: "absolute",
    top: "32%",
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 28,
  },
  lightSpot: {
    position: "absolute",
    bottom: -30,
    left: "20%",
    width: "70%",
    height: 120,
    borderRadius: 60,
  },
});
