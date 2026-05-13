import { ACCENT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, Text, View } from "react-native";

type Props = {
  onOpenWallet: () => void;
  onOpenHelp: () => void;
};

export function GiftCardsCtaCard({ onOpenWallet, onOpenHelp }: Props) {
  return (
    <View className="mt-8 px-4 pb-10">
      <Text className="text-xl font-extrabold text-brand-ink">Quick actions</Text>
      <Text className="mt-1 text-sm text-gray-600">Everything you need in two taps</Text>

      <View className="mt-4 flex-row gap-3">
        <Pressable
          onPress={onOpenWallet}
          className="flex-1 overflow-hidden rounded-3xl active:opacity-95"
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.08,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={["#ffffff", "#f0f6ff"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, minHeight: 132 }}
          >
            <View className="rounded-2xl bg-accent/10 p-2 self-start">
              <Ionicons name="wallet" size={20} color={ACCENT} />
            </View>
            <Text className="mt-3 text-base font-extrabold text-brand-ink">Wallet & history</Text>
            <Text className="mt-1 text-xs leading-4 text-gray-600">Track purchases and redemptions</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={onOpenHelp}
          className="flex-1 overflow-hidden rounded-3xl active:opacity-95"
          style={{
            shadowColor: "#0f172a",
            shadowOpacity: 0.08,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 5,
          }}
        >
          <LinearGradient
            colors={["#ffffff", "#fff8e1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, minHeight: 132 }}
          >
            <View className="rounded-2xl bg-brand-goldSoft p-2 self-start">
              <Ionicons name="help-buoy" size={20} color="#b45309" />
            </View>
            <Text className="mt-3 text-base font-extrabold text-brand-ink">Help & support</Text>
            <Text className="mt-1 text-xs leading-4 text-gray-600">Help and FAQs for your gift card orders</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}
