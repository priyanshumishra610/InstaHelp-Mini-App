import { HUB_COLORS } from "@/constants/gamingHub";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onGiftPress?: () => void;
  onMenuPress?: () => void;
};

export function GamingHubHeader({ onGiftPress, onMenuPress }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>Gaming Hub</Text>

      <View style={styles.actions}>
        <View style={styles.avatarWrap}>
          <LinearGradient
            colors={["#7c3aed", "#4f46e5", "#2563eb"]}
            style={styles.avatar}
          >
            <View style={styles.bubbleA} />
            <View style={styles.bubbleB} />
          </LinearGradient>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rewards"
          onPress={onGiftPress}
          hitSlop={8}
          style={styles.iconBtn}
        >
          <Ionicons name="gift-outline" size={24} color={HUB_COLORS.textPrimary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="More options"
          onPress={onMenuPress}
          hitSlop={8}
          style={styles.menuBtn}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={HUB_COLORS.textPrimary}
          />
          <View style={styles.notifDot} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: HUB_COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarWrap: {
    borderRadius: 20,
    overflow: "hidden",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  bubbleA: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.45)",
    top: 8,
    left: 6,
  },
  bubbleB: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(196,181,253,0.9)",
    bottom: 7,
    right: 8,
  },
  iconBtn: {
    padding: 2,
  },
  menuBtn: {
    padding: 2,
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f97316",
    borderWidth: 1.5,
    borderColor: HUB_COLORS.bgMid,
  },
});
