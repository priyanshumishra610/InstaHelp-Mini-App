import {
  AUTH_FONT,
  AUTH_PRIMARY,
  AUTH_PRIMARY_DEEP,
} from "@/constants/authPremium";
import { GlassAuthCard } from "@/components/auth/premium/GlassAuthCard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onCreateAccount: () => void;
};

function GhostField({ label, icon }: { label: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={14} color="#94a3b8" />
      <Text style={[styles.fieldText, { fontFamily: AUTH_FONT.regular }]}>
        {label}
      </Text>
    </View>
  );
}

export function RegisterAuthCard({ onCreateAccount }: Props) {
  return (
    <GlassAuthCard style={styles.card}>
      <Text style={[styles.eyebrow, { fontFamily: AUTH_FONT.semibold }]}>
        New here
      </Text>
      <Text style={[styles.headline, { fontFamily: AUTH_FONT.extrabold }]}>
        Join InstaHelp
      </Text>
      <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
        Access local services, offers and smart bookings.
      </Text>
      <GhostField label="Your name" icon="person-outline" />
      <GhostField label="Phone number" icon="call-outline" />
      <GhostField label="Your city / area" icon="location-outline" />
      <Pressable
        onPress={onCreateAccount}
        accessibilityRole="button"
        style={{ marginTop: 14 }}
      >
        <LinearGradient
          colors={["#3B82F6", AUTH_PRIMARY, AUTH_PRIMARY_DEEP]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.primaryBtn}
        >
          <Text style={[styles.primaryLabel, { fontFamily: AUTH_FONT.bold }]}>
            Create Account
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </LinearGradient>
      </Pressable>
      <Text style={[styles.note, { fontFamily: AUTH_FONT.regular }]}>
        Sign up with your mobile — we save your profile to InstaHelp.
      </Text>
    </GlassAuthCard>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", minHeight: 348 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: AUTH_PRIMARY,
    opacity: 0.85,
    marginBottom: 6,
  },
  headline: {
    fontSize: 20,
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  sub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
    marginBottom: 10,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.35)",
  },
  fieldText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: AUTH_PRIMARY_DEEP,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryLabel: { color: "#fff", fontSize: 13 },
  note: {
    marginTop: 12,
    fontSize: 10,
    lineHeight: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
});
