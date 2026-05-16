import { LogoMark } from "@/components/ui/LogoMark";
import { Screen } from "@/components/ui/Screen";
import {
  APP_WEB_URL,
  LEGAL_PRIVACY_URL,
  LEGAL_TERMS_URL,
} from "@/constants/appInfo";
import {
  ACCENT,
  ACCENT_DEEP,
  ACCENT_TINT,
  BRAND_GOLD,
} from "@/constants/theme";
import { useAppAuth } from "@/hooks/auth/useAppAuth";
import { useGoogleSignIn } from "@/hooks/auth/useGoogleSignIn";
import { syncClerkUserToProfile } from "@/utils/auth/syncClerkProfile";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@clerk/expo";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const PILLARS: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: "home-outline", label: "Home & local" },
  { icon: "chatbubbles-outline", label: "Concierge chat" },
  { icon: "time-outline", label: "Live progress" },
];

export function LoginScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn } = useAppAuth();
  const {
    signInWithGoogle,
    loading,
    error,
    setError,
  } = useGoogleSignIn();

  useEffect(() => {
    if (isSignedIn && user) {
      syncClerkUserToProfile(user);
    }
  }, [isSignedIn, user]);

  const onGoogle = async () => {
    setError(null);
    const ok = await signInWithGoogle();
    if (ok) {
      router.replace("/(auth)/name");
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Screen>
      <LinearGradient
        colors={["#e8f0ff", "#f4f8ff", "#ffffff"]}
        locations={[0, 0.35, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{ flex: 1 }}
      >
        <View
          pointerEvents="none"
          className="absolute -right-20 top-32 h-64 w-64 rounded-full"
          style={{ backgroundColor: `${ACCENT}14` }}
        />
        <View
          pointerEvents="none"
          className="absolute -left-16 bottom-48 h-48 w-48 rounded-full"
          style={{ backgroundColor: `${ACCENT_TINT}99` }}
        />

        <View className="flex-1 justify-between px-6 pb-10 pt-2">
          <Animated.View entering={FadeIn.duration(400)}>
            <View className="flex-row items-center justify-between">
              <LogoMark size="md" withWordmark />
              <View className="rounded-full border border-accent/25 bg-accent-soft px-3 py-1">
                <Text className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-accent-deep">
                  Concierge
                </Text>
              </View>
            </View>

            <Text className="mt-12 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-deep">
              InstaHelp® app
            </Text>
            <Text className="mt-3 text-4xl font-extrabold leading-[44px] tracking-tight text-neutral-900">
              Local help,{"\n"}
              <Text style={{ color: ACCENT }}>orchestrated for you.</Text>
            </Text>
            <Text className="mt-4 max-w-[340px] text-[16px] leading-[24px] text-neutral-600">
              Sign in to request services, track bookings in one place, and reach
              our team on WhatsApp when it matters.
            </Text>

            <View className="mt-8 flex-row flex-wrap gap-2">
              {PILLARS.map((p, i) => (
                <Animated.View
                  key={p.label}
                  entering={FadeInDown.duration(360).delay(120 + i * 70)}
                  className="flex-row items-center gap-2 rounded-2xl border border-white/80 bg-white/75 px-3.5 py-2.5 shadow-sm"
                  style={{
                    shadowColor: ACCENT,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.07,
                    shadowRadius: 12,
                  }}
                >
                  <View className="h-8 w-8 items-center justify-center rounded-xl bg-accent-soft">
                    <Ionicons name={p.icon} size={16} color={ACCENT} />
                  </View>
                  <Text className="text-[12px] font-bold text-neutral-800">
                    {p.label}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(440).delay(60)}>
            <LinearGradient
              colors={[BRAND_GOLD, "#ffc400"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              className="mb-3 h-1 w-full rounded-full opacity-90"
            />

            <View
              className="overflow-hidden rounded-3xl border border-accent-tint/80 bg-white p-5"
              style={{
                shadowColor: ACCENT,
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.12,
                shadowRadius: 24,
                elevation: 6,
              }}
            >
              <Text className="text-center text-[13px] font-semibold text-neutral-800">
                Continue with Google
              </Text>
              <Text className="mt-1 text-center text-[12px] leading-4 text-neutral-500">
                Same secure sign-in across devices. Next, we&apos;ll save your name
                and service area.
              </Text>

              {error ? (
                <View className="mt-4 flex-row items-start gap-2.5 rounded-2xl border border-red-100 bg-red-50 px-3.5 py-3">
                  <Ionicons
                    name="alert-circle"
                    size={18}
                    color="#dc2626"
                    style={{ marginTop: 1 }}
                  />
                  <Text className="flex-1 text-[13px] leading-5 font-medium text-red-800">
                    {error}
                  </Text>
                </View>
              ) : null}

              <Pressable
                onPress={() => void onGoogle()}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
                className={`mt-4 flex-row items-center justify-center gap-3 rounded-2xl border border-neutral-200/90 bg-neutral-50 py-[15px] active:bg-neutral-100 ${
                  loading ? "opacity-65" : ""
                }`}
              >
                {loading ? (
                  <ActivityIndicator color={ACCENT_DEEP} />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={22} color="#4285F4" />
                    <Text className="text-[16px] font-bold text-neutral-900">
                      Google
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={() =>
                  openWhatsApp(
                    "Hi InstaHelp — I need help signing in to the app.",
                  )
                }
                accessibilityRole="button"
                accessibilityLabel="Get help on WhatsApp"
                className="mt-4 flex-row items-center justify-center gap-2 py-2 active:opacity-75"
              >
                <Ionicons name="logo-whatsapp" size={18} color="#128C7E" />
                <Text className="text-[13px] font-bold text-neutral-700">
                  Stuck? Chat with InstaHelp on WhatsApp
                </Text>
              </Pressable>
            </View>

            <Text className="mt-6 text-center text-[12px] leading-[18px] text-neutral-500">
              By continuing you agree to our{" "}
              <Text
                className="font-bold text-accent"
                onPress={() => openUrl(LEGAL_TERMS_URL)}
              >
                Terms
              </Text>{" "}
              and{" "}
              <Text
                className="font-bold text-accent"
                onPress={() => openUrl(LEGAL_PRIVACY_URL)}
              >
                Privacy Policy
              </Text>
              .
            </Text>

            <Pressable
              onPress={() => openUrl(APP_WEB_URL)}
              accessibilityRole="button"
              accessibilityLabel="Open InstaHelp website"
              className="mt-4 flex-row items-center justify-center gap-1.5 self-center rounded-full bg-white/60 px-4 py-2 active:bg-white/90"
            >
              <Ionicons name="globe-outline" size={14} color={ACCENT} />
              <Text className="text-[12px] font-bold text-accent-deep">
                instahelp.in
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    </Screen>
  );
}
