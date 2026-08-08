import { PremiumPressable } from "@/components/auth/premium/PremiumPressable";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { AppIcon } from "@/components/ui/AppIcon";
import {
  AUTH_ACCENT_TEAL,
  AUTH_FONT,
  AUTH_GRADIENT,
  AUTH_PRIMARY,
} from "@/constants/authPremium";
import { RADIUS } from "@/constants/designSystem";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, StyleSheet, Text, View } from "react-native";

type Props = {
  credits: number;
  onPress: () => void;
  hint?: string | null;
  variant?: "premium" | "dark";
};

/** Premium header pill — opens credits & unlock history. */
export function CreditsPremiumButton({
  credits,
  onPress,
  hint,
  variant = "premium",
}: Props) {
  if (variant === "dark") {
    return (
      <PremiumPressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${credits} credits`}
        style={styles.darkOuter}
      >
        <View style={styles.darkFill}>
          <View style={styles.darkIconChip}>
            <AppIcon name="diamond" size={13} color="#FFFFFF" />
          </View>
          <View style={styles.textCol}>
            <View style={styles.valueRow}>
              <AnimatedNumber
                value={credits}
                style={[styles.darkValue, { fontFamily: AUTH_FONT.bold }]}
              />
              <Text style={[styles.darkLabel, { fontFamily: AUTH_FONT.semibold }]}>
                Credits
              </Text>
            </View>
            {hint ? (
              <Text style={[styles.darkHint, { fontFamily: AUTH_FONT.medium }]}>
                {hint}
              </Text>
            ) : null}
          </View>
        </View>
      </PremiumPressable>
    );
  }

  return (
    <PremiumPressable
      onPress={onPress}
      glow
      accessibilityRole="button"
      accessibilityLabel={`${credits} credits`}
      style={styles.outer}
    >
      <View style={styles.rim}>
        <LinearGradient
          colors={[...AUTH_GRADIENT]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          <View pointerEvents="none" style={styles.sheen} />
          <View style={styles.iconChip}>
            <AppIcon name="diamond" size={13} color={AUTH_ACCENT_TEAL} />
          </View>
          <View style={styles.textCol}>
            <View style={styles.valueRow}>
              <AnimatedNumber
                value={credits}
                style={[styles.value, { fontFamily: AUTH_FONT.bold }]}
              />
              <Text style={[styles.label, { fontFamily: AUTH_FONT.semibold }]}>
                Credits
              </Text>
            </View>
            {hint ? (
              <Text style={[styles.hint, { fontFamily: AUTH_FONT.medium }]}>
                {hint}
              </Text>
            ) : null}
          </View>
        </LinearGradient>
      </View>
    </PremiumPressable>
  );
}

const styles = StyleSheet.create({
  outer: Platform.select({
    ios: {
      shadowColor: AUTH_PRIMARY,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 14,
    },
    android: { elevation: 6 },
    default: {},
  }) ?? {},
  rim: {
    borderRadius: RADIUS.pill,
    padding: 1.5,
    backgroundColor: "rgba(79,209,197,0.35)",
  },
  fill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    overflow: "hidden",
  },
  sheen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.22)",
  },
  iconChip: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    alignItems: "flex-start",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  value: {
    fontSize: 17,
    lineHeight: 20,
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.2,
    color: "rgba(255,255,255,0.82)",
  },
  hint: {
    marginTop: 1,
    fontSize: 9,
    letterSpacing: 0.35,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
  },
  darkOuter: Platform.select({
    ios: {
      shadowColor: "#171717",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    },
    android: { elevation: 4 },
    default: {},
  }) ?? {},
  darkFill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AUTH_PRIMARY,
  },
  darkIconChip: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  darkValue: {
    fontSize: 15,
    lineHeight: 18,
    color: "#FFFFFF",
    fontVariant: ["tabular-nums"],
  },
  darkLabel: {
    fontSize: 11,
    letterSpacing: 0.2,
    color: "rgba(255,255,255,0.88)",
  },
  darkHint: {
    marginTop: 1,
    fontSize: 9,
    letterSpacing: 0.35,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
  },
});
