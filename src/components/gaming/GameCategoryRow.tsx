import { GameCard, GAME_CARD_WIDTH } from "@/components/gaming/GameCard";
import type { GameCategory, GamezopGame } from "@/constants/gamezopGames";
import { FlatList, StyleSheet, Text, View } from "react-native";

type Props = {
  category: GameCategory;
  games: GamezopGame[];
  onPlayGame: (game: GamezopGame) => void;
};

export function GameCategoryRow({ category, games, onPlayGame }: Props) {
  if (!games.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{category.title}</Text>
        <Text style={styles.subtitle}>{category.subtitle}</Text>
      </View>

      <FlatList
        data={games}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        removeClippedSubviews
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: GAME_CARD_WIDTH + 14,
          offset: (GAME_CARD_WIDTH + 14) * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <GameCard game={item} index={index} onPress={onPlayGame} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 26,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#f1f5f9",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(148,163,184,0.95)",
  },
  list: {
    paddingLeft: 20,
    paddingRight: 6,
  },
});
