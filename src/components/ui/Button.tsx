import { SPRING } from "@/constants/designSystem";
import { ACCENT } from "@/constants/theme";
import { cn } from "@/utils/cn";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

type Props = PropsWithChildren<{
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}>;

export function Button({
  onPress,
  children,
  className,
  textClassName,
  variant = "primary",
  size = "md",
  disabled,
  loading,
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled || loading) return;
    if (variant === "primary" || variant === "danger") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const sizes: Record<Size, string> = {
    sm: "px-4 py-2.5 rounded-xl",
    md: "px-5 py-3.5 rounded-2xl",
    lg: "px-6 py-4 rounded-2xl",
  };
  const sizeText: Record<Size, string> = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-base",
  };

  const styles: Record<Variant, string> = {
    primary: "bg-accent-yellow active:opacity-90",
    secondary: "bg-accent active:opacity-90",
    ghost: "bg-transparent active:opacity-70",
    outline:
      "border border-neutral-300 dark:border-neutral-700 bg-transparent active:opacity-80",
    danger: "bg-red-500 active:opacity-90",
  };
  const textStyles: Record<Variant, string> = {
    primary: "text-neutral-950 font-bold",
    secondary: "text-white font-semibold",
    ghost: "text-neutral-900 dark:text-white font-medium",
    outline: "text-neutral-900 dark:text-neutral-100 font-semibold",
    danger: "text-white font-semibold",
  };

  const indicatorColor =
    variant === "primary"
      ? "#0A0A0A"
      : variant === "outline" || variant === "ghost"
        ? ACCENT
        : "#ffffff";

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      onPress={handlePress}
      onPressIn={() => {
        if (disabled || loading) return;
        scale.value = withSpring(0.96, SPRING.snappy);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING.gentle);
      }}
      style={pressStyle}
      className={cn(
        "items-center justify-center",
        sizes[size],
        styles[variant],
        disabled && "opacity-40",
        className,
      )}
    >
      <MotiView
        key={loading ? "loading" : "content"}
        from={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 150 }}
      >
        {loading ? (
          <ActivityIndicator color={indicatorColor} />
        ) : typeof children === "string" ? (
          <Text className={cn(sizeText[size], textStyles[variant], textClassName)}>
            {children}
          </Text>
        ) : (
          children
        )}
      </MotiView>
    </AnimatedPressable>
  );
}
