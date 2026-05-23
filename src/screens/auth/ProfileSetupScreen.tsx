import { AUTH_FONT, AUTH_PRIMARY } from "@/constants/authPremium";
import { getFirebaseStorage } from "@/firebase/config";
import { updateUserProfile } from "@/firebase/users";
import { useAuth } from "@/providers/AuthProvider";
import type { UserGender } from "@/types/firestoreUser";
import { mapFirebaseAuthError } from "@/utils/auth/firebaseErrors";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const GENDERS: { id: UserGender; label: string }[] = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "other", label: "Other" },
  { id: "prefer_not_to_say", label: "Prefer not to say" },
];

export function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { firebaseUser, refreshFirestoreUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<UserGender | "">("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const canContinue = fullName.trim().length >= 2 && Boolean(gender);

  const pickImage = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  }, []);

  const uploadProfileImage = async (uid: string, uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const objectRef = ref(getFirebaseStorage(), `users/${uid}/avatar.jpg`);
    await uploadBytes(objectRef, blob, { contentType: "image/jpeg" });
    return getDownloadURL(objectRef);
  };

  const onContinue = useCallback(async () => {
    if (!canContinue || !firebaseUser || loading) return;
    setLoading(true);
    setError(null);
    try {
      let profileImage: string | null = null;
      if (imageUri) {
        profileImage = await uploadProfileImage(firebaseUser.uid, imageUri);
      }
      await updateUserProfile(firebaseUser.uid, {
        fullName: fullName.trim(),
        gender: gender as UserGender,
        profileImage,
      });
      await refreshFirestoreUser();
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e) {
      setError(mapFirebaseAuthError(e));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }, [
    canContinue,
    firebaseUser,
    fullName,
    gender,
    imageUri,
    loading,
    refreshFirestoreUser,
    router,
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
          <Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>
            Create your profile
          </Text>
          <Text style={[styles.sub, { fontFamily: AUTH_FONT.regular }]}>
            Tell us a bit about you to personalize InstaHelp.
          </Text>

          <Pressable onPress={() => void pickImage()} style={styles.avatarWrap}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="camera-outline" size={28} color="#9CA3AF" />
              </View>
            )}
            <Text style={[styles.avatarHint, { fontFamily: AUTH_FONT.medium }]}>
              Add photo (optional)
            </Text>
          </Pressable>

          <Text style={[styles.label, { fontFamily: AUTH_FONT.semibold }]}>
            Full name
          </Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your name"
            placeholderTextColor="#6B7280"
            style={[styles.input, { fontFamily: AUTH_FONT.medium }]}
            editable={!loading}
          />

          <Text style={[styles.label, { fontFamily: AUTH_FONT.semibold }]}>
            Gender
          </Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => {
              const selected = gender === g.id;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => setGender(g.id)}
                  style={[styles.genderChip, selected && styles.genderChipActive]}
                >
                  <Text
                    style={[
                      styles.genderLabel,
                      { fontFamily: AUTH_FONT.medium },
                      selected && styles.genderLabelActive,
                    ]}
                  >
                    {g.label}
                  </Text>
                </Pressable>
              );
            })}
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
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text
                style={[
                  styles.continueLabel,
                  { fontFamily: AUTH_FONT.semibold },
                  canContinue && styles.continueLabelActive,
                ]}
              >
                Continue
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A1A" },
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  scroll: { paddingHorizontal: 24 },
  title: {
    fontSize: 28,
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 24,
  },
  avatarWrap: { alignItems: "center", marginBottom: 24 },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#1E1E28",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  label: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#9CA3AF",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderRadius: 14,
    backgroundColor: "#1E1E28",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
  },
  genderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  genderChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#1E1E28",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  genderChipActive: {
    backgroundColor: "rgba(37,99,235,0.25)",
    borderColor: AUTH_PRIMARY,
  },
  genderLabel: { fontSize: 13, color: "#9CA3AF" },
  genderLabelActive: { color: "#fff" },
  error: {
    fontSize: 12,
    color: "#f87171",
    marginBottom: 12,
  },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#2A2A34",
    marginTop: 8,
  },
  continueBtnActive: { backgroundColor: "#E5E7EB" },
  continueLabel: { fontSize: 16, color: "#6B7280" },
  continueLabelActive: { color: "#0f172a" },
});
