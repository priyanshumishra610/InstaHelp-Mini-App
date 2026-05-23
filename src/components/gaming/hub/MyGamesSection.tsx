import { GameThumb } from "@/components/gaming/hub/GameThumb";
import { HubSectionHeader } from "@/components/gaming/hub/HubSectionHeader";
import { HUB_COLORS, type MyGameEntry } from "@/constants/gamingHub";
import type { GamezopGame } from "@/constants/gamezopGames";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const CARD_W = 140;

type Props = {
  games: MyGameEntry[];
  onPlay: (game: GamezopGame) => void;
};

export function MyGamesSection({ games, onPlay }: Props) {
  return (
    <View style={styles.section}>
      <HubSectionHeader title="My games" />

      <FlatList
        data={games}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(g) => `my-${g.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Play ${item.title}`}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPlay(item);
            }}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.thumbWrap}>
              <GameThumb game={item} size={116} radius={18} />
            </View>
            <View style={styles.meta}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={HUB_COLORS.textSecondary}
                />
              </View>
              <Text style={styles.date}>{item.lastPlayedLabel}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
    marginBottom: 28,
  },
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
  thumbWrap: {
    alignItems: "center",
  },
  card: {
    width: CARD_W,
    padding: 12,
    paddingBottom: 14,
    borderRadius: 20,
    backgroundColor: HUB_COLORS.cardBg,
    borderWidth: 1,
    borderColor: HUB_COLORS.cardBorder,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  meta: {
    marginTop: 10,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: HUB_COLORS.textPrimary,
  },
  date: {
    fontSize: 12,
    fontWeight: "500",
    color: HUB_COLORS.textSecondary,
  },
});
