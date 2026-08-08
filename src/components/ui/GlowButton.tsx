import { RADIUS } from "@/constants/designSystem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
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
  /** primary = filled accent glow · soft = outlined surface pill */
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
  const { colors, isDark } = useAppTheme();
  const isPrimary = variant === "primary";
  const primaryTop = isDark ? colors.ink : colors.accent;
  const primaryBottom = isDark ? colors.inkMuted : colors.accentDeep;
  const primaryLabel = isDark ? colors.canvas : colors.accentForeground;

  return (
    <View style={[fullWidth && styles.fullWidth, style]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        className="active:opacity-90"
        style={[
          styles.pressable,
          isPrimary
            ? [
                styles.primaryGlow,
                Platform.OS === "ios"
                  ? {
                      shadowColor: primaryTop,
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.35,
                      shadowRadius: 22,
                    }
                  : { elevation: 8 },
              ]
            : [
                styles.softGlow,
                Platform.OS === "ios"
                  ? {
                      shadowColor: colors.ink,
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: isDark ? 0.2 : 0.12,
                      shadowRadius: 14,
                    }
                  : { elevation: 4 },
              ],
        ]}
      >
        {isPrimary ? (
          <LinearGradient
            colors={[primaryTop, primaryBottom]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryFill}
          >
            <View pointerEvents="none" style={styles.primarySheen} />
            <Text style={[styles.primaryLabel, { color: primaryLabel }]}>
              {label}
            </Text>
          </LinearGradient>
        ) : (
          <View
            style={[
              styles.softFill,
              {
                backgroundColor: colors.surface,
                borderColor: colors.line,
              },
            ]}
          >
            <Text style={[styles.softLabel, { color: colors.ink }]}>{label}</Text>
          </View>
        )}
      </Pressable>
    </View>
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
  primaryGlow: {},
  softGlow: {},
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
    letterSpacing: 0.2,
  },
  softFill: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
  },
  softLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
});

export const GlowButton = memo(GlowButtonInner);
