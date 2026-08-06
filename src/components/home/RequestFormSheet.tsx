import { ExploreServiceSuggestion } from "@/components/home/ExploreServiceSuggestion";
import { GlowButton } from "@/components/ui/GlowButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { DateTimeSlotPicker } from "@/components/ui/DateTimeSlotPicker";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/config/env";
import {
  AUTH_FONT,
  AUTH_GRADIENT,
  AUTH_PRIMARY,
  AUTH_PRIMARY_LIGHT,
} from "@/constants/authPremium";
import { HERO_BACKDROP, HERO_LAVENDER, HERO_LAVENDER_MIST } from "@/constants/theme";
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
import { LinearGradient } from "expo-linear-gradient";
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

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={[styles.sectionLabel, { fontFamily: AUTH_FONT.semibold }]}>
      {children}
    </Text>
  );
}

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

  if (!visible) return null;

  return (
    <Modal
      visible
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close form" />

        <LinearGradient
          colors={[...AUTH_GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.sheetRim, { paddingBottom: Math.max(insets.bottom, 12) }]}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetAccentBar}>
              <View style={styles.sheetAccentPrimary} />
              <View style={styles.sheetAccentSecondary} />
            </View>

            <View style={styles.headerRow}>
              <View style={styles.headerCopy}>
                <Text style={[styles.eyebrow, { fontFamily: AUTH_FONT.semibold }]}>
                  CONCIERGE
                </Text>
                <Text style={[styles.title, { fontFamily: AUTH_FONT.bold }]}>
                  Get it done today
                </Text>
                <Text style={[styles.subtitle, { fontFamily: AUTH_FONT.regular }]}>
                  Tell us your task — we handle the rest via WhatsApp.
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.closePill}
              >
                <Text style={[styles.closeLabel, { fontFamily: AUTH_FONT.semibold }]}>
                  Close
                </Text>
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollContent}
              style={styles.scroll}
            >
              <SectionLabel>YOUR DETAILS</SectionLabel>

              <View style={styles.row}>
                <View style={styles.rowHalf}>
                  <FormField label="Name" error={errors.name}>
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
                  </FormField>
                </View>
                <View style={styles.rowHalf}>
                  <FormField label="Phone" error={errors.phone}>
                    <Input
                      placeholder="Mobile number"
                      value={phoneInput}
                      onChangeText={(v) => {
                        phoneTouchedRef.current = true;
                        setPhoneInput(v);
                        if (errors.phone) setErrors((e) => ({ ...e, phone: "" }));
                      }}
                      error={!!errors.phone}
                      keyboardType="phone-pad"
                    />
                  </FormField>
                </View>
              </View>

              <FormField
                label="Service address"
                error={errors.address}
                hint={
                  addressAutofilled
                    ? "Filled from your location — edit if needed"
                    : undefined
                }
                className="mt-3"
              >
                <View style={styles.addressWrap}>
                  <Input
                    placeholder={
                      deviceLocation.isLoading && !address
                        ? "Detecting location..."
                        : "Where should we send help?"
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
                    style={styles.locateBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Use current location"
                  >
                    {deviceLocation.isLoading ? (
                      <ActivityIndicator color={AUTH_PRIMARY} size="small" />
                    ) : (
                      <AppIcon name="locate" size={18} color={AUTH_PRIMARY} />
                    )}
                  </Pressable>
                </View>
              </FormField>

              <SectionLabel>TASK</SectionLabel>

              <FormField label="Service type" error={errors.service}>
                <SelectField
                  value={serviceType}
                  options={SERVICE_OPTIONS}
                  placeholder="What do you need?"
                  pickerTitle="What do you need?"
                  error={!!errors.service}
                  onChange={(v) => {
                    setServiceType(v);
                    if (errors.service) setErrors((e) => ({ ...e, service: "" }));
                  }}
                />
              </FormField>

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

              <FormField label="Describe your task" error={errors.description} className="mt-3">
                <Input
                  placeholder="Share details — timing, scope, anything helpful..."
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
              </FormField>

              <FormField label="Preferred time" error={errors.time} className="mt-3">
                <DateTimeSlotPicker
                  value={preferredTime}
                  onChange={(next) => {
                    setPreferredTime(next);
                    if (errors.time) setErrors((e) => ({ ...e, time: "" }));
                  }}
                  error={!!errors.time}
                />
              </FormField>

              <SectionLabel>ABOUT YOU</SectionLabel>

              <FormField label="How did you find us?" error={errors.source}>
                <SelectField
                  value={source}
                  options={SOURCE_OPTIONS}
                  placeholder="Select one"
                  pickerTitle="How did you hear about us?"
                  error={!!errors.source}
                  onChange={(v) => {
                    setSource(v);
                    if (errors.source) setErrors((e) => ({ ...e, source: "" }));
                  }}
                />
              </FormField>

              <FormField label="Already paid elsewhere?" error={errors.paid} className="mt-3">
                <SelectField
                  value={paid}
                  options={PAID_OPTIONS}
                  placeholder="Select one"
                  pickerTitle="Payment status"
                  error={!!errors.paid}
                  onChange={(v) => {
                    setPaid(v);
                    if (errors.paid) setErrors((e) => ({ ...e, paid: "" }));
                  }}
                />
              </FormField>

              <View style={styles.submitBlock}>
                {submitting ? (
                  <View style={styles.submitLoading}>
                    <ActivityIndicator color={AUTH_PRIMARY} />
                  </View>
                ) : (
                  <GlowButton
                    label="Submit request"
                    onPress={() => {
                      void handleSubmit();
                    }}
                    variant="primary"
                    fullWidth
                  />
                )}
              </View>

              <Text style={[styles.legal, { fontFamily: AUTH_FONT.regular }]}>
                By submitting, you allow us to contact you. See{" "}
                <Text
                  style={styles.legalLink}
                  onPress={() => Linking.openURL(LEGAL_TERMS_URL).catch(() => {})}
                >
                  Terms
                </Text>{" "}
                and{" "}
                <Text
                  style={styles.legalLink}
                  onPress={() => Linking.openURL(LEGAL_PRIVACY_URL).catch(() => {})}
                >
                  Privacy
                </Text>
                .
              </Text>
            </ScrollView>
          </View>
        </LinearGradient>
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
  sheetRim: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 1.5,
    maxHeight: "94%",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28.5,
    borderTopRightRadius: 28.5,
    overflow: "hidden",
    maxHeight: "100%",
  },
  sheetAccentBar: {
    flexDirection: "row",
    height: 4,
  },
  sheetAccentPrimary: {
    flex: 1.4,
    backgroundColor: AUTH_PRIMARY,
  },
  sheetAccentSecondary: {
    flex: 1,
    backgroundColor: AUTH_PRIMARY_LIGHT,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 4,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: AUTH_PRIMARY,
  },
  title: {
    marginTop: 4,
    fontSize: 22,
    color: "#111827",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
  },
  closePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: HERO_LAVENDER,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(23,23,23,0.12)",
  },
  closeLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  scroll: {
    maxHeight: "72%",
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  sectionLabel: {
    marginTop: 18,
    marginBottom: 10,
    fontSize: 10,
    letterSpacing: 1.3,
    color: AUTH_PRIMARY,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowHalf: {
    flex: 1,
  },
  addressWrap: {
    position: "relative",
  },
  locateBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23,23,23,0.08)",
  },
  submitBlock: {
    marginTop: 24,
  },
  submitLoading: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  legal: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#6B7280",
  },
  legalLink: {
    color: AUTH_PRIMARY,
    textDecorationLine: "underline",
  },
});
