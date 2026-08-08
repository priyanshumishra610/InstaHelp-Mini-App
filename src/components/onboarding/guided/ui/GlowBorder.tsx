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
  radius?: number;
};

export function GlowBorder({ rect, visible = true, radius = 20 }: Props) {
  const { colors } = useAppTheme();
  const reduceMotion = useReduceMotion();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    if (!visible || reduceMotion) {
      pulse.value = 0.75;
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.45, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [visible, reduceMotion, pulse]);

  const style = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [{ scale: 0.998 + pulse.value * 0.006 }],
  }));

  if (!rect || !visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.border,
        {
          left: rect.x - 3,
          top: rect.y - 3,
          width: rect.width + 6,
          height: rect.height + 6,
          borderRadius: radius,
          borderColor: colors.accent,
          shadowColor: colors.accent,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  border: {
    position: "absolute",
    borderWidth: 2,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
});
