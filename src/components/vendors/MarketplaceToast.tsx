import { Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

type Props = {
  message: string | null;
};

export function MarketplaceToast({ message }: Props) {
  if (!message) return null;

  return (
    <Animated.View
      pointerEvents="none"
      entering={FadeInDown.springify().damping(18).stiffness(220)}
      exiting={FadeOutUp.duration(200)}
      className="absolute left-4 right-4 top-2 z-50 rounded-2xl border border-status-doneFg bg-white px-4 py-3 shadow-soft"
      style={{ elevation: 14 }}
    >
      <Text className="text-center text-[13px] font-bold text-neutral-900">
        {message}
      </Text>
      <View className="mt-1 flex-row items-center justify-center gap-1">
        <View className="h-1 w-10 rounded-full bg-status-doneFg/30" />
      </View>
    </Animated.View>
  );
}
