import { useMemo } from "react";
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
import { useEffect } from "react";

type Sparkle = {
  id: number;
  left: `${number}%`;
  top: `${number}%`;
  size: number;
  delay: number;
};

function SparkleDot({ s }: { s: Sparkle }) {
  const opacity = useSharedValue(0.2);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withDelay(
      s.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.out(Easing.ease) }),
          withTiming(0.15, { duration: 1100 }),
        ),
        -1,
        false,
      ),
    );
    scale.value = withDelay(
      s.delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 900 }),
          withTiming(0.5, { duration: 1100 }),
        ),
        -1,
        false,
      ),
    );
  }, [opacity, s.delay, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.sparkle,
        style,
        {
          left: s.left,
          top: s.top,
          width: s.size,
          height: s.size,
        },
      ]}
    />
  );
}

export function GamingSparkles({ count = 16 }: { count?: number }) {
  const sparkles = useMemo<Sparkle[]>(
    () =>
      Array.from({ length: count }, (_, id) => ({
        id,
        left: `${(id * 23 + 7) % 92}%` as `${number}%`,
        top: `${(id * 31 + 12) % 88}%` as `${number}%`,
        size: 3 + (id % 4),
        delay: (id % 7) * 180,
      })),
    [count],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {sparkles.map((s) => (
        <SparkleDot key={s.id} s={s} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sparkle: {
    position: "absolute",
    borderRadius: 99,
    backgroundColor: "#fde68a",
  },
});
