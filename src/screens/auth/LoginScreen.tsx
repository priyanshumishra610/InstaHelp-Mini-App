import { AuthCardScene } from "@/components/auth/premium/AuthCardScene";
import { AuthPremiumBackdrop } from "@/components/auth/premium/AuthPremiumBackdrop";
import { FloatingServiceObjects } from "@/components/auth/premium/FloatingServiceObjects";
import {
  APP_WEB_URL,
  LEGAL_PRIVACY_URL,
  LEGAL_TERMS_URL,
} from "@/config/env";
import { AUTH_FONT } from "@/constants/authPremium";
import { activateGuestSession } from "@/utils/auth/session";
import { signInWithPhone } from "@/utils/auth/signInWithPhone";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
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
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { TextInput } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
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
    Poppins_800ExtraBold,
  });

  const focusPhone = useCallback(() => {
    setError(null);
    setTimeout(() => phoneRef.current?.focus(), 120);
  }, []);

  const onContinue = useCallback(async () => {
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
  }, [phone, router]);

  const onSkipLogin = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const dest = activateGuestSession();
    router.replace(dest);
  }, [router]);

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  if (!fontsLoaded) {
    return (
      <AuthPremiumBackdrop>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={[styles.loaderText, { fontFamily: AUTH_FONT.medium }]}>
            InstaHelp
          </Text>
        </View>
      </AuthPremiumBackdrop>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AuthPremiumBackdrop>
        <FloatingServiceObjects />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
            <View style={styles.brandBlock}>
              <Text style={[styles.brandWord, { fontFamily: AUTH_FONT.extrabold }]}>
                InstaHelp
              </Text>
              <Text style={[styles.brandTag, { fontFamily: AUTH_FONT.medium }]}>
                Local services super app
              </Text>
            </View>
            <Pressable
              onPress={onSkipLogin}
              accessibilityRole="button"
              accessibilityLabel="Skip login and browse as guest"
              style={({ pressed }) => [pressed && { opacity: 0.88 }]}
            >
              <LinearGradient
                colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.08)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.skipPill}
              >
                <Text style={[styles.skipLabel, { fontFamily: AUTH_FONT.semibold }]}>
                  Skip
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color="rgba(255,255,255,0.95)"
                />
              </LinearGradient>
            </Pressable>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.content,
              { paddingBottom: insets.bottom + 20 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInDown.duration(420).delay(40)}>
              <AuthCardScene
                onFocusLogin={focusPhone}
                onFocusRegister={focusPhone}
                login={{
                  phoneInputRef: phoneRef,
                  phone,
                  onPhoneChange: (v) => setPhone(v.replace(/\D/g, "").slice(0, 10)),
                  loading,
                  error,
                  onContinue: () => void onContinue(),
                }}
              />
            </Animated.View>

            <View style={styles.legalCard}>
              <Text style={[styles.legal, { fontFamily: AUTH_FONT.regular }]}>
                By continuing you agree to our{" "}
                <Text
                  style={styles.legalLink}
                  onPress={() => openUrl(LEGAL_TERMS_URL)}
                >
                  Terms
                </Text>{" "}
                and{" "}
                <Text
                  style={styles.legalLink}
                  onPress={() => openUrl(LEGAL_PRIVACY_URL)}
                >
                  Privacy Policy
                </Text>
                .
              </Text>
              <Pressable
                onPress={() => openUrl(APP_WEB_URL)}
                accessibilityRole="button"
                style={styles.webLink}
              >
                <Ionicons name="globe-outline" size={14} color="rgba(255,255,255,0.75)" />
                <Text style={[styles.webLabel, { fontFamily: AUTH_FONT.semibold }]}>
                  instahelp.in
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </AuthPremiumBackdrop>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  loaderText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  content: { flexGrow: 1, paddingTop: 4 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingBottom: 8,
    zIndex: 10,
  },
  brandBlock: {
    flex: 1,
    marginRight: 12,
  },
  brandWord: {
    fontSize: 22,
    color: "#fff",
    letterSpacing: -0.5,
  },
  brandTag: {
    marginTop: 2,
    fontSize: 11,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.2,
  },
  skipPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  skipLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.2,
  },
  legalCard: {
    marginTop: 8,
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  legal: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "rgba(255,255,255,0.7)",
  },
  legalLink: {
    color: "#fff",
    fontFamily: AUTH_FONT.semibold,
  },
  webLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  webLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.4,
  },
});
