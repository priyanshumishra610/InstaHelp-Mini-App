import { HubSectionHeader } from "@/components/gaming/hub/HubSectionHeader";
import { GameThumb } from "@/components/gaming/hub/GameThumb";
import { HUB_COLORS, type HubGameItem } from "@/constants/gamingHub";
import type { GamezopGame } from "@/constants/gamezopGames";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const ICON_SIZE = 76;

type Props = {
  games: HubGameItem[];
  onPlay: (game: GamezopGame) => void;
};

export function InstantPlaysSection({ games, onPlay }: Props) {
  return (
    <View style={styles.section}>
      <HubSectionHeader title="Top instant plays" />

      <FlatList
        data={games}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(g) => `instant-${g.game.id}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const label = item.label ?? item.game.title;
          return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Play ${label}`}
            onPress={() => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPlay(item.game);
            }}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <GameThumb
              game={item.game}
              size={ICON_SIZE}
              radius={16}
              showInstantBadge
            />
            <View style={styles.labelRow}>
              <Text style={styles.label} numberOfLines={1}>
                {label}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={HUB_COLORS.textSecondary}
              />
            </View>
          </Pressable>
          );
        }}
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
