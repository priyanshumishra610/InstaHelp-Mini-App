import { whiteStackScreenOptions } from "@/components/navigation/whiteStackScreen";
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
import { SaveVendorButton } from "@/components/vendors/SaveVendorButton";
import { exploreRevealCostLabel, tryExploreReveal } from "@/services/explore/exploreRevealService";
import { alertInsufficientCredits } from "@/services/ads/alertInsufficientCredits";
import { CreditHistoryModal } from "@/components/vendors/CreditHistoryModal";
import { useAuthPhone } from "@/hooks/auth/useAuthPhone";
import { useExploreSubscription } from "@/hooks/useExploreSubscription";
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
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mt-8 mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">
      {children}
    </Text>
  );
}

export function VendorDetailScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const phone = useAuthPhone();
  const { subscription, entitlements } = useExploreSubscription();
  const { vendorId } = useLocalSearchParams<{ vendorId: string }>();

  const { vendor, loading: vendorLoading, error: vendorError, retry } =
    useVendor(String(vendorId ?? ""));
  const coords = useVendorUserLocation(true);

  const credits = useVendorLeadStore((s) => s.credits);
  const unlockedVendorIds = useVendorLeadStore((s) => s.unlockedVendorIds);
  const unlocked = vendor ? unlockedVendorIds.includes(vendor.id) : false;

  const [toast, setToast] = useState<string | null>(null);
  const [creditsOpen, setCreditsOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = vendor ? vendorDisplayName(vendor) : "Vendor";

  useLayoutEffect(() => {
    navigation.setOptions({
      ...whiteStackScreenOptions,
      headerShown: true,
      title: vendor ? vendor.category : "Not found",
      headerBackTitle: "Back",
      headerRight:
        vendor != null
          ? () => (
              <Pressable
                onPress={() => setCreditsOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Open credits"
                className="mr-1 flex-row items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 active:opacity-85"
              >
                <Text className="text-[12px] font-medium text-neutral-500">
                  Credits
                </Text>
                <Text className="text-[13px] font-semibold tabular-nums text-neutral-900">
                  {credits}
                </Text>
              </Pressable>
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

  const handleReveal = useCallback(async () => {
    if (!vendor) return;
    const res = await tryExploreReveal(phone, vendor.id);
    if (!res.ok) {
      if (res.reason === "weekly_limit") {
        Alert.alert(
          "Weekly limit reached",
          "Your Pro plan includes 10 reveals per week. Upgrade to Pro+ for unlimited reveals.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "View plans",
              onPress: () => router.push("/(tabs)/vendors/plans"),
            },
          ],
        );
        return;
      }
      alertInsufficientCredits({
        needCredits: VENDOR_REVEAL_CREDIT_COST,
        onOpenPlans: () => router.push("/(tabs)/vendors/plans"),
        onOpenCredits: () => setCreditsOpen(true),
      });
      return;
    }
    if (!res.alreadyUnlocked) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToastMsg(
        res.usedCredits
          ? "Contact unlocked — your credits were updated."
          : "Contact unlocked with your Explore plan!",
      );
    }
  }, [vendor, phone, showToastMsg, router]);

  if (vendorLoading) {
    return (
      <Screen surface="white" atmosphere={false}>
        <Animated.View
          entering={FadeIn.duration(280)}
          className="flex-1 items-center justify-center"
        >
          <ActivityIndicator size="large" color="#171717" />
          <Text className="mt-3 text-[13px] text-neutral-400">
            Loading vendor…
          </Text>
        </Animated.View>
      </Screen>
    );
  }

  if (!vendor) {
    return (
      <Screen surface="white" atmosphere={false}>
        <Animated.View
          entering={FadeInDown.duration(360).delay(40)}
          className="flex-1 items-center justify-center px-8"
        >
          <Text className="text-center text-[15px] text-neutral-700">
            {vendorError
              ? "Could not load this vendor. Check your connection and try again."
              : "This vendor is no longer available."}
          </Text>
          <View className="mt-6 flex-row gap-3">
            {vendorError ? (
              <Pressable
                onPress={retry}
                className="rounded-xl bg-neutral-900 px-5 py-3 active:opacity-90"
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
        </Animated.View>
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

  const revealCostLabel = exploreRevealCostLabel(subscription);
  const usesPlanReveal = entitlements.hasPlanReveals;

  return (
    <Screen surface="white" atmosphere={false}>
      <View className="flex-1">
        {toast ? <MarketplaceToast message={toast} key={toast} /> : null}
        <CreditHistoryModal
          visible={creditsOpen}
          onClose={() => setCreditsOpen(false)}
        />

        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.springify().damping(22).stiffness(240).delay(60)}>
          <View className="mt-2 flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text className="text-[26px] font-bold leading-8 tracking-tight text-neutral-900">
                {title}
              </Text>
              <Text className="mt-2 text-[14px] leading-5 text-neutral-500">
                {vendor.category}
                {locationLine ? `\n${locationLine}` : ""}
              </Text>
            </View>
            <SaveVendorButton vendorId={vendor.id} />
          </View>

          <View className="mt-5 flex-row flex-wrap items-center gap-x-4 gap-y-2 border-b border-neutral-100 pb-5">
            <View className="flex-row items-center gap-1">
              <Ionicons name="star" size={15} color="#171717" />
              <Text className="text-[15px] font-semibold text-neutral-900">
                {vendor.rating > 0 ? vendor.rating.toFixed(1) : "New"}
              </Text>
              <Text className="text-[13px] text-neutral-400">
                ({vendor.reviewCount.toLocaleString("en-IN")})
              </Text>
            </View>
            <Text className="text-[15px] font-semibold text-neutral-900">
              {formatStartingPrice(vendor)}
            </Text>
            {vendor.isVerified ? (
              <Text className="text-[12px] font-medium uppercase tracking-wide text-neutral-400">
                Verified
              </Text>
            ) : null}
          </View>

          {gallery.length > 0 ? (
            <>
              <SectionTitle>Photos</SectionTitle>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {gallery.map((uri, idx) => (
                  <Image
                    key={`${uri}-${idx}`}
                    source={{ uri }}
                    className="h-32 w-44 rounded-2xl bg-neutral-100"
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            </>
          ) : null}

          <SectionTitle>About</SectionTitle>
          <View className="rounded-2xl bg-neutral-50 px-4 py-4">
            <Text className="text-[15px] leading-6 text-neutral-700">
              {serviceDescriptionPreview(vendor, 460)}
            </Text>
            {serviceLines.length > 0 ? (
              <View className="mt-4 gap-2 border-t border-neutral-200/80 pt-4">
                <Text className="text-[11px] font-semibold uppercase tracking-[0.12em] text-neutral-400">
                  Services
                </Text>
                {serviceLines.map((line, i) => (
                  <Text
                    key={`${i}-${line.slice(0, 24)}`}
                    className="text-[14px] leading-5 text-neutral-800"
                  >
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>

          <SectionTitle>Contact</SectionTitle>
          <VendorContactRevealPanel
            vendor={vendor}
            unlocked={unlocked}
            revealCostLabel={revealCostLabel}
            usesPlanReveal={usesPlanReveal}
            onReveal={handleReveal}
          />
          </Animated.View>
        </ScrollView>
      </View>
    </Screen>
  );
}
