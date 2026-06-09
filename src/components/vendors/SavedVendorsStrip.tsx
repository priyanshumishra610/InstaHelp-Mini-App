import { SaveVendorButton } from "@/components/vendors/SaveVendorButton";
import { useSavedVendorsStore } from "@/store/savedVendorsStore";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  vendors: VendorRecord[];
  isPro: boolean;
  savedLimit: number | null;
};

export function SavedVendorsStrip({ vendors, isPro, savedLimit }: Props) {
  const router = useRouter();
  const savedIds = useSavedVendorsStore((s) => s.vendorIds);

  const savedVendors = useMemo(() => {
    const map = new Map(vendors.map((v) => [v.id, v]));
    return savedIds
      .map((id) => map.get(id))
      .filter((v): v is VendorRecord => Boolean(v))
      .slice(0, 12);
  }, [savedIds, vendors]);

  if (savedIds.length === 0) return null;

  return (
    <View className="px-4 pb-2 pt-1">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[14px] font-extrabold text-neutral-900">
            Saved vendors
          </Text>
          <Text className="text-[11px] font-semibold text-neutral-500">
            {savedIds.length}
            {savedLimit != null ? ` / ${savedLimit} on Free` : " · unlimited on Pro"}
          </Text>
        </View>
        {!isPro ? (
          <Pressable
            onPress={() => router.push("/(tabs)/vendors/plans")}
            className="rounded-full bg-accent-soft px-3 py-1.5"
          >
            <Text className="text-[10px] font-extrabold text-accent-deep">
              Save unlimited · Pro
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
        contentContainerStyle={{ gap: 10, paddingRight: 8 }}
      >
        {savedVendors.map((vendor) => (
          <Pressable
            key={vendor.id}
            onPress={() => router.push(`/(tabs)/vendors/${vendor.id}`)}
            className="w-[168px] overflow-hidden rounded-2xl border border-neutral-200 bg-white active:opacity-90"
          >
            <View className="flex-row items-start justify-between p-3">
              <View className="flex-1 pr-2">
                <Text
                  className="text-[13px] font-extrabold text-neutral-900"
                  numberOfLines={2}
                >
                  {vendorDisplayName(vendor)}
                </Text>
                <Text className="mt-1 text-[10px] font-semibold text-neutral-500">
                  {vendor.city} · {vendor.category}
                </Text>
              </View>
              <SaveVendorButton vendorId={vendor.id} size={16} />
            </View>
          </Pressable>
        ))}

        {savedVendors.length < savedIds.length ? (
          <View className="w-[140px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-3">
            <Ionicons name="search-outline" size={18} color="#94a3b8" />
            <Text className="mt-2 text-center text-[11px] font-semibold text-neutral-500">
              {savedIds.length - savedVendors.length} saved outside current filters
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
