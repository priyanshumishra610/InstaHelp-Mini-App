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

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mt-6 mb-2 text-[15px] font-semibold text-neutral-900">
      {children}
    </Text>
  );
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
      headerTitleStyle: { fontWeight: "700", fontSize: 16 },
      title: vendor ? title : "Not found",
      headerRight:
        vendor != null
          ? () => (
              <View className="mr-2 flex-row items-center gap-1 rounded-lg bg-white px-2.5 py-1.5">
                <Ionicons name="diamond-outline" size={14} color="#7C3AED" />
                <Text className="text-[13px] font-semibold text-neutral-800">
                  {credits}
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
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text className="mt-3 text-[13px] text-neutral-500">
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
          <Text className="text-center text-[15px] text-neutral-700">
            {vendorError
              ? "Could not load this vendor. Check your connection and try again."
              : "This vendor is no longer available."}
          </Text>
          <View className="mt-6 flex-row gap-3">
            {vendorError ? (
              <Pressable
                onPress={retry}
                className="rounded-xl bg-accent px-5 py-3"
              >
                <Text className="text-[14px] font-semibold text-white">
                  Retry
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={() => router.back()}
              className="rounded-xl border border-neutral-200 bg-white px-5 py-3"
            >
              <Text className="text-[14px] font-semibold text-neutral-800">
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

  const serviceLines = [
    vendor.subCategory.trim(),
    vendor.servicesText.trim(),
  ].filter(Boolean);

  const locationLine = [
    vendor.areaLabel,
    distanceKm != null ? `${distanceKm.toFixed(1)} km away` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Screen className="bg-[#eef2fb]">
      <View className="flex-1">
        {toast ? <MarketplaceToast message={toast} key={toast} /> : null}

        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="mt-1 text-[22px] font-bold leading-7 text-neutral-900">
            {title}
          </Text>

          <Text className="mt-1 text-[14px] text-neutral-600">
            {vendor.category}
            {locationLine ? ` · ${locationLine}` : ""}
          </Text>

          <View className="mt-3 flex-row flex-wrap items-center gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={16} color="#eab308" />
              <Text className="text-[15px] font-semibold text-neutral-900">
                {vendor.rating > 0 ? vendor.rating.toFixed(1) : "—"}
              </Text>
              <Text className="text-[13px] text-neutral-500">
                ({vendor.reviewCount.toLocaleString("en-IN")} reviews)
              </Text>
            </View>
            <Text className="text-[14px] font-medium text-accent">
              {formatStartingPrice(vendor)}
            </Text>
            {vendor.isVerified ? (
              <View className="flex-row items-center gap-1">
                <Ionicons name="shield-checkmark" size={14} color="#7C3AED" />
                <Text className="text-[13px] text-accent">Verified</Text>
              </View>
            ) : null}
          </View>

          {gallery.length > 0 ? (
            <>
              <SectionTitle>Photos</SectionTitle>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10 }}
              >
                {gallery.map((uri, idx) => (
                  <Image
                    key={`${uri}-${idx}`}
                    source={{ uri }}
                    className="h-28 w-40 rounded-xl bg-neutral-200"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </>
          ) : null}

          <SectionTitle>About</SectionTitle>
          <View className="rounded-xl border border-neutral-200 bg-white p-4">
            <Text className="text-[14px] leading-[22px] text-neutral-700">
              {serviceDescriptionPreview(vendor, 460)}
            </Text>
            {serviceLines.length > 0 ? (
              <View className="mt-3 gap-1.5 border-t border-neutral-100 pt-3">
                <Text className="text-[13px] font-medium text-neutral-500">
                  Services
                </Text>
                {serviceLines.map((line, i) => (
                  <Text
                    key={`${i}-${line.slice(0, 24)}`}
                    className="text-[14px] leading-5 text-neutral-800"
                  >
                    · {line}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>

          <SectionTitle>Contact</SectionTitle>
          <VendorContactRevealPanel
            vendor={vendor}
            unlocked={unlocked}
            onReveal={handleReveal}
          />
        </ScrollView>
      </View>
    </Screen>
  );
}
