import { GLASS, RADIUS, cardShadow, claySurface } from "@/constants/designSystem";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { type ReactNode, useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { AnimatedPressable } from "./AnimatedPressable";

export type GlassIntensity = "soft" | "medium" | "strong";
export type SurfaceVariant = "glass" | "clay" | "minimal";

type Props = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  /** Live GPU blur. Prefer false on dense FlatList rows. */
  blur?: boolean;
  intensity?: GlassIntensity;
  /** glass = liquid blur · clay = soft extrusion · minimal = flat white */
  variant?: SurfaceVariant;
  radius?: number;
  shadow?: "sm" | "md" | "lg" | "card" | "clay" | "none";
  padding?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "none";
};

const INTENSITY: Record<GlassIntensity, number> = {
  soft: GLASS.blurLight,
  medium: GLASS.blurMedium,
  strong: GLASS.blurStrong,
};

export function GlassSurface({
  children,
  className = "",
  style,
  blur = true,
  intensity = "medium",
  variant = "glass",
  radius = RADIUS.xl,
  shadow = "card",
  padding = false,
  onPress,
  accessibilityLabel,
  accessibilityRole,
}: Props) {
  const [reduceTransparency, setReduceTransparency] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceTransparencyEnabled?.()
      .then((enabled) => {
        if (mounted) setReduceTransparency(Boolean(enabled));
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const useLiveBlur =
    variant === "glass" && blur && !reduceTransparency && Platform.OS !== "web";

  const surfaceStyle: ViewStyle =
    variant === "clay"
      ? claySurface(radius)
      : variant === "minimal"
        ? {
            borderRadius: radius,
            backgroundColor: "#FFFFFF",
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: GLASS.stroke,
            ...(shadow !== "none" ? cardShadow(shadow === "clay" ? "card" : shadow) : null),
          }
        : {
            borderRadius: radius,
            ...(shadow !== "none" ? cardShadow(shadow) : null),
          };

  const content = (
    <View className={className} style={[styles.outer, surfaceStyle, style]}>
      {variant === "glass" ? (
        <View style={[styles.card, { borderRadius: radius }]}>
          {useLiveBlur ? (
            <BlurView
              intensity={INTENSITY[intensity]}
              tint={GLASS.tint}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <LinearGradient
            pointerEvents="none"
            colors={
              useLiveBlur
                ? ["rgba(255,255,255,0.35)", "rgba(255,255,255,0.2)"]
                : ["rgba(23,23,23,0.04)", "rgba(23,23,23,0.02)"]
            }
            style={StyleSheet.absoluteFill}
          />
          <View pointerEvents="none" style={[styles.rim, { borderRadius: radius }]} />
          <View style={padding ? styles.padded : undefined}>{children}</View>
        </View>
      ) : (
        <View style={[{ borderRadius: radius, overflow: "hidden" }, padding ? styles.padded : null]}>
          {children}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        haptic
        accessibilityRole={accessibilityRole ?? "button"}
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return content;
}

/** List-safe card surface — theme-aware so content stays readable in dark mode. */
export function glassCardStyle(
  radius: number = RADIUS.xl,
  opts?: { backgroundColor?: string; borderColor?: string; isDark?: boolean },
): ViewStyle {
  const isDark = opts?.isDark ?? false;
  return {
    borderRadius: radius,
    overflow: "hidden",
    backgroundColor: opts?.backgroundColor ?? (isDark ? "#27272A" : "#FFFFFF"),
    borderWidth: 1,
    borderColor:
      opts?.borderColor ??
      (isDark ? "rgba(255,255,255,0.1)" : "rgba(28,25,23,0.08)"),
    ...Platform.select({
      ios: {
        shadowColor: "#1C1917",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.28 : 0.05,
        shadowRadius: 10,
      },
      android: { elevation: isDark ? 3 : 2 },
      default: {},
    }),
  };
}

/** List-safe clay card. */
export function clayCardStyle(radius: number = RADIUS.xl): ViewStyle {
  return {
    ...claySurface(radius),
    overflow: "hidden",
  };
}

const styles = StyleSheet.create({
  outer: {
    overflow: "visible",
  },
  card: {
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: GLASS.border,
  },
  rim: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: GLASS.rim,
  },
  padded: {
    padding: 16,
  },
});
