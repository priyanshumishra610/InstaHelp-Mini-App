import {
  SHOP_GREEN,
  SHOP_GREEN_LIGHT,
  SHOP_TEXT,
  SHOP_TEXT_MUTED,
} from "@/constants/shopTheme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

export function DealBanner({ title, subtitle, onPress }: Props) {
  const content = (
    <View style={styles.banner}>
      <View style={styles.iconWrap}>
        <Ionicons name="flame" size={18} color={SHOP_GREEN} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onPress ? (
        <Ionicons name="chevron-forward" size={18} color={SHOP_TEXT_MUTED} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 8,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: SHOP_GREEN_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconWrap: {
    height: 36,
    width: 36,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    color: SHOP_TEXT,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: SHOP_TEXT_MUTED,
  },
});
