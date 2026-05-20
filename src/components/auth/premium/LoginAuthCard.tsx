import { MinimalPhoneField } from "@/components/auth/premium/MinimalPhoneField";
import { GlassAuthCard } from "@/components/auth/premium/GlassAuthCard";
import {
  AUTH_ACCENT_TEAL,
  AUTH_FONT,
  AUTH_PRIMARY,
  AUTH_PRIMARY_DEEP,
} from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextInput,
} from "react-native";
import type { RefObject } from "react";

type Props = {
  phoneInputRef?: RefObject<TextInput | null>;
  phone: string;
  onPhoneChange: (v: string) => void;
  loading: boolean;
  error: string | null;
  onContinue: () => void;
};

export function LoginAuthCard({
  phoneInputRef,
  phone,
  onPhoneChange,
  loading,
  error,
  onContinue,
}: Props) {
  const digits = phone.replace(/\D/g, "").length;

  return (
    <GlassAuthCard elevated accentEdge style={styles.card}>
      <Text style={[styles.eyebrow, { fontFamily: AUTH_FONT.semibold }]}>
        InstaHelp
      </Text>
      <Text style={[styles.headline, { fontFamily: AUTH_FONT.extrabold }]}>
        Welcome back
      </Text>
      <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
        Sign in with your mobile — we sync your profile securely.
      </Text>

      <MinimalPhoneField
        ref={phoneInputRef}
        value={phone}
        onChangeText={onPhoneChange}
        editable={!loading}
        error={!!error}
      />

      {digits > 0 && digits < 10 && !error ? (
        <Text style={[styles.hint, { fontFamily: AUTH_FONT.regular }]}>
          {10 - digits} digit{10 - digits === 1 ? "" : "s"} left
        </Text>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={16} color="#dc2626" />
          <Text style={[styles.error, { fontFamily: AUTH_FONT.medium }]}>
            {error}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={onContinue}
        disabled={loading}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.ctaWrap,
          pressed && !loading && { transform: [{ scale: 0.98 }] },
        ]}
      >
        <LinearGradient
          colors={["#3B82F6", AUTH_PRIMARY, AUTH_PRIMARY_DEEP]}
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.primaryBtn, loading && { opacity: 0.82 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.ctaInner}>
              <Text style={[styles.primaryLabel, { fontFamily: AUTH_FONT.bold }]}>
                Continue
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </View>
          )}
        </LinearGradient>
      </Pressable>

      <View style={styles.trustRow}>
        {[
          { icon: "shield-checkmark" as const, label: "Secure" },
          { icon: "flash" as const, label: "Instant" },
          { icon: "cloud-done-outline" as const, label: "Synced" },
        ].map((item) => (
          <View key={item.label} style={styles.trustChip}>
            <Ionicons name={item.icon} size={13} color={AUTH_PRIMARY} />
            <Text style={[styles.trustChipText, { fontFamily: AUTH_FONT.semibold }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footerNote}>
        <View style={[styles.dot, { backgroundColor: AUTH_ACCENT_TEAL }]} />
        <Text style={[styles.trust, { fontFamily: AUTH_FONT.regular }]}>
          Local services · One super app
        </Text>
      </View>
    </GlassAuthCard>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", minHeight: 340 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: AUTH_PRIMARY,
    opacity: 0.85,
    marginBottom: 6,
  },
  headline: {
    fontSize: 26,
    color: "#0f172a",
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  sub: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748b",
    maxWidth: "100%",
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: "#94a3b8",
  },
  errorBox: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(254,242,242,0.95)",
    borderWidth: 1,
    borderColor: "rgba(252,165,165,0.5)",
  },
  error: {
    flex: 1,
    fontSize: 12,
    color: "#b91c1c",
    lineHeight: 17,
  },
  ctaWrap: {
    marginTop: 20,
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AUTH_PRIMARY_DEEP,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 8,
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryLabel: { color: "#fff", fontSize: 16, letterSpacing: 0.2 },
  trustRow: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  trustChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(37,99,235,0.06)",
    borderWidth: 1,
    borderColor: "rgba(37,99,235,0.1)",
  },
  trustChipText: {
    fontSize: 11,
    color: "#334155",
    letterSpacing: 0.2,
  },
  footerNote: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  trust: { fontSize: 11, color: "#94a3b8", letterSpacing: 0.2 },
});
