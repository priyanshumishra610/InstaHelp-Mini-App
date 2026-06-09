import type { InstaGame } from "@/constants/instaGames";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";

type Props = {
  game: InstaGame;
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
      <View
        style={[
          styles.thumb,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
        ]}
      >
        <LinearGradient
          colors={[colors[0], colors[1], colors[2] ?? colors[1]]}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.iconWrap}>
          <Ionicons
            name={iconName}
            size={size * 0.42}
            color="rgba(255,255,255,0.95)"
          />
        </View>

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.35)"]}
          style={styles.vignette}
          pointerEvents="none"
        />
      </View>

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
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  iconWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  vignette: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
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
