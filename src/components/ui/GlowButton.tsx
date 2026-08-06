import { RADIUS } from "@/constants/designSystem";
import { ACCENT, ACCENT_DEEP } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { memo } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  /** primary = filled blue glow · soft = glass blue outline */
  variant?: "primary" | "soft";
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

function GlowButtonInner({
  label,
  onPress,
  variant = "primary",
  fullWidth = false,
  style,
  accessibilityLabel,
}: Props) {
  const isPrimary = variant === "primary";

  return (
    <MotiView
      animate={{ opacity: [0.92, 1, 0.92] }}
      transition={{ type: "timing", duration: 2800, loop: true }}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        className="active:opacity-90"
        style={[
          styles.pressable,
          isPrimary ? styles.primaryGlow : styles.softGlow,
        ]}
      >
        {isPrimary ? (
          <LinearGradient
            colors={[ACCENT, ACCENT_DEEP]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryFill}
          >
            <View pointerEvents="none" style={styles.primarySheen} />
            <Text style={styles.primaryLabel}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.softFill}>
            <Text style={styles.softLabel}>{label}</Text>
          </View>
        )}
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: "100%",
  },
  pressable: {
    borderRadius: RADIUS.pill,
    overflow: "hidden",
  },
  primaryGlow: Platform.select({
    ios: {
      shadowColor: ACCENT,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.42,
      shadowRadius: 22,
    },
    android: { elevation: 8 },
    default: {},
  }) ?? {},
  softGlow: Platform.select({
    ios: {
      shadowColor: ACCENT,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 14,
    },
    android: { elevation: 4 },
    default: {},
  }) ?? {},
  primaryFill: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.pill,
    overflow: "hidden",
  },
  primarySheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.35)",
  },
  primaryLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  softFill: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: "rgba(0,74,173,0.28)",
    backgroundColor: "rgba(232,240,255,0.55)",
  },
  softLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: ACCENT,
  },
});

export const GlowButton = memo(GlowButtonInner);
