import { GlassAuthCard } from "@/components/auth/premium/GlassAuthCard";
import { PremiumPressable } from "@/components/auth/premium/PremiumPressable";
import { ServiceIllustration } from "@/components/auth/premium/ServiceIllustration";
import {
  AUTH_ACCENT_YELLOW,
  AUTH_FONT,
  AUTH_PRIMARY,
} from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  onLogin: () => void;
  onRegister: () => void;
  compact?: boolean;
};

export function WelcomeAuthCard({ onLogin, onRegister, compact }: Props) {
  return (
    <GlassAuthCard style={compact ? [styles.card, styles.cardCompact] : styles.card}>
      <Text style={[styles.eyebrow, { fontFamily: AUTH_FONT.semibold }]}>
        Discover InstaHelp
      </Text>
      {!compact ? <ServiceIllustration /> : null}
      <Text
        style={[
          styles.headline,
          { fontFamily: AUTH_FONT.extrabold },
          compact && styles.headlineCompact,
        ]}
      >
        Everything You Need.{"\n"}One Tap Away.
      </Text>
      <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
        Trusted services, instant bookings, repairs, travel, logistics and more.
      </Text>
      <View style={styles.actions}>
        <PremiumPressable onPress={onLogin} glow accessibilityRole="button">
          <LinearGradient
            colors={[AUTH_ACCENT_YELLOW, "#E6C000", "#D4AF00"]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.primaryBtn}
          >
            <Text style={[styles.primaryLabel, { fontFamily: AUTH_FONT.bold }]}>
              Login
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#0A0A0A" />
          </LinearGradient>
        </PremiumPressable>
        <PremiumPressable
          onPress={onRegister}
          accessibilityRole="button"
          style={styles.secondaryBtn}
        >
          <Text style={[styles.secondaryLabel, { fontFamily: AUTH_FONT.semibold }]}>
            Register
          </Text>
        </PremiumPressable>
      </View>
    </GlassAuthCard>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", minHeight: 360 },
  cardCompact: { minHeight: 300 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: AUTH_PRIMARY,
    opacity: 0.85,
    marginBottom: 4,
  },
  headline: {
    fontSize: 20,
    lineHeight: 26,
    color: "#0f172a",
    letterSpacing: -0.4,
  },
  headlineCompact: {
    fontSize: 17,
    lineHeight: 22,
  },
  sub: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748b",
  },
  actions: { marginTop: 18, gap: 10 },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#E6C000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryLabel: { color: "#0A0A0A", fontSize: 15 },
  secondaryBtn: {
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(37,99,235,0.28)",
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  secondaryLabel: { color: AUTH_PRIMARY, fontSize: 14 },
});
