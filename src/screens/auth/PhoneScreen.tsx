import { signUpSchema, type SignUpInput } from "@/api/schemas/serviceRequest";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { LogoMark } from "@/components/ui/LogoMark";
import { Screen } from "@/components/ui/Screen";
import { useDeviceAddress } from "@/hooks/useDeviceAddress";
import { persistProfile } from "@/services/profileService";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  FadeOutLeft,
} from "react-native-reanimated";

const PERKS = [
  { icon: "flash" as const, text: "Instant matching" },
  { icon: "shield-checkmark" as const, text: "Verified pros" },
  { icon: "chatbubbles" as const, text: "WhatsApp concierge" },
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
    setValue,
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

  const [autofilled, setAutofilled] = useState(false);
  const {
    address: detected,
    isLoading: detectingLocation,
    isError: detectError,
    error: detectErrorPayload,
    refresh: refreshLocation,
  } = useDeviceAddress({ autoFetch: step === 2 });

  useEffect(() => {
    if (!detected) return;
    const current = getValues("addressLine")?.trim();
    if (current) return;
    setValue("addressLine", detected.address, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setAutofilled(true);
  }, [detected, getValues, setValue]);

  const applyDetectedAddress = () => {
    if (!detected) return;
    setValue("addressLine", detected.address, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setAutofilled(true);
  };

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
      <View
        pointerEvents="none"
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent"
        style={{ opacity: 0.18 }}
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-brand-blue"
        style={{ opacity: 0.06 }}
      />

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
          <Animated.View
            entering={FadeIn.duration(400).easing(Easing.out(Easing.cubic))}
            className="flex-row items-center justify-between"
          >
            <LogoMark size="md" withWordmark />
            <View className="flex-row items-center gap-1.5">
              <View
                className={`h-1.5 rounded-full ${
                  step === 1 ? "w-7 bg-brand-blue" : "w-2 bg-neutral-200"
                }`}
              />
              <View
                className={`h-1.5 rounded-full ${
                  step === 2 ? "w-7 bg-brand-blue" : "w-2 bg-neutral-200"
                }`}
              />
            </View>
          </Animated.View>

          {step === 1 ? (
            <Animated.View
              entering={FadeIn.duration(320).easing(Easing.out(Easing.cubic))}
              exiting={FadeOutLeft.duration(220)}
              style={{ flex: 1, marginTop: 44 }}
            >
              <Animated.View entering={FadeInUp.delay(60).duration(420)}>
                <View className="flex-row items-center gap-2">
                  <View className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                  <Text className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-blue">
                    Welcome aboard
                  </Text>
                </View>
                <Text className="mt-4 text-[34px] font-extrabold leading-[40px] tracking-tight text-neutral-900">
                  Let&apos;s get
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-[34px] font-extrabold leading-[40px] tracking-tight text-neutral-900">
                    you set up.
                  </Text>
                  <View className="ml-3 h-2 w-10 rounded-full bg-accent" />
                </View>
                <Text className="mt-3 text-[15px] leading-[22px] text-neutral-500">
                  Enter your number to unlock the concierge.
                  {"\n"}No passwords. No OTP wait. No noise.
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(180).duration(420)}
                className="mt-7"
              >
                <View className="flex-row items-center gap-3">
                  {PERKS.map((p) => (
                    <View
                      key={p.text}
                      className="flex-1 items-center gap-2 rounded-2xl border border-brand-line bg-white px-2 py-3"
                    >
                      <View className="h-9 w-9 items-center justify-center rounded-full bg-accent">
                        <Ionicons name={p.icon} size={15} color="#ffffff" />
                      </View>
                      <Text
                        className="text-[11px] font-bold text-neutral-700 text-center"
                        numberOfLines={1}
                      >
                        {p.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(320).duration(420)}
                className="mt-8 gap-5"
              >
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <FormField
                      label="Phone number"
                      error={errors.phone?.message}
                    >
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

                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color="#737373"
                  />
                  <Text className="text-[11px] font-medium text-neutral-500">
                    End-to-end private. Stored only on your device + Sheet.
                  </Text>
                </View>
              </Animated.View>

              <View style={{ flex: 1 }} />

              <Animated.View
                entering={FadeInDown.delay(440).duration(420)}
                className="mt-8 gap-3"
              >
                <Pressable
                  onPress={goNext}
                  accessibilityRole="button"
                  accessibilityLabel="Continue to profile"
                  className="rounded-2xl bg-neutral-900 py-4 active:opacity-90"
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Text className="text-base font-bold text-white">
                      Continue
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                  </View>
                </Pressable>
                <Text className="text-center text-[11px] text-neutral-400">
                  By continuing you agree to InstaHelp&apos;s service terms.
                </Text>
              </Animated.View>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeIn.duration(320).easing(Easing.out(Easing.cubic))}
              exiting={FadeOutLeft.duration(220)}
              style={{ flex: 1, marginTop: 44 }}
            >
              <Animated.View entering={FadeInUp.delay(60).duration(420)}>
                <Pressable
                  onPress={goBack}
                  className="self-start flex-row items-center gap-1.5 rounded-full border border-brand-line bg-white px-3 py-2"
                >
                  <Ionicons name="chevron-back" size={14} color="#000000" />
                  <Text className="text-xs font-bold tracking-wide text-neutral-800">
                    {getValues("phone").trim() || "Edit number"}
                  </Text>
                </Pressable>
                <View className="mt-5 flex-row items-center gap-2">
                  <View className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                  <Text className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-blue">
                    Almost there
                  </Text>
                </View>
                <Text className="mt-4 text-[34px] font-extrabold leading-[40px] tracking-tight text-neutral-900">
                  Tell us
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-[34px] font-extrabold leading-[40px] tracking-tight text-neutral-900">
                    about you.
                  </Text>
                  <View className="ml-3 h-2 w-10 rounded-full bg-accent" />
                </View>
                <Text className="mt-3 text-[15px] leading-[22px] text-neutral-500">
                  We use this on bookings so vendors greet you by name.
                </Text>
              </Animated.View>

              <Animated.View
                entering={FadeInUp.delay(180).duration(420)}
                className="mt-8"
              >
                <View className="rounded-3xl border border-brand-line bg-white p-5">
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
                          returnKeyType="next"
                        />
                      </FormField>
                    )}
                  />

                  <View className="my-5 h-px bg-brand-line" />

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

                  <View className="my-5 h-px bg-brand-line" />

                  <Controller
                    control={control}
                    name="addressLine"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <FormField
                        label="Default address (optional)"
                        error={errors.addressLine?.message}
                        hint="Speeds up future bookings. You can add more later."
                      >
                        <LocationBanner
                          loading={detectingLocation}
                          error={detectError ? detectErrorPayload?.message : null}
                          detectedShort={detected?.shortAddress}
                          autofilled={autofilled && !!value?.trim()}
                          onApply={applyDetectedAddress}
                          onRetry={() => {
                            setAutofilled(false);
                            refreshLocation().catch(() => {});
                          }}
                        />
                        <Input
                          multiline
                          className="min-h-[88px]"
                          textAlignVertical="top"
                          placeholder="Flat, building, street, area, city"
                          value={value ?? ""}
                          onBlur={onBlur}
                          onChangeText={(v) => {
                            onChange(v);
                            if (autofilled) setAutofilled(false);
                          }}
                          error={!!errors.addressLine}
                        />
                      </FormField>
                    )}
                  />
                </View>

                {submitError ? (
                  <View className="mt-4 flex-row items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3">
                    <Ionicons name="alert-circle" size={16} color="#dc2626" />
                    <Text className="flex-1 text-xs font-medium text-red-600">
                      {submitError}
                    </Text>
                  </View>
                ) : null}
              </Animated.View>

              <View style={{ flex: 1 }} />

              <Animated.View
                entering={FadeInDown.delay(360).duration(420)}
                className="mt-8 gap-3"
              >
                <Pressable
                  onPress={onSubmit}
                  disabled={submitting}
                  accessibilityRole="button"
                  accessibilityLabel="Finish sign up"
                  className={`rounded-2xl bg-neutral-900 py-4 active:opacity-90 ${
                    submitting ? "opacity-60" : ""
                  }`}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    {submitting ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Text className="text-base font-bold text-white">
                          Finish and continue
                        </Text>
                        <Ionicons
                          name="checkmark"
                          size={16}
                          color="#ffffff"
                        />
                      </>
                    )}
                  </View>
                </Pressable>
                <Text className="text-center text-[11px] text-neutral-400">
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

function LocationBanner({
  loading,
  error,
  detectedShort,
  autofilled,
  onApply,
  onRetry,
}: {
  loading: boolean;
  error: string | null | undefined;
  detectedShort: string | undefined;
  autofilled: boolean;
  onApply: () => void;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-accent-tint bg-accent-soft px-3 py-2.5">
        <ActivityIndicator size="small" color="#004aad" />
        <Text className="flex-1 text-[12px] font-semibold text-accent-deep">
          Detecting your location…
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2.5">
        <Ionicons name="location-outline" size={14} color="#737373" />
        <Text className="flex-1 text-[12px] font-medium text-neutral-500" numberOfLines={2}>
          {error}
        </Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry location"
          className="rounded-full bg-neutral-900 px-3 py-1.5 active:opacity-90"
        >
          <Text className="text-[11px] font-bold text-white">Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (autofilled) {
    return (
      <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-accent-tint bg-accent-soft px-3 py-2.5">
        <Ionicons name="checkmark-circle" size={14} color="#004aad" />
        <Text className="flex-1 text-[12px] font-semibold text-accent-deep" numberOfLines={1}>
          Filled from your current location
        </Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Refresh location"
          hitSlop={6}
        >
          <Ionicons name="refresh" size={14} color="#004aad" />
        </Pressable>
      </View>
    );
  }

  if (detectedShort) {
    return (
      <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-accent-tint bg-accent-soft px-3 py-2.5">
        <Ionicons name="navigate" size={14} color="#004aad" />
        <Text className="flex-1 text-[12px] font-semibold text-accent-deep" numberOfLines={1}>
          {detectedShort}
        </Text>
        <Pressable
          onPress={onApply}
          accessibilityRole="button"
          accessibilityLabel="Use detected location"
          className="rounded-full bg-accent px-3 py-1.5 active:opacity-90"
        >
          <Text className="text-[11px] font-bold text-white">Use</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}
