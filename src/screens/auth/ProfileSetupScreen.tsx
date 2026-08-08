import { AppAtmosphere } from "@/components/ui/AppAtmosphere";
import {
  AUTH_ACCENT_CORAL,
  AUTH_ACCENT_ROSE,
  AUTH_ACCENT_TEAL,
  AUTH_FONT,
  AUTH_PRIMARY,
} from "@/constants/authPremium";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useAuth } from "@/providers/AuthProvider";
import { persistProfile } from "@/services/profileService";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import type { UserGender, UserProfile } from "@/types/user";
import { isValidProfileAge } from "@/utils/auth/profileComplete";
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
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const GENDER_OPTIONS: {
  value: UserGender;
  label: string;
  tint: string;
  soft: string;
}[] = [
  { value: "male", label: "Male", tint: "#3B82F6", soft: "rgba(59,130,246,0.12)" },
  { value: "female", label: "Female", tint: AUTH_ACCENT_ROSE, soft: "rgba(196,92,122,0.12)" },
  { value: "other", label: "Other", tint: AUTH_ACCENT_TEAL, soft: "rgba(79,209,197,0.16)" },
  {
    value: "prefer_not_to_say",
    label: "Prefer not to say",
    tint: "#78716C",
    soft: "rgba(120,113,108,0.12)",
  },
];

const INPUT_BG = "#F7F5F2";
const BORDER = "rgba(0,0,0,0.08)";

