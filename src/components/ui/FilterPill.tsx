import { AppIcon } from "@/components/ui/AppIcon";
import { BorderTrail } from "@/components/motion/BorderTrail";
import { SPRING } from "@/constants/designSystem";
import { GLASS } from "@/constants/designSystem";
import { ACCENT, BRAND_GOLD, INK } from "@/constants/theme";
import type { AppIconKey } from "@/constants/icons";
import { MotiView } from "moti";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export type FilterPillProps = {
  label: string;
  active?: boolean;
  /** Material Design 3 semantic icon (preferred). */
  icon?: AppIconKey;
  onPress: () => void;
  compact?: boolean;
  index?: number;
  activeColor?: string;
  /** Text-only glass pills — no icons or checkmarks. */
  minimal?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function isLightAccent(hex: string) {
  const h = hex.replace("#", "");
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

/**
 * Soft pill + Motion-Primitives Border Trail when active.
 * Active chips use shop yellow by default (dark label), matching instahelp.in/shop.
 */
function FilterPillInner({
  label,
  active = false,
  icon,
  onPress,
  compact = false,
  activeColor = BRAND_GOLD,
  minimal = false,
}: FilterPillProps) {
  const scale = useSharedValue(1);
  const resolvedActiveColor = minimal ? ACCENT : activeColor;
  const lightActive = isLightAccent(resolvedActiveColor);
  const activeFg = lightActive ? "#0A0A0A" : "#FFFFFF";
  const idleIcon = minimal ? INK : ACCENT;

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pad = compact ? "px-3.5 py-[9px]" : "px-3.5 py-2.5";

  return (
    <BorderTrail active={active} radius={999} color={resolvedActiveColor}>
      <AnimatedPressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        hitSlop={6}
        onPressIn={() => {
          scale.value = withSpring(0.94, SPRING.snappy);
        }}
        onPressOut={() => {
          scale.value = withSpring(1, SPRING.gentle);
        }}
        style={pressStyle}
      >
        <MotiView
          animate={{
            backgroundColor: active
              ? resolvedActiveColor
              : minimal
                ? GLASS.fillStrong
                : "#FFFFFF",
            borderColor: active
              ? resolvedActiveColor
              : minimal
                ? GLASS.border
                : "#E5E5E5",
          }}
          transition={{ type: "timing", duration: 200 }}
          className={`flex-row items-center gap-1.5 rounded-full border ${pad}`}
          style={
            active
              ? minimal
                ? {
                    shadowColor: ACCENT,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.28,
                    shadowRadius: 12,
                    elevation: 3,
                  }
                : {
                    shadowColor: lightActive ? "#000000" : resolvedActiveColor,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: lightActive ? 0.1 : 0.22,
                    shadowRadius: 6,
                    elevation: 2,
                  }
              : minimal
                ? {
                    shadowColor: ACCENT,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 1,
                  }
                : {
                    shadowColor: "#A3A3A3",
                    shadowOffset: { width: 2, height: 3 },
                    shadowOpacity: 0.18,
                    shadowRadius: 6,
                    elevation: 2,
                    borderTopColor: "#FFFFFF",
                    borderLeftColor: "#FAFAFA",
                  }
          }
        >
          {!minimal && icon ? (
            <AppIcon
              name={icon}
              size={compact ? 14 : 15}
              color={active ? activeFg : idleIcon}
              filled={active}
            />
          ) : null}
          <Text
            numberOfLines={1}
            className={`font-semibold ${compact ? "text-[12px]" : "text-[13px]"}`}
            style={{
              color: active ? activeFg : minimal ? "#44403C" : "#292524",
            }}
          >
            {label}
          </Text>
          {!minimal && active ? (
            <View className="ml-0.5">
              <AppIcon name="checkCircle" size={12} color={activeFg} />
            </View>
          ) : null}
        </MotiView>
      </AnimatedPressable>
    </BorderTrail>
  );
}

export const FilterPill = memo(FilterPillInner);
