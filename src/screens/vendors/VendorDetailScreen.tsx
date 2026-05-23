import {
  BANGALORE_CITY_CENTER,
  VENDOR_REVEAL_CREDIT_COST,
} from "@/constants/vendorMarketplace";
import { Screen } from "@/components/ui/Screen";
import { VendorContactRevealPanel } from "@/components/vendors/VendorContactRevealPanel";
import { MarketplaceToast } from "@/components/vendors/MarketplaceToast";
import { useVendorUserLocation } from "@/hooks/useVendorUserLocation";
import { haversineKm } from "@/services/vendors/vendorGeo";
import { useVendor } from "@/hooks/useVendor";
import {
  formatStartingPrice,
  vendorGallerySources,
  serviceDescriptionPreview,
} from "@/services/vendors/vendorPresentation";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import { useVendorLeadStore } from "@/store/vendorLeadStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

function starMixFromAverage(rating: number): number[] {
  const r = Math.min(5, Math.max(0, rating));
  const weights = [1, 2, 3, 4, 5].map((star) =>
    Math.exp(-((star - r) * (star - r)) / 2),
  );
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => (w / sum) * 100);
}

export function VendorDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();

  const { vendor, loading: vendorLoading, error: vendorError, retry } =
    useVendor(String(vendorId ?? ""));
  const coords = useVendorUserLocation(true);

  const credits = useVendorLeadStore((s) => s.credits);
  const tryRevealVendor = useVendorLeadStore((s) => s.tryRevealVendor);
  const unlockedVendorIds = useVendorLeadStore((s) => s.unlockedVendorIds);
  const unlocked = vendor ? unlockedVendorIds.includes(vendor.id) : false;

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = vendor ? vendorDisplayName(vendor) : "Vendor";

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerShadowVisible: false,
      headerStyle: { backgroundColor: "#eef2fb" },
      headerTintColor: "#171717",
      headerTitleStyle: { fontWeight: "800", fontSize: 16 },
      title: vendor ? title : "Not found",
      headerRight:
        vendor != null
          ? () => (
              <View className="mr-2 flex-row items-center gap-2 rounded-full border border-accent-tint bg-white px-3 py-2 shadow-soft">
                <Ionicons name="diamond" size={15} color="#004aad" />
                <Text className="text-[14px] font-extrabold text-accent-deep">
                  {credits}
                </Text>
                <Text className="text-[11px] font-semibold text-neutral-500">
                  cr
                </Text>
              </View>
            )
          : undefined,
    });
  }, [navigation, vendor, title, credits]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToastMsg = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2700);
  }, []);

  const handleReveal = useCallback(() => {
    if (!vendor) return;
    const res = tryRevealVendor(vendor.id);
    if (!res.ok) {
      Alert.alert(
        "Not enough credits",
        `You need ${VENDOR_REVEAL_CREDIT_COST} credits to reveal this vendor.`,
      );
      return;
    }
    if (!res.alreadyUnlocked) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToastMsg("Contact unlocked — your credits were updated.");
    }
  }, [vendor, tryRevealVendor, showToastMsg]);

  if (vendorLoading) {
    return (
      <Screen className="bg-[#eef2fb]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#004aad" />
          <Text className="mt-3 text-[13px] font-semibold text-neutral-500">
            Loading vendor…
          </Text>
        </View>
      </Screen>
    );
  }

  if (!vendor) {
    return (
      <Screen className="bg-[#eef2fb]">
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-center text-[16px] font-bold text-neutral-700">
            {vendorError
              ? "Could not load this vendor. Check your connection and try again."
              : "This vendor is no longer available."}
          </Text>
          <View className="mt-6 flex-row gap-3">
            {vendorError ? (
              <Pressable
                onPress={retry}
                className="rounded-full bg-accent px-6 py-3"
              >
                <Text className="text-[14px] font-extrabold text-white">
                  Retry
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => router.back()}
              className="rounded-full border border-neutral-200 bg-white px-6 py-3"
            >
              <Text className="text-[14px] font-extrabold text-neutral-800">
                Go back
              </Text>
            </Pressable>
          </View>
        </View>
      </Screen>
    );
  }

  const distanceKm =
    vendor.coordinates && (coords ?? BANGALORE_CITY_CENTER)
      ? haversineKm(coords ?? BANGALORE_CITY_CENTER, vendor.coordinates)
      : null;

  const gallery = vendorGallerySources(vendor);
  const mix = starMixFromAverage(vendor.rating || 3.5);

  const serviceLines = [
    vendor.subCategory.trim(),
    vendor.servicesText.trim(),
  ].filter(Boolean);

  return (
    <Screen className="bg-[#eef2fb]">
      <View className="flex-1">
        {toast ? <MarketplaceToast message={toast} key={toast} /> : null}

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(420)}>
            <Text className="mt-2 text-[24px] font-extrabold leading-8 text-neutral-900">
              {title}
            </Text>
            <View className="mt-3 flex-row flex-wrap items-center gap-2">
              <View className="rounded-full bg-white px-3 py-1.5 shadow-soft">
                <Text className="text-[12px] font-extrabold text-accent-deep">
                  {vendor.category}
                </Text>
              </View>
              {vendor.isVerified ? (
                <View className="flex-row items-center gap-1 rounded-full bg-accent-soft px-3 py-1.5">
                  <Ionicons name="shield-checkmark" size={14} color="#004aad" />
                  <Text className="text-[12px] font-extrabold text-accent">
                    Verified partner
                  </Text>
                </View>
              ) : null}
              <Text className="text-[13px] font-semibold text-neutral-600">
                {vendor.areaLabel}
                {distanceKm != null ? ` · ${distanceKm.toFixed(1)} km away` : ""}
              </Text>
            </View>

            <View className="mt-4 flex-row items-center gap-3">
              <View className="flex-row items-center gap-1">
                <Ionicons name="star" size={18} color="#ffd500" />
                <Text className="text-[18px] font-extrabold text-neutral-900">
                  {vendor.rating > 0 ? vendor.rating.toFixed(1) : "—"}
                </Text>
              </View>
              <Text className="text-[14px] font-semibold text-neutral-600">
                {vendor.reviewCount.toLocaleString("en-IN")} reviews
              </Text>
              <View className="h-4 w-px bg-neutral-200" />
              <Text className="text-[14px] font-extrabold text-accent-deep">
                {formatStartingPrice(vendor)}
              </Text>
            </View>
          </Animated.View>

          <Text className="mt-8 text-[13px] font-extrabold uppercase tracking-[0.18em] text-neutral-500">
            Gallery
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ gap: 12 }}
          >
            {(gallery.length ? gallery : ["placeholder"]).map((uri, idx) =>
              uri === "placeholder" ? (
                <View
                  key="ph"
                  className="h-36 w-52 overflow-hidden rounded-3xl border border-dashed border-neutral-300 bg-white"
                >
                  <LinearGradient
                    colors={["#f0f6ff", "#ffffff"]}
                    className="flex-1 items-center justify-center"
                  >
                    <Ionicons name="images-outline" size={28} color="#9ca3af" />
                    <Text className="mt-2 text-center text-[12px] font-semibold text-neutral-500">
                      Photos coming soon
                    </Text>
                  </LinearGradient>
                </View>
              ) : (
                <Image
                  key={`${uri}-${idx}`}
                  source={{ uri }}
                  className="h-36 w-52 rounded-3xl bg-neutral-200"
                  resizeMode="cover"
                />
              ),
            )}
          </ScrollView>

          <Text className="mt-8 text-[13px] font-extrabold uppercase tracking-[0.18em] text-neutral-500">
            About
          </Text>
          <View className="mt-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
            <Text className="text-[14px] leading-[21px] text-neutral-700">
              {serviceDescriptionPreview(vendor, 460)}{" "}
              Operating across {vendor.areaLabel} with coverage throughout Bengaluru.
            </Text>
          </View>

          <Text className="mt-8 text-[13px] font-extrabold uppercase tracking-[0.18em] text-neutral-500">
            Services offered
          </Text>
          <View className="mt-3 gap-2 rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
            {serviceLines.length ? (
              serviceLines.map((line, i) => (
                <View key={`${i}-${line.slice(0, 24)}`} className="flex-row gap-2">
                  <Text className="text-accent">•</Text>
                  <Text className="flex-1 text-[14px] leading-5 text-neutral-800">
                    {line}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-[14px] text-neutral-600">
                Comprehensive {vendor.category.toLowerCase()} assistance tailored to your
                request.
              </Text>
            )}
          </View>

          <Text className="mt-8 text-[13px] font-extrabold uppercase tracking-[0.18em] text-neutral-500">
            Reviews summary
          </Text>
          <View className="mt-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
            <Text className="text-[14px] leading-[21px] text-neutral-700">
              Customers highlight responsiveness and clarity on pricing. Detailed review
              excerpts will sync once we connect the live reputation feed.
            </Text>
          </View>

          <Text className="mt-8 text-[13px] font-extrabold uppercase tracking-[0.18em] text-neutral-500">
            Rating shape
          </Text>
          <Text className="mt-1 text-[12px] font-medium text-neutral-500">
            Illustrative spread inferred from the public average — not individual review
            tallies.
          </Text>
          <View className="mt-3 rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = mix[star - 1] ?? 0;
              return (
                <View key={star} className="mb-2 flex-row items-center gap-2">
                  <Text className="w-8 text-[12px] font-bold text-neutral-600">
                    {star}★
                  </Text>
                  <View className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <View
                      className="h-2 rounded-full bg-brand-gold"
                      style={{ width: `${pct}%` }}
                    />
                  </View>
                  <Text className="w-12 text-right text-[11px] font-semibold text-neutral-500">
                    {pct.toFixed(0)}%
                  </Text>
                </View>
              );
            })}
          </View>

          <Text className="mt-8 text-[13px] font-extrabold uppercase tracking-[0.18em] text-neutral-500">
            Contact
          </Text>
          <View className="mt-3">
            <VendorContactRevealPanel
              vendor={vendor}
              unlocked={unlocked}
              onReveal={handleReveal}
            />
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
