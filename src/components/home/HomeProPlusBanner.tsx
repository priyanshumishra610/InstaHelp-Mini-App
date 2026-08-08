import { AppIcon } from "@/components/ui/AppIcon";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { RADIUS, cardShadow } from "@/constants/designSystem";
import { PERF_MODE } from "@/constants/performance";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onUnlock: () => void;
};

const Box = PERF_MODE ? View : MotiView;

export function HomeProPlusBanner({ onUnlock }: Props) {
  const wrapProps = PERF_MODE
    ? { style: styles.wrap }
    : {
        from: { opacity: 0, translateY: 10 },
        animate: { opacity: 1, translateY: 0 },
        transition: { type: "spring" as const, damping: 20, stiffness: 280, delay: 120 },
        style: styles.wrap,
      };

  return (
    <Box {...wrapProps}>
      <Pressable
        onPress={onUnlock}
        accessibilityRole="button"
        accessibilityLabel="Unlock with Pro+"
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        <LinearGradient
          colors={["#1C1917", "#292524", "#44403C"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, cardShadow("md")]}
        >
          <View style={styles.glowOrb} pointerEvents="none" />
          <View style={[styles.glowOrb, styles.glowOrbSecondary]} pointerEvents="none" />

          <View style={styles.content}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <AppIcon name="crown-outline" size={11} color="#FFFFFF" />
                <Text style={[styles.badgeText, { fontFamily: AUTH_FONT.bold }]}>Pro+</Text>
              </View>
              <Text style={[styles.badgeHint, { fontFamily: AUTH_FONT.medium }]}>
                Early access
              </Text>
            </View>

            <Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>
              Unlock premium categories first
            </Text>
            <Text style={[styles.subtitle, { fontFamily: AUTH_FONT.regular }]}>
              High-quality vendors, before anyone else.
            </Text>

            <View style={styles.cta}>
              <Text style={[styles.ctaText, { fontFamily: AUTH_FONT.semibold }]}>
                Unlock with Pro+
              </Text>
              <AppIcon name="arrowForward" size={14} color={AUTH_PRIMARY} />
            </View>
          </View>

          <View style={styles.graphicWrap} pointerEvents="none">
            <View style={styles.cardStack}>
              <View style={[styles.stackCard, styles.stackCardBack]} />
              <LinearGradient
                colors={["#FAFAF9", "#E7E5E4"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.stackCardFront}
              >
                <View style={styles.chipRow}>
                  <View style={styles.crownChip}>
                    <AppIcon name="crown-outline" size={12} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.proLabel, { fontFamily: AUTH_FONT.bold }]}>Pro+</Text>
                </View>
                <View style={styles.stripe} />
                <View style={styles.stripeShort} />
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Box>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  pressable: {
    borderRadius: RADIUS.lg,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  card: {
    flexDirection: "row",
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    minHeight: 124,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  glowOrb: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -40,
    right: 20,
  },
  glowOrbSecondary: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: 60,
    left: -20,
    right: undefined,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 8,
    gap: 4,
    justifyContent: "center",
    zIndex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.5,
    color: "#FFFFFF",
  },
  badgeHint: {
    fontSize: 10,
    letterSpacing: 0.2,
    color: "rgba(255,255,255,0.55)",
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.3,
    color: "#FAFAF9",
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    color: "rgba(245,245,244,0.72)",
    maxWidth: "96%",
  },
  cta: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.pill,
    backgroundColor: "#FFFFFF",
  },
  ctaText: {
    fontSize: 12,
    color: AUTH_PRIMARY,
  },
  graphicWrap: {
    width: 96,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 12,
    zIndex: 1,
  },
  cardStack: {
    width: 78,
    height: 88,
    alignItems: "center",
    justifyContent: "center",
  },
  stackCard: {
    position: "absolute",
    width: 68,
    height: 44,
    borderRadius: 10,
  },
  stackCardBack: {
    backgroundColor: "rgba(255,255,255,0.12)",
    transform: [{ rotate: "12deg" }, { translateY: -6 }],
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  stackCardFront: {
    width: 72,
    height: 46,
    borderRadius: 10,
    padding: 9,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(28,25,23,0.08)",
    transform: [{ rotate: "-8deg" }],
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  crownChip: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AUTH_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  proLabel: {
    fontSize: 11,
    color: AUTH_PRIMARY,
    letterSpacing: 0.3,
  },
  stripe: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(28,25,23,0.12)",
    width: "100%",
  },
  stripeShort: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(28,25,23,0.08)",
    width: "55%",
    marginTop: 3,
  },
});
