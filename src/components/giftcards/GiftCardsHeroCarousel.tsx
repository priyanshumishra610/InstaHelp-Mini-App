import type { GiftCardHeroSlide } from "@/constants/hubble";
import { ACCENT, BRAND_GOLD } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 420);
const CARD_GAP = 12;

type Props = {
  slides: GiftCardHeroSlide[];
  onOpenSlide: (slide: GiftCardHeroSlide) => void;
};

export function GiftCardsHeroCarousel({ slides, onOpenSlide }: Props) {
  const listRef = useRef<FlatList<GiftCardHeroSlide>>(null);
  const [index, setIndex] = useState(0);
  const scrollX = useSharedValue(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % slides.length;
        listRef.current?.scrollToOffset({
          offset: next * (CARD_WIDTH + CARD_GAP),
          animated: true,
        });
        return next;
      });
    }, 5200);
    return () => clearInterval(id);
  }, [slides.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
  };

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(x / (CARD_WIDTH + CARD_GAP));
    setIndex(Math.max(0, Math.min(slides.length - 1, nextIndex)));
  };

  return (
    <View className="mt-1">
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16, gap: CARD_GAP }}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item, index: i }) => (
          <HeroCard
            slide={item}
            index={i}
            scrollX={scrollX}
            cardWidth={CARD_WIDTH}
            onPress={() => onOpenSlide(item)}
          />
        )}
      />
      <View className="mt-3 flex-row items-center justify-center gap-2">
        {slides.map((s, i) => (
          <View
            key={`dot-${s.id}`}
            className="h-2 rounded-full"
            style={{
              width: i === index ? 18 : 8,
              backgroundColor: i === index ? ACCENT : "#e5e7eb",
            }}
          />
        ))}
      </View>
    </View>
  );
}

function HeroCard({
  slide,
  index,
  scrollX,
  cardWidth,
  onPress,
}: {
  slide: GiftCardHeroSlide;
  index: number;
  scrollX: SharedValue<number>;
  cardWidth: number;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (cardWidth + CARD_GAP),
      index * (cardWidth + CARD_GAP),
      (index + 1) * (cardWidth + CARD_GAP),
    ];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.96, 1, 0.96],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }] };
  });

  return (
    <Animated.View style={[{ width: cardWidth }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        className="overflow-hidden rounded-3xl active:opacity-95"
        style={{
          shadowColor: "#0f172a",
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={[slide.accent, "#0b1220"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 18, minHeight: 168 }}
        >
          <View className="flex-row items-start justify-between">
            <View className="max-w-[78%] gap-2">
              <Text className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/80">
                InstaHelp® Gift Cards
              </Text>
              <Text className="text-2xl font-extrabold text-white">{slide.title}</Text>
              <Text className="text-sm leading-5 text-white/85">{slide.subtitle}</Text>
            </View>
            <View className="rounded-2xl bg-white/15 p-2">
              <Ionicons name="sparkles" size={22} color={BRAND_GOLD} />
            </View>
          </View>
          <View className="mt-5 flex-row items-center justify-end">
            <View className="flex-row items-center gap-2 rounded-full bg-white px-4 py-2">
              <Text className="text-sm font-extrabold" style={{ color: slide.accent }}>
                {slide.cta}
              </Text>
              <Ionicons name="arrow-forward" size={16} color={slide.accent} />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}
