import type { TourAnchorRect } from "@/store/guidedTourStore";
import { useReduceMotion } from "@/components/onboarding/guided/hooks/useReduceMotion";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

type Props = {
  rect: TourAnchorRect | null;
  visible?: boolean;
};

export function PulseRing({ rect, visible = true }: Props) {
  const { colors } = useAppTheme();
  const reduceMotion = useReduceMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    if (!visible || reduceMotion) {
      scale.value = 1;
      opacity.value = 0.65;
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 1100, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 1100, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 1100 }),
        withTiming(0.55, { duration: 1100 }),
      ),
      -1,
      true,
    );
  }, [visible, reduceMotion, scale, opacity]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!rect || !visible) return null;

  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const size = Math.max(rect.width, rect.height) + 18;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          left: cx - size / 2,
          top: cy - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colors.accent,
        },
        ringStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    borderWidth: 2,
  },
});
