import { OtpCodeInput } from "@/components/auth/OtpCodeInput";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { FIREBASE_CONFIG } from "@/firebase/auth";
import { isFirebaseConfigured } from "@/firebase/config";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthUiStore } from "@/stores/authUiStore";
import { mapFirebaseAuthError } from "@/utils/auth/firebaseErrors";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const RESEND_SECONDS = 45;

export function OtpVerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { verifyOtp, sendOtp, getConfirmation } = useAuth();
  const pendingPhone = useAuthUiStore((s) => s.pendingPhoneDigits);
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (!getConfirmation()) {
      router.replace("/(auth)/phone");
    }
  }, [getConfirmation, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  const onVerify = useCallback(async () => {
    if (loading || otp.length !== 6) return;
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(otp);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      const msg = e instanceof Error ? e.message : mapFirebaseAuthError(e);
      setError(msg);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [loading, otp, verifyOtp]);

  const onResend = useCallback(async () => {
    if (secondsLeft > 0 || resendLoading || !pendingPhone) return;
    setResendLoading(true);
    setError(null);
    try {
      const verifier = recaptchaRef.current;
      if (!verifier) throw new Error("Verification not ready");
      await sendOtp(pendingPhone, verifier);
      setSecondsLeft(RESEND_SECONDS);
      setOtp("");
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      setError(mapFirebaseAuthError(e));
    } finally {
      setResendLoading(false);
    }
  }, [pendingPhone, resendLoading, secondsLeft, sendOtp]);

  const maskedPhone = pendingPhone
    ? `+91 ${pendingPhone.slice(0, 5)} ${pendingPhone.slice(5)}`
    : "+91";

  if (!fontsLoaded) {
    return (
      <View style={[styles.root, styles.center]}>
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

      {isFirebaseConfigured() ? (
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaRef}
          firebaseConfig={FIREBASE_CONFIG}
          attemptInvisibleVerification
        />
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>
            Enter OTP
          </Text>
          <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
            Sent to {maskedPhone}
          </Text>

          <View style={styles.otpWrap}>
            <OtpCodeInput value={otp} onChange={setOtp} disabled={loading} />
          </View>

          {error ? (
            <Text style={[styles.error, { fontFamily: AUTH_FONT.medium }]}>
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={() => void onVerify()}
            disabled={otp.length !== 6 || loading}
            style={({ pressed }) => [
              styles.verifyBtn,
              otp.length === 6 && styles.verifyBtnActive,
              pressed && otp.length === 6 && { opacity: 0.92 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text
                style={[
                  styles.verifyLabel,
                  { fontFamily: AUTH_FONT.semibold },
                  otp.length === 6 && styles.verifyLabelActive,
                ]}
              >
                Verify
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => void onResend()}
            disabled={secondsLeft > 0 || resendLoading}
            style={styles.resendBtn}
          >
            {resendLoading ? (
              <ActivityIndicator color={AUTH_PRIMARY} size="small" />
            ) : (
              <Text style={[styles.resendText, { fontFamily: AUTH_FONT.medium }]}>
                {secondsLeft > 0
                  ? `Resend OTP in ${secondsLeft}s`
                  : "Resend OTP"}
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A1A" },
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  header: { paddingHorizontal: 16 },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  sheet: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 28,
  },
  otpWrap: { marginBottom: 20 },
  error: {
    fontSize: 12,
    color: "#f87171",
    marginBottom: 12,
  },
  verifyBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#2A2A34",
    marginBottom: 16,
  },
  verifyBtnActive: { backgroundColor: "#E5E7EB" },
  verifyLabel: { fontSize: 16, color: "#6B7280" },
  verifyLabelActive: { color: "#0f172a" },
  resendBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  resendText: {
    fontSize: 14,
    color: AUTH_PRIMARY,
  },
});
