import { CategorySection } from "@/components/discovery/CategorySection";
import { DiscoverySkeleton } from "@/components/discovery/DiscoverySkeleton";
import { ServiceChip } from "@/components/discovery/ServiceChip";
import { OfferBannerCarousel } from "@/components/offers/OfferBannerCarousel";
import {
  DISCOVERY_CATEGORIES,
  getPopularServices,
  getRecommendedServices,
} from "@/constants/discoveryCategories";
import { getWeeklyOffers } from "@/constants/weeklyOffers";
import { useWeeklyOffers } from "@/hooks/useCmsContent";
import { trackBannerClick } from "@/services/content/homeContentService";
import { ACCENT } from "@/constants/theme";
import { useDiscoveryStore } from "@/store/discoveryStore";
import type { DiscoveryCategory, DiscoveryService } from "@/types/discovery";
import type { WeeklyOffer } from "@/types/offers";
import { discoveryImpact, discoverySelection } from "@/utils/discoveryHaptics";
import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type ScrollView as ScrollViewType,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export type DiscoverySectionHandle = {
  scrollToCategory: (categoryId: string) => void;
  setActiveNavId: (id: string) => void;
};

type Props = {
  onServiceSelect: (service: DiscoveryService, categoryId: string) => void;
  onOfferPress?: (offer: WeeklyOffer) => void;
  parentScrollRef?: React.RefObject<ScrollViewType | null>;
  sectionAnchorY?: { value: number };
  activeNavId: string;
  onActiveNavIdChange: (id: string) => void;
  onRegisterScrollToCategory: (fn: (categoryId: string) => void) => void;
};

function MicroCarousel({
  title,
  subtitle,
  services,
  onPress,
}: {
  title: string;
  subtitle: string;
  services: DiscoveryService[];
  onPress: (service: DiscoveryService) => void;
}) {
  if (!services.length) return null;

  return (
    <Animated.View entering={FadeInUp.duration(400).delay(80)} className="mt-7">
      <Text className="text-[13px] font-bold text-neutral-900">{title}</Text>
      <Text className="mt-0.5 text-[11px] text-neutral-500">{subtitle}</Text>
      <FlatList
        horizontal
        data={services}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={{ gap: 8, paddingTop: 10, paddingRight: 4 }}
        renderItem={({ item }) => (
          <View style={{ width: 132 }}>
            <ServiceChip service={item} compact onPress={() => onPress(item)} />
          </View>
        )}
      />
    </Animated.View>
  );
}

