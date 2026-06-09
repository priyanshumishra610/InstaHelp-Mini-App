import { HUB_COLORS } from "@/constants/gamingHub";
import type { InstaGame } from "@/constants/instaGames";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  game: InstaGame;
  displayTitle?: string;
  onPlay: (game: InstaGame) => void;
};

/** Wide promotional card matching Gaming Hub ad slot */
export function GamingAdBanner({ game, displayTitle, onPlay }: Props) {
  const colors = game.gradient;
  const label = displayTitle ?? game.title;
  const iconName = game.icon as keyof typeof Ionicons.glyphMap;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Play ${label}`}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPlay(game);
        }}
        style={({ pressed }) => [styles.banner, pressed && styles.bannerPressed]}
      >
        <View style={styles.gradient}>
          <LinearGradient
            colors={["#1a0b2e", colors[0], colors[1]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <View style={styles.adPill}>
            <Text style={styles.adText}>Featured</Text>
            <Ionicons
              name="information-circle-outline"
              size={12}
              color="rgba(255,255,255,0.7)"
            />
          </View>

          <View style={styles.artWrap}>
            <View style={styles.artFallback}>
              <Ionicons name={iconName} size={48} color="rgba(255,255,255,0.9)" />
            </View>
          </View>

          <Text style={styles.gameLabel}>{label}</Text>
          <Text style={styles.tagline}>{game.tagline}</Text>

          <View style={styles.ctaWrap}>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>Play Now</Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  banner: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  bannerPressed: {
    opacity: 0.95,
  },
  gradient: {
    minHeight: 200,
    padding: 14,
    alignItems: "center",
    overflow: "hidden",
  },
  adPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: HUB_COLORS.adBadge,
    zIndex: 2,
  },
  adText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },
  artWrap: {
    width: "100%",
    height: 120,
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  artFallback: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  gameLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: HUB_COLORS.textPrimary,
    marginBottom: 4,
    zIndex: 2,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "600",
    color: HUB_COLORS.textSecondary,
    marginBottom: 10,
    zIndex: 2,
  },
  ctaWrap: {
    width: "100%",
    alignItems: "center",
    zIndex: 2,
  },
  cta: {
    backgroundColor: HUB_COLORS.accentBlue,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 22,
    minWidth: 150,
    alignItems: "center",
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
