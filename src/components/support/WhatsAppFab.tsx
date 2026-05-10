import { openWhatsApp } from "@/utils/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TAB_BAR_BASE_HEIGHT = 58;
const FAB_GAP = 16;

type Props = {
  offsetTabBar?: boolean;
};

export function WhatsAppFab({ offsetTabBar = true }: Props) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const bottom = offsetTabBar
    ? TAB_BAR_BASE_HEIGHT + bottomInset + FAB_GAP
    : bottomInset + FAB_GAP;

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", right: 16, bottom, zIndex: 50 }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chat on WhatsApp"
        onPress={() =>
          openWhatsApp("Hi InstaHelp, I need assistance with my request.")
        }
        style={{
          shadowColor: "#25D366",
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        }}
        className="flex-row items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 active:opacity-90"
      >
        <View className="h-7 w-7 items-center justify-center rounded-full bg-white/20">
          <Ionicons name="logo-whatsapp" size={18} color="#fff" />
        </View>
        <Text className="text-sm font-semibold text-white max-w-[140px]">
          Concierge
        </Text>
      </Pressable>
    </View>
  );
}
