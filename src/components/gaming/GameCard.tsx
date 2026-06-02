import { PremiumPressable } from "@/components/auth/premium/PremiumPressable";
import {
  getGamezopImageUrl,
  type GamezopGame,
} from "@/constants/gamezopGames";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const CARD_W = 156;
const CARD_H = 210;

type Props = {
  game: GamezopGame;
  index?: number;
  onPress: (game: GamezopGame) => void;
};

export function GameCard({ game, index = 0, onPress }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withDelay(
      (index % 5) * 120,
      withRepeat(
        withSequence(
          withTiming(-5, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
          withTiming(4, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );
  }, [floatY, index]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  const iconName = game.icon as keyof typeof Ionicons.glyphMap;
  const colors = game.gradient.length >= 2 ? game.gradient : ["#6366f1", "#8b5cf6"];

  return (
    <Animated.View style={[styles.outer, floatStyle]}>
      <PremiumPressable
        accessibilityRole="button"
        accessibilityLabel={`Play ${game.title}`}
        onPress={() => onPress(game)}
        glow
        style={styles.pressable}
      >
        <LinearGradient
          colors={[colors[0], colors[1], colors[2] ?? colors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.glowRing} />
          <View style={styles.thumb}>
            {!imageFailed ? (
              <Image
                source={{ uri: getGamezopImageUrl(game.id, "thumb") }}
                style={StyleSheet.absoluteFillObject}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <Ionicons name={iconName} size={36} color="rgba(255,255,255,0.95)" />
            )}
          </View>
          <BlurView intensity={24} tint="dark" style={styles.rewardBadge}>
            <Ionicons name="gift" size={11} color="#fde68a" />
            <Text style={styles.rewardText}>+{game.rewardCoins}</Text>
          </BlurView>
          <View style={styles.bottom}>
            <Text style={styles.title} numberOfLines={2}>
              {game.title}
            </Text>
            <View style={styles.playRow}>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={12} color="#0f172a" />
              </View>
              <Text style={styles.playLabel}>Play</Text>
            </View>
          </View>
        </LinearGradient>
      </PremiumPressable>
    </Animated.View>
  );
}

export function GameCardShimmer({ index = 0 }: { index?: number }) {
  const shimmer = useSharedValue(0.35);

  useEffect(() => {
    shimmer.value = withDelay(
      index * 80,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 700 }),
          withTiming(0.35, { duration: 700 }),
        ),
        -1,
        true,
      ),
    );
  }, [index, shimmer]);

  const style = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  return (
    <Animated.View style={[styles.shimmer, style]}>
      <View style={styles.shimmerInner} />
    </Animated.View>
  );
}

export const GAME_CARD_WIDTH = CARD_W;
export const GAME_CARD_HEIGHT = CARD_H;

const styles = StyleSheet.create({
  outer: {
    width: CARD_W,
    marginRight: 14,
  },
  pressable: {
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#6366f1",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 18,
      },
      android: { elevation: 8 },
    }),
  },
  gradient: {
    width: CARD_W,
    height: CARD_H,
    padding: 12,
    justifyContent: "space-between",
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  thumb: {
    alignSelf: "center",
    marginTop: 8,
    width: 72,
    height: 72,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  rewardBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  rewardText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#fde68a",
  },
  bottom: {
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
    lineHeight: 18,
  },
  playRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  playLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.4,
  },
  shimmer: {
    width: CARD_W,
    height: CARD_H,
    marginRight: 14,
    borderRadius: 24,
    overflow: "hidden",
  },
  shimmerInner: {
    flex: 1,
    backgroundColor: "rgba(148,163,184,0.25)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
});
