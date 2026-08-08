import { useReduceMotion } from "@/components/onboarding/guided/hooks/useReduceMotion";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const PARTICLE_COUNT = 28;

type Particle = {
  id: number;
  x: number;
  delay: number;
  drift: number;
  size: number;
  color: string;
};

type Props = {
  active?: boolean;
};

export function ConfettiBurst({ active = true }: Props) {
  const { width, height } = useWindowDimensions();
  const { colors } = useAppTheme();
  const reduceMotion = useReduceMotion();

  const particles = useMemo<Particle[]>(() => {
    const palette = [colors.accent, "#171717", "#F59E0B", "#10B981", "#6366F1"];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      delay: Math.random() * 420,
      drift: (Math.random() - 0.5) * 80,
      size: 4 + Math.random() * 5,
      color: palette[i % palette.length] ?? colors.accent,
    }));
  }, [width, colors.accent]);

  if (!active || reduceMotion) return null;

  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p) => (
        <ConfettiPiece key={p.id} particle={p} height={height} />
      ))}
    </Animated.View>
  );
}

function ConfettiPiece({
  particle,
  height,
}: {
  particle: Particle;
  height: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      particle.delay,
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }),
    );
  }, [particle.delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
    transform: [
      { translateX: particle.x + particle.drift * progress.value },
      { translateY: -20 + progress.value * (height * 0.55) },
      { rotate: `${progress.value * 360}deg` },
      { scale: 1 - progress.value * 0.35 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          width: particle.size,
          height: particle.size * 1.4,
          borderRadius: 2,
          backgroundColor: particle.color,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  piece: {
    position: "absolute",
    top: 0,
  },
});
