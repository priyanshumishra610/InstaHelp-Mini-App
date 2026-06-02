import { LoginHeroVisual } from "@/components/auth/LoginHeroVisual";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/config/env";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { isSheetProfileComplete } from "@/utils/auth/profileComplete";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AUTH_ENTER_MS = 520;

export function PhoneAuthScreen() {
  const router = useRouter();
  const { fromSplash } = useLocalSearchParams<{ fromSplash?: string }>();
  const insets = useSafeAreaInsets();
  const fromSplashTransition = fromSplash === "1";
  const contentOpacity = useSharedValue(fromSplashTransition ? 0 : 1);
  const contentTranslateY = useSharedValue(fromSplashTransition ? 14 : 0);
  const enterGuestMode = useOnboardingStore((s) => s.enterGuestMode);
  const { signInWithPhone } = useAuth();

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
      await signInWithPhone(phone);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const profile = useProfileStore.getState().profile;
      router.replace(
        isSheetProfileComplete(profile) ? "/(tabs)" : "/(auth)/profile",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in. Try again.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [loading, phone, phoneReady, router, signInWithPhone]);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const onSkipBrowse = useCallback(() => {
    setError(null);
    enterGuestMode();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/(tabs)");
  }, [enterGuestMode, router]);

  useEffect(() => {
    if (!fromSplashTransition || !fontsLoaded) return;
    contentOpacity.value = withDelay(
      80,
      withTiming(1, { duration: AUTH_ENTER_MS, easing: Easing.out(Easing.cubic) }),
    );
    contentTranslateY.value = withDelay(
      80,
      withTiming(0, { duration: AUTH_ENTER_MS, easing: Easing.out(Easing.cubic) }),
    );
  }, [contentOpacity, contentTranslateY, fontsLoaded, fromSplashTransition]);

  const contentEnterStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

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

      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 8,
            paddingLeft: Math.max(insets.left, 16),
            paddingRight: Math.max(insets.right, 16),
          },
        ]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={onSkipBrowse}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Skip sign in"
          hitSlop={8}
          style={({ pressed }) => [
            styles.skipButton,
            pressed && styles.skipButtonPressed,
          ]}
        >
          <Text style={[styles.skipLabel, { fontFamily: AUTH_FONT.semibold }]}>
            Skip
          </Text>
        </Pressable>
      </View>

      <Animated.View style={[styles.flex, contentEnterStyle]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 28) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.screenCenterWrap}>
          <View style={[styles.heroSection, { paddingTop: 8 }]}>
            <Text style={[styles.logo, { fontFamily: AUTH_FONT.bold }]}>InstaHelp</Text>
            <Text style={[styles.logoSub, { fontFamily: AUTH_FONT.medium }]}>
              We&apos;ll get it done
            </Text>
            <LoginHeroVisual />
          </View>

          <View style={styles.sheet}>
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
            <View style={styles.countryBox}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={[styles.countryCode, { fontFamily: AUTH_FONT.semibold }]}>
                +91
              </Text>
            </View>
            <TextInput
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
            <Text style={[styles.error, { fontFamily: AUTH_FONT.medium }]}>{error}</Text>
          ) : null}

          <Pressable
            onPress={() => void onContinue()}
            disabled={!phoneReady || loading}
            style={({ pressed }) => [
              styles.continueBtn,
              phoneReady && styles.continueBtnActive,
              pressed && phoneReady && { opacity: 0.92 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={phoneReady ? "#FFFFFF" : "#9CA3AF"} />
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const INPUT_BG = "#1E1E28";
const BORDER = "rgba(255,255,255,0.08)";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A1A" },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  screenCenterWrap: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    alignItems: "stretch",
  },
  loader: { alignItems: "center", justifyContent: "center" },
  heroSection: { alignItems: "center", paddingBottom: 12 },
  logo: { fontSize: 32, color: "#fff", letterSpacing: -0.5, textAlign: "center" },
  logoSub: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 0.2,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },
  sheet: {
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#14141C",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: BORDER,
  },
  headline: {
    fontSize: 22,
    lineHeight: 30,
    color: "#fff",
    letterSpacing: -0.3,
    marginBottom: 22,
    textAlign: "center",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 22,
    width: "100%",
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
    width: "100%",
    justifyContent: "center",
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
  countryCode: { fontSize: 16, color: "#fff" },
  phoneInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
    fontSize: 14,
    color: "#fff",
    textAlign: "left",
  },
  error: {
    fontSize: 12,
    color: "#f87171",
    marginBottom: 10,
    marginTop: -6,
    textAlign: "center",
  },
  continueBtn: {
    alignSelf: "center",
    width: "92%",
    maxWidth: 320,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F2F3D",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    marginBottom: 12,
    minHeight: 54,
  },
  continueBtnActive: {
    backgroundColor: AUTH_PRIMARY,
    borderColor: AUTH_PRIMARY,
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  continueLabel: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  continueLabelActive: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  topBar: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    zIndex: 20,
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  skipButtonPressed: {
    opacity: 0.88,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  skipLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 0.2,
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
