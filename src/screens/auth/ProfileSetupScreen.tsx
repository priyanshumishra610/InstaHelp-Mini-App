import { AppAtmosphere } from "@/components/ui/AppAtmosphere";
import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useAuth } from "@/providers/AuthProvider";
import { persistProfile } from "@/services/profileService";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import type { UserGender, UserProfile } from "@/types/user";
import { isValidProfileAge } from "@/utils/auth/profileComplete";
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

const GENDER_OPTIONS: { value: UserGender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const INPUT_BG = "#F3F4F6";
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
              <Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>
                A few details{"\n"}about you
              </Text>
              <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
                Help us personalize InstaHelp. Name and age are required.
              </Text>

              <View style={styles.field}>
                <Text style={[styles.label, { fontFamily: AUTH_FONT.medium }]}>
                  Full name *
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={fullName}
                    onChangeText={(t) => {
                      setError(null);
                      setFullName(t);
                    }}
                    placeholder="e.g. Karan Sharma"
                    placeholderTextColor="#6B7280"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    autoComplete="name"
                  />
                  <Ionicons name="person-outline" size={18} color="#9CA3AF" />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { fontFamily: AUTH_FONT.medium }]}>
                  Age *
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={ageText}
                    onChangeText={(t) => {
                      setError(null);
                      setAgeText(t.replace(/\D/g, "").slice(0, 3));
                    }}
                    placeholder="e.g. 28"
                    placeholderTextColor="#6B7280"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
                </View>
                {ageText.length > 0 && !ageOk ? (
                  <Text style={[styles.hint, { fontFamily: AUTH_FONT.regular }]}>
                    Enter an age between 13 and 120
                  </Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { fontFamily: AUTH_FONT.medium }]}>
                  Gender
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
                        style={[styles.chip, selected && styles.chipSelected]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            { fontFamily: AUTH_FONT.medium },
                            selected && styles.chipLabelSelected,
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
                  City
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={city}
                    onChangeText={(t) => {
                      setError(null);
                      setCity(t);
                    }}
                    placeholder="e.g. Bangalore"
                    placeholderTextColor="#6B7280"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    autoComplete="postal-address-locality"
                  />
                  <Ionicons name="location-outline" size={18} color="#9CA3AF" />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { fontFamily: AUTH_FONT.medium }]}>
                  Email (optional)
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    value={email}
                    onChangeText={(t) => {
                      setError(null);
                      setEmail(t);
                    }}
                    placeholder="hello@email.com"
                    placeholderTextColor="#6B7280"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Ionicons name="mail-outline" size={18} color="#9CA3AF" />
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
    shadowColor: "#004aad",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    lineHeight: 34,
    color: "#111827",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    marginBottom: 8,
  },
  field: { marginTop: 14 },
  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 8,
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
  chipSelected: {
    backgroundColor: "#F5F3FF",
    borderColor: AUTH_PRIMARY,
  },
  chipLabel: {
    fontSize: 12,
    color: "#4B5563",
  },
  chipLabelSelected: {
    color: AUTH_PRIMARY,
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
