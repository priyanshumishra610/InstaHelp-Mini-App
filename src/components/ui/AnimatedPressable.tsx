import * as Haptics from "expo-haptics";
import { type ReactNode } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SPRING } from "@/constants/designSystem";

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, "children"> & {
  children: ReactNode;
  scaleTo?: number;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AnimatedPressable({
  children,
  scaleTo = 0.97,
  haptic = false,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressableBase
      {...rest}
      style={[animatedStyle, style]}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, SPRING.snappy);
        if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, SPRING.gentle);
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressableBase>
  );
}
