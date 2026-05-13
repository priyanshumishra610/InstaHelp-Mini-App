import type { GiftCardFeatured } from "@/constants/hubble";
import { ACCENT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FlatList, Pressable, Text, View } from "react-native";

type Props = {
  items: GiftCardFeatured[];
  onOpen: (item: GiftCardFeatured) => void;
};

export function FeaturedGiftCardsRow({ items, onOpen }: Props) {
  return (
    <View className="mt-6">
      <SectionTitle title="Featured" subtitle="Handpicked for InstaHelp members" />
      <FlatList
        horizontal
        data={items}
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingTop: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpen(item)}
            className="w-64 overflow-hidden rounded-3xl bg-white active:opacity-95"
            style={{
              shadowColor: "#0f172a",
              shadowOpacity: 0.1,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={["#f0f6ff", "#ffffff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16 }}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 gap-2 pr-2">
                  <Text className="text-lg font-extrabold text-brand-ink">{item.name}</Text>
                  <Text className="text-sm leading-5 text-gray-600">{item.tagline}</Text>
                </View>
                <View className="rounded-2xl bg-accent/10 p-2">
                  <Ionicons name="gift" size={22} color={ACCENT} />
                </View>
              </View>
              <View className="mt-4 flex-row items-center justify-between">
                {item.cashbackLabel ? (
                  <View className="rounded-full bg-brand-goldSoft px-3 py-1">
                    <Text className="text-[11px] font-extrabold uppercase tracking-wide text-brand-goldDeep">
                      {item.cashbackLabel}
                    </Text>
                  </View>
                ) : (
                  <View />
                )}
                <View className="flex-row items-center gap-1">
                  <Text className="text-sm font-extrabold" style={{ color: ACCENT }}>
                    Shop
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={ACCENT} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        )}
      />
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="px-4">
      <Text className="text-xl font-extrabold text-brand-ink">{title}</Text>
      <Text className="mt-1 text-sm text-gray-600">{subtitle}</Text>
    </View>
  );
}
