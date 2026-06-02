import { CategoryChipsRow } from "@/components/category/CategoryChipsRow";
import { TrendingServicesRow } from "@/components/category/TrendingServicesRow";
import { DiscoveryCategoryNav } from "@/components/discovery/DiscoveryCategoryNav";
import { DiscoverySection } from "@/components/discovery/DiscoverySection";
import { Input } from "@/components/ui/Input";
import { LogoMark } from "@/components/ui/LogoMark";
import { Screen } from "@/components/ui/Screen";
import { SelectField, type SelectOption } from "@/components/ui/SelectField";
import { FeaturedVendorsRow } from "@/components/vendor/FeaturedVendorsRow";
import { NearbyVendorsRow } from "@/components/vendor/NearbyVendorsRow";
import { LEGAL_PRIVACY_URL, LEGAL_TERMS_URL } from "@/config/env";
import { DISCOVERY_CATEGORIES } from "@/constants/discoveryCategories";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useProfileQuery } from "@/hooks/queries/useProfile";
import { useDeviceAddress } from "@/hooks/useDeviceAddress";
import { useVendorUserLocation } from "@/hooks/useVendorUserLocation";
import { createBookingLocalFirst } from "@/services/bookingService";
import type { DiscoveryService } from "@/types/discovery";
import type { WeeklyOffer } from "@/types/offers";
import { discoverySelection } from "@/utils/discoveryHaptics";
import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    Pressable,
    Text,
    View,
    type ImageSourcePropType,
} from "react-native";
import Animated, {
    Easing,
    FadeInDown,
    FadeInUp,
    interpolate,
    useAnimatedReaction,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

const TOPICS: { id: string; label: string; message: string }[] = [
  {
    id: "requests",
    label: "Requests",
    message:
      "Hi InstaHelp! I have a custom request I'd like to talk through with the concierge.",
  },
  {
    id: "payment",
    label: "Payments",
    message:
      "Hi InstaHelp! I'm facing a payment issue with my recent request. Could you take a look?",
  },
  {
    id: "cancel",
    label: "Cancellations",
    message:
      "Hi InstaHelp! I'd like to cancel a booking. Could you walk me through the next steps?",
  },
  {
    id: "status",
    label: "Status",
    message:
      "Hi InstaHelp! Can I get an update on the status of my booking(s)?",
  },
  {
    id: "reschedule",
    label: "Reschedule",
    message:
      "Hi InstaHelp! I need to reschedule an upcoming booking. Could you help me reset the time?",
  },
  {
    id: "history",
    label: "History",
    message:
      "Hi InstaHelp! I'd like to review my past bookings and service history.",
  },
];

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

const FASTEST_PATH_SLIDER_IMAGES = [
  require("../../../assets/images/Gemini_Generated_Image_4tdedu4tdedu4tde.png"),
  require("../../../assets/images/Gemini_Generated_Image_6cgdhc6cgdhc6cgd.png"),
  require("../../../assets/images/Gemini_Generated_Image_m1qyy0m1qyy0m1qy.png"),
  require("../../../assets/images/Gemini_Generated_Image_3sfimq3sfimq3sfi (1).png"),
] as const satisfies ReadonlyArray<ImageSourcePropType>;

function FastestPathImageSlider() {
  const trackProgress = useSharedValue(0);

  useEffect(() => {
    trackProgress.value = withRepeat(
      withTiming(1, {
        duration: 26000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [trackProgress]);

  const scrollerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(trackProgress.value, [0, 1], [0, -430]) }],
  }));

  return (
    <View className="overflow-hidden rounded-3xl border border-accent-tint/70 bg-[#f8fbff] px-2.5 py-2">
      <View
        pointerEvents="none"
        className="absolute -right-8 -top-10 h-24 w-24 rounded-full"
        style={{ backgroundColor: "rgba(139, 165, 255, 0.2)" }}
      />
      <View className="relative overflow-hidden rounded-2xl">
        <LinearGradient
          pointerEvents="none"
          colors={[
            "rgba(255,255,255,0.52)",
            "rgba(220, 232, 255, 0.18)",
            "rgba(255,255,255,0.06)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 1,
          }}
        />
        <Animated.View
          className="flex-row items-center"
          style={[{ width: 900, gap: 10, paddingHorizontal: 6 }, scrollerStyle]}
        >
          {[...FASTEST_PATH_SLIDER_IMAGES, ...FASTEST_PATH_SLIDER_IMAGES].map(
            (source, index) => (
              <View
                key={`fastest-path-slider-${index}`}
                className="h-20 w-28 overflow-hidden rounded-2xl border border-white/85 bg-white"
                style={{
                  shadowColor: "#95abff",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.16,
                  shadowRadius: 16,
                }}
              >
                <Image
                  source={source}
                  resizeMode="cover"
                  style={{ width: "100%", height: "100%", opacity: 0.96 }}
                />
                <LinearGradient
                  pointerEvents="none"
                  colors={["rgba(255,255,255,0.42)", "rgba(255,255,255,0)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    height: "56%",
                  }}
                />
              </View>
            ),
          )}
        </Animated.View>
        <LinearGradient
          pointerEvents="none"
          colors={["#f8fbff", "rgba(248,251,255,0.72)", "rgba(248,251,255,0)"]}
          locations={[0, 0.48, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 80,
            zIndex: 10,
          }}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(248,251,255,0)", "rgba(248,251,255,0.72)", "#f8fbff"]}
          locations={[0, 0.52, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 80,
            zIndex: 10,
          }}
        />
        <LinearGradient
          pointerEvents="none"
          colors={["rgba(255,255,255,0.44)", "rgba(255,255,255,0)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 28,
            zIndex: 11,
          }}
        />
      </View>
    </View>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    service?: string;
    source?: string;
  }>();
  const authPhone = useAuthPhone();
  const { data: profile } = useProfileQuery();

  const greeting = useMemo(() => {
    const n = profile?.name?.trim();
    return n ? n.split(" ")[0] : "there";
  }, [profile?.name]);

  const [name, setName] = useState(profile?.name ?? "");
  const [phoneInput, setPhoneInput] = useState(authPhone ?? "");
  const [address, setAddress] = useState("");
  const [addressAutofilled, setAddressAutofilled] = useState(false);
  const [serviceType, setServiceType] = useState<string>("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState<string>("");
  const [paid, setPaid] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const deviceLocation = useDeviceAddress({ autoFetch: true });
  const vendorCoords = useVendorUserLocation(false);

  // Hydrate name + phone from the saved profile as soon as they're available,
  // but only if the user hasn't typed anything yet (don't clobber edits).
  const nameTouchedRef = useRef(false);
  const phoneTouchedRef = useRef(false);
  const addressTouchedRef = useRef(false);
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

  // 1) Auto-fill from device location the moment it resolves.
  useEffect(() => {
    if (addressTouchedRef.current) return;
    if (!deviceLocation.address?.address) return;
    setAddress(deviceLocation.address.address);
    setAddressAutofilled(true);
    setErrors((current) => ({ ...current, address: "" }));
  }, [deviceLocation.address?.address]);

  // 2) Fallback to a saved profile address only if device detection hasn't
  //    landed yet. Skip the seeded placeholder copy.
  useEffect(() => {
    if (addressTouchedRef.current) return;
    if (address) return;
    if (deviceLocation.isLoading || deviceLocation.isSuccess) return;

    const saved = profile?.addresses?.find(
      (a) =>
        a.line &&
        a.line.trim().length > 0 &&
        a.line !== "Add your home address in Profile",
    );
    if (saved) {
      setAddress(saved.line);
    }
  }, [
    profile?.addresses,
    address,
    deviceLocation.isLoading,
    deviceLocation.isSuccess,
  ]);
  useEffect(() => {
    const requestedService = Array.isArray(params.service)
      ? params.service[0]
      : params.service;
    const requestedSource = Array.isArray(params.source)
      ? params.source[0]
      : params.source;

    if (
      requestedService &&
      SERVICE_OPTIONS.some((option) => option.value === requestedService)
    ) {
      setServiceType(requestedService);
      setErrors((current) => ({ ...current, service: "" }));
    }

    if (
      requestedSource &&
      SOURCE_OPTIONS.some((option) => option.value === requestedSource)
    ) {
      setSource(requestedSource);
      setErrors((current) => ({ ...current, source: "" }));
    }
  }, [params.service, params.source]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Add your name";
    if (phoneInput.replace(/\D/g, "").length < 8)
      next.phone = "Add a valid phone";
    if (address.trim().length < 6) next.address = "Add a service address";
    if (!serviceType) next.service = "Pick a service";
    if (description.trim().length < 8) next.description = "A bit more detail";
    if (!source) next.source = "Required";
    if (!paid) next.paid = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const serviceLabel =
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
        serviceLabel,
        description: description.trim(),
        preferredTime: "ASAP",
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
      `Service: ${serviceLabel}`,
      addressTrimmed ? `Address: ${addressTrimmed}` : null,
      "",
      `Details: ${description.trim()}`,
      "",
      sourceLabel ? `Found us via: ${sourceLabel}` : null,
      paidLabel ? `Previously paid: ${paidLabel}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await openWhatsApp(wa);

    setDescription("");
    setSource("");
    setPaid("");
    setSubmitting(false);
    router.push("/(tabs)/bookings");
  };

  const sendTopic = (msg: string) => {
    openWhatsApp(msg);
  };

  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollY = useSharedValue(0);
  const discoveryAnchorY = useSharedValue(0);
  const discoveryAnchorRef = useRef(0);
  const stickyNavVisible = useSharedValue(0);
  const scrollToCategoryRef = useRef<(categoryId: string) => void>(() => {});
  const [activeNavId, setActiveNavId] = useState(
    DISCOVERY_CATEGORIES[0]?.id ?? "home-personal",
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  useAnimatedReaction(
    () => scrollY.value,
    (y) => {
      const threshold = discoveryAnchorY.value + 80;
      stickyNavVisible.value = withTiming(y > threshold ? 1 : 0, { duration: 200 });
    },
  );

  const handleOfferPress = useCallback((offer: WeeklyOffer) => {
    const action = offer.action ?? "";
    if (action === "scroll:form") {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    if (action.startsWith("http://") || action.startsWith("https://")) {
      Linking.openURL(action).catch(() => {
        Alert.alert("Couldn't open offer", "Please try again in a moment.");
      });
    }
  }, []);

  const handleDiscoveryServiceSelect = useCallback(
    (service: DiscoveryService, _categoryId: string) => {
      if (service.formServiceId) {
        setServiceType(service.formServiceId);
        setErrors((current) => ({ ...current, service: "" }));
      }
      setDescription((current) => {
        if (current.trim().length >= 8) return current;
        return `I need help with ${service.label}. Please share availability and pricing.`;
      });
      const anchor = discoveryAnchorRef.current || discoveryAnchorY.value;
      scrollRef.current?.scrollTo({
        y: Math.max(0, anchor - 320),
        animated: true,
      });
    },
    [],
  );

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <DiscoveryCategoryNav
          activeId={activeNavId}
          visible={stickyNavVisible}
          onSelect={(id) => {
            discoverySelection();
            scrollToCategoryRef.current(id);
          }}
        />
        <Animated.ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={scrollHandler}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <View className="px-5 pt-2">
            <View className="flex-row items-center justify-between">
              <LogoMark size="md" withWordmark />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Concierge"
                onPress={() =>
                  openWhatsApp(
                    `Hi InstaHelp${
                      profile?.name ? `, this is ${profile.name.split(" ")[0]}` : ""
                    } \u2014 I need help right now.`,
                  )
                }
                className="h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white"
              >
                <Ionicons name="chatbubble-ellipses" size={18} color="#004aad" />
              </Pressable>
            </View>
            <Animated.View
              entering={FadeInDown.duration(400).delay(60)}
              className="mt-5"
            >
              <Text className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">
                Hi {greeting}
              </Text>
            </Animated.View>
          </View>

          {/* WhatsApp Quick Topics */}
          <Animated.View
            entering={FadeInUp.duration(450).delay(120)}
            className="mt-6 px-5"
          >
            <View className="overflow-hidden rounded-3xl border border-accent-tint bg-accent-soft p-5">
              <View className="flex-row items-center gap-2">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-brand-gold">
                  <Ionicons name="flash" size={12} color="#1a1a1a" />
                </View>
                <Text className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-deep">
                  Fastest path
                </Text>
              </View>
              <Text className="mt-3 text-[19px] font-extrabold leading-6 text-neutral-900">
                Skip the form, go straight{"\n"}to WhatsApp
              </Text>
              <Text className="mt-1.5 text-[13px] leading-[19px] text-neutral-600">
                Pick a topic and we'll open WhatsApp with your message ready
                to send.
              </Text>
              <View className="mt-4 gap-2">
                <View className="flex-row gap-2">
                  {TOPICS.slice(0, 3).map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => sendTopic(t.message)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open WhatsApp about ${t.label}`}
                      className="min-h-[52px] flex-1 items-center justify-center rounded-2xl border border-neutral-900/10 bg-white px-2 py-2.5 active:bg-neutral-50"
                    >
                      <Text
                        className="text-center text-[12px] font-bold leading-4 text-neutral-900"
                        numberOfLines={2}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View className="flex-row gap-2">
                  {TOPICS.slice(3, 6).map((t) => (
                    <Pressable
                      key={t.id}
                      onPress={() => sendTopic(t.message)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open WhatsApp about ${t.label}`}
                      className="min-h-[52px] flex-1 items-center justify-center rounded-2xl border border-neutral-900/10 bg-white px-2 py-2.5 active:bg-neutral-50"
                    >
                      <Text
                        className="text-center text-[12px] font-bold leading-4 text-neutral-900"
                        numberOfLines={2}
                      >
                        {t.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </Animated.View>
          <Animated.View
            entering={FadeInUp.duration(450).delay(170)}
            className="mt-3 px-5"
          >
            <FastestPathImageSlider />
          </Animated.View>

          {/* Divider */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(200)}
            className="mt-7 flex-row items-center gap-3 px-8"
          >
            <View className="h-px flex-1 bg-neutral-200" />
            <Text className="text-[12px] font-semibold text-neutral-500">
              Prefer detailed request? Fill the form
            </Text>
            <View className="h-px flex-1 bg-neutral-200" />
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(220)}
            className="mt-5 px-5"
          >
            <View className="rounded-3xl border border-neutral-200 bg-white p-5">
              <Text className="text-[22px] font-extrabold leading-7 text-neutral-900">
                Get it done today
              </Text>
              <Text className="mt-1.5 text-[13px] leading-[19px] text-neutral-500">
                Tell us your task, we'll handle the rest.
              </Text>

              {/* Row 1: Name + Phone */}
              <View className="mt-5 flex-row gap-3">
                <View className="flex-1">
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChangeText={(v) => {
                      nameTouchedRef.current = true;
                      setName(v);
                      if (errors.name)
                        setErrors((e) => ({ ...e, name: "" }));
                    }}
                    error={!!errors.name}
                    autoCapitalize="words"
                    autoComplete="name"
                    textContentType="name"
                    returnKeyType="next"
                  />
                  {errors.name ? (
                    <Text className="ml-1 mt-1 text-[11px] text-red-500">
                      {errors.name}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-1">
                  <Input
                    placeholder="Phone / WhatsApp"
                    value={phoneInput}
                    onChangeText={(v) => {
                      phoneTouchedRef.current = true;
                      setPhoneInput(v);
                      if (errors.phone)
                        setErrors((e) => ({ ...e, phone: "" }));
                    }}
                    error={!!errors.phone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                  />
                  {errors.phone ? (
                    <Text className="ml-1 mt-1 text-[11px] text-red-500">
                      {errors.phone}
                    </Text>
                  ) : null}
                </View>
              </View>

              {/* Row 2: Service address (auto-detected) */}
              <View className="mt-3">
                <View className="relative">
                  <Input
                    placeholder={
                      deviceLocation.isLoading && !address
                        ? "Detecting your location..."
                        : "Service address"
                    }
                    value={address}
                    onChangeText={(v) => {
                      addressTouchedRef.current = true;
                      setAddress(v);
                      setAddressAutofilled(false);
                      if (errors.address)
                        setErrors((e) => ({ ...e, address: "" }));
                    }}
                    error={!!errors.address}
                    autoCapitalize="sentences"
                    autoComplete="postal-address"
                    textContentType="fullStreetAddress"
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    className="min-h-[64px] pr-11"
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Detect location"
                    onPress={() => {
                      addressTouchedRef.current = false;
                      setAddressAutofilled(false);
                      deviceLocation.refresh().catch(() => {});
                    }}
                    disabled={deviceLocation.isLoading}
                    hitSlop={6}
                    className="absolute right-2 top-2 h-9 w-9 items-center justify-center rounded-full bg-accent-soft"
                  >
                    {deviceLocation.isLoading ? (
                      <ActivityIndicator color="#004aad" size="small" />
                    ) : (
                      <Ionicons
                        name="locate"
                        size={18}
                        color="#004aad"
                      />
                    )}
                  </Pressable>
                </View>

                {deviceLocation.isLoading && !address ? (
                  <View className="ml-1 mt-1.5 flex-row items-center gap-1.5">
                    <ActivityIndicator color="#004aad" size="small" />
                    <Text className="text-[11px] font-semibold text-accent-deep">
                      Detecting your location...
                    </Text>
                  </View>
                ) : addressAutofilled && !errors.address ? (
                  <View className="ml-1 mt-1.5 flex-row items-center gap-1.5">
                    <Ionicons
                      name="checkmark-circle"
                      size={12}
                      color="#004aad"
                    />
                    <Text className="text-[11px] font-semibold text-accent-deep">
                      Auto-filled from your current location
                    </Text>
                  </View>
                ) : deviceLocation.isError && !address ? (
                  <View className="ml-1 mt-1.5 flex-row items-center gap-1.5">
                    <Ionicons
                      name="information-circle-outline"
                      size={12}
                      color="#a16207"
                    />
                    <Text className="text-[11px] font-semibold text-amber-700">
                      Couldn't detect your location. Type your address or tap retry.
                    </Text>
                  </View>
                ) : null}

                {errors.address ? (
                  <Text className="ml-1 mt-1 text-[11px] text-red-500">
                    {errors.address}
                  </Text>
                ) : null}
              </View>

              {/* Row 3: Service type (full width) */}
              <View className="mt-3">
                <SelectField
                  value={serviceType}
                  options={SERVICE_OPTIONS}
                  placeholder="Service type"
                  pickerTitle="What do you need?"
                  error={!!errors.service}
                  onChange={(v) => {
                    setServiceType(v);
                    if (errors.service)
                      setErrors((e) => ({ ...e, service: "" }));
                  }}
                />
                {errors.service ? (
                  <Text className="ml-1 mt-1 text-[11px] text-red-500">
                    {errors.service}
                  </Text>
                ) : null}
              </View>

              {/* Description */}
              <View className="mt-3">
                <Input
                  placeholder="Describe your task, the more detail, the faster we respond..."
                  value={description}
                  onChangeText={(v) => {
                    setDescription(v);
                    if (errors.description)
                      setErrors((e) => ({ ...e, description: "" }));
                  }}
                  error={!!errors.description}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  className="min-h-[120px]"
                />
                {errors.description ? (
                  <Text className="ml-1 mt-1 text-[11px] text-red-500">
                    {errors.description}
                  </Text>
                ) : null}
              </View>

              {/* Source */}
              <View className="mt-3">
                <SelectField
                  value={source}
                  options={SOURCE_OPTIONS}
                  placeholder="How did you find us?"
                  pickerTitle="How did you hear about us?"
                  error={!!errors.source}
                  onChange={(v) => {
                    setSource(v);
                    if (errors.source)
                      setErrors((e) => ({ ...e, source: "" }));
                  }}
                />
                {errors.source ? (
                  <Text className="ml-1 mt-1 text-[11px] text-red-500">
                    {errors.source}
                  </Text>
                ) : null}
              </View>

              {/* Paid */}
              <View className="mt-3">
                <SelectField
                  value={paid}
                  options={PAID_OPTIONS}
                  placeholder="Have you already paid for this service somewhere?"
                  pickerTitle="Payment status"
                  error={!!errors.paid}
                  onChange={(v) => {
                    setPaid(v);
                    if (errors.paid)
                      setErrors((e) => ({ ...e, paid: "" }));
                  }}
                />
                {errors.paid ? (
                  <Text className="ml-1 mt-1 text-[11px] text-red-500">
                    {errors.paid}
                  </Text>
                ) : null}
              </View>

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Submit request"
                className="mt-6 h-14 flex-row items-center justify-center gap-2 rounded-full bg-neutral-900 active:opacity-90"
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-[15px] font-extrabold text-white">
                      Submit Request
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </>
                )}
              </Pressable>

              <Text className="mt-3 text-center text-[11px] leading-[17px] text-neutral-500">
                By submitting, you allow us to contact and assist you. See our{" "}
                <Text
                  className="text-neutral-600 underline"
                  onPress={() => Linking.openURL(LEGAL_TERMS_URL).catch(() => {})}
                >
                  Terms and Conditions
                </Text>{" "}
                and{" "}
                <Text
                  className="text-neutral-600 underline"
                  onPress={() =>
                    Linking.openURL(LEGAL_PRIVACY_URL).catch(() => {})
                  }
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </View>
          </Animated.View>

          <FeaturedVendorsRow userLocation={vendorCoords} />
          <CategoryChipsRow />
          <TrendingServicesRow />
          <NearbyVendorsRow userLocation={vendorCoords} />

          <Animated.View
            entering={FadeInUp.duration(480).delay(200)}
            className="mt-5 px-5"
          >
            <Pressable
              onPress={() => router.push("/(tabs)/vendors")}
              accessibilityRole="button"
              accessibilityLabel="Explore vendor marketplace"
              className="overflow-hidden rounded-3xl border border-accent-tint shadow-soft"
            >
              <LinearGradient
                colors={["#003a85", "#004aad", "#3b82f6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-5 py-5"
              >
                <View className="flex-row items-center justify-between gap-4">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <View className="rounded-full bg-white/15 px-2.5 py-1">
                        <Text className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-white">
                          New
                        </Text>
                      </View>
                      <Text className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                        All India
                      </Text>
                    </View>
                    <Text className="mt-3 text-[20px] font-extrabold leading-7 text-white">
                      Vendor marketplace
                    </Text>
                    <Text className="mt-1 text-[13px] leading-[19px] text-white/85">
                      4,500+ vendor listings across India — search by city,
                      category, or area. Reveal contacts with credits.
                    </Text>
                  </View>
                  <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                    <Ionicons name="sparkles" size={26} color="#ffd500" />
                  </View>
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(500).delay(300)}
            className="px-5"
            onLayout={(e) => {
              const y = e.nativeEvent.layout.y;
              discoveryAnchorY.value = y;
              discoveryAnchorRef.current = y;
            }}
          >
            <DiscoverySection
              onServiceSelect={handleDiscoveryServiceSelect}
              onOfferPress={handleOfferPress}
              parentScrollRef={scrollRef}
              sectionAnchorY={discoveryAnchorY}
              activeNavId={activeNavId}
              onActiveNavIdChange={setActiveNavId}
              onRegisterScrollToCategory={(fn) => {
                scrollToCategoryRef.current = fn;
              }}
            />
          </Animated.View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
