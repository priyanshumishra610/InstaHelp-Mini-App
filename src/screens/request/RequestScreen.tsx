import { serviceRequestSchema } from "@/api/schemas/serviceRequest";
import { QUICK_SERVICES } from "@/constants/quickServices";
import { ServiceIcon } from "@/components/service/ServiceIcon";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { useCreateBookingMutation } from "@/hooks/queries/useBookings";
import { pickOptionalImage } from "@/utils/pickOptionalImage";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import type { z } from "zod";

type Form = z.infer<typeof serviceRequestSchema>;

const TIME_PRESETS = [
  "Today, ASAP",
  "Today evening",
  "Tomorrow morning",
  "This weekend",
];

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
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <View className="mt-2 flex-row items-center gap-3 rounded-3xl border border-brand-line bg-white p-4 dark:border-brand-lineDark dark:bg-brand-cardDark">
          {service ? (
            <ServiceIcon icon={service.icon} active />
          ) : (
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-accent">
              <Ionicons name="sparkles" size={20} color="#1a1a1a" />
            </View>
          )}
          <View className="flex-1">
            <Text className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-deep dark:text-accent">
              New request
            </Text>
            <Text className="mt-1 text-lg font-extrabold text-neutral-900 dark:text-white">
              {serviceLabel}
            </Text>
          </View>
        </View>

        <Text className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
          Add timing and context. Photos are optional but helpful.
        </Text>

        <View className="mt-6 gap-5">
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="What do you need?"
                error={errors.description?.message}
                hint="Be specific about scope, location, or timing."
              >
                <Input
                  multiline
                  className="min-h-[110px]"
                  textAlignVertical="top"
                  placeholder="e.g. Deep clean a 2BHK kitchen and 2 bathrooms"
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
                  placeholder="e.g. Today 4 to 6 pm or Saturday 10 am"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.preferredTime}
                />
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {TIME_PRESETS.map((t) => {
                    const on = watchedTime === t;
                    return (
                      <Pressable
                        key={t}
                        onPress={() => onChange(t)}
                        className={`rounded-full px-3 py-1.5 ${
                          on
                            ? "bg-accent"
                            : "border border-brand-line bg-white dark:border-brand-lineDark dark:bg-brand-cardDark"
                        }`}
                      >
                        <Text
                          className={`text-xs font-bold ${
                            on
                              ? "text-accent-foreground"
                              : "text-neutral-700 dark:text-neutral-200"
                          }`}
                        >
                          {t}
                        </Text>
                      </Pressable>
                    );
                  })}
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
                  placeholder="Parking, access, pets, anything we should know."
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.notes}
                />
              </FormField>
            )}
          />

          <View>
            <Text className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
              Photo (optional)
            </Text>
            {picked ? (
              <View className="rounded-2xl bg-white p-2 shadow-soft dark:bg-brand-cardDark dark:shadow-soft-dark">
                <Image
                  source={{ uri: picked.uri }}
                  className="h-44 w-full rounded-xl"
                  resizeMode="cover"
                />
                <View className="mt-2 flex-row gap-2">
                  <Pressable
                    onPress={async () => {
                      const p = await pickOptionalImage();
                      setPicked(p ? { uri: p.uri, base64: p.base64 ?? null } : null);
                    }}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-brand-line py-2.5 dark:border-brand-lineDark"
                  >
                    <Ionicons name="refresh" size={14} color="#525252" />
                    <Text className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                      Change
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setPicked(null)}
                    className="flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 dark:border-red-900"
                  >
                    <Ionicons name="trash-outline" size={14} color="#dc2626" />
                    <Text className="text-xs font-bold text-red-600">
                      Remove
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={async () => {
                  const p = await pickOptionalImage();
                  setPicked(p ? { uri: p.uri, base64: p.base64 ?? null } : null);
                }}
                className="flex-row items-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-brand-cardDark"
              >
                <View className="h-10 w-10 items-center justify-center rounded-xl bg-accent/15">
                  <Ionicons name="image-outline" size={18} color="#a88a00" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-neutral-900 dark:text-white">
                    Attach a photo
                  </Text>
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                    Helps the vendor estimate faster.
                  </Text>
                </View>
                <Ionicons name="add" size={18} color="#a88a00" />
              </Pressable>
            )}
          </View>

          {pickErr ? (
            <Text className="text-sm font-medium text-red-500">{pickErr}</Text>
          ) : null}

          <Button
            loading={mutation.isPending}
            onPress={onSubmit}
            size="lg"
            accessibilityLabel="Submit request"
          >
            Submit to InstaHelp
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