function DiscoverySectionComponent({
  onServiceSelect,
  onOfferPress,
  parentScrollRef,
  sectionAnchorY,
  activeNavId,
  onActiveNavIdChange,
  onRegisterScrollToCategory,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(["home-personal", "personal-care"]),
  );
  const sectionOffsets = useRef<Record<string, number>>({});
  const discoveryTop = useRef(0);

  const recentlyViewed = useDiscoveryStore((s) => s.recentlyViewed);
  const clearRecentlyViewed = useDiscoveryStore((s) => s.clearRecentlyViewed);
  const recordView = useDiscoveryStore((s) => s.recordView);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 520);
    return () => clearTimeout(t);
  }, []);

  const popular = useMemo(() => getPopularServices(), []);
  const recommended = useMemo(() => getRecommendedServices(), []);
  const { data: offersData } = useWeeklyOffers();
  const weeklyOffers = useMemo(
    () => offersData?.offers ?? getWeeklyOffers().offers,
    [offersData],
  );

  const handleServicePress = useCallback(
    (service: DiscoveryService, categoryId: string) => {
      recordView({
        id: service.id,
        label: service.label,
        icon: service.icon,
        categoryId,
      });
      onServiceSelect(service, categoryId);
    },
    [onServiceSelect, recordView],
  );

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  }, []);

  const scrollToCategory = useCallback(
    (categoryId: string) => {
      onActiveNavIdChange(categoryId);
      setExpandedIds((prev) => new Set(prev).add(categoryId));
      const y = sectionOffsets.current[categoryId];
      if (y != null && parentScrollRef?.current && sectionAnchorY) {
        parentScrollRef.current.scrollTo({
          y: sectionAnchorY.value + discoveryTop.current + y - 56,
          animated: true,
        });
      }
    },
    [onActiveNavIdChange, parentScrollRef, sectionAnchorY],
  );

  useEffect(() => {
    onRegisterScrollToCategory(scrollToCategory);
  }, [onRegisterScrollToCategory, scrollToCategory]);

  const handleViewAll = useCallback(
    (category: DiscoveryCategory) => {
      discoverySelection();
      scrollToCategory(category.id);
    },
    [scrollToCategory],
  );

  const handleOfferPress = useCallback(
    (offer: WeeklyOffer) => {
      discoverySelection();
      trackBannerClick(offer.id);
      const action = offer.action ?? "";
      if (action.startsWith("category:")) {
        const categoryId = action.slice("category:".length);
        if (DISCOVERY_CATEGORIES.some((c) => c.id === categoryId)) {
          scrollToCategory(categoryId);
        }
      }
      onOfferPress?.(offer);
    },
    [onOfferPress, scrollToCategory],
  );

  const registerSectionLayout = useCallback((categoryId: string, y: number) => {
    sectionOffsets.current[categoryId] = y;
  }, []);

  const filteredCategoryCount = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return DISCOVERY_CATEGORIES.length;
    return DISCOVERY_CATEGORIES.filter((c) =>
      c.services.some((s) => s.label.toLowerCase().includes(q)),
    ).length;
  }, [filterQuery]);

  if (loading) {
    return <DiscoverySkeleton />;
  }

  return (
    <View
      onLayout={(e) => {
        discoveryTop.current = e.nativeEvent.layout.y;
      }}
    >
      <Animated.View
        entering={FadeInDown.duration(450).delay(40)}
        className="mt-10"
      >
        <Text className="text-[22px] font-extrabold leading-7 tracking-tight text-neutral-900">
          Services, Products & Experiences. Sorted.
        </Text>
        <Text className="mt-1.5 text-[13px] leading-[19px] text-neutral-500">
          Everything you need, connected beautifully.
        </Text>
      </Animated.View>

      <OfferBannerCarousel offers={weeklyOffers} onOfferPress={handleOfferPress} />

      <Animated.View entering={FadeInUp.duration(400).delay(90)} className="mt-5">
        <View className="flex-row items-center rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
          <Ionicons name="search-outline" size={16} color="#a3a3a3" />
          <TextInput
            value={filterQuery}
            onChangeText={setFilterQuery}
            placeholder="Search services..."
            placeholderTextColor="#a3a3a3"
            className="ml-2 flex-1 py-1.5 text-[13px] text-neutral-900"
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search discovery services"
          />
          {filterQuery.length > 0 ? (
            <Pressable
              onPress={() => {
                discoveryImpact("light");
                setFilterQuery("");
              }}
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={18} color="#a3a3a3" />
            </Pressable>
          ) : null}
        </View>
        {filterQuery.trim() ? (
          <Text className="mt-2 text-[11px] text-neutral-500">
            {filteredCategoryCount} categor{filteredCategoryCount === 1 ? "y" : "ies"} match
          </Text>
        ) : null}
      </Animated.View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        contentContainerStyle={{ gap: 6, paddingRight: 8 }}
      >
        {DISCOVERY_CATEGORIES.map((cat) => {
          const active = activeNavId === cat.id;
          return (
            <Pressable
              key={cat.id}
              onPress={() => scrollToCategory(cat.id)}
              className={`rounded-full border px-3 py-1.5 ${
                active
                  ? "border-neutral-900 bg-neutral-900"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <Text
                className={`text-[10px] font-bold ${
                  active ? "text-white" : "text-neutral-600"
                }`}
                numberOfLines={1}
              >
                {cat.title.length > 22 ? `${cat.title.slice(0, 20)}…` : cat.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {recentlyViewed.length > 0 ? (
        <View className="mt-7">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[13px] font-bold text-neutral-900">
                Recently viewed
              </Text>
              <Text className="mt-0.5 text-[11px] text-neutral-500">
                Pick up where you left off
              </Text>
            </View>
            <Pressable onPress={clearRecentlyViewed} hitSlop={8}>
              <Text className="text-[11px] font-bold" style={{ color: ACCENT }}>
                Clear
              </Text>
            </Pressable>
          </View>
          <FlatList
            horizontal
            data={recentlyViewed}
            keyExtractor={(item) => `${item.id}-${item.viewedAt}`}
            showsHorizontalScrollIndicator={false}
            initialNumToRender={5}
            contentContainerStyle={{ gap: 8, paddingTop: 10 }}
            renderItem={({ item }) => (
              <View style={{ width: 128 }}>
                <ServiceChip
                  service={{
                    id: item.id,
                    label: item.label,
                    icon: item.icon,
                  }}
                  compact
                  onPress={() =>
                    handleServicePress(
                      {
                        id: item.id,
                        label: item.label,
                        icon: item.icon,
                      },
                      item.categoryId,
                    )
                  }
                />
              </View>
            )}
          />
        </View>
      ) : null}

      <MicroCarousel
        title="Popular nearby"
        subtitle="Trusted picks in your area"
        services={popular}
        onPress={(s) => {
          const cat =
            DISCOVERY_CATEGORIES.find((c) => c.services.some((x) => x.id === s.id))?.id ??
            "home-personal";
          handleServicePress(s, cat);
        }}
      />

      <MicroCarousel
        title="Recommended for you"
        subtitle="Curated based on what people book most"
        services={recommended}
        onPress={(s) => {
          const cat =
            DISCOVERY_CATEGORIES.find((c) => c.services.some((x) => x.id === s.id))?.id ??
            "home-personal";
          handleServicePress(s, cat);
        }}
      />

      <View className="mt-2">
        {DISCOVERY_CATEGORIES.map((category, index) => (
          <CategorySection
            key={category.id}
            category={category}
            expanded={expandedIds.has(category.id)}
            onToggle={toggleCategory}
            onViewAll={handleViewAll}
            onServicePress={handleServicePress}
            onLayout={registerSectionLayout}
            index={index}
            filterQuery={filterQuery}
          />
        ))}
      </View>

      {filterQuery.trim() && filteredCategoryCount === 0 ? (
        <View className="mt-8 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-6">
          <Text className="text-center text-[13px] font-semibold text-neutral-700">
            No services match “{filterQuery.trim()}”
          </Text>
          <Text className="mt-1 text-center text-[11px] text-neutral-500">
            Try a shorter keyword or browse categories above.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export const DiscoverySection = memo(DiscoverySectionComponent);
