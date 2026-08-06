import { GLASS, RADIUS, cardShadow, claySurface } from "@/constants/designSystem";
import { ACCENT } from "@/constants/theme";
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
                ? [GLASS.fillStrong, GLASS.fill]
                : [GLASS.fillFallback, "rgba(255,255,255,0.9)"]
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

/** List-safe translucent glass with blue tint (no BlurView). */
export function glassCardStyle(radius: number = RADIUS.xl): ViewStyle {
  return {
    borderRadius: radius,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.62)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,74,173,0.12)",
    ...Platform.select({
      ios: {
        shadowColor: ACCENT,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 18,
      },
      android: { elevation: 4 },
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
