import type { RecentlyViewedGiftCard } from "@/store/giftCardsStore";
import { ACCENT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, Text, View } from "react-native";

type Props = {
  items: RecentlyViewedGiftCard[];
  onOpen: (item: RecentlyViewedGiftCard) => void;
  onClear: () => void;
};

export function RecentlyViewedSection({ items, onOpen, onClear }: Props) {
  if (!items.length) {
    return (
      <View className="mt-8 px-4">
        <Text className="text-xl font-extrabold text-brand-ink">Recently viewed</Text>
        <View className="mt-4 rounded-3xl border border-dashed border-accent-tint bg-accent-soft/40 p-5">
          <Text className="text-sm font-semibold text-gray-700">
            Your recently opened brands will appear here for quick return visits.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between px-4">
        <View>
          <Text className="text-xl font-extrabold text-brand-ink">Recently viewed</Text>
          <Text className="mt-1 text-sm text-gray-600">Pick up where you left off</Text>
        </View>
        <Pressable onPress={onClear} className="rounded-full bg-accent-soft px-3 py-2 active:opacity-90">
          <Text className="text-xs font-extrabold" style={{ color: ACCENT }}>
            Clear
          </Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={items}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpen(item)}
            className="w-56 rounded-3xl border border-accent-tint/80 bg-white p-4 active:opacity-95"
            style={{
              shadowColor: "#0f172a",
              shadowOpacity: 0.06,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
              elevation: 3,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="rounded-2xl bg-accent-soft px-3 py-2">
                <Text className="text-xs font-extrabold" style={{ color: ACCENT }}>
                  {item.title.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Ionicons name="time-outline" size={16} color="#9ca3af" />
            </View>
            <Text className="mt-3 text-base font-extrabold text-brand-ink" numberOfLines={2}>
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text className="mt-1 text-xs text-gray-600" numberOfLines={2}>
                {item.subtitle}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </View>
  );
}
