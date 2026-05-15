import { DISCOVERY_CATEGORIES } from "@/constants/discoveryCategories";
import { discoverySelection } from "@/utils/discoveryHaptics";
import { memo } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import Animated, { type SharedValue, useAnimatedStyle } from "react-native-reanimated";

type Props = {
  activeId: string;
  onSelect: (categoryId: string) => void;
  visible: SharedValue<number>;
};

function DiscoveryCategoryNavComponent({ activeId, onSelect, visible }: Props) {
  const style = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ translateY: (1 - visible.value) * -6 }],
  }));

  return (
    <Animated.View
      style={style}
      pointerEvents="box-none"
      className="absolute left-0 right-0 top-0 z-30 border-b border-neutral-200/90 bg-white/96 px-5 py-2.5"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 6, alignItems: "center" }}
      >
        {DISCOVERY_CATEGORIES.map((cat) => {
          const active = activeId === cat.id;
          const short =
            cat.title.length > 18 ? `${cat.title.slice(0, 16)}…` : cat.title;
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                discoverySelection();
                onSelect(cat.id);
              }}
              className={`rounded-full px-3 py-1.5 ${
                active ? "bg-neutral-900" : "bg-neutral-100"
              }`}
            >
              <Text
                className={`text-[10px] font-bold ${
                  active ? "text-white" : "text-neutral-600"
                }`}
                numberOfLines={1}
              >
                {short}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

export const DiscoveryCategoryNav = memo(DiscoveryCategoryNavComponent);
