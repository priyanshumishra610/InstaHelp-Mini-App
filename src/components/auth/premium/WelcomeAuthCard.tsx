import { GlassAuthCard } from "@/components/auth/premium/GlassAuthCard";
import { ServiceIllustration } from "@/components/auth/premium/ServiceIllustration";
import {
  AUTH_FONT,
  AUTH_PRIMARY,
  AUTH_PRIMARY_DEEP,
} from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onLogin: () => void;
  onRegister: () => void;
};

export function WelcomeAuthCard({ onLogin, onRegister }: Props) {
  return (
    <GlassAuthCard style={styles.card}>
      <Text style={[styles.eyebrow, { fontFamily: AUTH_FONT.semibold }]}>
        InstaHelp
      </Text>
      <ServiceIllustration />
      <Text style={[styles.headline, { fontFamily: AUTH_FONT.extrabold }]}>
        Everything You Need.{"\n"}One Tap Away.
      </Text>
      <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
        Book trusted local services, repairs, deliveries and experiences
        instantly.
      </Text>
      <View style={styles.actions}>
        <Pressable onPress={onLogin} accessibilityRole="button">
          <LinearGradient
            colors={["#3B82F6", AUTH_PRIMARY, AUTH_PRIMARY_DEEP]}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.primaryBtn}
          >
            <Text style={[styles.primaryLabel, { fontFamily: AUTH_FONT.bold }]}>
              Login
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </LinearGradient>
        </Pressable>
        <Pressable
          onPress={onRegister}
          accessibilityRole="button"
          style={styles.secondaryBtn}
        >
          <Text style={[styles.secondaryLabel, { fontFamily: AUTH_FONT.semibold }]}>
            Register
          </Text>
        </Pressable>
      </View>
    </GlassAuthCard>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", minHeight: 332 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: AUTH_PRIMARY,
    opacity: 0.85,
    marginBottom: 4,
  },
  headline: {
    fontSize: 18,
    lineHeight: 20,
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  sub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748b",
  },
  actions: { marginTop: 14, gap: 8 },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: AUTH_PRIMARY_DEEP,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryLabel: { color: "#fff", fontSize: 13 },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(37,99,235,0.25)",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  secondaryLabel: { color: AUTH_PRIMARY, fontSize: 13 },
});
