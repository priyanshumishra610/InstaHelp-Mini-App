import { OfferCard } from "@/components/offers/OfferCard";
import { OfferBannerSkeleton } from "@/components/offers/OfferBannerSkeleton";
import { ACCENT } from "@/constants/theme";
import type { WeeklyOffer } from "@/types/offers";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const HORIZONTAL_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;
const CARD_GAP = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_GAP;
const AUTO_PLAY_MS = 5500;

type Props = {
  offers: WeeklyOffer[];
  onOfferPress?: (offer: WeeklyOffer) => void;
  /** Brief skeleton on first mount (ms). Set 0 to skip. */
  skeletonMs?: number;
};

export function OfferBannerCarousel({
  offers,
  onOfferPress,
  skeletonMs = 380,
}: Props) {
  const listRef = useRef<Animated.FlatList<WeeklyOffer>>(null);
  const scrollX = useSharedValue(0);
  const activeIndex = useSharedValue(0);
  const userDragging = useSharedValue(0);
  const [dotIndex, setDotIndex] = useState(0);
  const [showSkeleton, setShowSkeleton] = useState(skeletonMs > 0);

  useEffect(() => {
    if (skeletonMs <= 0) return;
    const t = setTimeout(() => setShowSkeleton(false), skeletonMs);
    return () => clearTimeout(t);
  }, [skeletonMs]);

  const scrollToIndex = useCallback((index: number) => {
    listRef.current?.scrollToOffset({
      offset: index * SNAP_INTERVAL,
      animated: true,
    });
  }, []);

  useAnimatedReaction(
    () => Math.round(scrollX.value / SNAP_INTERVAL),
    (next, prev) => {
      if (next !== prev && next >= 0 && next < offers.length) {
        activeIndex.value = next;
        runOnJS(setDotIndex)(next);
      }
    },
    [offers.length],
  );

  useEffect(() => {
    if (offers.length <= 1 || showSkeleton) return;
    const id = setInterval(() => {
      if (userDragging.value === 1) return;
      const next = (activeIndex.value + 1) % offers.length;
      activeIndex.value = next;
      runOnJS(setDotIndex)(next);
      scrollToIndex(next);
    }, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [offers.length, showSkeleton, scrollToIndex, activeIndex, userDragging]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onBeginDrag: () => {
      userDragging.value = 1;
    },
    onEndDrag: () => {
      userDragging.value = 0;
    },
  });

  if (!offers.length) return null;

  if (showSkeleton) {
    return <OfferBannerSkeleton />;
  }

  return (
    <View className="mt-6">
      <Animated.FlatList
        ref={listRef}
        data={offers}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        disableIntervalMomentum
        bounces={false}
        overScrollMode="never"
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
        contentContainerStyle={{
          paddingLeft: 0,
          paddingRight: HORIZONTAL_PADDING,
          gap: CARD_GAP,
        }}
        keyExtractor={(item) => item.id}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        renderItem={({ item, index }) => (
          <OfferCard
            offer={item}
            index={index}
            scrollX={scrollX}
            cardWidth={CARD_WIDTH}
            onPress={(offer) => onOfferPress?.(offer)}
          />
        )}
      />
      <View className="mt-3 flex-row items-center justify-center gap-2">
        {offers.map((offer, i) => (
          <View
            key={`offer-dot-${offer.id}`}
            className="h-2 rounded-full"
            style={{
              width: i === dotIndex ? 18 : 8,
              backgroundColor: i === dotIndex ? ACCENT : "#e5e7eb",
            }}
          />
        ))}
      </View>
    </View>
  );
}
