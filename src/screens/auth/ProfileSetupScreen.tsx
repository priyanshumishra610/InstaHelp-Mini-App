import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useAuth } from "@/providers/AuthProvider";
import { persistProfile } from "@/services/profileService";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useProfileStore } from "@/store/profileStore";
import type { UserGender, UserProfile } from "@/types/user";
import {
  isValidProfileAge,
} from "@/utils/auth/profileComplete";
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
      router.replace("/(tabs)");
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
    fullName,
    gender,
    loading,
    normalizedEmail,
    parsedAge,
    phone,
    profile,
    refreshSession,
    router,
    setDeferProfile,
  ]);

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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sheetOuter}>
            <LinearGradient
              colors={["rgba(118,67,255,0.22)", "rgba(28,24,44,0.92)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sheet}
            >
              <Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>
                A few details{"\n"}about you
              </Text>
              <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
                Help us personalize InstaHelp — name and age are required.
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
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    autoComplete="name"
                  />
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color="rgba(255,255,255,0.55)"
                  />
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
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color="rgba(255,255,255,0.55)"
                  />
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
                        style={[
                          styles.chip,
                          selected && styles.chipSelected,
                        ]}
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
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    autoComplete="postal-address-locality"
                  />
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color="rgba(255,255,255,0.55)"
                  />
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
                    placeholderTextColor="rgba(255,255,255,0.35)"
                    style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Ionicons
                    name="mail-outline"
                    size={18}
                    color="rgba(255,255,255,0.55)"
                  />
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
                style={({ pressed }) => [
                  styles.continueBtn,
                  canContinue && styles.continueBtnActive,
                  pressed && canContinue && { opacity: 0.92 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
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
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A1A" },
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
    justifyContent: "center",
  },
  sheetOuter: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  sheet: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(17,16,26,0.92)",
    overflow: "hidden",
  },
  title: {
    fontSize: 26,
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  sub: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.60)",
    marginBottom: 14,
  },
  field: { marginTop: 12 },
  label: {
    fontSize: 13,
    color: "rgba(255,255,255,0.78)",
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    padding: 0,
  },
  hint: {
    marginTop: 6,
    fontSize: 11,
    color: "rgba(248,113,113,0.9)",
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
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  chipSelected: {
    backgroundColor: "rgba(118,67,255,0.35)",
    borderColor: AUTH_PRIMARY,
  },
  chipLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.72)",
  },
  chipLabelSelected: {
    color: "#fff",
  },
  error: {
    fontSize: 12,
    color: "#f87171",
    marginBottom: 12,
    marginTop: 10,
  },
  continueBtn: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 320,
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2F2F3D",
    marginTop: 28,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    minHeight: 54,
    overflow: "hidden",
  },
  continueBtnActive: {
    backgroundColor: AUTH_PRIMARY,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: AUTH_PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  continueLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },
  continueLabelActive: {
    color: "#FFFFFF",
    textAlign: "center",
  },
});
