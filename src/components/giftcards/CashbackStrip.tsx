import { ACCENT, BRAND_GOLD } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, Text, View } from "react-native";

const OFFERS = [
  { id: "o1", label: "Extra rewards", value: "Stackable cashback", icon: "trending-up" as const },
  { id: "o2", label: "Limited drops", value: "Brand spotlights", icon: "flash" as const },
  { id: "o3", label: "Secure checkout", value: "Trusted payments", icon: "shield-checkmark" as const },
];

type Props = {
  onOpenOffers: () => void;
};

export function CashbackStrip({ onOpenOffers }: Props) {
  return (
    <View className="mt-6 px-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-extrabold text-brand-ink">Cashback & offers</Text>
          <Text className="mt-1 text-sm text-gray-600">Unlock perks as you browse partner offers</Text>
        </View>
        <Pressable
          onPress={onOpenOffers}
          className="rounded-full bg-accent px-3 py-2 active:opacity-90"
        >
          <Text className="text-xs font-extrabold text-white">Open</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
        contentContainerStyle={{ gap: 12, paddingVertical: 4 }}
      >
        {OFFERS.map((o) => (
          <LinearGradient
            key={o.id}
            colors={["#0b1220", "#111827"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 18,
              padding: 14,
              minWidth: 200,
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 8 },
              elevation: 6,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="rounded-2xl bg-white/10 p-2">
                <Ionicons name={o.icon} size={18} color={BRAND_GOLD} />
              </View>
              <View className="rounded-full bg-white/10 px-2 py-1">
                <Text className="text-[10px] font-extrabold uppercase tracking-wide text-white/80">
                  Live
                </Text>
              </View>
            </View>
            <Text className="mt-3 text-sm font-extrabold text-white">{o.label}</Text>
            <Text className="mt-1 text-xs leading-4 text-white/75">{o.value}</Text>
            <View className="mt-3 h-[1px] w-full bg-white/10" />
            <Text className="mt-3 text-[11px] font-bold uppercase tracking-wide" style={{ color: ACCENT }}>
              Curated in InstaHelp®
            </Text>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
}
