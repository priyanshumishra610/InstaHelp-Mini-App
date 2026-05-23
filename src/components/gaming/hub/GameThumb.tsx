import type { GamezopGame } from "@/constants/gamezopGames";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

type Props = {
  game: GamezopGame;
  size: number;
  radius?: number;
  showInstantBadge?: boolean;
};

export function GameThumb({
  game,
  size,
  radius = 16,
  showInstantBadge = false,
}: Props) {
  const colors = game.gradient;
  const iconName = game.icon as keyof typeof Ionicons.glyphMap;

  return (
    <View style={{ width: size, height: size }}>
      <LinearGradient
        colors={[colors[0], colors[1], colors[2] ?? colors[1]]}
        style={[
          styles.thumb,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={size * 0.42}
          color="rgba(255,255,255,0.95)"
        />
      </LinearGradient>

      {showInstantBadge ? (
        <View style={styles.badge}>
          <Ionicons name="flash" size={11} color="#fff" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  badge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(15,10,30,0.92)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
});
