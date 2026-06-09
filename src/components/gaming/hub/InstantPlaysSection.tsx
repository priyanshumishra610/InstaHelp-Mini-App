import { HubSectionHeader } from "@/components/gaming/hub/HubSectionHeader";
import { GameThumb } from "@/components/gaming/hub/GameThumb";
import { HUB_COLORS } from "@/constants/gamingHub";
import type { InstaGame } from "@/constants/instaGames";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const ICON_SIZE = 76;

type Props = {
  games: InstaGame[];
  onPlay: (game: InstaGame) => void;
};

export function InstantPlaysSection({ games, onPlay }: Props) {
  return (
    <View style={styles.section}>
      <HubSectionHeader title="Top instant plays" />

      <FlatList
        data={games}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(g) => `instant-${g.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item: game }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Play ${game.title}`}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPlay(game);
            }}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <GameThumb
              game={game}
              size={ICON_SIZE}
              radius={16}
              showInstantBadge
            />
            <View style={styles.labelRow}>
              <Text style={styles.label} numberOfLines={2}>
                {game.title}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={HUB_COLORS.textSecondary}
              />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  list: {
    paddingHorizontal: 20,
    gap: 18,
  },
  item: {
    width: ICON_SIZE + 4,
    alignItems: "flex-start",
  },
  itemPressed: {
    opacity: 0.88,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 1,
    maxWidth: ICON_SIZE + 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: HUB_COLORS.textPrimary,
    flexShrink: 1,
  },
});
