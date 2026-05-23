import { AUTH_ACCENT_TEAL } from "@/constants/authPremium";
import { useEffect, useMemo } from "react";
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

type Particle = {
  id: number;
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
};

function ParticleDot({ p }: { p: Particle }) {
  const y = useSharedValue(0);
  const opacity = useSharedValue(p.opacity);

  useEffect(() => {
    y.value = withDelay(
      p.delay,
      withRepeat(
        withSequence(
          withTiming(-18, { duration: p.duration, easing: Easing.inOut(Easing.ease) }),
          withTiming(12, { duration: p.duration, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
    opacity.value = withDelay(
      p.delay,
      withRepeat(
        withSequence(
          withTiming(p.opacity * 1.4, { duration: p.duration * 0.9 }),
          withTiming(p.opacity * 0.5, { duration: p.duration * 0.9 }),
        ),
        -1,
        true,
      ),
    );
  }, [opacity, p, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        style,
        {
          left: p.left,
          top: p.top,
          width: p.size,
          height: p.size,
          borderRadius: p.size / 2,
        },
      ]}
    />
  );
}

export function AnimatedParticles({ count = 28 }: { count?: number }) {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, id) => ({
      id,
      left: `${(id * 17 + 11) % 94}%` as `${number}%`,
      top: `${(id * 23 + 7) % 88}%` as `${number}%`,
      size: 2 + (id % 4),
      opacity: 0.15 + (id % 5) * 0.08,
      delay: (id % 7) * 180,
      duration: 4200 + (id % 5) * 900,
    }));
  }, [count]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p) => (
        <ParticleDot key={p.id} p={p} />
      ))}
      <View style={[styles.glowOrb, { backgroundColor: `${AUTH_ACCENT_TEAL}22` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  glowOrb: {
    position: "absolute",
    top: "18%",
    left: "12%",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
});
