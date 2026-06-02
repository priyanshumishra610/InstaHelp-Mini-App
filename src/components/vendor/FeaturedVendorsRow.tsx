import { VendorHomeCard } from "@/components/vendor/VendorHomeCard";
import { VendorRowSkeleton } from "@/components/vendor/VendorRowSkeleton";
import { useFeaturedVendors } from "@/hooks/useFeaturedVendors";
import { haversineKm } from "@/services/vendors/vendorGeo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  userLocation?: { lat: number; lng: number } | null;
};

export function FeaturedVendorsRow({ userLocation }: Props) {
  const router = useRouter();
  const { vendors, loading, error, retry } = useFeaturedVendors(8);

  if (!loading && !vendors.length && !error) return null;

  return (
    <View className="mt-5">
      <View className="mb-3 flex-row items-end justify-between px-5">
        <View>
          <Text className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent-muted">
            Featured
          </Text>
          <Text className="mt-1 text-[18px] font-extrabold text-neutral-900">
            Top picks near you
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/vendors")}
          accessibilityRole="button"
          className="flex-row items-center gap-1 rounded-full border border-accent/15 bg-white px-3 py-1.5"
        >
          <Text className="text-[11px] font-bold text-accent-deep">See all</Text>
          <Ionicons name="chevron-forward" size={14} color="#7C3AED" />
        </Pressable>
      </View>

      {error ? (
        <Pressable onPress={retry} className="mx-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <Text className="text-[12px] font-semibold text-red-700">
            Could not load featured vendors. Tap to retry.
          </Text>
        </Pressable>
      ) : null}

      {loading ? (
        <VendorRowSkeleton />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {vendors.map((v) => (
            <VendorHomeCard
              key={v.id}
              vendor={v}
              distanceKm={
                userLocation && v.coordinates
                  ? haversineKm(userLocation, v.coordinates)
                  : null
              }
              onPress={() => router.push(`/(tabs)/vendors/${v.id}`)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
