import { HUB_COLORS } from "@/constants/gamingHub";
import type { GamezopGame } from "@/constants/gamezopGames";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  game: GamezopGame;
  displayTitle?: string;
  onPlay: (game: GamezopGame) => void;
};

/** Wide promotional card matching Gaming Hub ad slot */
export function GamingAdBanner({ game, displayTitle, onPlay }: Props) {
  const colors = game.gradient;
  const label = displayTitle ?? game.title;

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
        <LinearGradient
          colors={["#2d2640", colors[0], colors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.adPill}>
            <Text style={styles.adText}>Ad</Text>
            <Ionicons
              name="information-circle-outline"
              size={12}
              color="rgba(255,255,255,0.7)"
            />
          </View>

          <View style={styles.mazeArt}>
            <View style={styles.mazeRow}>
              <View style={[styles.mazeCell, styles.mazeWall]} />
              <View style={[styles.mazeCell, styles.mazePath]} />
              <View style={[styles.mazeCell, styles.mazeWall]} />
              <View style={[styles.mazeCell, styles.mazePath]} />
            </View>
            <View style={styles.mazeRow}>
              <View style={[styles.mazeCell, styles.mazePath]} />
              <View style={[styles.mazeCell, styles.mazeWall]} />
              <View style={[styles.mazeCell, styles.mazePath]} />
              <View style={[styles.mazeCell, styles.mazeWall]} />
            </View>
            <View style={styles.mazeRow}>
              <View style={[styles.mazeCell, styles.mazeWall]} />
              <View style={[styles.mazeCell, styles.mazePath]} />
              <View style={[styles.mazeCell, styles.mazeWall]} />
              <View style={[styles.mazeCell, styles.mazeHighlight]} />
            </View>
          </View>

          <Text style={styles.gameLabel}>{label}</Text>

          <View style={styles.ctaWrap}>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>Play Now</Text>
            </View>
          </View>
        </LinearGradient>
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
    minHeight: 168,
    padding: 14,
    alignItems: "center",
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
  },
  adText: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.85)",
  },
  mazeArt: {
    marginTop: 8,
    marginBottom: 6,
    gap: 4,
  },
  mazeRow: {
    flexDirection: "row",
    gap: 4,
  },
  mazeCell: {
    width: 28,
    height: 28,
    borderRadius: 4,
  },
  mazeWall: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  mazePath: {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  mazeHighlight: {
    backgroundColor: "rgba(59,130,246,0.85)",
  },
  gameLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: HUB_COLORS.textPrimary,
    marginBottom: 10,
  },
  ctaWrap: {
    width: "100%",
    alignItems: "center",
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
