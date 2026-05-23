import { HUB_COLORS } from "@/constants/gamingHub";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  onSeeAll?: () => void;
};

export function HubSectionHeader({ title, onSeeAll }: Props) {
  return (
    <Pressable
      accessibilityRole="header"
      onPress={onSeeAll}
      disabled={!onSeeAll}
      style={styles.row}
    >
      <Text style={styles.title}>{title}</Text>
      <Ionicons name="chevron-forward" size={20} color={HUB_COLORS.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: HUB_COLORS.textPrimary,
    letterSpacing: -0.2,
  },
});
