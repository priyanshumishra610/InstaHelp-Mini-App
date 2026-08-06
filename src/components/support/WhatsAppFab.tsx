import { openWhatsApp } from "@/utils/whatsapp";
import { useExploreSubscription } from "@/hooks/useExploreSubscription";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AppIcon } from "@/components/ui/AppIcon";
import { MotiView } from "moti";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const TAB_BAR_BASE_HEIGHT = 64;
const FAB_GAP = 16;

type Props = {
  offsetTabBar?: boolean;
};

export function WhatsAppFab({ offsetTabBar = true }: Props) {
  const insets = useSafeAreaInsets();
  const { entitlements } = useExploreSubscription();
  const bottomInset = Math.max(insets.bottom, 8);
  // Floating glass tab sits above the home indicator.
  const bottom = offsetTabBar
    ? TAB_BAR_BASE_HEIGHT + bottomInset + FAB_GAP + 4
    : bottomInset + FAB_GAP;

  const message = entitlements.whatsAppPriority
    ? "Hi InstaHelp Pro+ — I need priority assistance with Explore / vendor discovery."
    : "Hi InstaHelp, I need assistance with my request.";

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", right: 16, bottom, zIndex: 50 }}
    >
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 14, stiffness: 220, delay: 300 }}
      >
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Chat on WhatsApp"
          onPress={() => openWhatsApp(message)}
          haptic
          scaleTo={0.94}
          style={{
            shadowColor: "#25D366",
            shadowOpacity: 0.35,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
            elevation: 10,
          }}
          className="flex-row items-center gap-2 rounded-full bg-[#25D366] px-4 py-3"
        >
          <View className="h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <AppIcon name="whatsapp" size={18} color="#fff" />
          </View>
          <Text className="max-w-[140px] text-sm font-semibold text-white">
            {entitlements.whatsAppPriority ? "Pro+ Support" : "Concierge"}
          </Text>
        </AnimatedPressable>
      </MotiView>
    </View>
  );
}
