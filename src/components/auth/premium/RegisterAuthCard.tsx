import {
  AUTH_FONT,
  AUTH_GRADIENT,
  AUTH_PRIMARY,
} from "@/constants/authPremium";
import { GlassAuthCard } from "@/components/auth/premium/GlassAuthCard";
import { PremiumPressable } from "@/components/auth/premium/PremiumPressable";
import { SocialAuthButton } from "@/components/auth/premium/SocialAuthButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  onCreateAccount: (phone?: string) => void;
  initialPhone?: string;
  compact?: boolean;
  onSocialHint?: (message: string) => void;
};

function Field({
  label,
  icon,
  value,
  onChangeText,
  keyboardType,
  maxLength,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "phone-pad";
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.fieldBlock}>
      <Text style={[styles.fieldLabel, { fontFamily: AUTH_FONT.semibold }]}>
        {label}
      </Text>
      <View style={[styles.field, focused && styles.fieldFocused]}>
        <Ionicons name={icon} size={16} color={focused ? AUTH_PRIMARY : "#94a3b8"} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={label}
          placeholderTextColor="#cbd5e1"
          keyboardType={keyboardType}
          maxLength={maxLength}
          style={[styles.fieldInput, { fontFamily: AUTH_FONT.medium }]}
        />
      </View>
    </View>
  );
}

export function RegisterAuthCard({
  onCreateAccount,
  initialPhone = "",
  compact,
  onSocialHint,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(initialPhone.replace(/\D/g, "").slice(0, 10));
  const [location, setLocation] = useState("");

  const socialHint = () =>
    onSocialHint?.("Complete sign-up with your mobile on the login card.");

  return (
    <GlassAuthCard style={compact ? [styles.card, styles.cardCompact] : styles.card}>
      <Text style={[styles.eyebrow, { fontFamily: AUTH_FONT.semibold }]}>
        Join the network
      </Text>
      <Text style={[styles.headline, { fontFamily: AUTH_FONT.extrabold }]}>
        Join InstaHelp
      </Text>
      <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
        Access local services, offers and smart bookings.
      </Text>

      <Field label="Name" icon="person-outline" value={name} onChangeText={setName} />
      <Field
        label="Phone number"
        icon="call-outline"
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
        keyboardType="phone-pad"
        maxLength={10}
      />
      <Field
        label="Location"
        icon="location-outline"
        value={location}
        onChangeText={setLocation}
      />

      <PremiumPressable
        onPress={() => onCreateAccount(phone || undefined)}
        glow
        accessibilityRole="button"
        style={{ marginTop: 16 }}
      >
        <LinearGradient
          colors={[...AUTH_GRADIENT]}
          locations={[0, 0.5, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.primaryBtn}
        >
          <Text style={[styles.primaryLabel, { fontFamily: AUTH_FONT.bold }]}>
            Create Account
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </LinearGradient>
      </PremiumPressable>

      {!compact ? (
        <View style={styles.socialRow}>
          <SocialAuthButton
            provider="google"
            compact
            label="Google"
            onPress={socialHint}
          />
          <SocialAuthButton
            provider="apple"
            compact
            label="Apple"
            onPress={socialHint}
          />
        </View>
      ) : null}
    </GlassAuthCard>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", minHeight: 400 },
  cardCompact: { minHeight: 360 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: "uppercase",
    color: AUTH_PRIMARY,
    opacity: 0.85,
    marginBottom: 6,
  },
  headline: {
    fontSize: 22,
    color: "#0f172a",
    letterSpacing: -0.4,
  },
  sub: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
    marginBottom: 12,
  },
  fieldBlock: { marginTop: 10 },
  fieldLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: 6,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(248,250,252,0.95)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
  },
  fieldFocused: {
    borderColor: "rgba(23,23,23,0.18)",
    backgroundColor: "#fff",
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
  },
  fieldInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    paddingVertical: 0,
  },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#E6C000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryLabel: { color: "#FFFFFF", fontSize: 15 },
  socialRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
});
