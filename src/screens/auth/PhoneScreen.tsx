import { signUpSchema, type SignUpInput } from "@/api/schemas/serviceRequest";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { LogoMark } from "@/components/ui/LogoMark";
import { Screen } from "@/components/ui/Screen";
import { persistProfile } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
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
  FadeInRight,
  FadeOutLeft,
} from "react-native-reanimated";

const PERKS = [
  { icon: "flash" as const, text: "Instant vendor matching" },
  { icon: "shield-checkmark" as const, text: "Verified pros, every time" },
  { icon: "chatbubbles" as const, text: "Concierge on WhatsApp" },
];

export function PhoneScreen() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      phone: "+91 ",
      name: "",
      addressLabel: "Home",
      addressLine: "",
    },
    mode: "onTouched",
  });

  const goNext = async () => {
    const ok = await trigger("phone");
    if (ok) setStep(2);
  };

  const goBack = () => {
    setSubmitError(null);
    setStep(1);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      const cleanedPhone = values.phone.replace(/\s+/g, "");
      const token = `signup_${Date.now()}`;
      setSession(cleanedPhone, token);

      const trimmedLine = values.addressLine?.trim() ?? "";
      const trimmedLabel = (values.addressLabel?.trim() || "Home").trim();
      const addresses = trimmedLine
        ? [
            {
              id: trimmedLabel.toLowerCase().replace(/[^a-z0-9]/g, "") || "home",
              label: trimmedLabel,
              line: trimmedLine,
            },
          ]
        : [];

      const profile = {
        phone: cleanedPhone,
        name: values.name.trim(),
        addresses,
        favorites: [] as string[],
      };

      setProfile(profile);
      await persistProfile(profile);

      router.replace("/(tabs)");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save your profile",
      );
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between">
            <LogoMark size="md" withWordmark />
            <View className="flex-row items-center gap-1.5">
              <View
                className={`h-1.5 rounded-full ${
                  step === 1 ? "w-6 bg-accent" : "w-2 bg-accent/40"
                }`}
              />
              <View
                className={`h-1.5 rounded-full ${
                  step === 2 ? "w-6 bg-accent" : "w-2 bg-accent/40"
                }`}
              />
            </View>
          </View>

          {step === 1 ? (
            <Animated.View
              entering={FadeIn.duration(320).easing(Easing.out(Easing.cubic))}
              exiting={FadeOutLeft.duration(220)}
              style={{ flex: 1, marginTop: 32 }}
            >
              <Animated.View entering={FadeInRight.delay(80).duration(360)}>
                <View className="self-start rounded-full bg-accent/15 px-3 py-1.5">
                  <Text className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-deep">
                    Welcome
                  </Text>
                </View>
                <Text className="mt-3 text-3xl font-extrabold leading-9 text-neutral-900 dark:text-white">
                  Let&apos;s get you set up
                </Text>
                <Text className="mt-2 text-base leading-6 text-neutral-500 dark:text-neutral-400">
                  Enter your phone first. No passwords, no OTP wait, no noise.
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInRight.delay(160).duration(380)}
                className="mt-6 gap-2"
              >
                {PERKS.map((p, i) => (
                  <View
                    key={p.text}
                    className="flex-row items-center gap-3 rounded-2xl border border-brand-line bg-white p-3 dark:border-brand-lineDark dark:bg-brand-cardDark"
                    style={{ opacity: 1 - i * 0.05 }}
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-accent/20">
                      <Ionicons name={p.icon} size={16} color="#a88a00" />
                    </View>
                    <Text className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                      {p.text}
                    </Text>
                  </View>
                ))}
              </Animated.View>

              <Animated.View
                entering={FadeInRight.delay(280).duration(380)}
                className="mt-7 gap-5"
              >
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormField label="Phone number" error={errors.phone?.message}>
                      <Input
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={!!errors.phone}
                        returnKeyType="next"
                        onSubmitEditing={goNext}
                      />
                    </FormField>
                  )}
                />

                <Button
                  size="lg"
                  onPress={goNext}
                  accessibilityLabel="Continue to profile"
                >
                  Continue
                </Button>
                <Text className="text-center text-xs text-neutral-400 dark:text-neutral-600">
                  By continuing you agree to InstaHelp&apos;s service terms.
                </Text>
              </Animated.View>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(320).easing(Easing.out(Easing.cubic))}
              exiting={FadeOutLeft.duration(220)}
              style={{ flex: 1, marginTop: 32 }}
            >
              <Animated.View entering={FadeInRight.delay(60).duration(360)}>
                <Pressable
                  onPress={goBack}
                  className="self-start flex-row items-center gap-1 rounded-full bg-white px-3 py-1.5 shadow-soft dark:bg-neutral-900 dark:shadow-soft-dark"
                >
                  <Ionicons name="chevron-back" size={14} color="#525252" />
                  <Text className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                    {getValues("phone").trim() || "Edit number"}
                  </Text>
                </Pressable>
                <Text className="mt-4 text-3xl font-extrabold leading-9 text-neutral-900 dark:text-white">
                  Tell us about you
                </Text>
                <Text className="mt-2 text-base leading-6 text-neutral-500 dark:text-neutral-400">
                  We use this on bookings so vendors greet you by name.
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInRight.delay(180).duration(380)}
                className="mt-7 gap-5"
              >
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormField label="Full name" error={errors.name?.message}>
                      <Input
                        autoCapitalize="words"
                        autoComplete="name"
                        placeholder="e.g. Priyanshu Mishra"
                        value={value}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={!!errors.name}
                        returnKeyType="next"
                      />
                    </FormField>
                  )}
                />

                <Controller
                  control={control}
                  name="addressLabel"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                      label="Address label"
                      error={errors.addressLabel?.message}
                      hint="A short tag like Home, Office, or Parents."
                    >
                      <Input
                        placeholder="Home"
                        value={value ?? ""}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={!!errors.addressLabel}
                      />
                    </FormField>
                  )}
                />

                <Controller
                  control={control}
                  name="addressLine"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                      label="Default address (optional)"
                      error={errors.addressLine?.message}
                      hint="Speeds up future bookings. You can add more later."
                    >
                      <Input
                        multiline
                        className="min-h-[88px]"
                        textAlignVertical="top"
                        placeholder="Flat, building, street, area, city"
                        value={value ?? ""}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        error={!!errors.addressLine}
                      />
                    </FormField>
                  )}
                />

                {submitError ? (
                  <View className="flex-row items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/40">
                    <Ionicons name="alert-circle" size={16} color="#dc2626" />
                    <Text className="flex-1 text-xs font-medium text-red-600">
                      {submitError}
                    </Text>
                  </View>
                ) : null}

                <Button
                  size="lg"
                  onPress={onSubmit}
                  loading={submitting}
                  accessibilityLabel="Finish sign up"
                >
                  Finish and continue
                </Button>
                <Text className="text-center text-xs text-neutral-400 dark:text-neutral-600">
                  Saved securely to your InstaHelp profile.
                </Text>
              </Animated.View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
