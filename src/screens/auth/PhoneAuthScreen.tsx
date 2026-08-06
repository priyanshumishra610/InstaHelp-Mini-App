import { LoginHeroVisual } from "@/components/auth/LoginHeroVisual";
import { AppAtmosphere } from "@/components/ui/AppAtmosphere";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/config/env";
import {
  AUTH_ACCENT_YELLOW,
  AUTH_ACCENT_YELLOW_DEEP,
  AUTH_FONT,
  AUTH_PRIMARY,
  AUTH_PRIMARY_DEEP,
  AUTH_PRIMARY_LIGHT,
} from "@/constants/authPremium";
import { useAuth } from "@/providers/AuthProvider";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import { isSheetProfileComplete } from "@/utils/auth/profileComplete";
import { GreatVibes_400Regular } from "@expo-google-fonts/great-vibes";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
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
  FadeInDown,
  FadeInUp,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AUTH_ENTER_MS = 520;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PhoneAuthScreen() {
  const router = useRouter();
  const { fromSplash } = useLocalSearchParams<{ fromSplash?: string }>();
  const insets = useSafeAreaInsets();
  const fromSplashTransition = fromSplash === "1";
  const contentOpacity = useSharedValue(fromSplashTransition ? 0 : 1);
  const contentTranslateY = useSharedValue(fromSplashTransition ? 14 : 0);
  const phoneFocus = useSharedValue(0);
  const ctaScale = useSharedValue(1);
  const enterGuestMode = useOnboardingStore((s) => s.enterGuestMode);
  const { signInWithPhone } = useAuth();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    GreatVibes_400Regular,
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

  useEffect(() => {
    phoneFocus.value = withTiming(focused ? 1 : 0, { duration: 220 });
  }, [focused, phoneFocus]);

  const contentEnterStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const phoneFieldStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      phoneFocus.value,
      [0, 1],
      ["rgba(0,74,173,0.12)", AUTH_PRIMARY],
    ),
    shadowOpacity: 0.06 + phoneFocus.value * 0.12,
  }));

  const ctaAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));

  if (!fontsLoaded) {
    return (
      <View style={[styles.root, styles.loader]}>
        <ActivityIndicator color={AUTH_PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <AppAtmosphere variant="auth" />

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
              <Animated.View
                entering={FadeInDown.duration(480).delay(40)}
                style={[styles.heroSection, { paddingTop: 8 }]}
              >
                <View style={styles.logoRow}>
                  <Text style={[styles.logo, { fontFamily: AUTH_FONT.bold }]}>
                    Insta
                  </Text>
                  <Text style={[styles.logoAccent, { fontFamily: AUTH_FONT.bold }]}>
                    Help
                  </Text>
                </View>
                <Text style={[styles.logoSub, { fontFamily: AUTH_FONT.medium }]}>
                  We&apos;ll get it done
                </Text>
                <LoginHeroVisual />
              </Animated.View>

              <Animated.View entering={FadeInUp.duration(520).delay(120)}>
                <LinearGradient
                  colors={[AUTH_PRIMARY, AUTH_PRIMARY_LIGHT, AUTH_ACCENT_YELLOW]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sheetRim}
                >
                  <View style={styles.sheet}>
                    <View style={styles.sheetAccentBar}>
                      <View style={styles.sheetAccentBlue} />
                      <View style={styles.sheetAccentYellow} />
                    </View>

                    <Text style={[styles.headline, { fontFamily: AUTH_FONT.bold }]}>
                      Everything You{" "}
                      <Text style={[styles.headlineCursive, { fontFamily: AUTH_FONT.cursive }]}>
                        Need
                      </Text>
                      .{"\n"}
                      One{" "}
                      <Text style={[styles.headlineCursive, { fontFamily: AUTH_FONT.cursive }]}>
                        Tap
                      </Text>{" "}
                      Away.
                    </Text>
                    <View style={styles.headlineMarkRow}>
                      <View style={styles.headlineMarkBlue} />
                      <View style={styles.headlineMarkYellow} />
                    </View>

                    <Text
                      style={[styles.formLabel, { fontFamily: AUTH_FONT.semibold }]}
                    >
                      LOG IN OR SIGN UP
                    </Text>

                    <Animated.View style={[styles.phoneShell, phoneFieldStyle]}>
                      <View style={styles.countryBox}>
                        <View style={styles.flagBadge}>
                          <Ionicons name="flag" size={14} color={AUTH_PRIMARY} />
                        </View>
                        <Text
                          style={[
                            styles.countryCode,
                            { fontFamily: AUTH_FONT.semibold },
                          ]}
                        >
                          +91
                        </Text>
                      </View>
                      <View style={styles.phoneDivider} />
                      <TextInput
                        value={phone}
                        onChangeText={(t) => {
                          setError(null);
                          setPhone(t.replace(/\D/g, "").slice(0, 10));
                        }}
                        onFocus={() => {
                          setFocused(true);
                          void Haptics.selectionAsync();
                        }}
                        onBlur={() => setFocused(false)}
                        placeholder="10-digit mobile number"
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        maxLength={10}
                        style={[styles.phoneInput, { fontFamily: AUTH_FONT.medium }]}
                        editable={!loading}
                      />
                      {phoneReady ? (
                        <View style={styles.readyDot}>
                          <Ionicons name="checkmark" size={12} color="#0A0A0A" />
                        </View>
                      ) : null}
                    </Animated.View>

                    {error ? (
                      <Text style={[styles.error, { fontFamily: AUTH_FONT.medium }]}>
                        {error}
                      </Text>
                    ) : null}

                    <AnimatedPressable
                      onPress={() => void onContinue()}
                      disabled={!phoneReady || loading}
                      accessibilityRole="button"
                      accessibilityLabel="Continue"
                      onPressIn={() => {
                        if (phoneReady) {
                          ctaScale.value = withSpring(0.97, { damping: 18, stiffness: 320 });
                        }
                      }}
                      onPressOut={() => {
                        ctaScale.value = withSpring(1, { damping: 16, stiffness: 260 });
                      }}
                      style={ctaAnimStyle}
                    >
                      <LinearGradient
                        colors={
                          phoneReady
                            ? [AUTH_ACCENT_YELLOW, AUTH_ACCENT_YELLOW_DEEP]
                            : ["#E5E7EB", "#E5E7EB"]
                        }
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={[
                          styles.continueBtn,
                          phoneReady && styles.continueBtnActive,
                        ]}
                      >
                        {loading ? (
                          <ActivityIndicator
                            color={phoneReady ? "#0A0A0A" : "#9CA3AF"}
                          />
                        ) : (
                          <View style={styles.continueInner}>
                            <Text
                              style={[
                                styles.continueLabel,
                                { fontFamily: AUTH_FONT.semibold },
                                phoneReady && styles.continueLabelActive,
                              ]}
                            >
                              Continue
                            </Text>
                            <Ionicons
                              name="arrow-forward"
                              size={16}
                              color={phoneReady ? "#0A0A0A" : "#9CA3AF"}
                            />
                          </View>
                        )}
                      </LinearGradient>
                    </AnimatedPressable>

                    <View style={styles.trustRow}>
                      <View style={styles.trustChip}>
                        <Ionicons name="shield-checkmark" size={12} color={AUTH_PRIMARY} />
                        <Text style={[styles.trustText, { fontFamily: AUTH_FONT.medium }]}>
                          Secure
                        </Text>
                      </View>
                      <View style={styles.trustChipYellow}>
                        <Ionicons name="flash" size={12} color="#0A0A0A" />
                        <Text style={[styles.trustTextDark, { fontFamily: AUTH_FONT.medium }]}>
                          Fast
                        </Text>
                      </View>
                      <View style={styles.trustChip}>
                        <Ionicons name="sparkles" size={12} color={AUTH_PRIMARY} />
                        <Text style={[styles.trustText, { fontFamily: AUTH_FONT.medium }]}>
                          Local help
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.legal, { fontFamily: AUTH_FONT.regular }]}>
                      By continuing, you agree to our{" "}
                      <Text
                        style={styles.legalLink}
                        onPress={() => openUrl(LEGAL_TERMS_URL)}
                      >
                        Terms of Service
                      </Text>{" "}
                      and{" "}
                      <Text
                        style={styles.legalLink}
                        onPress={() => openUrl(LEGAL_PRIVACY_URL)}
                      >
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F6FB" },
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
  heroSection: { alignItems: "center", paddingBottom: 16 },
  logoRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  logo: {
    fontSize: 34,
    color: "#111827",
    letterSpacing: -0.6,
  },
  logoAccent: {
    fontSize: 34,
    color: AUTH_PRIMARY,
    letterSpacing: -0.6,
  },
  logoSub: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 0.2,
    color: "#6B7280",
    textAlign: "center",
  },
  sheetRim: {
    borderRadius: 30,
    padding: 1.5,
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 6,
  },
  sheet: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28.5,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 22,
    overflow: "hidden",
  },
  sheetAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: "row",
  },
  sheetAccentBlue: {
    flex: 1.4,
    backgroundColor: AUTH_PRIMARY,
  },
  sheetAccentYellow: {
    flex: 1,
    backgroundColor: AUTH_ACCENT_YELLOW,
  },
  headline: {
    marginTop: 10,
    fontSize: 26,
    lineHeight: 34,
    color: "#111827",
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: "center",
  },
  headlineCursive: {
    fontSize: 34,
    lineHeight: 38,
    color: AUTH_PRIMARY_DEEP,
  },
  headlineMarkRow: {
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },
  headlineMarkBlue: {
    width: 28,
    height: 3,
    borderRadius: 99,
    backgroundColor: AUTH_PRIMARY,
  },
  headlineMarkYellow: {
    width: 14,
    height: 3,
    borderRadius: 99,
    backgroundColor: AUTH_ACCENT_YELLOW,
  },
  formLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: AUTH_PRIMARY,
    textAlign: "center",
    marginBottom: 14,
  },
  phoneShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    width: "100%",
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "rgba(0,74,173,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 1,
  },
  countryBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingLeft: 4,
    paddingVertical: 8,
  },
  flagBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,74,173,0.08)",
  },
  countryCode: { fontSize: 15, color: "#111827" },
  phoneDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(0,74,173,0.16)",
  },
  phoneInput: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  readyDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AUTH_ACCENT_YELLOW,
  },
  error: {
    fontSize: 12,
    color: "#DC2626",
    marginBottom: 10,
    marginTop: -6,
    textAlign: "center",
  },
  continueBtn: {
    alignSelf: "center",
    width: "100%",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    minHeight: 54,
  },
  continueBtnActive: {
    shadowColor: AUTH_ACCENT_YELLOW_DEEP,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  continueInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  continueLabel: {
    fontSize: 16,
    color: "#9CA3AF",
    textAlign: "center",
  },
  continueLabelActive: {
    color: "#0A0A0A",
  },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },
  trustChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,74,173,0.08)",
  },
  trustChipYellow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: AUTH_ACCENT_YELLOW,
  },
  trustText: {
    fontSize: 11,
    color: AUTH_PRIMARY,
  },
  trustTextDark: {
    fontSize: 11,
    color: "#0A0A0A",
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
    backgroundColor: "rgba(0,74,173,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,74,173,0.12)",
  },
  skipButtonPressed: {
    opacity: 0.88,
    backgroundColor: "rgba(0,74,173,0.1)",
  },
  skipLabel: {
    fontSize: 15,
    color: AUTH_PRIMARY,
    letterSpacing: 0.2,
  },
  legal: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#6B7280",
  },
  legalLink: {
    color: AUTH_PRIMARY,
    textDecorationLine: "underline",
  },
});
