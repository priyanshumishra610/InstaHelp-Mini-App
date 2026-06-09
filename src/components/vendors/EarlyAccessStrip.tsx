import { EARLY_ACCESS_CATEGORIES } from "@/constants/exploreEntitlements";
import { MarketplaceVendorCard } from "@/components/vendors/MarketplaceVendorCard";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  vendors: VendorRecord[];
  canAccess: boolean;
  onReveal: (vendorId: string) => void;
  isVendorUnlocked: (vendorId: string) => boolean;
  distanceKmFromUser: (v: VendorRecord) => number | null;
  revealCostLabel: string;
};

export function EarlyAccessStrip({
  vendors,
  canAccess,
  onReveal,
  isVendorUnlocked,
  distanceKmFromUser,
  revealCostLabel,
}: Props) {
  const router = useRouter();

  const earlyVendors = useMemo(() => {
    const set = new Set(
      EARLY_ACCESS_CATEGORIES.map((c) => c.toLowerCase()),
    );
    return vendors
      .filter((v) => set.has(v.category.trim().toLowerCase()))
      .slice(0, canAccess ? 6 : 3);
  }, [canAccess, vendors]);

  if (earlyVendors.length === 0) return null;

  if (!canAccess) {
    return (
      <View className="mx-4 mb-3 overflow-hidden rounded-3xl border border-accent/20 bg-accent-soft/40 p-4">
        <View className="flex-row items-start gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white">
            <Ionicons name="sparkles" size={20} color="#7C3AED" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-extrabold text-neutral-900">
              Early access categories
            </Text>
            <Text className="mt-1 text-[12px] leading-5 text-neutral-600">
              Pro+ unlocks {EARLY_ACCESS_CATEGORIES.slice(0, 2).join(", ")} and more
              before they go mainstream.
            </Text>
            <Pressable
              onPress={() => router.push("/(tabs)/vendors/plans")}
              className="mt-3 self-start rounded-full bg-neutral-950 px-4 py-2.5"
            >
              <Text className="text-[12px] font-bold text-white">
                Unlock with Pro+
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="pb-2">
      <View className="px-4 pb-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="sparkles" size={16} color="#7C3AED" />
          <Text className="text-[14px] font-extrabold text-neutral-900">
            Early access · Pro+
          </Text>
        </View>
        <Text className="mt-0.5 text-[11px] font-semibold text-neutral-500">
          New categories live for Pro+ members first
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 0 }}
      >
        {earlyVendors.map((vendor) => (
          <View key={vendor.id} style={{ width: 320, marginRight: 12 }}>
            <MarketplaceVendorCard
              vendor={vendor}
              distanceKm={distanceKmFromUser(vendor)}
              unlocked={isVendorUnlocked(vendor.id)}
              revealCostLabel={revealCostLabel}
              onPressCard={() => router.push(`/(tabs)/vendors/${vendor.id}`)}
              onReveal={() => onReveal(vendor.id)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
