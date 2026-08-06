import { MinimalPhoneField } from "@/components/auth/premium/MinimalPhoneField";
import { GlassAuthCard } from "@/components/auth/premium/GlassAuthCard";
import { OtpInputRow } from "@/components/auth/premium/OtpInputRow";
import { PremiumPressable } from "@/components/auth/premium/PremiumPressable";
import { SocialAuthButton } from "@/components/auth/premium/SocialAuthButton";
import {
  AUTH_ACCENT_TEAL,
  AUTH_FONT,
  AUTH_GRADIENT,
  AUTH_PRIMARY,
} from "@/constants/authPremium";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type TextInput,
} from "react-native";
import type { RefObject } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";

type Props = {
  phoneInputRef?: RefObject<TextInput | null>;
  phone: string;
  onPhoneChange: (v: string) => void;
  loading: boolean;
  error: string | null;
  onContinue: () => void;
  isFocused?: boolean;
  onSocialHint?: (message: string) => void;
};

export function LoginAuthCard({
  phoneInputRef,
  phone,
  onPhoneChange,
  loading,
  error,
  onContinue,
  isFocused = true,
  onSocialHint,
}: Props) {
  const [otp, setOtp] = useState("");
  const digits = phone.replace(/\D/g, "").length;
  const showOtp = digits >= 10;
  const phoneReady = digits === 10;

  const socialHint = () =>
    onSocialHint?.("Phone sign-in is fastest — enter your mobile number below.");

  return (
    <GlassAuthCard elevated accentEdge glowPulse={isFocused} style={styles.card}>
      <Text style={[styles.eyebrow, { fontFamily: AUTH_FONT.semibold }]}>
        InstaHelp
      </Text>
      <Text style={[styles.headline, { fontFamily: AUTH_FONT.extrabold }]}>
        Welcome Back
      </Text>
      <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
        We missed you at InstaHelp
      </Text>

      <MinimalPhoneField
        ref={phoneInputRef}
        value={phone}
        onChangeText={onPhoneChange}
        editable={!loading && isFocused}
        error={!!error}
      />

      {showOtp ? (
        <Animated.View entering={FadeInDown.duration(320)}>
          <OtpInputRow value={otp} onChange={setOtp} visible={isFocused} />
        </Animated.View>
      ) : null}

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

      <PremiumPressable
        onPress={onContinue}
        disabled={loading || !phoneReady}
        glow
        accessibilityRole="button"
        accessibilityLabel="Continue"
        style={[styles.ctaWrap, !phoneReady && styles.ctaDisabled]}
      >
        <LinearGradient
          colors={
            phoneReady
              ? [...AUTH_GRADIENT]
              : ["#94a3b8", "#64748b", "#475569"]
          }
          locations={[0, 0.45, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.primaryBtn, loading && { opacity: 0.82 }]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.ctaInner}>
              <Text style={[styles.primaryLabel, { fontFamily: AUTH_FONT.bold }]}>
                Continue
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </View>
          )}
        </LinearGradient>
      </PremiumPressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={[styles.dividerText, { fontFamily: AUTH_FONT.medium }]}>
          or
        </Text>
        <View style={styles.dividerLine} />
      </View>

      <SocialAuthButton provider="google" onPress={socialHint} />

      <View style={styles.trustRow}>
        {[
          { icon: "shield-checkmark" as const, label: "Verified Services" },
          { icon: "lock-closed" as const, label: "Secure Login" },
          { icon: "flash" as const, label: "Fast Booking" },
        ].map((item) => (
          <View key={item.label} style={styles.trustChip}>
            <Ionicons name={item.icon} size={12} color={AUTH_PRIMARY} />
            <Text style={[styles.trustChipText, { fontFamily: AUTH_FONT.semibold }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.footerNote}>
        <View style={[styles.dot, { backgroundColor: AUTH_ACCENT_TEAL }]} />
        <Text style={[styles.trust, { fontFamily: AUTH_FONT.regular }]}>
          One tap to trusted local help
        </Text>
      </View>
    </GlassAuthCard>
  );
}

const styles = StyleSheet.create({
  card: { width: "100%", minHeight: 380 },
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
  ctaWrap: { marginTop: 18 },
  ctaDisabled: { opacity: 0.92 },
  primaryBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E6C000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryLabel: { color: "#FFFFFF", fontSize: 16, letterSpacing: 0.2 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(148,163,184,0.45)",
  },
  dividerText: {
    fontSize: 11,
    color: "#94a3b8",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  trustRow: {
    marginTop: 4,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  trustChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(23,23,23,0.06)",
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.1)",
  },
  trustChipText: {
    fontSize: 9,
    color: "#334155",
    letterSpacing: 0.15,
  },
  footerNote: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  trust: { fontSize: 11, color: "#94a3b8", letterSpacing: 0.2 },
});
