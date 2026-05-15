import type { DiscoveryService } from "@/types/discovery";
import { ACCENT } from "@/constants/theme";
import { discoveryImpact } from "@/utils/discoveryHaptics";
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  service: DiscoveryService;
  onPress: (service: DiscoveryService) => void;
  compact?: boolean;
};

function ServiceChipComponent({ service, onPress, compact }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 18, stiffness: 420 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 360 });
  }, [scale]);

  const handlePress = useCallback(() => {
    discoveryImpact("light");
    onPress(service);
  }, [onPress, service]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={service.label}
      style={[
        animatedStyle,
        {
          shadowColor: "#0f172a",
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        },
      ]}
      className={`flex-row items-center rounded-2xl border border-neutral-200/90 bg-white active:bg-neutral-50 ${
        compact ? "gap-2 px-2.5 py-2" : "gap-2.5 px-3 py-2.5"
      }`}
    >
      <View
        className={`items-center justify-center rounded-xl bg-accent-soft ${
          compact ? "h-7 w-7" : "h-8 w-8"
        }`}
      >
        <Ionicons name={service.icon} size={compact ? 13 : 14} color={ACCENT} />
      </View>
      <Text
        className={`flex-1 font-semibold text-neutral-800 ${
          compact ? "text-[11px] leading-[14px]" : "text-[12px] leading-[15px]"
        }`}
        numberOfLines={2}
      >
        {service.label}
      </Text>
    </AnimatedPressable>
  );
}

export const ServiceChip = memo(ServiceChipComponent);
