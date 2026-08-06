import { ExploreServiceSuggestion } from "@/components/home/ExploreServiceSuggestion";
import { GlowButton } from "@/components/ui/GlowButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { DateTimeSlotPicker } from "@/components/ui/DateTimeSlotPicker";
import { Input } from "@/components/ui/Input";
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import { ExploreGlassCard } from "@/components/vendors/ExploreGlassCard";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/config/env";
import { RADIUS } from "@/constants/designSystem";
import { ACCENT, HERO_BACKDROP, HERO_LAVENDER } from "@/constants/theme";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDeviceAddress } from "@/hooks/useDeviceAddress";
import { createBookingLocalFirst } from "@/services/bookingService";
import {
  matchFormToExplore,
  type ExploreFormSuggestion,
} from "@/services/vendors/matchFormToExplore";
import { openWhatsApp } from "@/utils/whatsapp";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SERVICE_OPTIONS: SelectOption[] = [
  { value: "cleaning", label: "Cleaning" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrician", label: "Electrician" },
  { value: "painting", label: "Painting" },
  { value: "ac_repair", label: "AC repair" },
  { value: "cctv", label: "CCTV installation / repair" },
  { value: "carpenter", label: "Carpenter" },
  { value: "repair", label: "Repair / handyman" },
  { value: "moving", label: "Packers & movers" },
  { value: "pest_control", label: "Pest control" },
  { value: "appliance_repair", label: "Appliance repair" },
  { value: "real_estate", label: "Real estate" },
  { value: "doctor", label: "Doctor / clinic" },
  { value: "car_wash", label: "Car wash / detailing" },
  { value: "laundry", label: "Laundry / dry clean" },
  { value: "local_shop", label: "Local shop / errand" },
  { value: "driver", label: "Driver" },
  { value: "tutor", label: "Tutor" },
  { value: "salon", label: "Salon at home" },
  { value: "errand", label: "Errand / pickup" },
  { value: "custom", label: "Something else" },
];

const SOURCE_OPTIONS: SelectOption[] = [
  { value: "friend", label: "Friend or family" },
  { value: "social", label: "Instagram / TikTok / Social" },
  { value: "search", label: "Google search" },
  { value: "ad", label: "Saw an ad" },
  { value: "notification", label: "InstaHelp notification" },
  { value: "concierge", label: "Concierge referral" },
  { value: "other", label: "Somewhere else" },
];

const PAID_OPTIONS: SelectOption[] = [
  { value: "no", label: "No, this is a fresh request" },
  { value: "yes", label: "Yes, I've already paid elsewhere" },
  { value: "partial", label: "Partial payment somewhere" },
  { value: "unsure", label: "Not sure" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  initialService?: string;
  initialSource?: string;
  onBrowseExplore?: (suggestion: ExploreFormSuggestion) => void;
};

export function RequestFormSheet({
  visible,
  onClose,
  initialService,
  initialSource,
  onBrowseExplore,
}: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const authPhone = useAuthPhone();
  const { data: profile } = useProfileQuery();

  const [name, setName] = useState(profile?.name ?? "");
  const [phoneInput, setPhoneInput] = useState(authPhone ?? "");
  const [address, setAddress] = useState("");
  const [addressAutofilled, setAddressAutofilled] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [preferredTime, setPreferredTime] = useState("Today, ASAP");
  const [source, setSource] = useState("");
  const [paid, setPaid] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [exploreSuggestionDismissed, setExploreSuggestionDismissed] =
    useState(false);

  const deviceLocation = useDeviceAddress({ autoFetch: visible });
  const debouncedDescription = useDebouncedValue(description, 280);
  const serviceLabel = useMemo(
    () => SERVICE_OPTIONS.find((s) => s.value === serviceType)?.label,
    [serviceType],
  );
  const exploreSuggestion = useMemo(
    () =>
      matchFormToExplore({
        serviceType,
        serviceLabel,
        description: debouncedDescription,
      }),
    [serviceType, serviceLabel, debouncedDescription],
  );

  const nameTouchedRef = useRef(false);
  const phoneTouchedRef = useRef(false);
  const addressTouchedRef = useRef(false);

  useEffect(() => {
    setExploreSuggestionDismissed(false);
  }, [exploreSuggestion?.search, exploreSuggestion?.label]);

  useEffect(() => {
    const profileName = profile?.name?.trim();
    if (profileName && !nameTouchedRef.current && name === "") {
      setName(profileName);
    }
  }, [profile?.name, name]);

  useEffect(() => {
    if (authPhone && !phoneTouchedRef.current && phoneInput === "") {
      setPhoneInput(authPhone);
    }
  }, [authPhone, phoneInput]);

  useEffect(() => {
    if (addressTouchedRef.current) return;
    if (!deviceLocation.address?.address) return;
    setAddress(deviceLocation.address.address);
    setAddressAutofilled(true);
    setErrors((current) => ({ ...current, address: "" }));
  }, [deviceLocation.address?.address]);

  useEffect(() => {
    if (!visible) return;
    if (
      initialService &&
      SERVICE_OPTIONS.some((option) => option.value === initialService)
    ) {
      setServiceType(initialService);
    }
    if (
      initialSource &&
      SOURCE_OPTIONS.some((option) => option.value === initialSource)
    ) {
      setSource(initialSource);
    }
  }, [visible, initialService, initialSource]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Add your name";
    if (phoneInput.replace(/\D/g, "").length < 8)
      next.phone = "Add a valid phone";
    if (address.trim().length < 6) next.address = "Add a service address";
    if (!serviceType) next.service = "Pick a service";
    if (description.trim().length < 8) next.description = "A bit more detail";
    if (preferredTime.trim().length < 2) next.time = "Pick a preferred time";
    if (!source) next.source = "Required";
    if (!paid) next.paid = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const resolvedServiceLabel =
      SERVICE_OPTIONS.find((s) => s.value === serviceType)?.label ?? "Request";
    const sourceLabel =
      SOURCE_OPTIONS.find((s) => s.value === source)?.label ?? "";
    const paidLabel =
      PAID_OPTIONS.find((s) => s.value === paid)?.label ?? "";
    const addressTrimmed = address.trim();

    const notes = [
      addressTrimmed ? `Service address: ${addressTrimmed}` : null,
      sourceLabel ? `Found us via: ${sourceLabel}` : null,
      paidLabel ? `Previously paid: ${paidLabel}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await createBookingLocalFirst({
        serviceId: serviceType,
        serviceLabel: resolvedServiceLabel,
        description: description.trim(),
        preferredTime: preferredTime.trim(),
        notes,
        name: name.trim(),
        address: addressTrimmed,
        source: sourceLabel,
        paidStatus: paidLabel,
        consent: true,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Try again";
      Alert.alert("Couldn't save", msg);
      setSubmitting(false);
      return;
    }

    const wa = [
      "New InstaHelp request",
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phoneInput.trim()}`,
      `Service: ${resolvedServiceLabel}`,
      addressTrimmed ? `Address: ${addressTrimmed}` : null,
      "",
      `Details: ${description.trim()}`,
      preferredTime.trim() ? `Preferred time: ${preferredTime.trim()}` : null,
      "",
      sourceLabel ? `Found us via: ${sourceLabel}` : null,
      paidLabel ? `Previously paid: ${paidLabel}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await openWhatsApp(wa);
    setDescription("");
    setPreferredTime("Today, ASAP");
    setSource("");
    setPaid("");
    setSubmitting(false);
    onClose();
    router.push("/(tabs)/bookings");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close form" />
        <ExploreGlassCard
          radius={RADIUS.xxl}
          intensity="strong"
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <View className="px-5 pt-5">
            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                  style={{ color: ACCENT }}
                >
                  Concierge
                </Text>
                <Text className="mt-1 text-[20px] font-extrabold text-neutral-950">
                  Get it done today
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.closePill}
              >
                <Text className="text-[12px] font-bold text-neutral-600">Close</Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 20 }}
              style={{ maxHeight: "78%" }}
            >
              <Text className="mb-4 text-[13px] leading-[19px] text-neutral-500">
                Tell us your task — we handle the rest.
              </Text>

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChangeText={(v) => {
                      nameTouchedRef.current = true;
                      setName(v);
                      if (errors.name) setErrors((e) => ({ ...e, name: "" }));
                    }}
                    error={!!errors.name}
                    autoCapitalize="words"
                  />
                  {errors.name ? (
                    <Text className="ml-1 mt-1 text-[11px] text-red-500">{errors.name}</Text>
                  ) : null}
                </View>
                <View className="flex-1">
                  <Input
                    placeholder="Phone"
                    value={phoneInput}
                    onChangeText={(v) => {
                      phoneTouchedRef.current = true;
                      setPhoneInput(v);
                      if (errors.phone) setErrors((e) => ({ ...e, phone: "" }));
                    }}
                    error={!!errors.phone}
                    keyboardType="phone-pad"
                  />
                  {errors.phone ? (
                    <Text className="ml-1 mt-1 text-[11px] text-red-500">{errors.phone}</Text>
                  ) : null}
                </View>
              </View>

              <View className="relative mt-3">
                <Input
                  placeholder={
                    deviceLocation.isLoading && !address
                      ? "Detecting location..."
                      : "Service address"
                  }
                  value={address}
                  onChangeText={(v) => {
                    addressTouchedRef.current = true;
                    setAddress(v);
                    setAddressAutofilled(false);
                    if (errors.address) setErrors((e) => ({ ...e, address: "" }));
                  }}
                  error={!!errors.address}
                  multiline
                  numberOfLines={2}
                  className="min-h-[64px] pr-11"
                />
                <Pressable
                  onPress={() => {
                    addressTouchedRef.current = false;
                    setAddressAutofilled(false);
                    deviceLocation.refresh().catch(() => {});
                  }}
                  disabled={deviceLocation.isLoading}
                  className="absolute right-2 top-2 h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: "rgba(0,74,173,0.08)" }}
                >
                  {deviceLocation.isLoading ? (
                    <ActivityIndicator color={ACCENT} size="small" />
                  ) : (
                    <AppIcon name="locate" size={18} color={ACCENT} />
                  )}
                </Pressable>
              </View>

              <View className="mt-3">
                <SelectField
                  value={serviceType}
                  options={SERVICE_OPTIONS}
                  placeholder="Service type"
                  pickerTitle="What do you need?"
                  error={!!errors.service}
                  onChange={(v) => {
                    setServiceType(v);
                    if (errors.service) setErrors((e) => ({ ...e, service: "" }));
                  }}
                />
              </View>

              {exploreSuggestion &&
              !exploreSuggestionDismissed &&
              onBrowseExplore ? (
                <ExploreServiceSuggestion
                  suggestion={exploreSuggestion}
                  onBrowse={(s) => {
                    onClose();
                    onBrowseExplore(s);
                  }}
                  onDismiss={() => setExploreSuggestionDismissed(true)}
                />
              ) : null}

              <View className="mt-3">
                <Input
                  placeholder="Describe your task..."
                  value={description}
                  onChangeText={(v) => {
                    setDescription(v);
                    if (errors.description)
                      setErrors((e) => ({ ...e, description: "" }));
                  }}
                  error={!!errors.description}
                  multiline
                  numberOfLines={4}
                  className="min-h-[100px]"
                />
              </View>

              <View className="mt-3">
                <DateTimeSlotPicker
                  value={preferredTime}
                  onChange={(next) => {
                    setPreferredTime(next);
                    if (errors.time) setErrors((e) => ({ ...e, time: "" }));
                  }}
                  error={!!errors.time}
                />
              </View>

              <View className="mt-3">
                <SelectField
                  value={source}
                  options={SOURCE_OPTIONS}
                  placeholder="How did you find us?"
                  pickerTitle="How did you hear about us?"
                  error={!!errors.source}
                  onChange={(v) => {
                    setSource(v);
                    if (errors.source) setErrors((e) => ({ ...e, source: "" }));
                  }}
                />
              </View>

              <View className="mt-3">
                <SelectField
                  value={paid}
                  options={PAID_OPTIONS}
                  placeholder="Already paid elsewhere?"
                  pickerTitle="Payment status"
                  error={!!errors.paid}
                  onChange={(v) => {
                    setPaid(v);
                    if (errors.paid) setErrors((e) => ({ ...e, paid: "" }));
                  }}
                />
              </View>

              <View className="mt-5">
                {submitting ? (
                  <View className="h-14 items-center justify-center">
                    <ActivityIndicator color={ACCENT} />
                  </View>
                ) : (
                  <GlowButton
                    label="Submit Request"
                    onPress={() => {
                      void handleSubmit();
                    }}
                    variant="primary"
                    fullWidth
                  />
                )}
              </View>

              <Text className="mt-3 text-center text-[11px] leading-[17px] text-neutral-500">
                By submitting, you allow us to contact you. See{" "}
                <Text
                  className="underline"
                  style={{ color: ACCENT }}
                  onPress={() => Linking.openURL(LEGAL_TERMS_URL).catch(() => {})}
                >
                  Terms
                </Text>{" "}
                and{" "}
                <Text
                  className="underline"
                  style={{ color: ACCENT }}
                  onPress={() => Linking.openURL(LEGAL_PRIVACY_URL).catch(() => {})}
                >
                  Privacy
                </Text>
                .
              </Text>
            </ScrollView>
          </View>
        </ExploreGlassCard>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HERO_BACKDROP,
  },
  sheet: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    maxHeight: "92%",
  },
  closePill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: HERO_LAVENDER,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(139,92,246,0.12)",
  },
});
