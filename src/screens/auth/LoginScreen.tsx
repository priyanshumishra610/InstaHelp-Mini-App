import { LoginHeroVisual } from "@/components/auth/LoginHeroVisual";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/config/env";
import { AUTH_FONT } from "@/constants/authPremium";
import { activateGuestSession } from "@/utils/auth/session";
import { signInWithPhone } from "@/utils/auth/signInWithPhone";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const phoneRef = useRef<TextInput>(null);

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const phoneReady = phone.replace(/\D/g, "").length === 10;

  const onContinue = useCallback(async () => {
    if (!phoneReady || loading) return;
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPhone(phone);
      if (!result.ok) {
        setError(result.error);
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace(result.destination);
    } finally {
      setLoading(false);
    }
  }, [loading, phone, phoneReady, router]);

  const onSkip = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace(activateGuestSession());
  }, [router]);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.root, styles.loader]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={["#0A0A1A", "#0f1028", "#12122a"]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={styles.topBarSpacer} />
          <Pressable
            onPress={onSkip}
            accessibilityRole="button"
            accessibilityLabel="Skip login and browse as guest"
            style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={[styles.skipText, { fontFamily: AUTH_FONT.semibold }]}>
              Skip
            </Text>
          </Pressable>
        </View>

        {/* Top: brand + hero */}
        <View style={styles.heroSection}>
          <Text style={[styles.logo, { fontFamily: AUTH_FONT.bold }]}>InstaHelp</Text>
          <Text style={[styles.logoSub, { fontFamily: AUTH_FONT.medium }]}>
            We&apos;ll get it done
          </Text>
          <LoginHeroVisual />
        </View>

        {/* Bottom sheet */}
        <View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20) + 8 },
          ]}
        >
          <Text style={[styles.headline, { fontFamily: AUTH_FONT.bold }]}>
            Everything You Need.{"\n"}One Tap Away.
          </Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={[styles.dividerLabel, { fontFamily: AUTH_FONT.medium }]}>
              LOG IN OR SIGN UP
            </Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.phoneRow}>
            <Pressable style={styles.countryBox} accessibilityRole="button">
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={[styles.countryCode, { fontFamily: AUTH_FONT.semibold }]}>
                +91
              </Text>
              <Ionicons name="chevron-down" size={14} color="#9CA3AF" />
            </Pressable>

            <TextInput
              ref={phoneRef}
              value={phone}
              onChangeText={(t) => {
                setError(null);
                setPhone(t.replace(/\D/g, "").slice(0, 10));
              }}
              placeholder="10-digit mobile number"
              placeholderTextColor="#6B7280"
              keyboardType="phone-pad"
              maxLength={10}
              style={[styles.phoneInput, { fontFamily: AUTH_FONT.medium }]}
              editable={!loading}
            />
          </View>

          {error ? (
            <Text style={[styles.error, { fontFamily: AUTH_FONT.medium }]}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={() => void onContinue()}
            disabled={!phoneReady || loading}
            accessibilityRole="button"
            accessibilityState={{ disabled: !phoneReady || loading }}
            style={({ pressed }) => [
              styles.continueBtn,
              phoneReady && styles.continueBtnActive,
              pressed && phoneReady && { opacity: 0.92 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={phoneReady ? "#0f172a" : "#9CA3AF"} />
            ) : (
              <Text
                style={[
                  styles.continueLabel,
                  { fontFamily: AUTH_FONT.semibold },
                  phoneReady && styles.continueLabelActive,
                ]}
              >
                Continue
              </Text>
            )}
          </Pressable>

          <Text style={[styles.legal, { fontFamily: AUTH_FONT.regular }]}>
            By continuing, you agree to our{" "}
            <Text style={styles.legalLink} onPress={() => openUrl(LEGAL_TERMS_URL)}>
              Terms of Service
            </Text>{" "}
            <Text style={styles.legalLink} onPress={() => openUrl(LEGAL_PRIVACY_URL)}>
              Privacy Policy
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const SHEET_BG = "#14141C";
const INPUT_BG = "#1E1E28";
const BORDER = "rgba(255,255,255,0.08)";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0A0A1A",
  },
  flex: { flex: 1 },
  loader: {
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 4,
    zIndex: 20,
    elevation: 20,
  },
  topBarSpacer: {
    flex: 1,
  },
  skipBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  skipText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  heroSection: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  logo: {
    fontSize: 32,
    color: "#fff",
    letterSpacing: -0.5,
  },
  logoSub: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 0.2,
    color: "rgba(255,255,255,0.55)",
  },
  sheet: {
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    borderTopWidth: 1,
    borderColor: BORDER,
  },
  headline: {
    fontSize: 22,
    lineHeight: 30,
    color: "#fff",
    letterSpacing: -0.3,
    marginBottom: 22,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  dividerLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    color: "#6B7280",
  },
  phoneRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  flag: { fontSize: 18 },
  countryCode: {
    fontSize: 16,
    color: "#fff",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    fontSize: 16,
    color: "#fff",
    letterSpacing: 0.3,
  },
  error: {
    fontSize: 12,
    color: "#f87171",
    marginBottom: 10,
    marginTop: -6,
  },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2A34",
    marginBottom: 20,
  },
  continueBtnActive: {
    backgroundColor: "#E5E7EB",
  },
  continueLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  continueLabelActive: {
    color: "#0f172a",
  },
  legal: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#6B7280",
  },
  legalLink: {
    color: "#9CA3AF",
    textDecorationLine: "underline",
  },
});