function parseAgeInput(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

export function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const phone = useAuthPhone();
  const profile = useProfileStore((s) => s.profile);
  const { refreshSession } = useAuth();
  const setDeferProfile = useOnboardingStore((s) => s.setDeferProfile);

  const [fullName, setFullName] = useState(profile?.name ?? "");
  const [ageText, setAgeText] = useState(
    profile?.age != null ? String(profile.age) : "",
  );
  const [gender, setGender] = useState<UserGender | null>(profile?.gender ?? null);
  const [city, setCity] = useState(profile?.city ?? "");
  const [email, setEmail] = useState((profile?.email ?? "") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    GreatVibes_400Regular,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const parsedAge = useMemo(() => parseAgeInput(ageText), [ageText]);
  const nameOk = fullName.trim().length >= 2;
  const ageOk = isValidProfileAge(parsedAge);
  const normalizedEmail = useMemo(() => email.trim(), [email]);
  const emailOk =
    normalizedEmail.length === 0 ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const canContinue = nameOk && ageOk && emailOk && Boolean(phone);

  const enterApp = useCallback(() => {
    /* TUTORIAL_DISABLED — tutorialFeature.ts
    if (!useOnboardingStore.getState().appTutorialCompleted) {
      useOnboardingStore.getState().setPendingInAppTutorial(true);
    }
    */
    router.replace("/(tabs)");
  }, [router]);

  const onSkip = useCallback(() => {
    if (loading) return;
    setDeferProfile(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    enterApp();
  }, [enterApp, loading, setDeferProfile]);

  const onContinue = useCallback(async () => {
    if (!canContinue || !phone || loading || parsedAge == null) return;
    setLoading(true);
    setError(null);
    try {
      const next: UserProfile = {
        phone,
        name: fullName.trim(),
        age: parsedAge,
        gender,
        city: city.trim().length ? city.trim() : null,
        email: normalizedEmail.length ? normalizedEmail : null,
        birthday: profile?.birthday ?? null,
        anniversary: profile?.anniversary ?? null,
        addresses: profile?.addresses ?? [],
        favorites: profile?.favorites ?? [],
        avatarUri: profile?.avatarUri,
        role: profile?.role,
        preferredContact: profile?.preferredContact,
      };
      await persistProfile(next);
      await refreshSession();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDeferProfile(false);
      enterApp();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile.");
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [
    canContinue,
    city,
    email,
    enterApp,
    fullName,
    gender,
    loading,
    normalizedEmail,
    parsedAge,
    phone,
    profile,
    refreshSession,
    setDeferProfile,
  ]);

  if (!fontsLoaded) {
    return (
      <View style={[styles.root, styles.center]}>
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
          onPress={onSkip}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Skip profile setup"
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
        >
          <View style={styles.sheetOuter}>
            <View style={styles.sheet}>
              <Text style={[styles.wordmark, { fontFamily: AUTH_FONT.bold }]}>
                InstaHelp
              </Text>
              <Text style={[styles.tagline, { fontFamily: AUTH_FONT.medium }]}>
                We&apos;ll get it done
              </Text>
              <Text style={[styles.valueProp, { fontFamily: AUTH_FONT.regular }]}>
                Everything you need, one tap away. Trusted local help for cleaning,
                repairs, errands, and more.
              </Text>

              <View style={styles.trustRow}>
                <View style={[styles.trustChip, styles.trustChipSecure]}>
                  <Ionicons name="shield-checkmark" size={12} color="#0D9488" />
                  <Text style={[styles.trustText, styles.trustTextSecure, { fontFamily: AUTH_FONT.medium }]}>
                    Secure
                  </Text>
                </View>
                <View style={[styles.trustChip, styles.trustChipFast]}>
                  <Ionicons name="flash" size={12} color="#D97706" />
                  <Text style={[styles.trustText, styles.trustTextFast, { fontFamily: AUTH_FONT.medium }]}>
                    Fast
                  </Text>
                </View>
                <View style={[styles.trustChip, styles.trustChipLocal]}>
                  <Ionicons name="sparkles" size={12} color={AUTH_ACCENT_ROSE} />
                  <Text style={[styles.trustText, styles.trustTextLocal, { fontFamily: AUTH_FONT.medium }]}>
                    Local help
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.aboutBlock}>
                <View style={styles.aboutGlow} />
                <Text style={[styles.titleCursive, { fontFamily: AUTH_FONT.cursive }]}>
                  A little about you
                </Text>
                <View style={styles.titleAccentRow}>
                  <View style={[styles.titleAccentDot, { backgroundColor: AUTH_ACCENT_CORAL }]} />
                  <View style={[styles.titleAccentLine, { backgroundColor: AUTH_ACCENT_TEAL }]} />
                  <View style={[styles.titleAccentDot, { backgroundColor: AUTH_ACCENT_ROSE }]} />
                </View>
                <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
                  Name and age unlock your space. City and email help us find help that
                  feels local, fast, and made for you.
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { fontFamily: AUTH_FONT.medium }]}>
                  Your name <Text style={styles.requiredMark}>*</Text>
                </Text>
                <View style={[styles.inputRow, styles.inputRowName]}>
                  <TextInput
                    value={fullName}
                    onChangeText={(t) => {
                      setError(null);
                      setFullName(t);
                    }}
                    placeholder="e.g. Karan Sharma"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    autoComplete="name"
                  />
                  <Ionicons name="person-outline" size={18} color={AUTH_ACCENT_CORAL} />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { fontFamily: AUTH_FONT.medium }]}>
                  How old are you <Text style={styles.requiredMark}>*</Text>
                </Text>
                <View style={[styles.inputRow, styles.inputRowAge]}>
                  <TextInput
                    value={ageText}
                    onChangeText={(t) => {
                      setError(null);
                      setAgeText(t.replace(/\D/g, "").slice(0, 3));
                    }}
                    placeholder="e.g. 28"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Ionicons name="calendar-outline" size={18} color={AUTH_ACCENT_TEAL} />
                </View>
                {ageText.length > 0 && !ageOk ? (
                  <Text style={[styles.hint, { fontFamily: AUTH_FONT.regular }]}>
                    Pick an age between 13 and 120
                  </Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { fontFamily: AUTH_FONT.medium }]}>
                  How do you identify
                </Text>
                <View style={styles.chipRow}>
                  {GENDER_OPTIONS.map((opt) => {
                    const selected = gender === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => {
                          setError(null);
                          setGender(selected ? null : opt.value);
                        }}
                        disabled={loading}
                        style={[
                          styles.chip,
                          selected && {
                            backgroundColor: opt.soft,
                            borderColor: opt.tint,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            { fontFamily: AUTH_FONT.medium },
                            selected && { color: opt.tint },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { fontFamily: AUTH_FONT.medium }]}>
                  Where you call home
                </Text>
                <View style={[styles.inputRow, styles.inputRowCity]}>
                  <TextInput
                    value={city}
                    onChangeText={(t) => {
                      setError(null);
                      setCity(t);
                    }}
                    placeholder="e.g. Bangalore"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    autoComplete="postal-address-locality"
                  />
                  <Ionicons name="location-outline" size={18} color="#F59E0B" />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { fontFamily: AUTH_FONT.medium }]}>
                  A note to reach you{" "}
                  <Text style={styles.optionalMark}>(optional)</Text>
                </Text>
                <View style={[styles.inputRow, styles.inputRowEmail]}>
                  <TextInput
                    value={email}
                    onChangeText={(t) => {
                      setError(null);
                      setEmail(t);
                    }}
                    placeholder="hello@email.com"
                    placeholderTextColor="#9CA3AF"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Ionicons name="mail-outline" size={18} color={AUTH_ACCENT_ROSE} />
                </View>
              </View>

              {error ? (
                <Text style={[styles.error, { fontFamily: AUTH_FONT.medium }]}>
                  {error}
                </Text>
              ) : null}

              <Pressable
                onPress={() => void onContinue()}
                disabled={!canContinue || loading}
                accessibilityRole="button"
                accessibilityLabel="Continue to InstaHelp"
                style={({ pressed }) => [
                  styles.continueBtn,
                  canContinue && styles.continueBtnActive,
                  pressed && canContinue && { opacity: 0.92 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={canContinue ? "#FFFFFF" : "#9CA3AF"} />
                ) : (
                  <Text
                    style={[
                      styles.continueLabel,
                      { fontFamily: AUTH_FONT.semibold },
                      canContinue && styles.continueLabelActive,
                    ]}
                  >
                    Continue to InstaHelp
                  </Text>
                )}
              </Pressable>

              <Pressable
                onPress={onSkip}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Skip for now"
                hitSlop={6}
                style={({ pressed }) => [
                  styles.skipLink,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[styles.skipLinkLabel, { fontFamily: AUTH_FONT.medium }]}>
                  Skip for now
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F7F6FB" },
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
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
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  skipButtonPressed: {
    opacity: 0.88,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  skipLabel: {
    fontSize: 16,
    color: "#374151",
    letterSpacing: 0.2,
  },
  sheetOuter: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  sheet: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  wordmark: {
    fontSize: 24,
    color: AUTH_PRIMARY,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  tagline: {
    marginTop: 4,
    fontSize: 13,
    color: AUTH_ACCENT_TEAL,
    textAlign: "center",
  },
  valueProp: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
    textAlign: "center",
  },
  trustRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  trustChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  trustChipSecure: {
    backgroundColor: "rgba(13,148,136,0.1)",
  },
  trustChipFast: {
    backgroundColor: "rgba(217,119,6,0.1)",
  },
  trustChipLocal: {
    backgroundColor: "rgba(196,92,122,0.1)",
  },
  trustText: {
    fontSize: 11,
  },
  trustTextSecure: {
    color: "#0F766E",
  },
  trustTextFast: {
    color: "#B45309",
  },
  trustTextLocal: {
    color: AUTH_ACCENT_ROSE,
  },
  divider: {
    height: 1,
    backgroundColor: BORDER,
    marginTop: 20,
    marginBottom: 4,
  },
  aboutBlock: {
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: "rgba(79,209,197,0.08)",
    borderWidth: 1,
    borderColor: "rgba(79,209,197,0.22)",
    overflow: "hidden",
  },
  aboutGlow: {
    position: "absolute",
    top: -28,
    right: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(224,122,95,0.14)",
  },
  titleCursive: {
    fontSize: 36,
    lineHeight: 44,
    color: AUTH_ACCENT_ROSE,
    textAlign: "center",
    marginBottom: 8,
  },
  titleAccentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 10,
  },
  titleAccentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  titleAccentLine: {
    width: 42,
    height: 2,
    borderRadius: 2,
  },
  sub: {
    fontSize: 13,
    lineHeight: 19,
    color: "#57534E",
    textAlign: "center",
  },
  field: { marginTop: 14 },
  label: {
    fontSize: 13,
    color: "#44403C",
    marginBottom: 8,
  },
  requiredMark: {
    color: AUTH_ACCENT_CORAL,
    fontSize: 14,
  },
  optionalMark: {
    color: "#A8A29E",
    fontSize: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  inputRowName: {
    borderColor: "rgba(224,122,95,0.28)",
    backgroundColor: "rgba(224,122,95,0.06)",
  },
  inputRowAge: {
    borderColor: "rgba(79,209,197,0.32)",
    backgroundColor: "rgba(79,209,197,0.07)",
  },
  inputRowCity: {
    borderColor: "rgba(245,158,11,0.28)",
    backgroundColor: "rgba(245,158,11,0.06)",
  },
  inputRowEmail: {
    borderColor: "rgba(196,92,122,0.28)",
    backgroundColor: "rgba(196,92,122,0.06)",
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: "#111827",
    padding: 0,
  },
  hint: {
    marginTop: 6,
    fontSize: 11,
    color: "#DC2626",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: INPUT_BG,
    borderWidth: 1,
    borderColor: BORDER,
  },
  chipLabel: {
    fontSize: 12,
    color: "#57534E",
  },
  error: {
    fontSize: 12,
    color: "#DC2626",
    marginBottom: 8,
    marginTop: 12,
    textAlign: "center",
  },
  continueBtn: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginTop: 24,
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
  skipLink: {
    alignSelf: "center",
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipLinkLabel: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});
