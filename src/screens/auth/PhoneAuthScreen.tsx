import { LoginHeroVisual } from "@/components/auth/LoginHeroVisual";
import { AppAtmosphere } from "@/components/ui/AppAtmosphere";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/config/env";
import {
  AUTH_FONT,
  AUTH_PRIMARY,
  AUTH_PRIMARY_DEEP,
} from "@/constants/authPremium";
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
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
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

  const scrollRef = useRef<ScrollView>(null);
  const sheetOffsetY = useRef(0);
  const phoneFieldOffsetY = useRef(0);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
    if (!useOnboardingStore.getState().appTutorialCompleted) {
      useOnboardingStore.getState().setPendingInAppTutorial(true);
    }
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

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const onShow = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  const keyboardOpen = keyboardHeight > 0;

  const ensurePhoneVisible = useCallback(() => {
    const y = Math.max(0, sheetOffsetY.current + phoneFieldOffsetY.current - 20);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    });
  }, []);

  useEffect(() => {
    if (!keyboardOpen) return;
    const t = setTimeout(ensurePhoneVisible, Platform.OS === "ios" ? 60 : 120);
    return () => clearTimeout(t);
  }, [ensurePhoneVisible, keyboardOpen]);

  const onPhoneFocus = useCallback(() => {
    setFocused(true);
    void Haptics.selectionAsync();
    setTimeout(ensurePhoneVisible, Platform.OS === "ios" ? 80 : 160);
  }, [ensurePhoneVisible]);

  const contentEnterStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const phoneFieldStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      phoneFocus.value,
      [0, 1],
      ["rgba(23,23,23,0.12)", AUTH_PRIMARY],
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
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 52 : 0}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              keyboardOpen && styles.scrollContentKeyboard,
              {
                paddingBottom:
                  Math.max(insets.bottom, 28) +
                  (Platform.OS === "android" ? keyboardHeight : 0),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.screenCenterWrap}>
              {!keyboardOpen ? (
                <Animated.View
                  entering={FadeInDown.duration(480).delay(40)}
                  style={[styles.heroSection, { paddingTop: 8 }]}
                >
                  <Text style={[styles.wordmark, { fontFamily: AUTH_FONT.bold }]}>
                    InstaHelp
                  </Text>
                  <Text style={[styles.logoSub, { fontFamily: AUTH_FONT.medium }]}>
                    We&apos;ll get it done
                  </Text>
                  <LoginHeroVisual />
                </Animated.View>
              ) : (
                <View style={styles.heroCompact}>
                  <Text style={[styles.wordmarkCompact, { fontFamily: AUTH_FONT.bold }]}>
                    InstaHelp
                  </Text>
                </View>
              )}

              <Animated.View
                entering={FadeInUp.duration(520).delay(120)}
                onLayout={(e) => {
                  sheetOffsetY.current = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.sheet}>
                    {!keyboardOpen ? (
                      <>
                        <Text style={[styles.headline, { fontFamily: AUTH_FONT.bold }]}>
                          Everything you need.{"\n"}One tap away.
                        </Text>
                        <View style={styles.headlineMark} />
                      </>
                    ) : null}

                    <Text
                      style={[styles.formLabel, { fontFamily: AUTH_FONT.semibold }]}
                    >
                      LOG IN OR SIGN UP
                    </Text>

                    <Animated.View
                      style={[styles.phoneShell, phoneFieldStyle]}
                      onLayout={(e) => {
                        phoneFieldOffsetY.current = e.nativeEvent.layout.y;
                      }}
                    >
                      <View style={styles.countryBox}>
                        <Text style={styles.flagEmoji} accessibilityLabel="India">
                          🇮🇳
                        </Text>
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
                        onFocus={onPhoneFocus}
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
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
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
                            ? [AUTH_PRIMARY, AUTH_PRIMARY_DEEP]
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
                            color={phoneReady ? "#FFFFFF" : "#9CA3AF"}
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
                              color={phoneReady ? "#FFFFFF" : "#9CA3AF"}
                            />
                          </View>
                        )}
                      </LinearGradient>
                    </AnimatedPressable>

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
              </Animated.View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FAFAF9" },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  scrollContentKeyboard: {
    justifyContent: "flex-start",
    paddingTop: 8,
  },
  screenCenterWrap: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    alignItems: "stretch",
  },
  loader: { alignItems: "center", justifyContent: "center" },
  heroSection: { alignItems: "center", paddingBottom: 16 },
  heroCompact: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 10,
  },
  wordmark: {
    fontSize: 34,
    color: AUTH_PRIMARY,
    letterSpacing: -0.6,
    textAlign: "center",
  },
  wordmarkCompact: {
    fontSize: 22,
    color: AUTH_PRIMARY,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  logoSub: {
    marginTop: 4,
    fontSize: 13,
    letterSpacing: 0.2,
    color: "#6B7280",
    textAlign: "center",
  },
  sheet: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.08)",
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  headline: {
    fontSize: 24,
    lineHeight: 32,
    color: "#111827",
    letterSpacing: -0.4,
    marginBottom: 10,
    textAlign: "center",
  },
  headlineMark: {
    alignSelf: "center",
    width: 36,
    height: 3,
    borderRadius: 99,
    backgroundColor: AUTH_PRIMARY,
    marginBottom: 20,
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
    borderColor: "rgba(23,23,23,0.12)",
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
  flagEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  countryCode: { fontSize: 15, color: "#111827" },
  phoneDivider: {
    width: 1,
    height: 22,
    backgroundColor: "rgba(23,23,23,0.12)",
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
    backgroundColor: AUTH_PRIMARY,
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
    shadowColor: AUTH_PRIMARY_DEEP,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
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
    color: "#FFFFFF",
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
    backgroundColor: "rgba(23,23,23,0.06)",
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.12)",
  },
  skipButtonPressed: {
    opacity: 0.88,
    backgroundColor: "rgba(23,23,23,0.1)",
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
