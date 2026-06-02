import { Ionicons } from "@expo/vector-icons";
import { memo, type ComponentProps } from "react";
import {
  Platform,
  Pressable,
  type StyleProp,
  Text,
  View,
  type ViewStyle,
} from "react-native";

export type MarketplaceChipProps = {
  label: string;
  active?: boolean;
  icon?: ComponentProps<typeof Ionicons>["name"];
  onPress: () => void;
  /** Smaller rails (e.g. horizontal scroll strips). */
  compact?: boolean;
};

const shadowFor = (
  active: boolean,
): StyleProp<ViewStyle> =>
  Platform.select({
    ios: {
      shadowColor: active ? "#7C3AED" : "#0f172a",
      shadowOffset: { width: 0, height: active ? 3 : 1 },
      shadowOpacity: active ? 0.22 : 0.07,
      shadowRadius: active ? 10 : 4,
    },
    android: { elevation: active ? 6 : 2 },
    default: {},
  }) ?? {};

function MarketplaceChipInner({
  label,
  active,
  icon,
  onPress,
  compact,
}: MarketplaceChipProps) {
  const py = compact ? "py-1.5" : "py-2.5";
  const px = compact ? "px-3" : "px-4";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      hitSlop={6}
      className={`rounded-full border ${
        active
          ? "border-accent bg-accent"
          : "border-neutral-200/90 bg-white"
      } ${px} ${py}`}
      style={shadowFor(!!active)}
    >
      {({ pressed }) => (
        <View
          style={{ opacity: pressed ? 0.88 : 1 }}
          className="flex-row items-center gap-1.5"
        >
          {icon ? (
            <Ionicons
              name={icon}
              size={compact ? 13 : 14}
              color={active ? "#ffffff" : "#7C3AED"}
            />
          ) : null}
          <Text
            numberOfLines={1}
            className={`font-bold ${compact ? "text-[12px]" : "text-[13px]"} ${
              active ? "text-white" : "text-neutral-800"
            }`}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export const MarketplaceChip = memo(MarketplaceChipInner);
