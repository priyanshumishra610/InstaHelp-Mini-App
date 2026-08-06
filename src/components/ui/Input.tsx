import { ACCENT } from "@/constants/theme";
import { cn } from "@/utils/cn";
import { forwardRef } from "react";
import { TextInput, type TextInputProps } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type Props = TextInputProps & {
  className?: string;
  error?: boolean;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { className, error, onFocus, onBlur, style, ...rest },
  ref,
) {
  const focus = useSharedValue(0);
  const idleColor = error ? "#f87171" : "#e5e5e5";
  const focusColor = error ? "#ef4444" : ACCENT;

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [idleColor, focusColor]),
    shadowColor: focusColor,
    shadowOpacity: focus.value * 0.22,
    shadowRadius: 4 + focus.value * 6,
    shadowOffset: { width: 0, height: focus.value * 2 },
  }));

  return (
    <AnimatedTextInput
      ref={ref}
      placeholderTextColor="#9ca3af"
      onFocus={(e) => {
        focus.value = withTiming(1, { duration: 180 });
        onFocus?.(e);
      }}
      onBlur={(e) => {
        focus.value = withTiming(0, { duration: 180 });
        onBlur?.(e);
      }}
      style={[animatedStyle, style]}
      className={cn(
        "rounded-2xl border bg-white px-4 py-3.5 text-base text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50",
        "dark:border-neutral-800",
        className,
      )}
      {...rest}
    />
  );
});
