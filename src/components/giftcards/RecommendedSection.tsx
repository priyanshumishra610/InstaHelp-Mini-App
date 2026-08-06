import { ACCENT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

type Props = {
  onOpenPersonalized: () => void;
};

export function RecommendedSection({ onOpenPersonalized }: Props) {
  return (
    <View className="mt-8 px-4">
      <Text className="text-xl font-extrabold text-brand-ink">Recommended for you</Text>
      <Text className="mt-1 text-sm text-gray-600">Based on your InstaHelp activity style</Text>

      <Pressable
        onPress={onOpenPersonalized}
        className="mt-4 overflow-hidden rounded-3xl active:opacity-95"
        style={{
          shadowColor: "#0f172a",
          shadowOpacity: 0.1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }}
      >
        <LinearGradient
          colors={["#171717", "#0b1220"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 18 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 gap-2 pr-3">
              <Text className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/70">
                Smart picks
              </Text>
              <Text className="text-lg font-extrabold text-white">Continue your gifting journey</Text>
              <Text className="text-sm leading-5 text-white/80">
                Browse tailored picks in our secure gift card flow.
              </Text>
            </View>
            <View className="rounded-3xl bg-white/15 p-3">
              <Ionicons name="sparkles" size={26} color="#ffd500" />
            </View>
          </View>
          <View className="mt-4 flex-row items-center gap-2 self-start rounded-full bg-white px-4 py-2">
            <Text className="text-sm font-extrabold" style={{ color: ACCENT }}>
              Explore recommendations
            </Text>
            <Ionicons name="arrow-forward" size={16} color={ACCENT} />
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}
