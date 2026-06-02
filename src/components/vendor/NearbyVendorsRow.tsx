import { VendorHomeCard } from "@/components/vendor/VendorHomeCard";
import { VendorRowSkeleton } from "@/components/vendor/VendorRowSkeleton";
import { useNearbyVendors } from "@/hooks/useNearbyVendors";
import { haversineKm } from "@/services/vendors/vendorGeo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  userLocation: { lat: number; lng: number } | null;
};

export function NearbyVendorsRow({ userLocation }: Props) {
  const router = useRouter();
  const { vendors, loading, error } = useNearbyVendors(userLocation, 6);

  if (!loading && !vendors.length) return null;

  return (
    <View className="mt-6">
      <View className="mb-3 flex-row items-end justify-between px-5">
        <View>
          <Text className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-accent-muted">
            Nearby
          </Text>
          <Text className="mt-1 text-[18px] font-extrabold text-neutral-900">
            Nearby Pros closest to you..
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/vendors")}
          className="flex-row items-center gap-1 rounded-full border border-accent/15 bg-white px-3 py-1.5"
        >
          <Text className="text-[11px] font-bold text-accent-deep">Explore</Text>
          <Ionicons name="navigate-outline" size={14} color="#7C3AED" />
        </Pressable>
      </View>

      {error ? (
        <Text className="px-5 text-[12px] text-neutral-500">
          Enable location for smarter nearby results.
        </Text>
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
