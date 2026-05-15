import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { LogoMark } from "@/components/ui/LogoMark";
import { Screen } from "@/components/ui/Screen";
import { useAppAuth } from "@/hooks/auth/useAppAuth";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useDeviceAddress } from "@/hooks/useDeviceAddress";
import { persistProfile } from "@/services/profileService";
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
} from "react-native-reanimated";
import { z } from "zod";

const locationSchema = z.object({
  addressLabel: z
    .string()
    .max(20, "Short label, like Home or Office")
    .optional()
    .or(z.literal("")),
  addressLine: z
    .string()
    .max(200, "Keep address under 200 characters")
    .optional()
    .or(z.literal("")),
});

type LocationForm = z.infer<typeof locationSchema>;

export function LocationScreen() {
  const router = useRouter();
  const phone = useAuthPhone();
  const { isAuthenticated } = useAppAuth();
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [autofilled, setAutofilled] = useState(false);

  const existingLine = profile?.addresses?.[0]?.line ?? "";
  const existingLabel = profile?.addresses?.[0]?.label ?? "Home";

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LocationForm>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      addressLabel: existingLabel,
      addressLine: existingLine.includes("Add your home") ? "" : existingLine,
    },
    mode: "onTouched",
  });

  const {
    address: detected,
    isLoading: detectingLocation,
    isError: detectError,
    error: detectErrorPayload,
    refresh: refreshLocation,
  } = useDeviceAddress({ autoFetch: true });

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

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const basePhone = phone && phone !== "guest" ? phone : profile?.phone;
    if (!basePhone || !profile?.name?.trim()) {
      router.replace("/(auth)/name");
      return;
    }

    try {
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
        : profile.addresses;

      const next = {
        ...profile,
        phone: basePhone,
        addresses,
      };

      setProfile(next);
      if (isAuthenticated && basePhone !== "guest") {
        await persistProfile(next);
      }
      router.replace("/(tabs)");
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not save your profile",
      );
    }
  });

  return (
    <Screen>
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
        >
          <LogoMark size="md" withWordmark />
          <Animated.View
            entering={FadeIn.duration(320).easing(Easing.out(Easing.cubic))}
            style={{ flex: 1, marginTop: 44 }}
          >
            <Animated.View entering={FadeInUp.delay(60).duration(420)}>
              <View className="flex-row items-center gap-2">
                <View className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                <Text className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-blue">
                  Your area
                </Text>
              </View>
              <Text className="mt-4 text-[34px] font-extrabold leading-[40px] tracking-tight text-neutral-900">
                Where should we come?
              </Text>
              <Text className="mt-3 text-[15px] leading-[22px] text-neutral-500">
                Speeds up future bookings. You can add more addresses later.
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(180).duration(420)}
              className="mt-8"
            >
              <View className="rounded-3xl border border-brand-line bg-white p-5">
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
                    >
                      <LocationBanner
                        loading={detectingLocation}
                        error={
                          detectError ? detectErrorPayload?.message : null
                        }
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
                disabled={isSubmitting}
                className={`rounded-2xl bg-neutral-900 py-4 active:opacity-90 ${
                  isSubmitting ? "opacity-60" : ""
                }`}
              >
                <View className="flex-row items-center justify-center gap-2">
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Text className="text-base font-bold text-white">
                        Finish and continue
                      </Text>
                      <Ionicons name="checkmark" size={16} color="#ffffff" />
                    </>
                  )}
                </View>
              </Pressable>
              <Pressable
                onPress={() => router.replace("/(tabs)")}
                className="py-2"
              >
                <Text className="text-center text-sm font-semibold text-neutral-500">
                  Skip for now
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
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
        <Text
          className="flex-1 text-[12px] font-medium text-neutral-500"
          numberOfLines={2}
        >
          {error}
        </Text>
        <Pressable
          onPress={onRetry}
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
        <Text
          className="flex-1 text-[12px] font-semibold text-accent-deep"
          numberOfLines={1}
        >
          Filled from your current location
        </Text>
        <Pressable onPress={onRetry} hitSlop={6}>
          <Ionicons name="refresh" size={14} color="#004aad" />
        </Pressable>
      </View>
    );
  }

  if (detectedShort) {
    return (
      <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-accent-tint bg-accent-soft px-3 py-2.5">
        <Ionicons name="navigate" size={14} color="#004aad" />
        <Text
          className="flex-1 text-[12px] font-semibold text-accent-deep"
          numberOfLines={1}
        >
          {detectedShort}
        </Text>
        <Pressable
          onPress={onApply}
          className="rounded-full bg-accent px-3 py-1.5 active:opacity-90"
        >
          <Text className="text-[11px] font-bold text-white">Use</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}
