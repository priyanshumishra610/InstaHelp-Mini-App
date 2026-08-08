import { useReduceMotion } from "@/components/onboarding/guided/hooks/useReduceMotion";
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
import Svg, { Circle } from "react-native-svg";

type Props = {
  x: number;
  y: number;
  visible?: boolean;
  onTapComplete?: () => void;
};

const SIZE = 44;

export function FakeTouchIndicator({
  x,
  y,
  visible = true,
  onTapComplete,
}: Props) {
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const ripple = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 160 });
      return;
    }

    if (reduceMotion) {
      opacity.value = 1;
      scale.value = 1;
      onTapComplete?.();
      return;
    }

    opacity.value = withTiming(1, { duration: 280 });
    scale.value = withDelay(
      420,
      withSequence(
        withTiming(0.92, { duration: 120, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 140, easing: Easing.out(Easing.back(1.4)) }),
      ),
    );
    ripple.value = withDelay(
      520,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 0 }),
        ),
        2,
        false,
      ),
    );

    const timer = setTimeout(() => onTapComplete?.(), 1100);
    return () => clearTimeout(timer);
  }, [visible, reduceMotion, onTapComplete, opacity, scale, ripple]);

  const fingerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: x - SIZE / 2 },
      { translateY: y - SIZE / 2 },
      { scale: scale.value },
    ],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: (1 - ripple.value) * 0.35,
    transform: [
      { translateX: x - 28 },
      { translateY: y - 28 },
      { scale: 0.6 + ripple.value * 0.9 },
    ],
  }));

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.ripple, rippleStyle]} />
      <Animated.View style={[styles.finger, fingerStyle]}>
        <Svg width={SIZE} height={SIZE} viewBox="0 0 44 44">
          <Circle cx={22} cy={22} r={18} fill="rgba(23,23,23,0.88)" />
          <Circle cx={22} cy={22} r={8} fill="#FFFFFF" opacity={0.92} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  finger: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
  },
  ripple: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#171717",
  },
});
