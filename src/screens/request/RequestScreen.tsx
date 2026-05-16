import { serviceRequestSchema } from "@/api/schemas/serviceRequest";
import { QUICK_SERVICES } from "@/constants/quickServices";
import { ServiceIcon } from "@/components/service/ServiceIcon";
import { Button } from "@/components/ui/Button";
import { DateTimePickerField } from "@/components/ui/DateTimePickerField";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useCreateBookingMutation } from "@/hooks/queries/useBookings";
import { openWhatsApp } from "@/utils/whatsapp";
import { pickOptionalImage } from "@/utils/pickOptionalImage";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import type { z } from "zod";

type Form = z.infer<typeof serviceRequestSchema>;

const TIME_PRESETS = [
  "Today, ASAP",
  "Today evening",
  "Tomorrow morning",
  "This weekend",
];

function StepRow({
  step,
  label,
  done,
  active,
}: {
  step: number;
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <View className="min-w-0 flex-1 items-center">
      <View
        className={`h-8 w-8 items-center justify-center rounded-full border-2 ${
          done
            ? "border-accent bg-accent"
            : active
              ? "border-accent bg-accent-soft"
              : "border-neutral-200 bg-white"
        }`}
      >
        {done ? (
          <Ionicons name="checkmark" size={16} color="#ffffff" />
        ) : (
          <Text
            className={`text-xs font-extrabold ${
              active ? "text-accent" : "text-neutral-400"
            }`}
          >
            {step}
          </Text>
        )}
      </View>
      <Text
        className={`mt-1.5 text-center text-[10px] font-bold uppercase tracking-wide ${
          active || done ? "text-neutral-800" : "text-neutral-400"
        }`}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

export function RequestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    slug?: string;
    presetLabel?: string;
    presetDescription?: string;
  }>();
  const slug = String(params.slug ?? "custom");
  const presetLabel = String(params.presetLabel ?? "Custom request");
  const presetDescription = params.presetDescription
    ? String(params.presetDescription)
    : "";

  const service = useMemo(
    () => QUICK_SERVICES.find((s) => s.id === slug),
    [slug],
  );

  const serviceLabel = useMemo(() => {
    if (slug === "custom") return presetLabel;
    return service?.label ?? presetLabel;
  }, [presetLabel, service, slug]);

  const mutation = useCreateBookingMutation();
  const [picked, setPicked] = useState<{
    uri: string;
    base64: string | null;
  } | null>(null);
  const [pickErr, setPickErr] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      serviceId: slug,
      serviceLabel,
      description: presetDescription,
      preferredTime: "",
      notes: "",
    },
  });

  useEffect(() => {
    setValue("serviceId", slug);
    setValue("serviceLabel", serviceLabel);
  }, [serviceLabel, setValue, slug]);

  const watchedTime = watch("preferredTime");
  const watchedDescription = watch("description");
  const watchedNotes = watch("notes");

  const descOk = (watchedDescription?.trim().length ?? 0) >= 8;
  const timeOk = (watchedTime?.trim().length ?? 0) >= 2;
  const notesFilled = (watchedNotes?.trim().length ?? 0) > 0;

  const onSubmit = handleSubmit(async (values) => {
    setPickErr(null);
    try {
      const created = await mutation.mutateAsync({
        serviceId: values.serviceId,
        serviceLabel: values.serviceLabel,
        description: values.description,
        preferredTime: values.preferredTime,
        notes: values.notes,
        imageUri: picked?.uri,
        imageBase64: picked?.base64 ?? null,
      });
      router.replace({
        pathname: "/booking/[id]",
        params: { id: created.id },
      });
    } catch {
      setPickErr("Could not submit. Check connection and try again.");
    }
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(400).delay(40)}>
            <LinearGradient
              colors={["#f0f6ff", "#ffffff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="mt-2 overflow-hidden rounded-3xl border border-accent-tint/80 p-5"
              style={{
                shadowColor: "#004aad",
                shadowOpacity: 0.08,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                elevation: 4,
              }}
            >
              <View
                pointerEvents="none"
                className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10"
              />
              <View className="flex-row items-center gap-4">
                {service ? (
                  <View className="rounded-2xl border border-white/80 bg-white p-2 shadow-sm">
                    <ServiceIcon icon={service.icon} active />
                  </View>
                ) : (
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-accent shadow-sm">
                    <Ionicons name="sparkles" size={24} color="#ffffff" />
                  </View>
                )}
                <View className="min-w-0 flex-1">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <Text className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">
                      Service request
                    </Text>
                    <View className="rounded-full bg-accent-soft px-2 py-0.5">
                      <Text className="text-[9px] font-bold text-accent-deep">
                        Guided
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="mt-1.5 text-[22px] font-extrabold leading-7 text-neutral-900"
                    numberOfLines={3}
                  >
                    {serviceLabel}
                  </Text>
                  <Text className="mt-1 text-[13px] leading-[18px] text-neutral-600">
                    Add timing and a photo so our concierge can match you faster.
                  </Text>
                </View>
              </View>

              <View className="mt-5 flex-row justify-between px-1">
                <StepRow
                  step={1}
                  label="Details"
                  done={descOk}
                  active={!descOk}
                />
                <StepRow
                  step={2}
                  label="Schedule"
                  done={timeOk && descOk}
                  active={descOk && !timeOk}
                />
                <StepRow
                  step={3}
                  label="Extras"
                  done={!!picked || notesFilled}
                  active={descOk && timeOk && !picked && !notesFilled}
                />
              </View>
            </LinearGradient>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(420).delay(100)}
            className="mt-4 overflow-hidden rounded-2xl border border-neutral-200/90 bg-white px-4 py-3.5"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="logo-whatsapp" size={18} color="#128C7E" />
              <Text className="flex-1 text-[13px] leading-5 text-neutral-600">
                Prefer to talk it through?{" "}
                <Text
                  className="font-bold text-accent"
                  onPress={() =>
                    openWhatsApp(
                      `Hi InstaHelp! I want help with: ${serviceLabel}.`,
                    )
                  }
                >
                  Open WhatsApp
                </Text>
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(450).delay(140)}
            className="mt-6 gap-5"
          >
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="What do you need?"
                  error={errors.description?.message}
                  hint="Be specific about scope, rooms, access, and any must-haves."
                >
                  <Input
                    multiline
                    className="min-h-[120px]"
                    textAlignVertical="top"
                    placeholder="e.g. Deep clean kitchen + 2 bathrooms, supplies included if possible"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.description}
                  />
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="preferredTime"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Preferred time"
                  error={errors.preferredTime?.message}
                >
                  <Input
                    placeholder="e.g. Today 4–6 pm or Saturday 10 am"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.preferredTime}
                  />
                  <View className="mt-3 flex-row flex-wrap gap-2">
                    {TIME_PRESETS.map((t) => {
                      const on = watchedTime === t;
                      return (
                        <Pressable
                          key={t}
                          onPress={() => onChange(t)}
                          className={`rounded-2xl px-3.5 py-2 active:opacity-90 ${
                            on
                              ? "bg-accent shadow-sm"
                              : "border border-neutral-200 bg-neutral-50"
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              on
                                ? "text-accent-foreground"
                                : "text-neutral-700"
                            }`}
                          >
                            {t}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View className="mt-4">
                    <DateTimePickerField
                      label="Pick exact time"
                      value={
                        value && !TIME_PRESETS.includes(value)
                          ? value
                          : undefined
                      }
                      onPick={(formatted) => onChange(formatted)}
                    />
                  </View>
                </FormField>
              )}
            />

            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField label="Notes (optional)" error={errors.notes?.message}>
                  <Input
                    multiline
                    className="min-h-[88px]"
                    textAlignVertical="top"
                    placeholder="Parking, pets, gate codes, building name…"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={!!errors.notes}
                  />
                </FormField>
              )}
            />

            <View>
              <Text className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500">
                Photo (optional)
              </Text>
              {picked ? (
                <View className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2">
                  <Image
                    source={{ uri: picked.uri }}
                    className="h-48 w-full rounded-xl"
                    resizeMode="cover"
                  />
                  <View className="mt-3 flex-row gap-2">
                    <Pressable
                      onPress={async () => {
                        const p = await pickOptionalImage();
                        setPicked(
                          p ? { uri: p.uri, base64: p.base64 ?? null } : null,
                        );
                      }}
                      className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white py-3 active:bg-neutral-50"
                    >
                      <Ionicons name="refresh" size={16} color="#525252" />
                      <Text className="text-xs font-bold text-neutral-800">
                        Replace
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setPicked(null)}
                      className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-red-200/90 bg-red-50/80 py-3 active:opacity-90"
                    >
                      <Ionicons name="trash-outline" size={16} color="#dc2626" />
                      <Text className="text-xs font-bold text-red-700">
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={async () => {
                    const p = await pickOptionalImage();
                    setPicked(
                      p ? { uri: p.uri, base64: p.base64 ?? null } : null,
                    );
                  }}
                  className="flex-row items-center gap-3 rounded-2xl border border-dashed border-accent-tint bg-accent-soft/40 p-4 active:bg-accent-soft/70"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accent">
                    <Ionicons name="image-outline" size={20} color="#ffffff" />
                  </View>
                  <View className="min-w-0 flex-1">
                    <Text className="text-sm font-bold text-neutral-900">
                      Attach a reference photo
                    </Text>
                    <Text className="mt-0.5 text-xs leading-5 text-neutral-600">
                      Great for repairs, layouts, or “make it look like this”
                      moments.
                    </Text>
                  </View>
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
                    <Ionicons name="add" size={20} color="#004aad" />
                  </View>
                </Pressable>
              )}
            </View>

            {pickErr ? (
              <View className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3">
                <Text className="text-sm font-semibold text-red-700">
                  {pickErr}
                </Text>
              </View>
            ) : null}

            <View className="pb-2 pt-1">
              <Button
                loading={mutation.isPending}
                onPress={onSubmit}
                size="lg"
                className="rounded-full"
                accessibilityLabel="Submit request"
              >
                Submit to InstaHelp
              </Button>
              <View className="mt-3 flex-row items-center justify-center gap-1.5">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={14}
                  color="#737373"
                />
                <Text className="text-center text-[11px] text-neutral-500">
                  Encrypted in transit. We only share details with your assigned
                  pro.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
