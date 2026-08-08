import { ServiceChip } from "@/components/discovery/ServiceChip";
import { PERF_MODE } from "@/constants/performance";
import type { DiscoveryCategory, DiscoveryService } from "@/types/discovery";
import { ACCENT } from "@/constants/theme";
import { discoverySelection } from "@/utils/discoveryHaptics";
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect } from "react";
import { LayoutChangeEvent, Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Props = {
  category: DiscoveryCategory;
  expanded: boolean;
  onToggle: (categoryId: string) => void;
  onViewAll: (category: DiscoveryCategory) => void;
  onServicePress: (service: DiscoveryService, categoryId: string) => void;
  onLayout?: (categoryId: string, y: number) => void;
  index: number;
  filterQuery: string;
};

function filterServices(
  services: DiscoveryService[],
  query: string,
): DiscoveryService[] {
  const q = query.trim().toLowerCase();
  if (!q) return services;
  return services.filter((s) => s.label.toLowerCase().includes(q));
}

function CategorySectionComponent({
  category,
  expanded,
  onToggle,
  onViewAll,
  onServicePress,
  onLayout,
  index,
  filterQuery,
}: Props) {
  const visibleServices = filterServices(category.services, filterQuery);
  const chevronRotation = useSharedValue(expanded ? 180 : 0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  useEffect(() => {
    if (PERF_MODE) return;
    chevronRotation.value = withTiming(expanded ? 180 : 0, { duration: 220 });
  }, [chevronRotation, expanded]);

  const handleToggle = useCallback(() => {
    discoverySelection();
    onToggle(category.id);
  }, [category.id, onToggle]);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      onLayout?.(category.id, e.nativeEvent.layout.y);
    },
    [category.id, onLayout],
  );

  if (filterQuery.trim() && visibleServices.length === 0) {
    return null;
  }

  const isRow = category.layout === "row";

  const SectionRoot = PERF_MODE ? View : Animated.View;
  const ExpandRoot = PERF_MODE ? View : Animated.View;

  return (
    <SectionRoot
      {...(!PERF_MODE
        ? {
            layout: Layout.springify().damping(20).stiffness(280),
            entering: FadeInDown.duration(380).delay(40 + index * 35),
          }
        : {})}
      onLayout={handleLayout}
      className="mt-6"
    >
      <View className="flex-row items-start justify-between gap-3">
        <Pressable
          onPress={handleToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          className="flex-1 active:opacity-80"
        >
          <View className="flex-row items-center gap-2">
            <Text className="text-[15px] font-bold tracking-tight text-neutral-900">
              {category.title}
            </Text>
            {PERF_MODE ? (
              <View
                style={{
                  transform: [{ rotate: expanded ? "180deg" : "0deg" }],
                }}
              >
                <Ionicons name="chevron-down" size={14} color="#737373" />
              </View>
            ) : (
              <Animated.View style={chevronStyle}>
                <Ionicons name="chevron-down" size={14} color="#737373" />
              </Animated.View>
            )}
          </View>
          <Text className="mt-0.5 text-[11px] leading-4 text-neutral-500">
            {category.subtitle}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onViewAll(category)}
          hitSlop={8}
          className="rounded-full px-2 py-1 active:opacity-70"
        >
          <Text className="text-[11px] font-bold" style={{ color: ACCENT }}>
            View all
          </Text>
        </Pressable>
      </View>

      {expanded ? (
        <ExpandRoot
          {...(!PERF_MODE
            ? { layout: Layout.springify().damping(22).stiffness(300) }
            : {})}
        >
          {isRow ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingTop: 12, paddingRight: 4 }}
              className="mt-0"
            >
              {visibleServices.map((service) => (
                <View key={service.id} style={{ width: 148 }}>
                  <ServiceChip
                    service={service}
                    onPress={(s) => onServicePress(s, category.id)}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="mt-3 flex-row flex-wrap" style={{ gap: 8 }}>
              {visibleServices.map((service) => (
                <View key={service.id} style={{ width: "48.5%" }}>
                  <ServiceChip
                    service={service}
                    onPress={(s) => onServicePress(s, category.id)}
                  />
                </View>
              ))}
            </View>
          )}
        </ExpandRoot>
      ) : (
        <Pressable
          onPress={handleToggle}
          className="mt-2.5 flex-row flex-wrap"
          style={{ gap: 6 }}
        >
          {visibleServices.slice(0, 4).map((service) => (
            <View
              key={service.id}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1"
            >
              <Text className="text-[10px] font-semibold text-neutral-600">
                {service.label}
              </Text>
            </View>
          ))}
          {visibleServices.length > 4 ? (
            <View className="rounded-full bg-accent-soft px-2.5 py-1">
              <Text className="text-[10px] font-bold text-accent-deep">
                +{visibleServices.length - 4}
              </Text>
            </View>
          ) : null}
        </Pressable>
      )}
    </SectionRoot>
  );
}

export const CategorySection = memo(CategorySectionComponent);
