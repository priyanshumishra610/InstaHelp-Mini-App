import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT } from "@/constants/authPremium";
import { RADIUS } from "@/constants/designSystem";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onExplore: () => void;
};

export function HomeFooterCta({ onExplore }: Props) {
  const { colors, isDark } = useAppTheme();
  const barBg = isDark ? colors.surface : "#171717";
  const copyColor = isDark ? colors.inkMuted : "rgba(255,255,255,0.85)";
  const ctaBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.14)";
  const ctaBorder = isDark ? colors.line : "rgba(255,255,255,0.2)";
  const iconFg = isDark ? colors.ink : "#FFFFFF";

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: barBg,
            borderWidth: isDark ? 1 : 0,
            borderColor: colors.line,
          },
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: ctaBg }]}>
          <AppIcon name="shield" size={22} color={iconFg} />
        </View>

        <Text style={[styles.copy, { fontFamily: AUTH_FONT.medium, color: copyColor }]}>
          Your satisfaction is our guarantee. We ensure quality, safe and reliable
          services every time.
        </Text>

        <Pressable
          onPress={onExplore}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: ctaBg, borderColor: ctaBorder },
            pressed && styles.ctaPressed,
          ]}
        >
          <Text style={[styles.ctaText, { fontFamily: AUTH_FONT.semibold, color: iconFg }]}>
            Explore Now
          </Text>
          <AppIcon name="arrowForward" size={14} color={iconFg} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: RADIUS.xl,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  ctaPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  ctaText: {
    fontSize: 11,
  },
});
