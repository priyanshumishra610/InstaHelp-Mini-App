import type { GiftCardBrandTile } from "@/constants/hubble";
import { ACCENT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, Text, View } from "react-native";

type Props = {
  brands: GiftCardBrandTile[];
  onOpenBrand: (brand: GiftCardBrandTile) => void;
};

export function PopularBrandsRow({ brands, onOpenBrand }: Props) {
  return (
    <View className="mt-8">
      <View className="px-4">
        <Text className="text-xl font-extrabold text-brand-ink">Popular brands</Text>
        <Text className="mt-1 text-sm text-gray-600">Fast access to top partners</Text>
      </View>
      <FlatList
        horizontal
        data={brands}
        keyExtractor={(b) => b.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpenBrand(item)}
            className="h-28 w-36 items-center justify-center rounded-3xl bg-white active:opacity-95"
            style={{
              shadowColor: "#0f172a",
              shadowOpacity: 0.08,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 5,
            }}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#e0eaff" }}
            >
              <Text className="text-base font-extrabold" style={{ color: ACCENT }}>
                {item.initials}
              </Text>
            </View>
            <Text
              className="mt-3 px-2 text-center text-xs font-extrabold text-brand-ink"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View className="absolute right-2 top-2 rounded-full bg-accent/10 px-2 py-1">
              <Ionicons name="open-outline" size={12} color={ACCENT} />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
