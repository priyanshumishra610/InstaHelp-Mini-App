import type { GiftCardCategory } from "@/constants/hubble";
import { ACCENT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

const ICON_MAP: Record<GiftCardCategory["icon"], keyof typeof Ionicons.glyphMap> = {
  restaurant: "restaurant",
  "shopping-bag": "bag-outline",
  film: "film",
  fitness: "barbell",
  airplane: "airplane",
  cafe: "cafe",
};

type Props = {
  categories: GiftCardCategory[];
  onSelect: (category: GiftCardCategory) => void;
};

export function CategoriesGrid({ categories, onSelect }: Props) {
  return (
    <View className="mt-8 px-4">
      <Text className="text-xl font-extrabold text-brand-ink">Categories</Text>
      <Text className="mt-1 text-sm text-gray-600">Jump straight into what you need</Text>
      <View className="mt-4 flex-row flex-wrap justify-between gap-y-3">
        {categories.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c)}
            className="w-[48%] overflow-hidden rounded-3xl border border-accent-tint/70 bg-white p-4 active:opacity-95"
            style={{
              shadowColor: "#0f172a",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="rounded-2xl bg-accent-soft p-2">
                <Ionicons name={ICON_MAP[c.icon]} size={20} color={ACCENT} />
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
            </View>
            <Text className="mt-3 text-base font-extrabold text-brand-ink">{c.title}</Text>
            <Text className="mt-1 text-xs leading-4 text-gray-600">{c.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
