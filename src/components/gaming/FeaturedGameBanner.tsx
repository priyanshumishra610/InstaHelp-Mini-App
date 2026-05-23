import { PremiumPressable } from "@/components/auth/premium/PremiumPressable";
import { GamingSparkles } from "@/components/gaming/GamingSparkles";
import type { GamezopGame } from "@/constants/gamezopGames";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
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

const { width: SCREEN_W } = Dimensions.get("window");
const BANNER_W = SCREEN_W - 40;
const BANNER_GAP = 12;

type Props = {
  games: GamezopGame[];
  onPlay: (game: GamezopGame) => void;
};

export function FeaturedGameBanner({ games, onPlay }: Props) {
  const listRef = useRef<FlatList<GamezopGame>>(null);
  const [index, setIndex] = useState(0);
  const scrollX = useSharedValue(0);

  useEffect(() => {
    if (games.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % games.length;
        listRef.current?.scrollToOffset({
          offset: next * (BANNER_W + BANNER_GAP),
          animated: true,
        });
        return next;
      });
    }, 4800);
    return () => clearInterval(id);
  }, [games.length]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / (BANNER_W + BANNER_GAP));
    setIndex(Math.max(0, Math.min(games.length - 1, next)));
  };

  if (!games.length) return null;

  return (
    <View style={styles.wrap}>
      <FlatList
        ref={listRef}
        data={games}
        horizontal
        pagingEnabled={false}
        snapToInterval={BANNER_W + BANNER_GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: BANNER_GAP }}
        keyExtractor={(g) => `featured-${g.id}`}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item, index: i }) => (
          <FeaturedSlide
            game={item}
            index={i}
            scrollX={scrollX}
            onPlay={() => onPlay(item)}
          />
        )}
      />
      <View style={styles.dots}>
        {games.map((g, i) => (
          <View
            key={`dot-${g.id}`}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

function FeaturedSlide({
  game,
  index,
  scrollX,
  onPlay,
}: {
  game: GamezopGame;
  index: number;
  scrollX: SharedValue<number>;
  onPlay: () => void;
}) {
  const colors = game.gradient;
  const iconName = game.icon as keyof typeof Ionicons.glyphMap;

  const parallax = useAnimatedStyle(() => {
    const input = [
      (index - 1) * (BANNER_W + BANNER_GAP),
      index * (BANNER_W + BANNER_GAP),
      (index + 1) * (BANNER_W + BANNER_GAP),
    ];
    const scale = interpolate(scrollX.value, input, [0.94, 1, 0.94], Extrapolation.CLAMP);
    const translateY = interpolate(scrollX.value, input, [8, 0, 8], Extrapolation.CLAMP);
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <Animated.View style={[{ width: BANNER_W }, parallax]}>
      <PremiumPressable onPress={onPlay} style={styles.bannerPress}>
        <LinearGradient
          colors={[colors[0], colors[1], colors[2] ?? colors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <GamingSparkles count={8} />
          <BlurView intensity={18} tint="dark" style={styles.featuredPill}>
            <Text style={styles.featuredPillText}>FEATURED</Text>
          </BlurView>
          <View style={styles.bannerContent}>
            <View style={styles.iconWrap}>
              <Ionicons name={iconName} size={44} color="#fff" />
            </View>
            <View style={styles.copy}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameTagline} numberOfLines={2}>
                {game.tagline}
              </Text>
              <View style={styles.ctaRow}>
                <LinearGradient
                  colors={["#ffffff", "#e2e8f0"]}
                  style={styles.cta}
                >
                  <Ionicons name="play" size={16} color="#0f172a" />
                  <Text style={styles.ctaText}>Play Now</Text>
                </LinearGradient>
                <View style={styles.earnPill}>
                  <Text style={styles.earnText}>+{game.rewardCoins} coins</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>
      </PremiumPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  bannerPress: {
    borderRadius: 28,
    overflow: "hidden",
  },
  banner: {
    height: 196,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  featuredPill: {
    alignSelf: "flex-start",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  featuredPillText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.6,
    color: "#fde68a",
  },
  bannerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 8,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  copy: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.4,
  },
  gameTagline: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    color: "rgba(255,255,255,0.88)",
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    flexWrap: "wrap",
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
  },
  earnPill: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  earnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fde68a",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(148,163,184,0.4)",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#818cf8",
  },
});
