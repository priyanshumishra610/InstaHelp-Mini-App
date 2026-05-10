import { cn } from "@/utils/cn";
import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";

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
  const handlePress = () => {
    if (disabled || loading) return;
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
    primary: "bg-accent shadow-glow active:opacity-90",
    secondary: "bg-neutral-900 dark:bg-white active:opacity-90",
    ghost: "bg-transparent active:opacity-70",
    outline:
      "border border-neutral-300 dark:border-neutral-700 bg-transparent active:opacity-80",
    danger: "bg-red-500 active:opacity-90",
  };
  const textStyles: Record<Variant, string> = {
    primary: "text-accent-foreground font-bold",
    secondary: "text-white dark:text-neutral-900 font-semibold",
    ghost: "text-neutral-900 dark:text-white font-medium",
    outline: "text-neutral-900 dark:text-neutral-100 font-semibold",
    danger: "text-white font-semibold",
  };

  const indicatorColor =
    variant === "primary" || variant === "outline" || variant === "ghost"
      ? "#1a1a1a"
      : "#fff";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      onPress={handlePress}
      className={cn(
        "items-center justify-center",
        sizes[size],
        styles[variant],
        disabled && "opacity-40",
        className,
      )}
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
    </Pressable>
  );
}
