import { AuthBackdrop } from "@/components/auth/AuthBackdrop";
import { AuthStepIndicator } from "@/components/auth/AuthStepIndicator";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { LogoMark } from "@/components/ui/LogoMark";
import { Screen } from "@/components/ui/Screen";
import { ACCENT } from "@/constants/theme";
import { useAppAuth } from "@/hooks/auth/useAppAuth";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { persistProfile } from "@/services/profileService";
import { useProfileStore } from "@/store/profileStore";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { z } from "zod";

const nameSchema = z.object({
  name: z
    .string()
    .min(2, "Tell us your name")
    .max(60, "Keep it under 60 characters"),
});

type NameForm = z.infer<typeof nameSchema>;

export function NameScreen() {
  const router = useRouter();
  const phone = useAuthPhone();
  const { isAuthenticated } = useAppAuth();
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: { name: profile?.name ?? "" },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    const trimmed = name.trim();
    const basePhone = phone && phone !== "guest" ? phone : profile?.phone ?? "";
    if (!basePhone) {
      router.replace("/(auth)/phone");
      return;
    }

    const next = {
      phone: basePhone,
      name: trimmed,
      addresses: profile?.addresses?.length
        ? profile.addresses
        : [
            {
              id: "home",
              label: "Home",
              line: "Add your home address in Profile",
            },
          ],
      favorites: profile?.favorites ?? [],
      avatarUri: profile?.avatarUri,
      role: profile?.role,
    };

    setProfile(next);
    if (isAuthenticated && basePhone !== "guest") {
      await persistProfile(next);
    }
    router.replace("/(auth)/location");
  });

  return (
    <Screen>
      <AuthBackdrop>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 24,
              paddingTop: 18,
              paddingBottom: 40,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <LogoMark size="md" withWordmark />
            <View className="mt-6">
              <AuthStepIndicator current="Your name" />
            </View>
            <Animated.View
              entering={FadeIn.duration(320).easing(Easing.out(Easing.cubic))}
              style={{ flex: 1, marginTop: 32 }}
            >
              <Animated.View entering={FadeInUp.delay(60).duration(420)}>
                <Text className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent-deep">
                  Almost there
                </Text>
                <Text className="mt-4 text-[32px] font-extrabold leading-[38px] tracking-tight text-neutral-900">
                  What should we call you?
                </Text>
                <Text className="mt-3 text-[15px] leading-[22px] text-neutral-600">
                  Vendors see this on bookings so they can greet you by name.
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(180).duration(420)}
                className="mt-8"
              >
                <View
                  className="rounded-3xl border border-white bg-white p-5"
                  style={{
                    shadowColor: ACCENT,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.08,
                    shadowRadius: 20,
                    elevation: 4,
                  }}
                >
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormField label="Full name" error={errors.name?.message}>
                      <Input
                        autoCapitalize="words"
                        autoComplete="name"
                        placeholder="Your full name"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={!!errors.name}
                        returnKeyType="done"
                        onSubmitEditing={onSubmit}
                      />
                    </FormField>
                  )}
                />
              </View>
            </Animated.View>

            <View style={{ flex: 1 }} />

              <Animated.View
                entering={FadeInDown.delay(360).duration(420)}
                className="mt-8"
              >
                <Pressable
                  onPress={onSubmit}
                  disabled={isSubmitting}
                  className={`rounded-2xl bg-accent py-4 active:opacity-90 ${
                    isSubmitting ? "opacity-60" : ""
                  }`}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    {isSubmitting ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Text className="text-base font-bold text-white">
                          Continue
                        </Text>
                        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                      </>
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </AuthBackdrop>
    </Screen>
  );
}
